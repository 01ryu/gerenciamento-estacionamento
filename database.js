import * as SQLite from 'expo-sqlite';
import { isValidPlate } from './vehicleRules';
import { validatePlan, extensionTiming } from './parkingPlan';
let connection;
export async function database() {
  if (!connection) connection = SQLite.openDatabaseAsync('gerenciamento_estacionamento.db');
  return connection;
}
export async function initialize() {
 const db=await database();
 await db.execAsync(`PRAGMA foreign_keys = ON;
 CREATE TABLE IF NOT EXISTS vagas (id TEXT PRIMARY KEY NOT NULL,status TEXT NOT NULL CHECK(status IN ('Livre','Ocupada')));
 CREATE TABLE IF NOT EXISTS veiculos (placa TEXT PRIMARY KEY NOT NULL,modelo TEXT NOT NULL,criado_em TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS movimentacoes (id TEXT PRIMARY KEY NOT NULL,vaga_id TEXT NOT NULL REFERENCES vagas(id),evento TEXT NOT NULL,horario TEXT NOT NULL,encerrada INTEGER NOT NULL DEFAULT 0);`);
 await db.withTransactionAsync(async()=>{
  const columns=await db.getAllAsync('PRAGMA table_info(movimentacoes)');
  for(const [name,type] of [['placa','TEXT REFERENCES veiculos(placa)'],['entrada_em','TEXT'],['saida_em','TEXT'],['duracao_minutos','INTEGER'],['valor_centavos','INTEGER'],['observacoes','TEXT']]) {
   if(!columns.some(c=>c.name===name)) await db.execAsync(`ALTER TABLE movimentacoes ADD COLUMN ${name} ${type}`);
  }
  await db.execAsync('CREATE TABLE IF NOT EXISTS prorrogacoes (id INTEGER PRIMARY KEY AUTOINCREMENT,movimentacao_id TEXT NOT NULL REFERENCES movimentacoes(id),minutos INTEGER NOT NULL,valor_centavos INTEGER NOT NULL,criado_em TEXT NOT NULL,inicio_em TEXT NOT NULL,fim_em TEXT NOT NULL);');
  await db.execAsync('CREATE UNIQUE INDEX IF NOT EXISTS uma_entrada_por_veiculo ON movimentacoes(placa) WHERE encerrada=0 AND placa IS NOT NULL;');
  const count=await db.getFirstAsync('SELECT COUNT(*) AS n FROM vagas');
  if(!count.n) for(const id of ['A01','A02','A03','A04','B01','B02']) await db.runAsync('INSERT INTO vagas(id,status) VALUES (?,?)',id,'Livre');
 });
}
export async function readData() {
 const db=await database();
 const spots=await db.getAllAsync('SELECT id,status FROM vagas ORDER BY id');
 const vehicles=await db.getAllAsync('SELECT placa AS plate,modelo AS model FROM veiculos ORDER BY placa');
 const history=await db.getAllAsync(`SELECT m.id,m.vaga_id AS spot,m.evento AS event,m.horario AS time,m.encerrada AS closed,m.placa AS plate,v.modelo AS model,m.entrada_em AS enteredAt,m.saida_em AS exitedAt,m.duracao_minutos AS durationMinutes,m.valor_centavos AS priceCents,m.observacoes AS notes FROM movimentacoes m LEFT JOIN veiculos v ON v.placa=m.placa ORDER BY m.rowid DESC`);
 const extensions=await db.getAllAsync('SELECT id,movimentacao_id AS movementId,minutos AS minutes,valor_centavos AS priceCents,criado_em AS createdAt,inicio_em AS startsAt,fim_em AS endsAt FROM prorrogacoes ORDER BY id');
 return {spots,vehicles,history:history.map(h=>({...h,closed:Boolean(h.closed),extensions:extensions.filter(e=>e.movementId===h.id)}))};
}
export async function saveVehicle(plate,model) {
 const db=await database();
 if(!plate||!model) throw new Error('Informe a placa e o modelo.');
 if(!isValidPlate(plate)) throw new Error('Placa inválida. Use 7 caracteres no formato ABC1234 ou ABC1D23.');
 if(await db.getFirstAsync('SELECT placa FROM veiculos WHERE placa=?',plate)) throw new Error('Esta placa já está cadastrada. Selecione o veículo na lista.');
 await db.runAsync('INSERT INTO veiculos(placa,modelo,criado_em) VALUES (?,?,?)',plate,model,new Date().toISOString());
}
export async function enterSpot(spotId,plate,plan) {
 const db=await database();
 const details=validatePlan(plan);
 if(!spotId||!plate) throw new Error('Selecione a vaga e um veículo para registrar a entrada.');
 await db.withTransactionAsync(async()=>{
  if(!await db.getFirstAsync('SELECT placa FROM veiculos WHERE placa=?',plate)) throw new Error('Veículo não encontrado. Cadastre-o primeiro.');
  if(await db.getFirstAsync('SELECT id FROM movimentacoes WHERE placa=? AND encerrada=0',plate)) throw new Error('Este veículo já ocupa uma vaga. Registre sua saída antes de uma nova entrada.');
  const result=await db.runAsync("UPDATE vagas SET status='Ocupada' WHERE id=? AND status='Livre'",spotId);
  if(result.changes!==1) throw new Error('Esta vaga não está mais disponível.');
  const now=new Date().toISOString();
  await db.runAsync('INSERT INTO movimentacoes(id,vaga_id,evento,horario,encerrada,placa,entrada_em,duracao_minutos,valor_centavos,observacoes) VALUES (?,?,?,?,0,?,?,?,?,?)',`${Date.now()}-${Math.random().toString(36).slice(2)}`,spotId,'Entrada registrada',new Date(now).toLocaleString('pt-BR'),plate,now,details.minutes,details.priceCents,details.notes);
 });
}
export async function leaveSpot(spotId,expectedId=null) {
 const db=await database();
 await db.withTransactionAsync(async()=>{
  const spot=await db.getFirstAsync('SELECT status FROM vagas WHERE id=?',spotId);
  if(!spot||spot.status!=='Ocupada') throw new Error('Esta vaga já está livre.');
  const active=await db.getAllAsync('SELECT id FROM movimentacoes WHERE vaga_id=? AND encerrada=0',spotId);
  if(expectedId&&!active.some(m=>m.id===expectedId)) throw new Error('Esta movimentação já foi encerrada. Atualize a consulta.');
  const now=new Date().toISOString(),display=new Date(now).toLocaleString('pt-BR');
  // Preserve entry timestamps. Legacy occupied spots have no known vehicle.
  if(active.length) await db.runAsync("UPDATE movimentacoes SET entrada_em=COALESCE(entrada_em,horario),saida_em=?,horario=?,evento='Saída registrada',encerrada=1 WHERE vaga_id=? AND encerrada=0",now,display,spotId);
  else await db.runAsync('INSERT INTO movimentacoes(id,vaga_id,evento,horario,encerrada,saida_em) VALUES (?,?,?,?,1,?)',`${Date.now()}-legacy`,spotId,'Saída de ocupação antiga',display,now);
  await db.runAsync("UPDATE vagas SET status='Livre' WHERE id=?",spotId);
 });
}

