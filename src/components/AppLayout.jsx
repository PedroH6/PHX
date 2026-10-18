import { useEffect, useMemo, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  Bell, CalendarDays, ChevronDown, ChevronRight, Cog, Gem, Goal, Home,
  Inbox, Menu, MessageCircle, Rocket, Search, Send, Sparkles, UsersRound, X,
} from 'lucide-react'
import { searchPHX } from '../data/appData'

const navItems = [
  { icon: Home, label: 'Dashboard', to: '/dashboard' },
  { icon: Goal, label: 'Objetivos', to: '/objetivos' },
  { icon: Send, label: 'Campanhas', to: '/campanhas' },
  { icon: Inbox, label: 'Inbox', to: '/inbox', badge: 3 },
  { icon: UsersRound, label: 'Clientes', to: '/clientes' },
  { icon: CalendarDays, label: 'Agenda', to: '/agenda' },
  { icon: Sparkles, label: 'IA', to: '/ia' },
  { icon: Cog, label: 'Configurações', to: '/configuracoes' },
]

const pageNames = {
  '/dashboard': 'Dashboard',
  '/objetivos': 'Objetivos',
  '/campanhas': 'Campanhas',
  '/inbox': 'Inbox',
  '/clientes': 'Clientes',
  '/agenda': 'Agenda',
  '/ia': 'Inteligência Artificial',
  '/configuracoes': 'Configurações',
}

function SearchResultGroup({ title, icon: Icon, items, onSelect, renderMeta }) {
  if (!items.length) return null
  return (
    <section className="border-t border-violet-100 first:border-t-0">
      <div className="flex items-center gap-2 px-4 pb-2 pt-3 text-[10px] font-black uppercase tracking-[.16em] text-violet-500"><Icon size={13} /> {title}</div>
      <div className="px-2 pb-2">
        {items.slice(0, 4).map((item) => (
          <button key={item.id} type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => onSelect(item)} className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition hover:bg-violet-50">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-500 text-xs font-black text-white">{item.name.split(' ').map((w) => w[0]).slice(0, 2).join('')}</div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-black text-slate-800">{item.name}</div>
              <div className="mt-0.5 truncate text-xs text-slate-500">{renderMeta(item)}</div>
            </div>
            <ChevronRight size={16} className="shrink-0 text-violet-400" />
          </button>
        ))}
      </div>
    </section>
  )
}

