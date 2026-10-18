import { useEffect, useMemo, useRef, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  Bell,
  CalendarDays,
  CheckCheck,
  ChevronDown,
  ChevronRight,
  Cog,
  Gem,
  Goal,
  Home,
  Inbox,
  LogOut,
  Menu,
  MessageCircle,
  Rocket,
  Search,
  Send,
  UserRound,
  UsersRound,
  X,
} from 'lucide-react'
import { searchPHX } from '../data/appData'

const navItems = [
  { icon: Home, label: 'Dashboard', to: '/dashboard' },
  { icon: Goal, label: 'Objetivos', to: '/objetivos' },
  { icon: Send, label: 'Campanhas', to: '/campanhas' },
  { icon: Inbox, label: 'Inbox', to: '/inbox', badge: 3 },
  { icon: UsersRound, label: 'Clientes', to: '/clientes' },
  { icon: CalendarDays, label: 'Agenda', to: '/agenda' },
  { icon: Cog, label: 'Configurações', to: '/configuracoes' },
]

const pageNames = {
  '/dashboard': 'Dashboard',
  '/objetivos': 'Objetivos',
  '/campanhas': 'Campanhas',
  '/inbox': 'Inbox',
  '/clientes': 'Clientes',
  '/agenda': 'Agenda',
  '/configuracoes': 'Configurações',
}

const initialNotifications = [
  {
    id: 1,
    title: '14 horários vazios amanhã',
    description: 'Há uma oportunidade de campanha para preencher a agenda.',
    time: 'Agora',
    route: '/campanhas',
    unread: true,
  },
  {
    id: 2,
    title: 'Nova mensagem de Mariana',
    description: 'Ela respondeu à campanha de Cardiologia.',
    time: '8 min',
    route: '/inbox?conversa=Mariana%20Souza',
    unread: true,
  },
  {
    id: 3,
    title: 'Meta semanal em 72%',
    description: 'Você está próximo de atingir o objetivo desta semana.',
    time: '1 h',
    route: '/dashboard',
    unread: true,
  },
]

