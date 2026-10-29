import React,{useState,useEffect} from 'react';
import {View,Text,StyleSheet} from 'react-native';
import {planBalance,money,durationText} from './parkingPlan';
export default function PlanSummary({entry}) {
 const [now,setNow]=useState(Date.now());
 useEffect(()=>{if(entry?.closed)return;setNow(Date.now());const timer=setInterval(()=>setNow(Date.now()),1000);return()=>clearInterval(timer);},[entry?.id,entry?.closed]);
 const balance=planBalance(entry,now);
 return <View style={s.box}>
 {balance?<><View style={s.row}><View style={s.cell}><Text style={s.label}>Total contratado</Text><Text style={s.value}>{money(balance.totalPriceCents)}</Text></View><View style={s.cell}><Text style={s.label}>Tempo contratado</Text><Text style={s.value}>{balance.totalMinutes} min</Text></View></View>
 <Text style={s.label}>{entry.closed?'Saldo de tempo na saída':balance.overdue?'Tempo excedido':'Tempo restante'}</Text>
 <Text style={[s.timer,balance.overdue>0&&{color:'#FFB9A6'}]}>{durationText(balance.overdue||balance.remaining)}</Text>
 {entry.closed&&balance.overdue>0&&<Text style={s.label}>Tempo excedido na saída</Text>}
 <Text style={s.label}>Término previsto: {new Date(balance.dueAt).toLocaleString('pt-BR')}</Text>
 <Text style={s.value}>Saldo proporcional: {money(balance.remainingCents)}</Text>
 <Text style={s.help}>Valor referente ao tempo não utilizado. Não indica pagamento pendente ou reembolso. Tempo excedido não gera cobrança automática.</Text></>:<Text style={s.label}>Esta ocupação antiga não possui tempo ou valor contratado.</Text>}
 {(entry?.extensions||[]).length>0&&<View style={{marginTop:16}}><Text style={s.value}>Prorrogações</Text>{entry.extensions.map(e=><View key={e.id} style={{marginTop:10}}><Text style={s.notes}>+{e.minutes} min · Recebido: {money(e.priceCents)}</Text><Text style={s.label}>Registrada: {new Date(e.createdAt).toLocaleString('pt-BR')}</Text><Text style={s.label}>Novo prazo: {new Date(e.endsAt).toLocaleString('pt-BR')}</Text></View>)}</View>}
 <Text style={[s.label,{marginTop:12}]}>Observações do cliente</Text><Text style={s.notes}>{entry?.notes||'Nenhuma observação.'}</Text>
 </View>;
}
const s=StyleSheet.create({box:{padding:16,borderRadius:13,borderWidth:1,borderColor:'#304561',backgroundColor:'#0C192D',marginVertical:16},row:{flexDirection:'row',flexWrap:'wrap',gap:20,marginBottom:15},cell:{flex:1,minWidth:110},label:{color:'#A1B1CB',fontSize:12,lineHeight:20},value:{color:'#EDF3FF',fontSize:17,fontWeight:'600',marginVertical:5},timer:{fontSize:23,fontWeight:'700',color:'#64E2BA',marginVertical:8},help:{color:'#91A5C2',fontSize:11,lineHeight:17,marginTop:6},notes:{color:'#EDF3FF',fontSize:13,lineHeight:21,marginTop:5}});
