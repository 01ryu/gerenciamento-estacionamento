// Runs the actual data-layer SQL against SQLite in memory (Node.js 22.13+).
const {DatabaseSync}=require('node:sqlite');
const fs=require('node:fs');
const assert=require('node:assert/strict');
const path=require('node:path');
const rules=fs.readFileSync(path.join(__dirname,'vehicleRules.js'),'utf8').replace(/export /g,'');
const {normalizePlate,isValidPlate}=new Function(rules+';return {normalizePlate,isValidPlate}')();
const planCode=fs.readFileSync(path.join(__dirname,'parkingPlan.js'),'utf8').replace(/export /g,'');
const {validatePlan,parsePrice,planBalance,extensionTiming}=new Function(planCode+';return {validatePlan,parsePrice,planBalance,extensionTiming}')();
const defaultPlan={minutes:60,priceCents:2000,notes:'Cliente retorna em uma hora'};
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
 const api=new Function('SQLite','isValidPlate','validatePlan','extensionTiming',source+';return {initialize,readData,saveVehicle,enterSpot,leaveSpot,extendStay};')({openDatabaseAsync:async()=>adapter},isValidPlate,validatePlan,extensionTiming);
 const enter=api.enterSpot; api.enterSpot=(spot,plate,plan=defaultPlan)=>enter(spot,plate,plan);
 return {api,sqlite};
}
(async()=>{
 assert.equal(normalizePlate('abc1d23extra'),'ABC1D23');
 assert.equal(normalizePlate('ab$%c12'),'ABC12');
 for(const plate of ['ABC1234','ABC1D23'])assert.ok(isValidPlate(plate));
 for(const plate of ['1234567','AB12345','ABC12','ABCD123','ABC1DD3','ABC12345','ABC@123'])assert.ok(!isValidPlate(plate));
 assert.equal(parsePrice('20,50'),2050);assert.equal(parsePrice('50'),5000);assert.equal(parsePrice('20.001'),null);assert.equal(parsePrice('-2'),null);
 const sample={enteredAt:'2026-10-29T12:00:00.000Z',durationMinutes:60,priceCents:2000,closed:false};
 assert.equal(planBalance(sample,Date.parse('2026-10-29T12:30:00Z')).remainingCents,1000);
 assert.equal(planBalance(sample,Date.parse('2026-10-29T13:00:00Z')).remainingCents,0);
 assert.equal(planBalance(sample,Date.parse('2026-10-29T13:01:00Z')).overdue,60000);
 assert.equal(planBalance({...sample,closed:true,exitedAt:'2026-10-29T12:15:00Z'},Date.parse('2026-10-30T12:00:00Z')).remainingCents,1500);
 assert.equal(planBalance({enteredAt:null}),null);
 assert.throws(()=>validatePlan({...defaultPlan,minutes:0}));assert.throws(()=>validatePlan({...defaultPlan,priceCents:-1}));assert.throws(()=>validatePlan({...defaultPlan,notes:'x'.repeat(501)}));
 const {api,sqlite}=setup();await api.initialize();await api.initialize();
 assert.equal((await api.readData()).spots.filter(s=>s.status==='Livre').length,6);
 await assert.rejects(()=>api.saveVehicle('1234567','Inválido'));
 await api.saveVehicle('ABC1D23','Civic');await api.saveVehicle('DEF1234','Onix');
 await assert.rejects(()=>api.saveVehicle('ABC1D23','Duplicado'));
 await assert.rejects(()=>api.enterSpot('A01',''));
 await api.enterSpot('A01','ABC1D23');
 await assert.rejects(()=>api.enterSpot('A03','DEF1234',{...defaultPlan,priceCents:-5}));
 const entry=(await api.readData()).history[0];assert.equal(entry.priceCents,2000);assert.equal(entry.durationMinutes,60);assert.equal(entry.notes,defaultPlan.notes);assert.equal(entry.plate,'ABC1D23');assert.equal(entry.model,'Civic');assert.ok(entry.enteredAt);
 await assert.rejects(()=>api.enterSpot('A03','ABC1D23'));await assert.rejects(()=>api.enterSpot('A01','DEF1234'));
 assert.equal((await api.readData()).spots.find(s=>s.id==='A03').status,'Livre');
 await api.extendStay(entry.id,{minutes:60,priceCents:2000});
 const extended=(await api.readData()).history[0];assert.equal(extended.extensions.length,1);
 assert.equal(extended.extensions[0].startsAt,new Date(Date.parse(entry.enteredAt)+3600000).toISOString());
 const balance=planBalance(extended,Date.parse(entry.enteredAt));assert.equal(balance.totalPriceCents,4000);assert.equal(balance.totalMinutes,120);assert.equal(balance.remainingCents,4000);
 await assert.rejects(()=>api.extendStay(entry.id,{minutes:-1,priceCents:2000}));
 await api.extendStay(entry.id,{minutes:300,priceCents:5000});
 assert.equal((await api.readData()).history[0].extensions.length,2);
 const expired={...sample,enteredAt:'2026-10-29T10:00:00Z'};
 assert.equal(extensionTiming(expired,60,Date.parse('2026-10-29T12:00:00Z')).endsAt,'2026-10-29T13:00:00.000Z');
 const segmented={...sample,extensions:[{minutes:60,priceCents:1000,startsAt:'2026-10-29T13:00:00Z',endsAt:'2026-10-29T14:00:00Z'}]};
 assert.equal(planBalance(segmented,Date.parse('2026-10-29T13:30:00Z')).remainingCents,500);
 await api.leaveSpot('A01',entry.id);await assert.rejects(()=>api.extendStay(entry.id,{minutes:60,priceCents:2000}));
 const closed=(await api.readData()).history[0];assert.equal(closed.enteredAt,entry.enteredAt);assert.ok(closed.exitedAt);assert.ok(closed.closed);assert.equal(closed.notes,entry.notes);assert.equal(closed.priceCents,entry.priceCents);
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
 assert.equal(migrated.history[0].priceCents,null);
 assert.equal(migrated.history[0].extensions.length,0);
 console.log('PASS: planos, saldos, expiração, observações, placas, cadastro, vínculos, dupla ocupação, horários, saída obsoleta e migração sem apagar dados.');
})().catch(e=>{console.error(e);process.exitCode=1;});
