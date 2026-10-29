import React, { useState } from 'react';
import {Modal,View,Text,Pressable,ScrollView,TextInput,StyleSheet,KeyboardAvoidingView,Platform} from 'react-native';
import {Icon} from './Brand';
import {isValidPlate} from './vehicleRules';

const date=value=>value?(value.includes('T')?new Date(value).toLocaleString('pt-BR'):value):'Não informado';
function Action({title,onPress,disabled=false,secondary=false}) {
 return <Pressable accessibilityRole="button" accessibilityLabel={title} disabled={disabled} onPress={onPress} style={({pressed})=>[s.button,secondary&&s.secondary,disabled&&{opacity:0.4},pressed&&{opacity:0.8}]}><Text style={[s.buttonText,secondary&&{color:'#EDF3FF'}]}>{title}</Text></Pressable>;
}
export default function SpotDetails({p,onClose}) {
 const [mode,setMode]=useState('existing');
 const {selectedSpot,spots,history,vehicles,selectedVehicle,setSelectedVehicle,plate,setPlate,model,setModel,busy,notice,addVehicle,checkIn,checkOut}=p;
 const spot=spots.find(s=>s.id===selectedSpot);
 const active=history.find(h=>h.spot===selectedSpot&&!h.closed);
 const occupied=spot?.status==='Ocupada';
 const selected=vehicles.find(v=>v.plate===selectedVehicle);
 const selectedBusy=history.some(h=>!h.closed&&h.plate===selectedVehicle);
 return <Modal transparent animationType="fade" visible onRequestClose={onClose}>
 <KeyboardAvoidingView style={s.backdrop} behavior={Platform.OS==='ios'?'padding':undefined}>
 <View style={s.dialog}><View style={s.top}><View><Text style={s.eyebrow}>{occupied?'VAGA OCUPADA':'REGISTRAR ENTRADA'}</Text><Text accessibilityRole="header" style={s.title}>Vaga {selectedSpot}</Text></View><Pressable accessibilityRole="button" accessibilityLabel="Fechar detalhes da vaga" onPress={onClose} style={s.close}><Icon name="close"/></Pressable></View>
 <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{padding:22,paddingTop:0}}>
 {notice&&<View accessibilityRole="alert" style={s.notice}><Text style={s.label}>{notice.title}</Text><Text style={s.text}>{notice.message}</Text></View>}
 {occupied?<>
 <View style={s.vehicle}><Icon name="car" size={36} color="#75D9F5"/><View style={{flex:1}}><Text style={s.plate}>{active?.plate||'Veículo não informado'}</Text><Text style={s.text}>{active?.model||'Ocupação registrada antes do vínculo com veículos.'}</Text></View></View>
 <Text style={s.label}>Entrada</Text><Text style={s.text}>{date(active?.enteredAt||active?.time)}</Text>
 {!active?.plate&&<Text style={s.help}>O registro antigo não contém a placa. A saída poderá ser registrada sem alterar os dados anteriores.</Text>}
 <Action title={busy?'Registrando saída…':'Registrar saída desta vaga'} disabled={busy} onPress={()=>checkOut(active||{spot:selectedSpot})}/>
 </>:<>
 <Text style={s.text}>Escolha um veículo cadastrado ou adicione um novo sem sair desta vaga.</Text>
 <View style={s.tabs}>{[['existing','Já cadastrado'],['new','Novo veículo']].map(([key,label])=><Pressable key={key} accessibilityRole="tab" accessibilityLabel={label} accessibilityState={{selected:mode===key}} onPress={()=>setMode(key)} style={[s.tab,mode===key&&s.tabActive]}><Text style={s.label}>{label}</Text></Pressable>)}</View>
 {mode==='new'?<><Text style={s.label}>Placa</Text><TextInput accessibilityLabel="Placa do novo veículo" value={plate} onChangeText={setPlate} maxLength={7} autoCapitalize="characters" autoCorrect={false} placeholder="ABC1D23" placeholderTextColor="#7D91AF" style={s.input}/><Text style={s.help}>{plate.length}/7 caracteres · ABC1234 ou ABC1D23</Text>{plate.length>0&&!isValidPlate(plate)&&<Text style={s.error}>Informe uma placa válida nos formatos indicados.</Text>}<Text style={s.label}>Modelo</Text><TextInput accessibilityLabel="Modelo do novo veículo" value={model} onChangeText={setModel} placeholder="Ex.: Honda Civic" placeholderTextColor="#7D91AF" style={s.input}/><Action title="Cadastrar e selecionar veículo" disabled={busy||!isValidPlate(plate)||!model.trim()} onPress={addVehicle} secondary/></>:
 <View style={{gap:8}}>{vehicles.length?vehicles.map(v=>{
  const occupation=history.find(h=>!h.closed&&h.plate===v.plate);
  return <Pressable key={v.plate} accessibilityRole="radio" accessibilityLabel={`Selecionar ${v.plate}`} accessibilityState={{checked:selectedVehicle===v.plate,disabled:!!occupation}} disabled={!!occupation||busy} onPress={()=>setSelectedVehicle(v.plate)} style={[s.option,selectedVehicle===v.plate&&s.optionSelected,occupation&&{opacity:0.5}]}><Icon name="car" color="#75D9F5"/><View style={{flex:1}}><Text style={s.label}>{v.plate}</Text><Text style={s.text}>{v.model}{occupation?` · Ocupa ${occupation.spot}`:''}</Text></View>{selectedVehicle===v.plate&&<Icon name="check" color="#64E2BA"/>}</Pressable>;
 }):<Text style={s.help}>Nenhum veículo cadastrado. Use a opção Novo veículo.</Text>}</View>}
 {selected&&!selectedBusy&&<View style={s.notice}><Text style={s.label}>Selecionado: {selected.plate}</Text><Text style={s.text}>{selected.model}</Text></View>}
 <Action title={busy?'Registrando…':'Confirmar entrada na vaga'} disabled={busy||!selected||selectedBusy} onPress={checkIn}/>
 </>}
 </ScrollView></View></KeyboardAvoidingView></Modal>;
}
const s=StyleSheet.create({backdrop:{flex:1,backgroundColor:'rgba(2,7,18,0.82)',justifyContent:'center',alignItems:'center',padding:16},dialog:{width:'100%',maxWidth:550,maxHeight:'92%',backgroundColor:'#101D33',borderWidth:1,borderColor:'#365171',borderRadius:22,overflow:'hidden'},top:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',padding:22},eyebrow:{fontSize:10,color:'#75D9F5',letterSpacing:2,fontWeight:'700'},title:{fontSize:28,color:'#EDF3FF',fontWeight:'700',marginTop:7},close:{padding:12},text:{color:'#A1B1CB',fontSize:13,lineHeight:21},label:{color:'#EDF3FF',fontSize:13,fontWeight:'600',marginBottom:5},plate:{color:'#EDF3FF',fontSize:23,fontWeight:'700',letterSpacing:1},vehicle:{flexDirection:'row',alignItems:'center',gap:16,padding:18,backgroundColor:'#192E49',borderRadius:13,marginBottom:22},button:{backgroundColor:'#8ADCF3',padding:15,borderRadius:12,minHeight:48,marginTop:18,alignItems:'center'},secondary:{backgroundColor:'#223958'},buttonText:{color:'#071425',fontSize:13,fontWeight:'700'},tabs:{flexDirection:'row',gap:8,marginVertical:18},tab:{flex:1,padding:12,borderWidth:1,borderColor:'#304561',borderRadius:10,alignItems:'center'},tabActive:{backgroundColor:'#263F60',borderColor:'#75D9F5'},option:{flexDirection:'row',alignItems:'center',gap:12,padding:14,borderWidth:1,borderColor:'#304561',borderRadius:12},optionSelected:{backgroundColor:'#203F51',borderColor:'#64E2BA'},input:{color:'#EDF3FF',backgroundColor:'#09172A',borderWidth:1,borderColor:'#304561',padding:14,borderRadius:10,fontSize:15,marginBottom:8},help:{color:'#A1B1CB',fontSize:11,lineHeight:19,marginBottom:14,marginTop:5},error:{color:'#FFB9A6',fontSize:12,marginBottom:12},notice:{padding:14,borderRadius:12,backgroundColor:'#20364F',marginVertical:12}});
