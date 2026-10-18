import { useNavigate } from 'react-router-dom'
import { CalendarDays, Sparkles } from 'lucide-react'
import { PageHeading, StatusPill } from '../components/UI'

export default function Dashboard() {
  const navigate = useNavigate()

  const metrics = [
    ['Meta da semana', '36 / 50', 'agendamentos'],
    ['Agendamentos', '36', 'esta semana'],
    ['Campanhas ativas', '4', 'em andamento'],
    ['Receita gerada', 'R$ 12.480', 'este mês'],
  ]

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
        {metrics.map(([label, value, description]) => (
          <div key={label} className="glass-card p-5">
            <div className="text-sm font-bold text-slate-500">{label}</div>
            <div className="mt-3 text-3xl font-black">{value}</div>
            <div className="mt-1 text-sm text-slate-400">{description}</div>
          </div>
        ))}
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
