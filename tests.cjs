// Runs the actual data-layer SQL against SQLite in memory (Node.js 22.13+).
const {DatabaseSync}=require('node:sqlite');
const fs=require('node:fs');
const assert=require('node:assert/strict');
const path=require('node:path');
const rules=fs.readFileSync(path.join(__dirname,'vehicleRules.js'),'utf8').replace(/export /g,'');
const {normalizePlate,isValidPlate}=new Function(rules+';return {normalizePlate,isValidPlate}')();
function setup(seed='') {
 const sqlite=new DatabaseSync(':memory:');
 if(seed)sqlite.exec(seed);
 const adapter={
  execAsync:async q=>sqlite.exec(q),
  getAllAsync:async(q,...args)=>sqlite.prepare(q).all(...args),
  getFirstAsync:async(q,...args)=>sqlite.prepare(q).get(...args),
  runAsync:async(q,...args)=>sqlite.prepare(q).run(...args),
  withTransactionAsync:async action=>{sqlite.exec('BEGIN');try{await action();sqlite.exec('COMMIT');}catch(e){sqlite.exec('ROLLBACK');throw e;}},
 };
 const source=fs.readFileSync(path.join(__dirname,'database.js'),'utf8').replace(/^import .*;\r?\n/gm,'').replace(/export /g,'');
 const api=new Function('SQLite','isValidPlate',source+';return {initialize,readData,saveVehicle,enterSpot,leaveSpot};')({openDatabaseAsync:async()=>adapter},isValidPlate);
 return {api,sqlite};
}
(async()=>{
 assert.equal(normalizePlate('abc1d23extra'),'ABC1D23');
 assert.equal(normalizePlate('ab$%c12'),'ABC12');
 for(const plate of ['ABC1234','ABC1D23'])assert.ok(isValidPlate(plate));
 for(const plate of ['1234567','AB12345','ABC12','ABCD123','ABC1DD3','ABC12345','ABC@123'])assert.ok(!isValidPlate(plate));
 const {api,sqlite}=setup();await api.initialize();await api.initialize();
 assert.equal((await api.readData()).spots.filter(s=>s.status==='Livre').length,6);
 await assert.rejects(()=>api.saveVehicle('1234567','Inválido'));
 await api.saveVehicle('ABC1D23','Civic');await api.saveVehicle('DEF1234','Onix');
 await assert.rejects(()=>api.saveVehicle('ABC1D23','Duplicado'));
 await assert.rejects(()=>api.enterSpot('A01',''));
 await api.enterSpot('A01','ABC1D23');
 const entry=(await api.readData()).history[0];assert.equal(entry.plate,'ABC1D23');assert.equal(entry.model,'Civic');assert.ok(entry.enteredAt);
 await assert.rejects(()=>api.enterSpot('A03','ABC1D23'));await assert.rejects(()=>api.enterSpot('A01','DEF1234'));
 assert.equal((await api.readData()).spots.find(s=>s.id==='A03').status,'Livre');
 await api.leaveSpot('A01',entry.id);
 const closed=(await api.readData()).history[0];assert.equal(closed.enteredAt,entry.enteredAt);assert.ok(closed.exitedAt);assert.ok(closed.closed);
 await api.enterSpot('A01','DEF1234');await assert.rejects(()=>api.leaveSpot('A01',entry.id));
 assert.equal((await api.readData()).spots.find(s=>s.id==='A01').status,'Ocupada');sqlite.close();
 const legacy=setup(`CREATE TABLE vagas(id TEXT PRIMARY KEY,status TEXT NOT NULL);CREATE TABLE veiculos(placa TEXT PRIMARY KEY,modelo TEXT NOT NULL,criado_em TEXT NOT NULL);CREATE TABLE movimentacoes(id TEXT PRIMARY KEY,vaga_id TEXT NOT NULL,evento TEXT NOT NULL,horario TEXT NOT NULL,encerrada INTEGER NOT NULL DEFAULT 0);
 INSERT INTO vagas VALUES('A02','Ocupada'),('B01','Ocupada');INSERT INTO veiculos VALUES('OLD1234','Antigo','2026-10-01');INSERT INTO movimentacoes VALUES('old','A02','Entrada registrada','01/10/2026, 10:00:00',0);`);
 await legacy.api.initialize();await legacy.api.initialize();
 assert.equal((await legacy.api.readData()).vehicles[0].plate,'OLD1234');
 await legacy.api.leaveSpot('A02','old');await legacy.api.leaveSpot('B01');
 const migrated=await legacy.api.readData();assert.ok(migrated.spots.every(s=>s.status==='Livre'));
 assert.equal(migrated.history.find(h=>h.id==='old').enteredAt,'01/10/2026, 10:00:00');
 assert.ok(migrated.history.every(h=>h.plate===null));legacy.sqlite.close();
 console.log('PASS: placas, cadastro, vínculos, dupla ocupação, horários, saída obsoleta e migração sem apagar dados.');
})().catch(e=>{console.error(e);process.exitCode=1;});
