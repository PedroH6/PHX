import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CalendarDays,
  Check,
  CircleCheckBig,
  Lightbulb,
  Megaphone,
  Minus,
  Pencil,
  Plus,
  Target,
  TrendingUp,
  X,
} from 'lucide-react'
import { PageHeading, StatusPill } from '../components/UI'
import { loadCampaigns } from '../data/appData'

const DEFAULT_WEEKLY_GOAL = 50
const DEFAULT_APPOINTMENTS = 36
const DEFAULT_ACTIVE_CAMPAIGNS = 4
const DEFAULT_REVENUE = 12480

function clampNumber(value, min = 0, max = 9999999, fallback = min) {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return fallback
  return Math.min(max, Math.max(min, Math.round(parsed)))
}

function usePersistentNumber(key, defaultValue, options = {}) {
  const { min = 0, max = 9999999 } = options

  const [value, setValue] = useState(() => {
    const saved = localStorage.getItem(key)
    return saved === null
      ? defaultValue
      : clampNumber(saved, min, max, defaultValue)
  })

  useEffect(() => {
    localStorage.setItem(key, String(value))
  }, [key, value])

  const updateValue = (nextValue) => {
    setValue(clampNumber(nextValue, min, max, defaultValue))
  }

  return [value, updateValue]
}

