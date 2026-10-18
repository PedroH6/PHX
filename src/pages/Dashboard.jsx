import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CalendarDays,
  Check,
  Minus,
  Pencil,
  Plus,
  Sparkles,
  X,
} from 'lucide-react'
import { PageHeading, StatusPill } from '../components/UI'

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

function WeeklyGoalCard({ appointments }) {
  const [goal, setGoal] = usePersistentNumber(
    'phx-weekly-goal',
    DEFAULT_WEEKLY_GOAL,
    { min: 1, max: 999 },
  )
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

export default function Dashboard() {
  const navigate = useNavigate()

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

  const opportunities = [
    ['14 horários vazios amanhã', 'Agenda', '/campanhas'],
    ['312 pacientes sem retornar há 6 meses', 'Clientes', '/clientes'],
    ['Nova agenda aberta de Cardiologia', 'Campanha', '/campanhas'],
  ]

  const campaignResults = [
    ['280', 'mensagens'],
    ['67', 'respostas'],
    ['21', 'interessados'],
    ['9', 'agendamentos'],
  ]

  return (
    <div>
      <PageHeading
        eyebrow="Outcome Growth OS"
        title="Dashboard"
        description="Acompanhe resultados, oportunidades e ações sugeridas pela IA."
        action={
          <button
            onClick={() => navigate('/objetivos')}
            className="gradient-button"
          >
            <Sparkles size={18} />
            Criar estratégia com IA
          </button>
        }
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <WeeklyGoalCard appointments={appointments} />

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
          <div className="flex items-center gap-2">
            <Sparkles className="text-violet-600" />
            <h2 className="text-lg font-black">
              Oportunidades detectadas pela IA
            </h2>
          </div>

          <div className="mt-4 space-y-3">
            {opportunities.map(([title, subtitle, route]) => (
              <button
                key={title}
                onClick={() => navigate(route)}
                className="flex w-full items-center gap-4 rounded-2xl border border-violet-100 bg-white p-4 text-left transition hover:bg-violet-50"
              >
                <div className="icon-bubble">
                  <CalendarDays size={18} />
                </div>

                <div className="flex-1">
                  <div className="font-black">{title}</div>
                  <div className="text-xs text-slate-500">{subtitle}</div>
                </div>

                <StatusPill>Abrir</StatusPill>
              </button>
            ))}
          </div>
        </div>

        <div className="glass-card p-5">
          <h2 className="text-lg font-black">Resultado da campanha</h2>
          <p className="mt-1 text-sm text-slate-500">Check-up Preventivo</p>

          <div className="mt-6 grid grid-cols-2 gap-3">
            {campaignResults.map(([value, label]) => (
              <div
                key={label}
                className="rounded-2xl bg-violet-50 p-4 text-center"
              >
                <div className="text-2xl font-black text-violet-700">{value}</div>
                <div className="text-xs text-slate-500">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
