import { useEffect,useState } from 'react'
import { useOutletContext,useSearchParams } from 'react-router-dom'
import { Plus,Search,Send,UsersRound } from 'lucide-react'
import { PageHeading,StatusPill } from '../components/UI'
import { campaigns,normalizeSearchText } from '../data/appData'

export default function Campaigns(){
  const {notify}=useOutletContext()
  const [params]=useSearchParams()
  const [query,setQuery]=useState(params.get('campanha')||'')
  useEffect(()=>{const value=params.get('campanha');if(value)setQuery(value)},[params])
  const term=normalizeSearchText(query)
  const filtered=campaigns.filter(c=>[c.name,c.status,c.result,c.audience].some(v=>normalizeSearchText(v).includes(term)))
  return <div><PageHeading eyebrow="Campaign Engine" title="Campanhas" description="Crie e acompanhe campanhas orientadas a resultado." action={<button onClick={()=>notify('Nova campanha em breve')} className="gradient-button"><Plus size={18}/>Nova campanha</button>}/>
    <div className="glass-card mb-5 p-4"><div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-violet-400"/><input value={query} onChange={e=>setQuery(e.target.value)} className="w-full rounded-2xl border border-violet-100 py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-violet-300" placeholder="Buscar campanha..."/></div></div>
    <section className="grid gap-4 lg:grid-cols-3">{filtered.map(c=><article key={c.id} className="glass-card p-5"><div className="flex items-center justify-between"><div className="icon-bubble"><Send size={18}/></div><StatusPill tone={c.tone}>{c.status}</StatusPill></div><h2 className="mt-5 text-lg font-black">{c.name}</h2><div className="mt-4 flex items-center gap-2 text-sm text-slate-500"><UsersRound size={16}/>{c.audience}</div><div className="mt-2 text-sm text-slate-500">{c.result}</div></article>)}</section>
  </div>
}