export async function extendStay(movementId,plan) {
 const details=validatePlan({...plan,notes:''});
 const db=await database();
 await db.withTransactionAsync(async()=>{
  const entry=await db.getFirstAsync(`SELECT m.id,m.encerrada AS closed,m.entrada_em AS enteredAt,m.duracao_minutos AS durationMinutes,m.valor_centavos AS priceCents,v.status FROM movimentacoes m JOIN vagas v ON v.id=m.vaga_id WHERE m.id=?`,movementId);
  if(!entry||entry.closed||entry.status!=='Ocupada')throw new Error('Esta estadia já foi encerrada. Não é possível prorrogá-la.');
  entry.extensions=await db.getAllAsync('SELECT minutos AS minutes,valor_centavos AS priceCents,inicio_em AS startsAt,fim_em AS endsAt FROM prorrogacoes WHERE movimentacao_id=? ORDER BY id',movementId);
  const now=Date.now(),timing=extensionTiming(entry,details.minutes,now);
  await db.runAsync('INSERT INTO prorrogacoes(movimentacao_id,minutos,valor_centavos,criado_em,inicio_em,fim_em) VALUES (?,?,?,?,?,?)',movementId,details.minutes,details.priceCents,new Date(now).toISOString(),timing.startsAt,timing.endsAt);
 });
}
