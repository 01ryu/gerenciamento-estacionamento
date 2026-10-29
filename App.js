import React, { useEffect, useState, useRef } from 'react';
import Interface from './Interface';
import {initialize,readData,saveVehicle,enterSpot,leaveSpot} from './database';
import {normalizePlate} from './vehicleRules';
export default function App() {
 const [notice,setNotice]=useState(null),[busy,setBusy]=useState(false);
 const lock=useRef(false);
 const [screenHistory,setScreenHistory]=useState(['Início']);
 const screen=screenHistory[screenHistory.length-1];
 const setScreen=next=>setScreenHistory(prev=>prev[prev.length-1]===next?prev:[...prev,next]);
 const goBack=()=>{setScreenHistory(prev=>prev.length>1?prev.slice(0,-1):prev);setNotice(null);};
 const canGoBack=screenHistory.length>1;
 const [spots,setSpots]=useState([]),[vehicles,setVehicles]=useState([]),[history,setHistory]=useState([]);
 const [plate,setPlateValue]=useState(''),[model,setModel]=useState('');
 const setPlate=value=>setPlateValue(normalizePlate(value));
 const [selectedSpot,setSelectedSpot]=useState(null),[selectedVehicle,setSelectedVehicle]=useState('');
 const [dbReady,setDbReady]=useState(false),[dbError,setDbError]=useState('');
 const apply=data=>{setSpots(data.spots);setVehicles(data.vehicles);setHistory(data.history);};
 const refresh=async()=>apply(await readData());
 useEffect(()=>{let mounted=true;(async()=>{try{await initialize();const data=await readData();if(mounted){apply(data);setDbReady(true);}}catch(e){if(mounted)setDbError('Não foi possível abrir o banco de dados. '+e.message);}})();return()=>{mounted=false;};},[]);
 async function perform(action) {
  if(lock.current)return;
  lock.current=true;setBusy(true);setNotice(null);
  try{await action();}catch(e){setNotice({title:'Não foi possível concluir',message:e.message});await refresh().catch(()=>{});}
  finally{lock.current=false;setBusy(false);}
 }
 const addVehicle=()=>perform(async()=>{
  const normalized=plate.trim().toUpperCase().replace(/[\s-]/g,'');
  await saveVehicle(normalized,model.trim());await refresh();setSelectedVehicle(normalized);setPlate('');setModel('');
  setNotice({title:'Veículo cadastrado',message:selectedSpot?'Veículo selecionado. Confirme a entrada na vaga.':'Cadastro salvo com sucesso.'});
 });
 const checkIn=()=>perform(async()=>{
  await enterSpot(selectedSpot,selectedVehicle);await refresh();
  setNotice({title:'Entrada registrada',message:`${selectedVehicle} está na vaga ${selectedSpot}.`});setSelectedVehicle('');
 });
 const checkOut=item=>perform(async()=>{
  await leaveSpot(item.spot,item.id||null);await refresh();
  setNotice({title:'Saída registrada',message:`A vaga ${item.spot} foi liberada. O veículo e os horários foram preservados no histórico.`});
 });
 return <Interface {...{screen,setScreen,goBack,canGoBack,spots,vehicles,history,selectedSpot,setSelectedSpot,selectedVehicle,setSelectedVehicle,plate,setPlate,model,setModel,dbReady,dbError,notice,setNotice,busy,addVehicle,checkIn,checkOut}}/>;
}
