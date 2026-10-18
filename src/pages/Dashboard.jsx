import { useNavigate } from 'react-router-dom'
import { CalendarDays, Send, Sparkles, UsersRound } from 'lucide-react'
import { PageHeading, StatusPill } from '../components/UI'

export default function Dashboard(){
  const navigate=useNavigate()
  return <div>
    <PageHeading eyebrow="Outcome Growth OS" title="Dashboard" description="Acompanhe resultados, oportunidades e ações sugeridas pela IA." action={<button onClick={()=>navigate('/objetivos')} className="gradient-button"><Sparkles size={18}/>Criar estratégia com IA</button>}/>
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {[['Meta da semana','36 / 50','agendamentos'],['Agendamentos','36','esta semana'],['Campanhas ativas','4','em andamento'],['Receita gerada','R$ 12.480','este mês']].map(([a,b,c])=><div key={a} className="glass-card p-5"><div className="text-sm font-bold text-slate-500">{a}</div><div className="mt-3 text-3xl font-black">{b}</div><div className="mt-1 text-sm text-slate-400">{c}</div></div>)}
    </section>
    <section className="mt-5 grid gap-5 xl:grid-cols-[1.15fr_.85fr]">
      <div className="glass-card p-5"><div className="flex items-center gap-2"><Sparkles className="text-violet-600"/><h2 className="text-lg font-black">Oportunidades detectadas pela IA</h2></div><div className="mt-4 space-y-3">
        {[['14 horários vazios amanhã','Agenda','/campanhas'],['312 pacientes sem retornar há 6 meses','Clientes','/clientes'],['Nova agenda aberta de Cardiologia','Campanha','/campanhas']].map(([t,s,to])=><button key={t} onClick={()=>navigate(to)} className="flex w-full items-center gap-4 rounded-2xl border border-violet-100 bg-white p-4 text-left hover:bg-violet-50"><div className="icon-bubble"><CalendarDays size={18}/></div><div className="flex-1"><div className="font-black">{t}</div><div className="text-xs text-slate-500">{s}</div></div><StatusPill>Abrir</StatusPill></button>)}
      </div>
      <div className="glass-card p-5"><h2 className="text-lg font-black">Resultado da campanha</h2><p className="mt-1 text-sm text-slate-500">Check-up Preventivo</p><div className="mt-6 grid grid-cols-2 gap-3">{[['280','mensagens'],['67','respostas'],['21','interessados'],['9','agendamentos']].map(([v,l])=><div key={l} className="rounded-2xl bg-violet-50 p-4 text-center"><div className="text-2xl font-black text-violet-700">{v}</div><div className="text-xs text-slate-500">{l}</div></div>)}</div></div>
    </section>
  </div>
}