import { useEffect, useMemo, useState } from 'react'
import { CheckCircle2, Save, Target } from 'lucide-react'
import { useOutletContext } from 'react-router-dom'
import { Field, PageHeading, StatusPill } from '../components/UI'

const defaultObjective = {
  objective: 'Preencher minha agenda',
  service: 'Cardiologia',
  professional: '',
  availableSlots: 18,
  target: 12,
  context: '',
}

function loadObjective() {
  try {
    const saved = localStorage.getItem('phx-current-objective')
    return saved ? { ...defaultObjective, ...JSON.parse(saved) } : defaultObjective
  } catch {
    return defaultObjective
  }
}

export default function Objectives() {
  const { notify } = useOutletContext()
  const [form, setForm] = useState(loadObjective)
  const [savedAt, setSavedAt] = useState('')

  const progress = useMemo(() => {
    const available = Math.max(1, Number(form.availableSlots) || 1)
    const target = Math.max(0, Number(form.target) || 0)
    return Math.min(100, Math.round((target / available) * 100))
  }, [form.availableSlots, form.target])

  useEffect(() => {
    const saved = localStorage.getItem('phx-objective-saved-at')
    if (saved) setSavedAt(saved)
  }, [])

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const saveObjective = (event) => {
    event.preventDefault()

    const normalized = {
      ...form,
      availableSlots: Math.max(1, Number(form.availableSlots) || 1),
      target: Math.max(1, Number(form.target) || 1),
    }

    if (normalized.target > normalized.availableSlots) {
      notify('A meta não pode ser maior que as vagas disponíveis')
      return
    }

    const now = new Date().toLocaleString('pt-BR')
    localStorage.setItem('phx-current-objective', JSON.stringify(normalized))
    localStorage.setItem('phx-objective-saved-at', now)
    setForm(normalized)
    setSavedAt(now)
    notify('Objetivo salvo com sucesso')
  }

  return (
    <div>
      <PageHeading
        eyebrow="Outcome Engine"
        title="Objetivos"
        description="Defina o resultado que você quer alcançar e acompanhe sua meta dentro do PHX."
      />

      <section className="grid gap-5 xl:grid-cols-[.9fr_1.1fr]">
        <form
          onSubmit={saveObjective}
          className="glass-card self-start p-5 sm:p-6"
        >
          <div className="flex items-start gap-3">
            <div className="icon-bubble">
              <Target size={19} />
            </div>
            <div>
              <h2 className="font-black text-slate-900">Defina seu outcome</h2>
              <p className="mt-1 text-sm text-slate-500">
                O objetivo fica salvo neste navegador enquanto desenvolvemos o
                backend definitivo.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Field label="Objetivo">
              <select
                value={form.objective}
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
                onChange={(event) => updateField('service', event.target.value)}
                placeholder="Ex.: Cardiologia"
                required
              />
            </Field>

            <Field label="Profissional (opcional)">
              <input
                value={form.professional}
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
                onChange={(event) => updateField('target', event.target.value)}
                required
              />
            </Field>

            <div className="sm:col-span-2">
              <Field label="Observação (opcional)">
                <textarea
                  rows="4"
                  value={form.context}
                  onChange={(event) =>
                    updateField('context', event.target.value)
                  }
                  placeholder="Ex.: priorizar pacientes antigos e horários da tarde."
                />
              </Field>
            </div>
          </div>

          <button type="submit" className="gradient-button mt-6 w-full">
            <Save size={18} />
            Salvar objetivo
          </button>
        </form>

        <div className="space-y-5">
          <div className="glass-card overflow-hidden">
            <div className="bg-gradient-to-br from-violet-950 via-violet-700 to-fuchsia-500 p-6 text-white">
              <div className="flex flex-wrap items-center gap-2">
                <StatusPill>Objetivo atual</StatusPill>
                {savedAt && (
                  <span className="text-xs font-semibold text-violet-200">
                    salvo em {savedAt}
                  </span>
                )}
              </div>

              <h3 className="mt-4 text-2xl font-black">{form.objective}</h3>
              <p className="mt-2 text-sm text-violet-100">
                {form.service}
                {form.professional ? ` • ${form.professional}` : ''}
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
                  <div className="text-xs text-violet-200">Vagas</div>
                  <div className="mt-1 text-2xl font-black">
                    {form.availableSlots}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
                  <div className="text-xs text-violet-200">Meta</div>
                  <div className="mt-1 text-2xl font-black">{form.target}</div>
                </div>

                <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
                  <div className="text-xs text-violet-200">Cobertura</div>
                  <div className="mt-1 text-2xl font-black">{progress}%</div>
                </div>
              </div>
            </div>

            <div className="p-5">
              <div className="text-sm font-black text-slate-800">
                Resumo do objetivo
              </div>

              <div className="mt-4 space-y-3">
                <div className="flex items-start gap-3 rounded-2xl bg-violet-50 p-4">
                  <CheckCircle2
                    size={18}
                    className="mt-0.5 shrink-0 text-violet-600"
                  />
                  <div>
                    <div className="text-sm font-black text-slate-800">
                      Resultado desejado
                    </div>
                    <div className="mt-1 text-sm text-slate-500">
                      Alcançar {form.target} de {form.availableSlots} vagas
                      disponíveis.
                    </div>
                  </div>
                </div>

                {form.context && (
                  <div className="rounded-2xl border border-violet-100 p-4">
                    <div className="text-xs font-black uppercase tracking-[.12em] text-violet-500">
                      Observação
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      {form.context}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
