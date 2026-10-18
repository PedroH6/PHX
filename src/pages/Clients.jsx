import { useEffect,useState } from 'react'
import { useOutletContext,useSearchParams } from 'react-router-dom'
import { Plus,Search,UsersRound } from 'lucide-react'
import { PageHeading,StatusPill } from '../components/UI'
import { clients,normalizeSearchText } from '../data/appData'

export default function Clients(){
  const {notify}=useOutletContext()
  const [params]=useSearchParams()
  const [query,setQuery]=useState(params.get('cliente')||'')
  useEffect(()=>{const value=params.get('cliente');if(value)setQuery(value)},[params])
  const term=normalizeSearchText(query)
  const filtered=clients.filter(c=>[c.name,c.phone,c.service,c.status].some(v=>normalizeSearchText(v).includes(term)))
  return <div><PageHeading eyebrow="CRM" title="Clientes" description="Organize sua base e encontre rapidamente quem precisa de atenção." action={<button onClick={()=>notify('Cadastro de cliente em breve')} className="gradient-button"><Plus size={18}/>Novo cliente</button>}/>
    <section className="glass-card overflow-hidden"><div className="border-b border-violet-100 p-4"><div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-violet-400"/><input value={query} onChange={e=>setQuery(e.target.value)} className="w-full rounded-2xl border border-violet-100 py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-violet-300" placeholder="Buscar cliente..."/></div></div>
      <div>{filtered.map(c=><article key={c.id} className="grid gap-3 border-b border-violet-50 p-4 md:grid-cols-[1.4fr_1fr_1fr_.7fr] md:items-center"><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-500 text-xs font-black text-white">{c.name.split(' ').map(n=>n[0]).slice(0,2).join('')}</div><div><div className="font-black">{c.name}</div><div className="text-xs text-slate-400">{c.phone}</div></div></div><div className="text-sm text-slate-500">{c.service}</div><div className="text-sm text-slate-500">{c.last}</div><StatusPill tone={c.status==='Ativo'?'emerald':'amber'}>{c.status}</StatusPill></article>)}</div>
    </section>
    <div className="mt-4 glass-card flex items-center gap-4 p-5"><div className="icon-bubble"><UsersRound size={20}/></div><div><div className="text-2xl font-black">1.320</div><div className="text-sm text-slate-500">clientes na base</div></div></div>
  </div>
}