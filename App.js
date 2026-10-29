import React, { useEffect, useState, useRef } from 'react';
import Interface from './Interface';
import * as SQLite from 'expo-sqlite';

const initialSpots = [
  { id: 'A01', status: 'Livre' }, { id: 'A02', status: 'Ocupada' },
  { id: 'A03', status: 'Livre' }, { id: 'A04', status: 'Livre' },
  { id: 'B01', status: 'Ocupada' }, { id: 'B02', status: 'Livre' },
];

export default function App() {
  const [notice, setNotice] = useState(null);
  const [busy, setBusy] = useState(false);
  const actionLock = useRef(false);
  const notify = (title, message) => setNotice({ title, message });
  async function perform(action) {
    if (actionLock.current) return;
    actionLock.current = true;
    setBusy(true);
    try { await action(); } finally { actionLock.current = false; setBusy(false); }
  }
  const [screenHistory, setScreenHistory] = useState(['Início']);
  const screen = screenHistory[screenHistory.length - 1];
  const setScreen = (next) => setScreenHistory(previous => previous[previous.length - 1] === next ? previous : [...previous, next]);
  const goBack = () => {
    setScreenHistory(previous => previous.length > 1 ? previous.slice(0, -1) : previous);
    setNotice(null);
  };
  const canGoBack = screenHistory.length > 1;
  const [spots, setSpots] = useState([]);
  const [plate, setPlate] = useState('');
  const [model, setModel] = useState('');
  const [vehicles, setVehicles] = useState([]);
  const [history, setHistory] = useState([]);
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [dbReady, setDbReady] = useState(false);
  const [dbError, setDbError] = useState('');

  const freeCount = spots.filter(s => s.status === 'Livre').length;

  // Inicializa o banco SQLite local e cria as tabelas caso ainda não existam.
  useEffect(() => {
    let mounted = true;
    async function initializeDatabase() {
      try {
        const db = await SQLite.openDatabaseAsync('gerenciamento_estacionamento.db');
        await db.execAsync(`
          PRAGMA foreign_keys = ON;
          CREATE TABLE IF NOT EXISTS vagas (
            id TEXT PRIMARY KEY NOT NULL,
            status TEXT NOT NULL CHECK(status IN ('Livre', 'Ocupada'))
          );
          CREATE TABLE IF NOT EXISTS veiculos (
            placa TEXT PRIMARY KEY NOT NULL,
            modelo TEXT NOT NULL,
            criado_em TEXT NOT NULL
          );
          CREATE TABLE IF NOT EXISTS movimentacoes (
            id TEXT PRIMARY KEY NOT NULL,
            vaga_id TEXT NOT NULL,
            evento TEXT NOT NULL,
            horario TEXT NOT NULL,
            encerrada INTEGER NOT NULL DEFAULT 0,
            FOREIGN KEY (vaga_id) REFERENCES vagas(id)
          );
        `);

        const spotCount = await db.getFirstAsync('SELECT COUNT(*) AS total FROM vagas');
        if (spotCount.total === 0) {
          for (const spot of initialSpots) {
            await db.runAsync('INSERT INTO vagas (id, status) VALUES (?, ?)', spot.id, spot.status);
          }
        }

        const vehicleCount = await db.getFirstAsync('SELECT COUNT(*) AS total FROM veiculos');
        if (vehicleCount.total === 0) {
          await db.runAsync(
            'INSERT INTO veiculos (placa, modelo, criado_em) VALUES (?, ?, ?)',
            'ABC1D23', 'Honda Civic', new Date().toISOString()
          );
        }

        if (mounted) {
          await loadDatabaseData(db, mounted);
          setDbReady(true);
        }
      } catch (error) {
        console.error('Erro ao inicializar SQLite:', error);
        if (mounted) setDbError('Não foi possível abrir o banco de dados. Feche o app e confira se instalou as dependências.');
      }
    }
    initializeDatabase();
    return () => { mounted = false; };
  }, []);

  async function loadDatabaseData(db, mounted = true) {
    const [dbSpots, dbVehicles, dbHistory] = await Promise.all([
      db.getAllAsync('SELECT id, status FROM vagas ORDER BY id'),
      db.getAllAsync('SELECT placa, modelo FROM veiculos ORDER BY placa'),
      db.getAllAsync('SELECT id, vaga_id AS spot, evento AS event, horario AS time, encerrada AS closed FROM movimentacoes ORDER BY rowid DESC')
    ]);
    if (mounted) {
      setSpots(dbSpots);
      setVehicles(dbVehicles.map(v => ({ plate: v.placa, model: v.modelo })));
      setHistory(dbHistory.map(h => ({ ...h, closed: Boolean(h.closed) })));
    }
  }

  async function refreshData() {
    const db = await SQLite.openDatabaseAsync('gerenciamento_estacionamento.db');
    await loadDatabaseData(db);
  }

  const addVehicle = async () => {
    const normalizedPlate = plate.trim().toUpperCase();
    const normalizedModel = model.trim();
    if (!normalizedPlate || !normalizedModel) {
      notify('Dados incompletos', 'Informe a placa e o modelo.');
      return;
    }
    try {
      const db = await SQLite.openDatabaseAsync('gerenciamento_estacionamento.db');
      const existing = await db.getFirstAsync('SELECT placa FROM veiculos WHERE placa = ?', normalizedPlate);
      if (existing) {
        notify('Placa já cadastrada', 'Informe uma placa diferente.');
        return;
      }
      await db.runAsync(
        'INSERT INTO veiculos (placa, modelo, criado_em) VALUES (?, ?, ?)',
        normalizedPlate, normalizedModel, new Date().toISOString()
      );
      await refreshData();
      setPlate('');
      setModel('');
      notify('Sucesso', 'Veículo salvo no banco de dados local.');
    } catch (error) {
      console.error(error);
      notify('Erro', 'Não foi possível salvar o veículo no banco de dados.');
    }
  };

  const checkIn = async () => {
    if (!selectedSpot) {
      notify('Selecione uma vaga', 'Escolha uma vaga livre antes de registrar a entrada.');
      return;
    }
    try {
      const db = await SQLite.openDatabaseAsync('gerenciamento_estacionamento.db');
      const spot = await db.getFirstAsync('SELECT id, status FROM vagas WHERE id = ?', selectedSpot);
      if (!spot || spot.status !== 'Livre') {
        notify('Vaga indisponível', 'Escolha outra vaga.');
        await refreshData();
        return;
      }
      const itemId = String(Date.now());
      const time = new Date().toLocaleString('pt-BR');
      await db.withTransactionAsync(async () => {
        await db.runAsync('UPDATE vagas SET status = ? WHERE id = ?', 'Ocupada', selectedSpot);
        await db.runAsync(
          'INSERT INTO movimentacoes (id, vaga_id, evento, horario, encerrada) VALUES (?, ?, ?, ?, ?)',
          itemId, selectedSpot, 'Entrada registrada', time, 0
        );
      });
      await refreshData();
      setSelectedSpot(null);
      setScreen('Histórico');
      notify('Entrada registrada', `Entrada registrada na vaga ${selectedSpot} e salva no banco de dados.`);
    } catch (error) {
      console.error(error);
      notify('Erro', 'Não foi possível registrar a entrada.');
    }
  };

  const checkOut = async (item) => {
    try {
      const db = await SQLite.openDatabaseAsync('gerenciamento_estacionamento.db');
      const time = new Date().toLocaleString('pt-BR');
      await db.withTransactionAsync(async () => {
        await db.runAsync('UPDATE vagas SET status = ? WHERE id = ?', 'Livre', item.spot);
        await db.runAsync(
          'UPDATE movimentacoes SET evento = ?, horario = ?, encerrada = 1 WHERE id = ?',
          'Saída registrada', time, item.id
        );
      });
      await refreshData();
      notify('Saída registrada', 'Vaga liberada e movimentação atualizada no banco de dados. Valor demonstrativo: R$ 10,00 (não é cobrança real).');
    } catch (error) {
      console.error(error);
      notify('Erro', 'Não foi possível registrar a saída.');
    }
  };

  return <Interface {...{screen,setScreen,goBack,canGoBack,spots,vehicles,history,selectedSpot,setSelectedSpot,plate,setPlate,model,setModel,dbReady,dbError,notice,setNotice,busy}}
    addVehicle={() => perform(addVehicle)} checkIn={() => perform(checkIn)} checkOut={(item) => perform(() => checkOut(item))} />;
}