export default function AppLayout() {
  const [open, setOpen] = useState(false)
  const [toast, setToast] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const searchResults = useMemo(() => searchPHX(searchQuery), [searchQuery])

  useEffect(() => setSearchOpen(false), [location.pathname])

  const notify = (message) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 2400)
  }

  const finishSearch = (path) => {
    navigate(path)
    setSearchQuery('')
    setSearchOpen(false)
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,_#ede9fe,_#f8f7ff_42%,_#ffffff_78%)] text-slate-900">
      {open && <button aria-label="Fechar menu" onClick={() => setOpen(false)} className="fixed inset-0 z-40 bg-slate-950/45 lg:hidden" />}
      <aside className={`fixed inset-y-0 left-0 z-50 w-[286px] transform overflow-hidden cosmic-grid text-white transition duration-300 lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="relative flex h-full flex-col p-5">
          <div className="flex items-center justify-between">
            <NavLink to="/dashboard" className="flex items-center gap-3" onClick={() => setOpen(false)}>
              <div className="grid h-11 w-11 place-items-center rounded-2xl border border-white/25 bg-white/10 shadow-glow"><Rocket className="h-6 w-6" /></div>
              <div><div className="text-xl font-black">PHX</div><div className="text-[10px] uppercase tracking-[.23em] text-violet-200">Outcome Growth OS</div></div>
            </NavLink>
            <button onClick={() => setOpen(false)} className="rounded-xl p-2 hover:bg-white/10 lg:hidden"><X size={20} /></button>
          </div>
          <nav className="mt-8 space-y-2">
            {navItems.map(({ icon: Icon, label, to, badge }) => (
              <NavLink key={to} to={to} onClick={() => setOpen(false)} className={({ isActive }) => `flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${isActive ? 'border border-violet-300/60 bg-white/16 shadow-glow' : 'text-violet-100 hover:bg-white/10'}`}>
                {({ isActive }) => <><Icon size={19} /><span>{label}</span>{badge ? <span className="ml-auto grid h-6 min-w-6 place-items-center rounded-full bg-fuchsia-500 px-1 text-xs font-bold">{badge}</span> : null}{isActive && !badge ? <ChevronRight className="ml-auto h-4 w-4" /> : null}</>}
              </NavLink>
            ))}
          </nav>
          <div className="mt-auto rounded-[26px] border border-violet-400/35 bg-white/10 p-4 backdrop-blur-xl">
            <div className="flex items-center gap-2 font-semibold"><Gem size={18} className="text-amber-300" /> Plano Pro</div>
            <p className="mt-2 text-sm leading-5 text-violet-100">Mais automações, IA e resultados para seu negócio.</p>
          </div>
        </div>
      </aside>

      <main className="lg:pl-[286px]">
        <header className="sticky top-0 z-30 border-b border-violet-100/70 bg-white/75 px-4 py-3 backdrop-blur-xl sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-3">
            <button onClick={() => setOpen(true)} className="grid h-11 w-11 place-items-center rounded-2xl border border-violet-100 bg-white text-violet-700 lg:hidden"><Menu /></button>
            <div className="hidden min-w-0 md:block"><div className="text-[11px] font-bold uppercase tracking-[.18em] text-violet-500">PHX</div><div className="truncate font-black">{pageNames[location.pathname] || 'PHX'}</div></div>

            <div className="relative order-3 w-full md:order-none md:ml-auto md:max-w-xl">
              <Search className="absolute left-4 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-violet-500" />
              <input value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setSearchOpen(true) }} onFocus={() => searchQuery.trim() && setSearchOpen(true)} onBlur={() => window.setTimeout(() => setSearchOpen(false), 120)} onKeyDown={(e) => { if (e.key === 'Escape') { setSearchOpen(false); e.currentTarget.blur() } }} className="w-full rounded-2xl border border-violet-100 bg-white/90 py-3 pl-11 pr-10 text-sm outline-none ring-violet-300 transition focus:ring-2" placeholder="Buscar clientes, campanhas, conversas..." />
              {searchQuery && <button type="button" aria-label="Limpar busca" onMouseDown={(e) => e.preventDefault()} onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 z-10 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-lg text-slate-400 hover:bg-violet-50 hover:text-violet-600"><X size={15} /></button>}
              {searchOpen && searchQuery.trim() && (
                <div className="absolute left-0 right-0 top-[calc(100%+10px)] z-50 max-h-[70vh] overflow-y-auto rounded-[24px] border border-violet-100 bg-white/95 p-2 shadow-2xl shadow-violet-200/60 backdrop-blur-xl">
                  <div className="flex items-center justify-between px-3 py-2"><div><div className="text-sm font-black">Busca global</div><div className="text-xs text-slate-400">Clientes, campanhas e conversas</div></div><span className="rounded-full bg-violet-50 px-2.5 py-1 text-[11px] font-black text-violet-600">{searchResults.total} resultados</span></div>
                  {searchResults.total === 0 ? <div className="px-4 py-8 text-center"><Search className="mx-auto text-violet-500" /><div className="mt-3 text-sm font-black">Nenhum resultado encontrado</div></div> : <>
                    <SearchResultGroup title="Clientes" icon={UsersRound} items={searchResults.clients} onSelect={(item) => finishSearch(`/clientes?cliente=${encodeURIComponent(item.name)}`)} renderMeta={(item) => `${item.service} • ${item.phone}`} />
                    <SearchResultGroup title="Campanhas" icon={Send} items={searchResults.campaigns} onSelect={(item) => finishSearch(`/campanhas?campanha=${encodeURIComponent(item.name)}`)} renderMeta={(item) => `${item.status} • ${item.audience}`} />
                    <SearchResultGroup title="Conversas" icon={MessageCircle} items={searchResults.conversations} onSelect={(item) => finishSearch(`/inbox?conversa=${encodeURIComponent(item.name)}`)} renderMeta={(item) => item.text} />
                  </>}
                </div>
              )}
            </div>

            <button className="ml-auto grid h-11 w-11 place-items-center rounded-2xl border border-violet-100 bg-white text-violet-700 md:ml-0"><Bell size={19} /></button>
            <button className="flex items-center gap-3 rounded-2xl px-2 py-1.5 hover:bg-violet-50">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-500 text-sm font-bold text-white">P</div>
              <div className="hidden text-left sm:block"><div className="text-sm font-bold">Pedro</div><div className="text-xs text-slate-500">Clínica Vida Plena</div></div><ChevronDown size={16} className="hidden text-slate-400 sm:block" />
            </button>
          </div>
        </header>
        <div className="mx-auto max-w-[1580px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7"><Outlet context={{ notify }} /></div>
      </main>
      {toast && <div className="fixed bottom-5 left-1/2 z-[100] -translate-x-1/2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-2xl">{toast}</div>}
    </div>
  )
}
