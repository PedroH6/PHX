import { useMemo, useState } from 'react'
import {
  CheckCircle2,
  Pencil,
  Plus,
  Save,
  Target,
  Trash2,
  X,
} from 'lucide-react'
import { useOutletContext } from 'react-router-dom'
import { Field, PageHeading, StatusPill } from '../components/UI'

const MAX_OBJECTIVES = 3

const emptyObjective = {
  objective: 'Preencher minha agenda',
  service: '',
  professional: '',
  availableSlots: 18,
  target: 12,
  context: '',
}

function createObjectiveId() {
  return `objective-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

function normalizeObjective(objective) {
  return {
    ...objective,
    availableSlots: Math.max(1, Number(objective.availableSlots) || 1),
    target: Math.max(1, Number(objective.target) || 1),
  }
}

function migrateLegacyObjective() {
  try {
    const legacy = localStorage.getItem('phx-current-objective')
    if (!legacy) return []

    const parsed = JSON.parse(legacy)
    const savedAt =
      localStorage.getItem('phx-objective-saved-at') ||
      new Date().toLocaleString('pt-BR')

    return [
      {
        id: createObjectiveId(),
        ...normalizeObjective(parsed),
        savedAt,
      },
    ]
  } catch {
    return []
  }
}

function loadObjectives() {
  try {
    const saved = localStorage.getItem('phx-objectives')

    if (saved) {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed)) return parsed.slice(0, MAX_OBJECTIVES)
    }

    const migrated = migrateLegacyObjective()

    if (migrated.length) {
      localStorage.setItem('phx-objectives', JSON.stringify(migrated))
      return migrated
    }

    return []
  } catch {
    return []
  }
}

function ObjectiveCard({ objective, index, onEdit, onDelete }) {
  const coverage = Math.min(
    100,
    Math.round((objective.target / objective.availableSlots) * 100),
  )

  return (
    <article className="glass-card overflow-hidden">
      <div className="bg-gradient-to-br from-violet-950 via-violet-700 to-fuchsia-500 p-5 text-white">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <StatusPill>Objetivo {index + 1}</StatusPill>
              <span className="text-xs font-semibold text-violet-200">
                {objective.savedAt}
              </span>
            </div>

            <h3 className="mt-4 text-xl font-black">{objective.objective}</h3>
            <p className="mt-1 text-sm text-violet-100">
              {objective.service || 'Serviço não informado'}
              {objective.professional ? ` • ${objective.professional}` : ''}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onEdit(objective)}
              className="grid h-9 w-9 place-items-center rounded-xl border border-white/20 bg-white/10 text-white transition hover:bg-white/20"
              aria-label="Editar objetivo"
              title="Editar objetivo"
            >
              <Pencil size={15} />
            </button>

            <button
              type="button"
              onClick={() => onDelete(objective.id)}
              className="grid h-9 w-9 place-items-center rounded-xl border border-white/20 bg-white/10 text-white transition hover:bg-rose-500/30"
              aria-label="Excluir objetivo"
              title="Excluir objetivo"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2">
          <div className="rounded-2xl border border-white/15 bg-white/10 p-3">
            <div className="text-[11px] text-violet-200">Vagas</div>
            <div className="mt-1 text-xl font-black">
              {objective.availableSlots}
            </div>
          </div>

          <div className="rounded-2xl border border-white/15 bg-white/10 p-3">
            <div className="text-[11px] text-violet-200">Meta</div>
            <div className="mt-1 text-xl font-black">{objective.target}</div>
          </div>

          <div className="rounded-2xl border border-white/15 bg-white/10 p-3">
            <div className="text-[11px] text-violet-200">Cobertura</div>
            <div className="mt-1 text-xl font-black">{coverage}%</div>
          </div>
        </div>

        <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/15">
          <div
            className="h-full rounded-full bg-white transition-all duration-500"
            style={{ width: `${coverage}%` }}
          />
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start gap-3 rounded-2xl bg-violet-50 p-3">
          <CheckCircle2
            size={17}
            className="mt-0.5 shrink-0 text-violet-600"
          />
          <div>
            <div className="text-sm font-black text-slate-800">
              Resultado desejado
            </div>
            <div className="mt-1 text-sm text-slate-500">
              Alcançar {objective.target} de {objective.availableSlots} vagas
              disponíveis.
            </div>
          </div>
        </div>

        {objective.context && (
          <div className="mt-3 rounded-2xl border border-violet-100 p-3">
            <div className="text-[11px] font-black uppercase tracking-[.12em] text-violet-500">
              Observação
            </div>
            <p className="mt-2 text-sm leading-5 text-slate-500">
              {objective.context}
            </p>
          </div>
        )}
      </div>
    </article>
  )
}

export default function Objectives() {
  const { notify } = useOutletContext()
  const [objectives, setObjectives] = useState(loadObjectives)
  const [form, setForm] = useState(emptyObjective)
  const [editingId, setEditingId] = useState(null)

  const isEditing = Boolean(editingId)
  const limitReached = objectives.length >= MAX_OBJECTIVES && !isEditing

  const formCoverage = useMemo(() => {
    const available = Math.max(1, Number(form.availableSlots) || 1)
    const target = Math.max(0, Number(form.target) || 0)
    return Math.min(100, Math.round((target / available) * 100))
  }, [form.availableSlots, form.target])

  const persistObjectives = (nextObjectives) => {
    setObjectives(nextObjectives)
    localStorage.setItem('phx-objectives', JSON.stringify(nextObjectives))
  }

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const resetForm = () => {
    setEditingId(null)
    setForm(emptyObjective)
  }

  const startNewObjective = () => {
    if (objectives.length >= MAX_OBJECTIVES) {
      notify('Você pode ter no máximo 3 objetivos')
      return
    }

    resetForm()
  }

  const editObjective = (objective) => {
    setEditingId(objective.id)
    setForm({
      objective: objective.objective,
      service: objective.service,
      professional: objective.professional,
      availableSlots: objective.availableSlots,
      target: objective.target,
      context: objective.context,
    })

    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const deleteObjective = (id) => {
    const nextObjectives = objectives.filter((objective) => objective.id !== id)
    persistObjectives(nextObjectives)

    if (editingId === id) resetForm()

    notify('Objetivo excluído')
  }

  const saveObjective = (event) => {
    event.preventDefault()

    if (!isEditing && objectives.length >= MAX_OBJECTIVES) {
      notify('Você já atingiu o limite de 3 objetivos')
      return
    }

    const normalized = normalizeObjective(form)

    if (!normalized.service.trim()) {
      notify('Informe o serviço do objetivo')
      return
    }

    if (normalized.target > normalized.availableSlots) {
      notify('A meta não pode ser maior que as vagas disponíveis')
      return
    }

    const savedAt = new Date().toLocaleString('pt-BR')

    if (isEditing) {
      const nextObjectives = objectives.map((objective) =>
        objective.id === editingId
          ? {
              ...objective,
              ...normalized,
              savedAt,
            }
          : objective,
      )

      persistObjectives(nextObjectives)
      notify('Objetivo atualizado com sucesso')
    } else {
      const nextObjectives = [
        ...objectives,
        {
          id: createObjectiveId(),
          ...normalized,
          savedAt,
        },
      ]

      persistObjectives(nextObjectives)
      notify('Objetivo adicionado com sucesso')
    }

    resetForm()
  }

  return (
    <div>
      <PageHeading
        eyebrow="Outcome Engine"
        title="Objetivos"
        description="Crie e acompanhe até 3 objetivos ao mesmo tempo dentro do PHX."
        action={
          objectives.length < MAX_OBJECTIVES && (
            <button
              type="button"
              onClick={startNewObjective}
              className="gradient-button"
            >
              <Plus size={18} />
              Novo objetivo
            </button>
          )
        }
      />

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <StatusPill tone={objectives.length === MAX_OBJECTIVES ? 'amber' : 'violet'}>
          {objectives.length} de {MAX_OBJECTIVES} objetivos
        </StatusPill>

        {objectives.length === MAX_OBJECTIVES && (
          <span className="text-sm text-slate-500">
            Limite atingido. Edite ou exclua um objetivo para criar outro.
          </span>
        )}
      </div>

      <section className="grid gap-5 xl:grid-cols-[.9fr_1.1fr]">
        <form
          onSubmit={saveObjective}
          className="glass-card self-start p-5 sm:p-6"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="icon-bubble">
                <Target size={19} />
              </div>

              <div>
                <h2 className="font-black text-slate-900">
                  {isEditing ? 'Editar objetivo' : 'Novo objetivo'}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {isEditing
                    ? 'Atualize os dados do objetivo selecionado.'
                    : limitReached
                      ? 'Exclua um objetivo para liberar uma nova vaga.'
                      : 'Defina o próximo resultado que você quer acompanhar.'}
                </p>
              </div>
            </div>

            {isEditing && (
              <button
                type="button"
                onClick={resetForm}
                className="grid h-9 w-9 place-items-center rounded-xl border border-violet-100 text-slate-400 transition hover:bg-violet-50"
                aria-label="Cancelar edição"
                title="Cancelar edição"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Field label="Objetivo">
              <select
                value={form.objective}
                disabled={limitReached}
                onChange={(event) =>
                  updateField('objective', event.target.value)
                }
              >
                <option>Preencher minha agenda</option>
                <option>Recuperar clientes antigos</option>
                <option>Divulgar um novo serviço</option>
                <option>Recuperar leads</option>
                <option>Aumentar minhas vendas</option>
              </select>
            </Field>

            <Field label="Serviço">
              <input
                value={form.service}
                disabled={limitReached}
                onChange={(event) => updateField('service', event.target.value)}
                placeholder="Ex.: Cardiologia"
                required
              />
            </Field>

            <Field label="Profissional (opcional)">
              <input
                value={form.professional}
                disabled={limitReached}
                onChange={(event) =>
                  updateField('professional', event.target.value)
                }
                placeholder="Ex.: Dr. Leandro"
              />
            </Field>

            <Field label="Vagas disponíveis">
              <input
                type="number"
                min="1"
                value={form.availableSlots}
                disabled={limitReached}
                onChange={(event) =>
                  updateField('availableSlots', event.target.value)
                }
                required
              />
            </Field>

            <Field label="Meta">
              <input
                type="number"
                min="1"
                value={form.target}
                disabled={limitReached}
                onChange={(event) => updateField('target', event.target.value)}
                required
              />
            </Field>

            <div className="rounded-2xl border border-violet-100 bg-violet-50/70 p-4">
              <div className="text-xs font-bold text-slate-500">
                Cobertura planejada
              </div>
              <div className="mt-1 text-2xl font-black text-violet-700">
                {formCoverage}%
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-violet-100">
                <div
                  className="h-full rounded-full bg-violet-600 transition-all"
                  style={{ width: `${formCoverage}%` }}
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <Field label="Observação (opcional)">
                <textarea
                  rows="4"
                  value={form.context}
                  disabled={limitReached}
                  onChange={(event) =>
                    updateField('context', event.target.value)
                  }
                  placeholder="Ex.: priorizar pacientes antigos e horários da tarde."
                />
              </Field>
            </div>
          </div>

          <button
            type="submit"
            disabled={limitReached}
            className="gradient-button mt-6 w-full disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Save size={18} />
            {isEditing ? 'Salvar alterações' : 'Adicionar objetivo'}
          </button>
        </form>

        <div>
          {objectives.length === 0 ? (
            <div className="glass-card flex min-h-[360px] flex-col items-center justify-center p-8 text-center">
              <div className="grid h-16 w-16 place-items-center rounded-[22px] bg-violet-100 text-violet-700">
                <Target size={28} />
              </div>
              <h3 className="mt-5 text-xl font-black text-slate-900">
                Nenhum objetivo criado
              </h3>
              <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                Use o formulário ao lado para adicionar seu primeiro objetivo.
                Você pode acompanhar até 3 ao mesmo tempo.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {objectives.map((objective, index) => (
                <ObjectiveCard
                  key={objective.id}
                  objective={objective}
                  index={index}
                  onEdit={editObjective}
                  onDelete={deleteObjective}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