function SearchResultGroup({ title, icon: Icon, items, onSelect, renderMeta }) {
  if (!items.length) return null

  return (
    <section className="border-t border-violet-100 first:border-t-0">
      <div className="flex items-center gap-2 px-4 pb-2 pt-3 text-[10px] font-black uppercase tracking-[.16em] text-violet-500">
        <Icon size={13} /> {title}
      </div>

      <div className="px-2 pb-2">
        {items.slice(0, 4).map((item) => (
          <button
            key={item.id}
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => onSelect(item)}
            className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition hover:bg-violet-50"
          >
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-500 text-xs font-black text-white">
              {item.name
                .split(' ')
                .map((word) => word[0])
                .slice(0, 2)
                .join('')}
            </div>

            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-black text-slate-800">
                {item.name}
              </div>
              <div className="mt-0.5 truncate text-xs text-slate-500">
                {renderMeta(item)}
              </div>
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
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [notifications, setNotifications] = useState(initialNotifications)

  const headerActionsRef = useRef(null)
  const location = useLocation()
  const navigate = useNavigate()
  const searchResults = useMemo(() => searchPHX(searchQuery), [searchQuery])

  const unreadNotifications = notifications.filter(
    (notification) => notification.unread,
  ).length

  useEffect(() => {
    setSearchOpen(false)
    setNotificationsOpen(false)
    setProfileOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (
        headerActionsRef.current &&
        !headerActionsRef.current.contains(event.target)
      ) {
        setNotificationsOpen(false)
        setProfileOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
    }
  }, [])

  const notify = (message) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 2400)
  }

  const finishSearch = (path) => {
    navigate(path)
    setSearchQuery('')
    setSearchOpen(false)
  }

  const markAllNotificationsAsRead = () => {
    setNotifications((current) =>
      current.map((notification) => ({
        ...notification,
        unread: false,
      })),
    )
  }

  const openNotification = (notification) => {
    setNotifications((current) =>
      current.map((item) =>
        item.id === notification.id ? { ...item, unread: false } : item,
      ),
    )
    setNotificationsOpen(false)
    navigate(notification.route)
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,_#ede9fe,_#f8f7ff_42%,_#ffffff_78%)] text-slate-900">
      {open && (
        <button
          aria-label="Fechar menu"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/45 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[286px] transform overflow-hidden cosmic-grid text-white transition duration-300 lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="relative flex h-full flex-col p-5">
          <div className="flex items-center justify-between">
            <NavLink
              to="/dashboard"
              className="flex items-center gap-3"
              onClick={() => setOpen(false)}
            >
              <div className="grid h-11 w-11 place-items-center rounded-2xl border border-white/25 bg-white/10 shadow-glow">
                <Rocket className="h-6 w-6" />
              </div>

              <div>
                <div className="text-xl font-black">PHX</div>
                <div className="text-[10px] uppercase tracking-[.23em] text-violet-200">
                  Outcome Growth OS
                </div>
              </div>
            </NavLink>

            <button
              onClick={() => setOpen(false)}
              className="rounded-xl p-2 hover:bg-white/10 lg:hidden"
            >
              <X size={20} />
            </button>
          </div>

          <nav className="mt-8 space-y-2">
            {navItems.map(({ icon: Icon, label, to, badge }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${isActive ? 'border border-violet-300/60 bg-white/16 shadow-glow' : 'text-violet-100 hover:bg-white/10'}`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon size={19} />
                    <span>{label}</span>
                    {badge ? (
                      <span className="ml-auto grid h-6 min-w-6 place-items-center rounded-full bg-fuchsia-500 px-1 text-xs font-bold">
                        {badge}
                      </span>
                    ) : null}
                    {isActive && !badge ? (
                      <ChevronRight className="ml-auto h-4 w-4" />
                    ) : null}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="mt-auto rounded-[26px] border border-violet-400/35 bg-white/10 p-4 backdrop-blur-xl">
            <div className="flex items-center gap-2 font-semibold">
              <Gem size={18} className="text-amber-300" />
              Plano Pro
            </div>
            <p className="mt-2 text-sm leading-5 text-violet-100">
              Mais automações e resultados para seu negócio.
            </p>
          </div>
        </div>
      </aside>

      <main className="lg:pl-[286px]">
        <header className="sticky top-0 z-30 border-b border-violet-100/70 bg-white/75 px-4 py-3 backdrop-blur-xl sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setOpen(true)}
              className="grid h-11 w-11 place-items-center rounded-2xl border border-violet-100 bg-white text-violet-700 lg:hidden"
            >
              <Menu />
            </button>

            <div className="hidden min-w-0 md:block">
              <div className="text-[11px] font-bold uppercase tracking-[.18em] text-violet-500">
                PHX
              </div>
              <div className="truncate font-black">
                {pageNames[location.pathname] || 'PHX'}
              </div>
            </div>

            <div className="relative order-3 w-full md:order-none md:ml-auto md:max-w-xl">
              <Search className="absolute left-4 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-violet-500" />

              <input
                value={searchQuery}
                onChange={(event) => {
                  setSearchQuery(event.target.value)
                  setSearchOpen(true)
                }}
                onFocus={() => searchQuery.trim() && setSearchOpen(true)}
                onBlur={() =>
                  window.setTimeout(() => setSearchOpen(false), 120)
                }
                onKeyDown={(event) => {
                  if (event.key === 'Escape') {
                    setSearchOpen(false)
                    event.currentTarget.blur()
                  }
                }}
                className="w-full rounded-2xl border border-violet-100 bg-white/90 py-3 pl-11 pr-10 text-sm outline-none ring-violet-300 transition focus:ring-2"
                placeholder="Buscar clientes, campanhas, conversas..."
              />

              {searchQuery && (
                <button
                  type="button"
                  aria-label="Limpar busca"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 z-10 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-lg text-slate-400 hover:bg-violet-50 hover:text-violet-600"
                >
                  <X size={15} />
                </button>
              )}

              {searchOpen && searchQuery.trim() && (
                <div className="absolute left-0 right-0 top-[calc(100%+10px)] z-50 max-h-[70vh] overflow-y-auto rounded-[24px] border border-violet-100 bg-white/95 p-2 shadow-2xl shadow-violet-200/60 backdrop-blur-xl">
                  <div className="flex items-center justify-between px-3 py-2">
                    <div>
                      <div className="text-sm font-black">Busca global</div>
                      <div className="text-xs text-slate-400">
                        Clientes, campanhas e conversas
                      </div>
                    </div>

                    <span className="rounded-full bg-violet-50 px-2.5 py-1 text-[11px] font-black text-violet-600">
                      {searchResults.total} resultados
                    </span>
                  </div>

                  {searchResults.total === 0 ? (
                    <div className="px-4 py-8 text-center">
                      <Search className="mx-auto text-violet-500" />
                      <div className="mt-3 text-sm font-black">
                        Nenhum resultado encontrado
                      </div>
                    </div>
                  ) : (
                    <>
                      <SearchResultGroup
                        title="Clientes"
                        icon={UsersRound}
                        items={searchResults.clients}
                        onSelect={(item) =>
                          finishSearch(
                            `/clientes?cliente=${encodeURIComponent(item.name)}`,
                          )
                        }
                        renderMeta={(item) =>
                          `${item.service} • ${item.phone}`
                        }
                      />

                      <SearchResultGroup
                        title="Campanhas"
                        icon={Send}
                        items={searchResults.campaigns}
                        onSelect={(item) =>
                          finishSearch(
                            `/campanhas?campanha=${encodeURIComponent(item.name)}`,
                          )
                        }
                        renderMeta={(item) =>
                          `${item.status} • ${item.audience}`
                        }
                      />

                      <SearchResultGroup
                        title="Conversas"
                        icon={MessageCircle}
                        items={searchResults.conversations}
                        onSelect={(item) =>
                          finishSearch(
                            `/inbox?conversa=${encodeURIComponent(item.name)}`,
                          )
                        }
                        renderMeta={(item) => item.text}
                      />
                    </>
                  )}
                </div>
              )}
            </div>

            <div
              ref={headerActionsRef}
              className="relative ml-auto flex items-center gap-2 md:ml-0"
            >
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setNotificationsOpen((current) => !current)
                    setProfileOpen(false)
                  }}
                  className={`relative grid h-11 w-11 place-items-center rounded-2xl border bg-white transition ${notificationsOpen ? 'border-violet-300 text-violet-700 shadow-lg shadow-violet-100' : 'border-violet-100 text-violet-700 hover:bg-violet-50'}`}
                  aria-label="Abrir notificações"
                  aria-expanded={notificationsOpen}
                >
                  <Bell size={19} />

                  {unreadNotifications > 0 && (
                    <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full border-2 border-white bg-fuchsia-500 px-1 text-[10px] font-black text-white">
                      {unreadNotifications}
                    </span>
                  )}
                </button>

                {notificationsOpen && (
                  <div className="absolute right-0 top-[calc(100%+12px)] z-50 w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-[24px] border border-violet-100 bg-white/95 shadow-2xl shadow-violet-200/50 backdrop-blur-xl">
                    <div className="flex items-center justify-between border-b border-violet-100 px-4 py-4">
                      <div>
                        <div className="font-black text-slate-900">
                          Notificações
                        </div>
                        <div className="mt-0.5 text-xs text-slate-400">
                          {unreadNotifications > 0
                            ? `${unreadNotifications} não lidas`
                            : 'Tudo em dia'}
                        </div>
                      </div>

                      {unreadNotifications > 0 && (
                        <button
                          type="button"
                          onClick={markAllNotificationsAsRead}
                          className="flex items-center gap-1.5 rounded-xl px-2.5 py-2 text-xs font-bold text-violet-600 transition hover:bg-violet-50"
                        >
                          <CheckCheck size={15} />
                          Marcar lidas
                        </button>
                      )}
                    </div>

                    <div className="max-h-[380px] overflow-y-auto p-2">
                      {notifications.map((notification) => (
                        <button
                          key={notification.id}
                          type="button"
                          onClick={() => openNotification(notification)}
                          className={`relative flex w-full gap-3 rounded-2xl p-3 text-left transition hover:bg-violet-50 ${notification.unread ? 'bg-violet-50/70' : ''}`}
                        >
                          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-violet-100 text-violet-700">
                            <Bell size={17} />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="pr-4 text-sm font-black text-slate-800">
                              {notification.title}
                            </div>
                            <div className="mt-1 text-xs leading-5 text-slate-500">
                              {notification.description}
                            </div>
                            <div className="mt-1.5 text-[11px] font-semibold text-violet-500">
                              {notification.time}
                            </div>
                          </div>

                          {notification.unread && (
                            <span className="absolute right-3 top-4 h-2 w-2 rounded-full bg-fuchsia-500" />
                          )}
                        </button>
                      ))}
                    </div>

                    <div className="border-t border-violet-100 p-2">
                      <button
                        type="button"
                        onClick={() => {
                          setNotificationsOpen(false)
                          notify('Central de notificações em evolução')
                        }}
                        className="w-full rounded-2xl px-4 py-3 text-sm font-bold text-violet-600 transition hover:bg-violet-50"
                      >
                        Ver todas as notificações
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen((current) => !current)
                    setNotificationsOpen(false)
                  }}
                  className={`flex items-center gap-3 rounded-2xl px-2 py-1.5 transition ${profileOpen ? 'bg-violet-50' : 'hover:bg-violet-50'}`}
                  aria-label="Abrir menu do perfil"
                  aria-expanded={profileOpen}
                >
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-500 text-sm font-bold text-white">
                    P
                  </div>

                  <div className="hidden text-left sm:block">
                    <div className="text-sm font-bold">Pedro</div>
                    <div className="text-xs text-slate-500">
                      Clínica Vida Plena
                    </div>
                  </div>

                  <ChevronDown
                    size={16}
                    className={`hidden text-slate-400 transition sm:block ${profileOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 top-[calc(100%+12px)] z-50 w-64 overflow-hidden rounded-[22px] border border-violet-100 bg-white/95 p-2 shadow-2xl shadow-violet-200/50 backdrop-blur-xl">
                    <div className="rounded-2xl bg-violet-50 p-3">
                      <div className="font-black text-slate-900">
                        Pedro Henrique
                      </div>
                      <div className="mt-1 text-xs text-slate-500">
                        Administrador do workspace
                      </div>
                    </div>

                    <div className="mt-2 space-y-1">
                      <button
                        type="button"
                        onClick={() => {
                          setProfileOpen(false)
                          notify('Página de perfil em evolução')
                        }}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-slate-700 transition hover:bg-violet-50"
                      >
                        <UserRound size={17} className="text-violet-600" />
                        Meu perfil
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setProfileOpen(false)
                          navigate('/configuracoes')
                        }}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-slate-700 transition hover:bg-violet-50"
                      >
                        <Cog size={17} className="text-violet-600" />
                        Configurações
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setProfileOpen(false)
                          notify('Logout será conectado quando criarmos a autenticação')
                        }}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
                      >
                        <LogOut size={17} />
                        Sair
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-[1580px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
          <Outlet context={{ notify }} />
        </div>
      </main>

      {toast && (
        <div className="fixed bottom-5 left-1/2 z-[100] -translate-x-1/2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-2xl">
          {toast}
        </div>
      )}
    </div>
  )
}
