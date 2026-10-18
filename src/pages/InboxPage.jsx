import { useEffect,useMemo,useState } from 'react'
import { useOutletContext,useSearchParams } from 'react-router-dom'
import { Search,Send } from 'lucide-react'
import { PageHeading,StatusPill } from '../components/UI'
import { conversations,normalizeSearchText } from '../data/appData'

export default function InboxPage(){
  const {notify}=useOutletContext()
  const [params]=useSearchParams()
  const target=params.get('conversa')
  const [selected,setSelected]=useState(conversations.find(c=>c.name===target)||conversations[0])
  const [query,setQuery]=useState('')
  const [message,setMessage]=useState('')
  useEffect(()=>{const match=conversations.find(c=>c.name===target);if(match)setSelected(match)},[target])
  const filtered=useMemo(()=>{const t=normalizeSearchText(query);return conversations.filter(c=>[c.name,c.text].some(v=>normalizeSearchText(v).includes(t)))},[query])
  return <div><PageHeading eyebrow="Omnichannel Inbox" title="Inbox" description="Centralize conversas e transforme respostas em resultados."/>
    <section className="glass-card overflow-hidden"><div className="grid min-h-[620px] lg:grid-cols-[340px_1fr]">
      <aside className="border-b border-violet-100 lg:border-b-0 lg:border-r"><div className="p-4"><div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-violet-400"/><input value={query} onChange={e=>setQuery(e.target.value)} className="w-full rounded-2xl border border-violet-100 py-3 pl-10 pr-4 outline-none" placeholder="Buscar conversa..."/></div></div>{filtered.map(c=><button key={c.id} onClick={()=>setSelected(c)} className={`flex w-full gap-3 border-t border-violet-50 p-4 text-left ${selected.id===c.id?'bg-violet-50':''}`}><div className="grid h-11 w-11 place-items-center rounded-full bg-violet-600 text-xs font-black text-white">{c.initials}</div><div className="min-w-0 flex-1"><div className="font-black">{c.name}</div><div className="truncate text-xs text-slate-500">{c.text}</div></div></button>)}</aside>
      <div className="flex min-h-[520px] flex-col"><header className="border-b border-violet-100 p-5"><div className="font-black">{selected.name}</div><div className="mt-1"><StatusPill tone="emerald">WhatsApp</StatusPill></div></header><div className="flex-1 space-y-4 p-6"><div className="max-w-[75%] rounded-2xl bg-white p-4 shadow-sm">{selected.text}</div><div className="ml-auto max-w-[75%] rounded-2xl bg-gradient-to-br from-violet-700 to-fuchsia-500 p-4 text-white">Olá! Como posso ajudar você hoje?</div></div><div className="border-t border-violet-100 p-4"><div className="flex gap-2"><input value={message} onChange={e=>setMessage(e.target.value)} className="flex-1 rounded-2xl border border-violet-100 px-4 py-3" placeholder="Digite uma mensagem..."/><button onClick={()=>{if(message.trim()){notify('Mensagem enviada');setMessage('')}}} className="grid h-12 w-12 place-items-center rounded-2xl bg-violet-600 text-white"><Send size={18}/></button></div></div></div>
    </div></section>
  </div>
}