function EditableMetricCard({
  label,
  value,
  onChange,
  description,
  step = 1,
  min = 0,
  max = 9999999,
  formatValue = (number) => String(number),
  editLabel = 'Editar valor',
}) {
  const [editing, setEditing] = useState(false)
  const [draftValue, setDraftValue] = useState(value)

  useEffect(() => {
    if (!editing) setDraftValue(value)
  }, [editing, value])

  const adjustDraft = (amount) => {
    setDraftValue((current) =>
      clampNumber(Number(current) + amount, min, max, value),
    )
  }

  const saveValue = () => {
    const safeValue = clampNumber(draftValue, min, max, value)
    onChange(safeValue)
    setDraftValue(safeValue)
    setEditing(false)
  }

  const cancelEditing = () => {
    setDraftValue(value)
    setEditing(false)
  }

  return (
    <div className="glass-card relative overflow-hidden p-5">
      <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-violet-100/70 blur-2xl" />

      <div className="relative flex items-start justify-between gap-3">
        <div className="text-sm font-bold text-slate-500">{label}</div>

        {!editing ? (
          <button
            type="button"
            onClick={() => {
              setDraftValue(value)
              setEditing(true)
            }}
            className="grid h-9 w-9 place-items-center rounded-xl border border-violet-100 bg-white text-violet-600 transition hover:bg-violet-50"
            aria-label={editLabel}
            title={editLabel}
          >
            <Pencil size={15} />
          </button>
        ) : (
          <button
            type="button"
            onClick={cancelEditing}
            className="grid h-9 w-9 place-items-center rounded-xl border border-violet-100 bg-white text-slate-400 transition hover:bg-slate-50"
            aria-label="Cancelar edição"
            title="Cancelar edição"
          >
            <X size={15} />
          </button>
        )}
      </div>

      <div className="relative mt-3 text-3xl font-black text-slate-900">
        {formatValue(value)}
      </div>
      <div className="relative mt-1 text-sm text-slate-400">{description}</div>

      {editing && (
        <div className="relative mt-5 rounded-2xl border border-violet-100 bg-violet-50/70 p-3">
          <div className="mb-2 text-xs font-bold text-slate-500">
            Definir novo valor
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => adjustDraft(-step)}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-violet-100 bg-white text-violet-700 transition hover:bg-violet-100"
              aria-label={`Diminuir ${step}`}
            >
              <Minus size={16} />
            </button>

            <input
              type="number"
              min={min}
              max={max}
              value={draftValue}
              onChange={(event) => setDraftValue(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') saveValue()
                if (event.key === 'Escape') cancelEditing()
              }}
              className="h-10 min-w-0 flex-1 rounded-xl border border-violet-100 bg-white px-3 text-center font-black text-slate-800 outline-none transition focus:border-violet-300 focus:ring-2 focus:ring-violet-200"
            />

            <button
              type="button"
              onClick={() => adjustDraft(step)}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-violet-100 bg-white text-violet-700 transition hover:bg-violet-100"
              aria-label={`Aumentar ${step}`}
            >
              <Plus size={16} />
            </button>

            <button
              type="button"
              onClick={saveValue}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-violet-600 text-white transition hover:bg-violet-700"
              aria-label="Salvar valor"
              title="Salvar valor"
            >
              <Check size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function WeeklyGoalCard({ appointments, goal, setGoal }) {
  const [draftGoal, setDraftGoal] = useState(goal)
  const [editing, setEditing] = useState(false)

  const progress = useMemo(
    () => Math.min(100, Math.round((appointments / goal) * 100)),
    [appointments, goal],
  )

  const remaining = Math.max(0, goal - appointments)
  const completed = appointments >= goal

  const adjustGoal = (amount) => {
    setDraftGoal((current) =>
      clampNumber(Number(current) + amount, 1, 999, goal),
    )
  }

  const saveGoal = () => {
    const safeGoal = clampNumber(draftGoal, 1, 999, goal)
    setGoal(safeGoal)
    setDraftGoal(safeGoal)
    setEditing(false)
  }

  const cancelEditing = () => {
    setDraftGoal(goal)
    setEditing(false)
  }

  return (
    <div className="glass-card relative overflow-hidden p-5">
      <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-violet-200/45 blur-2xl" />

      <div className="relative flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-bold text-slate-500">Meta da semana</div>
          <div className="mt-1 text-xs text-slate-400">
            {completed ? 'Meta atingida 🎉' : `Faltam ${remaining} agendamentos`}
          </div>
        </div>

        {!editing ? (
          <button
            type="button"
            onClick={() => {
              setDraftGoal(goal)
              setEditing(true)
            }}
            className="grid h-9 w-9 place-items-center rounded-xl border border-violet-100 bg-white text-violet-600 transition hover:bg-violet-50"
            aria-label="Editar meta semanal"
            title="Editar meta semanal"
          >
            <Pencil size={15} />
          </button>
        ) : (
          <button
            type="button"
            onClick={cancelEditing}
            className="grid h-9 w-9 place-items-center rounded-xl border border-violet-100 bg-white text-slate-400 transition hover:bg-slate-50"
            aria-label="Cancelar edição"
          >
            <X size={15} />
          </button>
        )}
      </div>

      <div className="relative mt-5 flex items-end justify-between gap-4">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">
              {appointments}
            </span>
            <span className="text-lg font-bold text-slate-400">/ {goal}</span>
          </div>
          <div className="mt-1 text-sm text-slate-400">agendamentos</div>
        </div>

        <div
          className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-[conic-gradient(#7c3aed_var(--progress),#ede9fe_0)] p-1.5"
          style={{ '--progress': `${progress}%` }}
        >
          <div className="grid h-full w-full place-items-center rounded-full bg-white text-sm font-black text-violet-700">
            {progress}%
          </div>
        </div>
      </div>

      <div className="relative mt-5 h-2 overflow-hidden rounded-full bg-violet-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-violet-700 via-fuchsia-500 to-purple-400 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {editing && (
        <div className="relative mt-5 rounded-2xl border border-violet-100 bg-violet-50/70 p-3">
          <div className="mb-2 text-xs font-bold text-slate-500">
            Definir nova meta semanal
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => adjustGoal(-5)}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-violet-100 bg-white text-violet-700 transition hover:bg-violet-100"
              aria-label="Diminuir meta em 5"
            >
              <Minus size={16} />
            </button>

            <input
              type="number"
              min="1"
              max="999"
              value={draftGoal}
              onChange={(event) => setDraftGoal(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') saveGoal()
                if (event.key === 'Escape') cancelEditing()
              }}
              className="h-10 min-w-0 flex-1 rounded-xl border border-violet-100 bg-white px-3 text-center font-black text-slate-800 outline-none transition focus:border-violet-300 focus:ring-2 focus:ring-violet-200"
              aria-label="Meta semanal"
            />

            <button
              type="button"
              onClick={() => adjustGoal(5)}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-violet-100 bg-white text-violet-700 transition hover:bg-violet-100"
              aria-label="Aumentar meta em 5"
            >
              <Plus size={16} />
            </button>

            <button
              type="button"
              onClick={saveGoal}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-violet-600 text-white transition hover:bg-violet-700"
              aria-label="Salvar meta"
              title="Salvar meta"
            >
              <Check size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}


function getDefaultCampaignPerformance(campaignList) {
  return campaignList.reduce((result, campaign) => {
    result[campaign.id] = {
      messages: campaign.metrics?.messages ?? 0,
      responses: campaign.metrics?.responses ?? 0,
      interested: campaign.metrics?.interested ?? 0,
      appointments: campaign.metrics?.appointments ?? 0,
    }
    return result
  }, {})
}

function loadCampaignPerformance(campaignList) {
  const defaults = getDefaultCampaignPerformance(campaignList)

  try {
    const saved = JSON.parse(
      localStorage.getItem('phx-campaign-performance') || '{}',
    )

    return campaignList.reduce((result, campaign) => {
      result[campaign.id] = {
        ...defaults[campaign.id],
        ...(saved[campaign.id] || {}),
      }
      return result
    }, {})
  } catch {
    return defaults
  }
}

function normalizeCampaignMetrics(metrics) {
  const messages = clampNumber(metrics.messages, 0, 999999, 0)
  const responses = clampNumber(metrics.responses, 0, messages, 0)
  const interested = clampNumber(metrics.interested, 0, responses, 0)
  const appointments = clampNumber(metrics.appointments, 0, interested, 0)

  return { messages, responses, interested, appointments }
}

function CampaignResultCard({
  campaignList,
  selectedCampaignId,
  setSelectedCampaignId,
  performance,
  setPerformance,
  onOpenCampaigns,
}) {
  const selectedCampaign =
    campaignList.find((campaign) => campaign.id === selectedCampaignId) ||
    campaignList[0]

  const metrics =
    performance[selectedCampaign?.id] ||
    selectedCampaign?.metrics || {
      messages: 0,
      responses: 0,
      interested: 0,
      appointments: 0,
    }

  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(metrics)

  useEffect(() => {
    setDraft(metrics)
    setEditing(false)
  }, [selectedCampaignId])

  useEffect(() => {
    if (!editing) setDraft(metrics)
  }, [editing, metrics])

  const responseRate =
    metrics.messages > 0
      ? Math.round((metrics.responses / metrics.messages) * 100)
      : 0

  const conversionRate =
    metrics.messages > 0
      ? Math.round((metrics.appointments / metrics.messages) * 100)
      : 0

  const interestRate =
    metrics.responses > 0
      ? Math.round((metrics.interested / metrics.responses) * 100)
      : 0

  const updateDraft = (field, value) => {
    setDraft((current) => ({ ...current, [field]: value }))
  }

  const saveMetrics = () => {
    const normalized = normalizeCampaignMetrics(draft)

    setPerformance((current) => ({
      ...current,
      [selectedCampaign.id]: normalized,
    }))
    setDraft(normalized)
    setEditing(false)
  }

  const cancelEditing = () => {
    setDraft(metrics)
    setEditing(false)
  }

  if (!selectedCampaign) return null

  return (
    <div className="glass-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Megaphone className="text-violet-600" size={19} />
            <h2 className="text-lg font-black">Resultado da campanha</h2>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Acompanhe o desempenho de cada campanha.
          </p>
        </div>

        {!editing ? (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="grid h-9 w-9 place-items-center rounded-xl border border-violet-100 bg-white text-violet-600 transition hover:bg-violet-50"
            aria-label="Editar resultados da campanha"
            title="Editar resultados"
          >
            <Pencil size={15} />
          </button>
        ) : (
          <button
            type="button"
            onClick={cancelEditing}
            className="grid h-9 w-9 place-items-center rounded-xl border border-violet-100 bg-white text-slate-400 transition hover:bg-slate-50"
            aria-label="Cancelar edição"
          >
            <X size={15} />
          </button>
        )}
      </div>

      <div className="mt-5">
        <label className="text-xs font-bold text-slate-500">
          Campanha selecionada
        </label>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
          <select
            value={selectedCampaign.id}
            onChange={(event) => setSelectedCampaignId(event.target.value)}
            className="min-w-0 flex-1 rounded-2xl border border-violet-100 bg-white px-3 py-3 text-sm font-bold text-slate-700 outline-none transition focus:border-violet-300 focus:ring-2 focus:ring-violet-200"
          >
            {campaignList.map((campaign) => (
              <option key={campaign.id} value={campaign.id}>
                {campaign.name}
              </option>
            ))}
          </select>

          <StatusPill tone={selectedCampaign.tone}>
            {selectedCampaign.status}
          </StatusPill>
        </div>
      </div>

      {!editing ? (
        <>
          <div className="mt-5 grid grid-cols-2 gap-3">
            {[
              [metrics.messages, 'mensagens'],
              [metrics.responses, 'respostas'],
              [metrics.interested, 'interessados'],
              [metrics.appointments, 'agendamentos'],
            ].map(([value, label]) => (
              <div
                key={label}
                className="rounded-2xl bg-violet-50 p-4 text-center"
              >
                <div className="text-2xl font-black text-violet-700">
                  {value}
                </div>
                <div className="text-xs text-slate-500">{label}</div>
              </div>
            ))}
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-violet-100 p-3">
              <div className="text-xs text-slate-400">Taxa de resposta</div>
              <div className="mt-1 text-xl font-black text-slate-800">
                {responseRate}%
              </div>
            </div>

            <div className="rounded-2xl border border-violet-100 p-3">
              <div className="text-xs text-slate-400">Taxa de interesse</div>
              <div className="mt-1 text-xl font-black text-slate-800">
                {interestRate}%
              </div>
            </div>

            <div className="rounded-2xl border border-violet-100 p-3">
              <div className="text-xs text-slate-400">Conversão final</div>
              <div className="mt-1 text-xl font-black text-violet-700">
                {conversionRate}%
              </div>
            </div>
          </div>

          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between text-xs">
              <span className="font-bold text-slate-500">
                Mensagens → agendamentos
              </span>
              <span className="font-black text-violet-600">
                {conversionRate}%
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-violet-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-700 via-fuchsia-500 to-purple-400 transition-all duration-500"
                style={{ width: `${Math.min(100, conversionRate)}%` }}
              />
            </div>
          </div>
        </>
      ) : (
        <div className="mt-5 rounded-[22px] border border-violet-100 bg-violet-50/60 p-4">
          <div className="text-sm font-black text-slate-800">
            Atualizar resultados
          </div>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Os números seguem o funil: mensagens, respostas, interessados e
            agendamentos.
          </p>

          <div className="mt-4 grid grid-cols-2 gap-3">
            {[
              ['messages', 'Mensagens'],
              ['responses', 'Respostas'],
              ['interested', 'Interessados'],
              ['appointments', 'Agendamentos'],
            ].map(([field, label]) => (
              <label key={field} className="block">
                <span className="mb-1.5 block text-xs font-bold text-slate-500">
                  {label}
                </span>
                <input
                  type="number"
                  min="0"
                  value={draft[field]}
                  onChange={(event) =>
                    updateDraft(field, event.target.value)
                  }
                  className="w-full rounded-xl border border-violet-100 bg-white px-3 py-2.5 text-center font-black text-slate-800 outline-none transition focus:border-violet-300 focus:ring-2 focus:ring-violet-200"
                />
              </label>
            ))}
          </div>

          <button
            type="button"
            onClick={saveMetrics}
            className="gradient-button mt-4 w-full"
          >
            <Check size={17} />
            Salvar resultados
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={onOpenCampaigns}
        className="mt-5 w-full rounded-2xl border border-violet-100 px-4 py-3 text-sm font-bold text-violet-700 transition hover:bg-violet-50"
      >
        Ver todas as campanhas
      </button>
    </div>
  )
}

function OpportunityCard({ opportunity, onOpen }) {
  const Icon = opportunity.icon

  return (
    <button
      type="button"
      onClick={() => onOpen(opportunity.route)}
      className="group flex w-full items-center gap-4 rounded-2xl border border-violet-100 bg-white p-4 text-left transition hover:-translate-y-0.5 hover:border-violet-200 hover:bg-violet-50/60 hover:shadow-lg hover:shadow-violet-100/50"
    >
      <div className="icon-bubble shrink-0 transition group-hover:scale-105">
        <Icon size={18} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="font-black text-slate-800">{opportunity.title}</div>
        <div className="mt-1 text-xs leading-5 text-slate-500">
          {opportunity.description}
        </div>
      </div>

      <StatusPill tone={opportunity.tone}>{opportunity.action}</StatusPill>
    </button>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()

  const [goal, setGoal] = usePersistentNumber(
    'phx-weekly-goal',
    DEFAULT_WEEKLY_GOAL,
    { min: 1, max: 999 },
  )

  const [appointments, setAppointments] = usePersistentNumber(
    'phx-week-appointments',
    DEFAULT_APPOINTMENTS,
    { min: 0, max: 9999 },
  )

  const [activeCampaigns, setActiveCampaigns] = usePersistentNumber(
    'phx-active-campaigns',
    DEFAULT_ACTIVE_CAMPAIGNS,
    { min: 0, max: 999 },
  )

  const [revenue, setRevenue] = usePersistentNumber(
    'phx-generated-revenue',
    DEFAULT_REVENUE,
    { min: 0, max: 99999999 },
  )

  const [campaignList] = useState(loadCampaigns)

  const [selectedCampaignId, setSelectedCampaignId] = useState(
    () =>
      localStorage.getItem('phx-dashboard-campaign') ||
      campaignList[0]?.id ||
      '',
  )
  const [campaignPerformance, setCampaignPerformance] = useState(() =>
    loadCampaignPerformance(campaignList),
  )

  useEffect(() => {
    localStorage.setItem('phx-dashboard-campaign', selectedCampaignId)
  }, [selectedCampaignId])

  useEffect(() => {
    localStorage.setItem(
      'phx-campaign-performance',
      JSON.stringify(campaignPerformance),
    )
  }, [campaignPerformance])

  const opportunities = useMemo(() => {
    const items = []
    const missingAppointments = Math.max(0, goal - appointments)

    if (missingAppointments > 0) {
      items.push({
        id: 'weekly-goal',
        icon: Target,
        title: `Faltam ${missingAppointments} agendamentos para a meta`,
        description: `Você tem ${appointments} de ${goal} agendamentos planejados para esta semana.`,
        action: 'Planejar',
        tone: 'amber',
        route: '/objetivos',
      })
    } else {
      items.push({
        id: 'weekly-goal-complete',
        icon: CircleCheckBig,
        title: 'Meta semanal atingida',
        description: `Você já alcançou ${appointments} agendamentos para uma meta de ${goal}.`,
        action: 'Concluída',
        tone: 'emerald',
        route: '/objetivos',
      })
    }

    if (activeCampaigns === 0) {
      items.push({
        id: 'campaigns',
        icon: Megaphone,
        title: 'Nenhuma campanha ativa',
        description: 'Crie uma campanha para começar a movimentar sua base de clientes.',
        action: 'Criar',
        tone: 'violet',
        route: '/campanhas',
      })
    } else {
      items.push({
        id: 'campaigns',
        icon: Megaphone,
        title: `${activeCampaigns} ${activeCampaigns === 1 ? 'campanha ativa' : 'campanhas ativas'}`,
        description: 'Acompanhe as campanhas em andamento e veja quais estão gerando mais respostas.',
        action: 'Acompanhar',
        tone: 'violet',
        route: '/campanhas',
      })
    }

    const nextRevenueMilestone =
      Math.max(5000, Math.ceil((revenue + 1) / 5000) * 5000)
    const revenueGap = Math.max(0, nextRevenueMilestone - revenue)
    const currency = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    })

    items.push({
      id: 'revenue',
      icon: TrendingUp,
      title:
        revenue === 0
          ? 'Registre a primeira receita do mês'
          : `Faltam ${currency.format(revenueGap)} para o próximo marco`,
      description:
        revenue === 0
          ? 'Comece a acompanhar o faturamento gerado pelas ações do PHX.'
          : `Próximo marco de receita: ${currency.format(nextRevenueMilestone)}.`,
      action: 'Acompanhar',
      tone: revenue === 0 ? 'amber' : 'emerald',
      route: '/campanhas',
    })

    return items
  }, [activeCampaigns, appointments, goal, revenue])

  return (
    <div>
      <PageHeading
        eyebrow="Outcome Growth OS"
        title="Dashboard"
        description="Acompanhe resultados, oportunidades e ações importantes do seu negócio."
        action={
          <button
            onClick={() => navigate('/objetivos')}
            className="gradient-button"
          >
            <Target size={18} />
            Criar objetivo
          </button>
        }
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <WeeklyGoalCard
          appointments={appointments}
          goal={goal}
          setGoal={setGoal}
        />

        <EditableMetricCard
          label="Agendamentos"
          value={appointments}
          onChange={setAppointments}
          description="esta semana"
          step={1}
          min={0}
          max={9999}
          editLabel="Editar agendamentos"
        />

        <EditableMetricCard
          label="Campanhas ativas"
          value={activeCampaigns}
          onChange={setActiveCampaigns}
          description="em andamento"
          step={1}
          min={0}
          max={999}
          editLabel="Editar campanhas ativas"
        />

        <EditableMetricCard
          label="Receita gerada"
          value={revenue}
          onChange={setRevenue}
          description="este mês"
          step={500}
          min={0}
          max={99999999}
          formatValue={(number) =>
            new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL',
              maximumFractionDigits: 0,
            }).format(number)
          }
          editLabel="Editar receita gerada"
        />
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[1.15fr_.85fr]">
        <div className="glass-card p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Lightbulb className="text-violet-600" />
                <h2 className="text-lg font-black">Oportunidades do negócio</h2>
              </div>
              <p className="mt-1 text-sm text-slate-500">
                Sugestões automáticas baseadas nos números do seu Dashboard.
              </p>
            </div>

            <StatusPill>{opportunities.length} oportunidades</StatusPill>
          </div>

          <div className="mt-4 space-y-3">
            {opportunities.map((opportunity) => (
              <OpportunityCard
                key={opportunity.id}
                opportunity={opportunity}
                onOpen={navigate}
              />
            ))}
          </div>
        </div>

        <CampaignResultCard
          campaignList={campaignList}
          selectedCampaignId={selectedCampaignId}
          setSelectedCampaignId={setSelectedCampaignId}
          performance={campaignPerformance}
          setPerformance={setCampaignPerformance}
          onOpenCampaigns={() => navigate('/campanhas')}
        />
      </section>
    </div>
  )
}
