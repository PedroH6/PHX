import { useState } from 'react'
import { ArrowRight, CheckCircle2, LoaderCircle, Send, Sparkles, Target, TriangleAlert } from 'lucide-react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { Field, PageHeading, StatusPill } from '../components/UI'

const initialForm = {
  objective: 'Preencher minha agenda',
  service: 'Cardiologia',
  professional: '',
  availableSlots: 18,
  target: 12,
  context: '',
}

export default function Objectives() {
  const { notify } = useOutletContext()
  const navigate = useNavigate()
  const [form, setForm] = useState(initialForm)
  const [strategy, setStrategy] = useState(null)
  const [meta, setMeta] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const generateStrategy = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    setStrategy(null)

    try {
      const response = await fetch('/api/ai/strategy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          availableSlots: Number(form.availableSlots),
          target: Number(form.target),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Não foi possível gerar a estratégia.')
      }

      setStrategy(data.strategy)
      setMeta(data.meta)
      notify('Estratégia criada com IA ✨')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <PageHeading
        eyebrow="Outcome Engine"
        title="Objetivos"
        description="Diga o resultado que você quer alcançar e deixe a IA do PHX preparar a estratégia."
      />

      <section className="grid gap-5 xl:grid-cols-[.9fr_1.1fr]">
        <form
          onSubmit={generateStrategy}
          className="glass-card self-start p-5 sm:p-6"
        >
          <div className="flex items-start gap-3">
            <div className="icon-bubble">
              <Target size={19} />
            </div>
            <div>
              <h2 className="font-black text-slate-900">Defina o outcome</h2>
              <p className="mt-1 text-sm text-slate-500">
                Esses dados serão enviados para a IA montar uma estratégia.
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
              <Field label="Contexto adicional (opcional)">
                <textarea
                  rows="4"
                  value={form.context}
                  onChange={(event) =>
                    updateField('context', event.target.value)
                  }
                  placeholder="Ex.: queremos priorizar pacientes antigos e temos atendimento na parte da tarde."
                />
              </Field>
            </div>
          </div>

          {error && (
            <div className="mt-5 flex gap-3 rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-700">
              <TriangleAlert className="mt-0.5 shrink-0" size={18} />
              <div>
                <div className="font-black">Não foi possível gerar</div>
                <div className="mt-1">{error}</div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="gradient-button mt-6 w-full disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <LoaderCircle className="animate-spin" size={18} />
                Criando estratégia...
              </>
            ) : (
              <>
                <Sparkles size={18} />
                Criar estratégia com IA
              </>
            )}
          </button>

          <p className="mt-3 text-center text-xs leading-5 text-slate-400">
            A IA sugere uma estratégia. O resultado final depende da execução,
            público, canal e contexto do negócio.
          </p>
        </form>

        <div className="min-w-0">
          {!strategy ? (
            <div className="glass-card overflow-hidden p-5">
              <div className="rounded-[26px] bg-gradient-to-br from-violet-950 via-violet-700 to-fuchsia-500 p-6 text-white">
                <div className="text-xs font-black uppercase tracking-[.2em] text-violet-200">
                  PHX AI Strategy
                </div>
                <h3 className="mt-3 text-2xl font-black">
                  Transforme o objetivo em um plano de ação
                </h3>
                <p className="mt-3 max-w-lg text-sm leading-6 text-violet-100">
                  Preencha os dados ao lado e o PHX vai sugerir público,
                  campanha, mensagem, ações, follow-ups e métricas.
                </p>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {[
                    'Público recomendado',
                    'Mensagem de campanha',
                    'Plano de execução',
                    'Métricas de sucesso',
                  ].map((item) => (
                    <div
                      key={item}
                      className="rounded-2xl border border-white/15 bg-white/10 p-3 text-sm font-semibold"
                    >
                      <CheckCircle2
                        size={16}
                        className="mb-2 text-fuchsia-200"
                      />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="glass-card overflow-hidden">
                <div className="bg-gradient-to-br from-violet-950 via-violet-800 to-fuchsia-600 p-6 text-white">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusPill>Estratégia gerada por IA</StatusPill>
                    {meta?.model && (
                      <span className="text-xs font-semibold text-violet-200">
                        {meta.model}
                      </span>
                    )}
                  </div>

                  <h2 className="mt-4 text-2xl font-black">
                    {strategy.title}
                  </h2>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-violet-100">
                    {strategy.summary}
                  </p>
                </div>

                <div className="grid gap-4 p-5 sm:grid-cols-2">
                  <div className="rounded-2xl bg-violet-50 p-4">
                    <div className="text-xs font-black uppercase tracking-[.14em] text-violet-500">
                      Público sugerido
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {strategy.audience}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-violet-50 p-4">
                    <div className="text-xs font-black uppercase tracking-[.14em] text-violet-500">
                      KPI principal
                    </div>
                    <div className="mt-2 font-black text-slate-800">
                      {strategy.successMetrics.primaryKpi}
                    </div>
                    <div className="mt-1 text-sm text-slate-500">
                      {strategy.successMetrics.target}
                    </div>
                  </div>
                </div>
              </div>

              <div className="glass-card p-5">
                <div className="flex items-center gap-2">
                  <Send size={18} className="text-violet-600" />
                  <h3 className="font-black">Campanha sugerida</h3>
                </div>

                <div className="mt-4 rounded-[22px] border border-violet-100 bg-violet-50/60 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="font-black text-slate-800">
                      {strategy.campaign.name}
                    </div>
                    <StatusPill>{strategy.campaign.channel}</StatusPill>
                  </div>

                  <p className="mt-4 whitespace-pre-line text-sm leading-6 text-slate-600">
                    {strategy.campaign.message}
                  </p>

                  <div className="mt-4 rounded-xl bg-white px-3 py-2 text-sm font-bold text-violet-700">
                    CTA: {strategy.campaign.cta}
                  </div>
                </div>
              </div>

              <div className="glass-card p-5">
                <h3 className="font-black">Plano de ação</h3>

                <div className="mt-4 space-y-3">
                  {strategy.actions.map((action) => (
                    <div
                      key={`${action.order}-${action.title}`}
                      className="flex gap-3 rounded-2xl border border-violet-100 p-4"
                    >
                      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-violet-600 text-xs font-black text-white">
                        {action.order}
                      </div>
                      <div>
                        <div className="font-black text-slate-800">
                          {action.title}
                        </div>
                        <p className="mt-1 text-sm leading-5 text-slate-500">
                          {action.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-5 lg:grid-cols-2">
                <div className="glass-card p-5">
                  <h3 className="font-black">Follow-ups</h3>
                  <div className="mt-4 space-y-2">
                    {strategy.followUps.map((followUp) => (
                      <div
                        key={followUp}
                        className="rounded-2xl bg-violet-50 p-3 text-sm leading-5 text-slate-600"
                      >
                        {followUp}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass-card p-5">
                  <h3 className="font-black">Cuidados da estratégia</h3>
                  <div className="mt-4 space-y-2">
                    {strategy.risks.map((risk) => (
                      <div
                        key={risk}
                        className="rounded-2xl bg-amber-50 p-3 text-sm leading-5 text-amber-800"
                      >
                        {risk}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate('/campanhas')}
                className="gradient-button w-full"
              >
                Transformar estratégia em campanha
                <ArrowRight size={18} />
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
