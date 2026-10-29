import React,{useState,useEffect} from 'react';
import {View,Text,TextInput,Pressable,StyleSheet} from 'react-native';
import {PLANS,parsePrice,planBalance,extensionTiming,money} from './parkingPlan';
export default function ExtensionForm({entry,busy,onExtend}) {
 const [open,setOpen]=useState(false),[option,setOption]=useState('hour');
 const [minutes,setMinutes]=useState(''),[price,setPrice]=useState('');
 useEffect(()=>{setOpen(false);},[entry?.extensions?.length]);
 const preset=PLANS.find(p=>p.id===option);
 const plan={minutes:preset?preset.minutes:(/^\d+$/.test(minutes)?Number(minutes):0),priceCents:preset?preset.priceCents:parsePrice(price)};
 const valid=Number.isInteger(plan.minutes)&&plan.minutes>0&&plan.minutes<=525600&&Number.isInteger(plan.priceCents)&&plan.priceCents>0&&plan.priceCents<=999999999;
 const eligible=entry&&!entry.closed&&planBalance(entry);
 const preview=valid&&eligible?extensionTiming(entry,plan.minutes):null;
 return <View style={s.box}>
 <Pressable accessibilityRole="button" accessibilityLabel="Prorrogar estadia" disabled={!eligible||busy} onPress={()=>setOpen(v=>!v)} style={[s.button,(!eligible||busy)&&{opacity:0.4}]}><Text style={s.buttonText}>{open?'Cancelar prorrogação':'Prorrogar estadia'}</Text></Pressable>
 {!eligible&&<Text style={s.help}>Ocupações antigas sem período contratado não podem ser prorrogadas. Encerre a ocupação e registre uma nova entrada com o período.</Text>}
 {open&&<><Text style={s.heading}>Adicionar tempo à estadia</Text><Text style={s.help}>O período é somado ao prazo atual. Se ele já venceu, começa agora. Não inclui cobrança automática pelo atraso anterior.</Text>
 {[...PLANS,{id:'custom',label:'Personalizar tempo e valor'}].map(p=><Pressable key={p.id} accessibilityRole="radio" accessibilityLabel={`Prorrogar: ${p.label}`} accessibilityState={{checked:option===p.id}} onPress={()=>setOption(p.id)} style={[s.option,option===p.id&&s.selected]}><Text style={s.text}>{p.label}</Text></Pressable>)}
 {option==='custom'&&<><Text style={s.text}>Tempo adicional (minutos)</Text><TextInput accessibilityLabel="Minutos adicionais" value={minutes} onChangeText={setMinutes} keyboardType="number-pad" maxLength={6} style={s.input} placeholder="Ex.: 60" placeholderTextColor="#8096B6"/><Text style={s.text}>Valor recebido pela prorrogação (R$)</Text><TextInput accessibilityLabel="Valor recebido na prorrogação" value={price} onChangeText={setPrice} keyboardType="decimal-pad" maxLength={10} style={s.input} placeholder="Ex.: 20,00" placeholderTextColor="#8096B6"/>{!valid&&<Text style={s.help}>Informe minutos inteiros positivos e um valor positivo com até duas casas decimais.</Text>}</>}
 {preview&&<View style={s.preview}><Text style={s.text}>Adicionar: {plan.minutes} min</Text><Text style={s.text}>Valor recebido: {money(plan.priceCents)}</Text><Text style={s.text}>Novo prazo previsto: {new Date(preview.endsAt).toLocaleString('pt-BR')}</Text></View>}
 <Text style={s.help}>Confirme após receber o valor do cliente. O app registra o recebimento informado, sem processar pagamentos.</Text>
 <Pressable accessibilityRole="button" accessibilityLabel="Confirmar prorrogação" disabled={!valid||busy} onPress={()=>onExtend(entry.id,plan)} style={[s.button,(!valid||busy)&&{opacity:0.4}]}><Text style={s.buttonText}>{busy?'Salvando…':'Confirmar prorrogação'}</Text></Pressable></>}
 </View>;
}
const s=StyleSheet.create({box:{marginVertical:10},button:{borderRadius:12,backgroundColor:'#263E61',borderWidth:1,borderColor:'#6386B2',padding:15,alignItems:'center',minHeight:48},buttonText:{color:'#E4F1FF',fontSize:14,fontWeight:'600'},heading:{color:'#EDF3FF',fontSize:19,fontWeight:'600',marginTop:20},help:{color:'#A1B1CB',fontSize:12,lineHeight:20,marginVertical:10},text:{color:'#EDF3FF',fontSize:13,lineHeight:22},option:{padding:13,borderWidth:1,borderColor:'#304561',borderRadius:10,marginBottom:9},selected:{backgroundColor:'#203F51',borderColor:'#64E2BA'},input:{color:'#EDF3FF',backgroundColor:'#09172A',borderWidth:1,borderColor:'#304561',padding:13,borderRadius:10,marginVertical:8,fontSize:15},preview:{backgroundColor:'#1C3450',borderRadius:12,padding:14,marginTop:10}});
