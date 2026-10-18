import { useEffect, useMemo, useState } from 'react'
import { useOutletContext, useSearchParams } from 'react-router-dom'
import {
  BarChart3,
  Check,
  CheckCircle2,
  Eye,
  Filter,
  Pause,
  Pencil,
  Play,
  Plus,
  Save,
  Search,
  Send,
  Trash2,
  UsersRound,
  X,
} from 'lucide-react'
import { Field, PageHeading, StatusPill } from '../components/UI'
import {
  getCampaignTone,
  loadCampaigns,
  normalizeSearchText,
  saveCampaigns,
} from '../data/appData'

const emptyCampaign = {
  name: '',
  channel: 'WhatsApp',
  status: 'Rascunho',
  audienceCount: 0,
  messages: 0,
  responses: 0,
  interested: 0,
  appointments: 0,
}

function numberValue(value, max = 999999) {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return 0
  return Math.max(0, Math.min(max, Math.round(parsed)))
}

function campaignToForm(campaign) {
  return {
    name: campaign.name,
    channel: campaign.channel,
    status: campaign.status,
    audienceCount: campaign.audienceCount,
    messages: campaign.metrics?.messages ?? 0,
    responses: campaign.metrics?.responses ?? 0,
    interested: campaign.metrics?.interested ?? 0,
    appointments: campaign.metrics?.appointments ?? 0,
  }
}

function CampaignModal({ mode, form, setForm, onClose, onSave }) {
  const isEditing = mode === 'edit'

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
      <button
        type="button"
        aria-label="Fechar"
        onClick={onClose}
        className="absolute inset-0"
      />

      <form
        onSubmit={onSave}
        className="relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[28px] border border-violet-100 bg-white p-5 shadow-2xl sm:p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs font-black uppercase tracking-[.16em] text-violet-500">
              Campaign Engine
            </div>
            <h2 className="mt-1 text-2xl font-black text-slate-900">
              {isEditing ? 'Editar campanha' : 'Nova campanha'}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {isEditing
                ? 'Atualize os dados e resultados da campanha.'
                : 'Cadastre uma campanha para acompanhar o desempenho no PHX.'}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-violet-100 text-slate-400 transition hover:bg-violet-50"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field label="Nome da campanha">
              <input
                value={form.name}
                onChange={(event) => updateField('name', event.target.value)}
                placeholder="Ex.: Agenda aberta — Cardiologia"
                required
              />
            </Field>
          </div>

          <Field label="Canal">
            <select
              value={form.channel}
              onChange={(event) => updateField('channel', event.target.value)}
            >
              <option>WhatsApp</option>
              <option>Instagram</option>
              <option>E-mail</option>
              <option>SMS</option>
            </select>
          </Field>

          <Field label="Status">
            <select
              value={form.status}
              onChange={(event) => updateField('status', event.target.value)}
            >
              <option>Rascunho</option>
              <option>Em andamento</option>
              <option>Pausada</option>
              <option>Concluída</option>
            </select>
          </Field>

          <Field label="Público / contatos">
            <input
              type="number"
              min="0"
              value={form.audienceCount}
              onChange={(event) =>
                updateField('audienceCount', event.target.value)
              }
            />
          </Field>

          <Field label="Mensagens enviadas">
            <input
              type="number"
              min="0"
              value={form.messages}
              onChange={(event) => updateField('messages', event.target.value)}
            />
          </Field>

          <Field label="Respostas">
            <input
              type="number"
              min="0"
              value={form.responses}
              onChange={(event) => updateField('responses', event.target.value)}
            />
          </Field>

          <Field label="Interessados">
            <input
              type="number"
              min="0"
              value={form.interested}
              onChange={(event) => updateField('interested', event.target.value)}
            />
          </Field>

          <Field label="Agendamentos / conversões">
            <input
              type="number"
              min="0"
              value={form.appointments}
              onChange={(event) =>
                updateField('appointments', event.target.value)
              }
            />
          </Field>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-violet-100 px-5 py-3 text-sm font-bold text-slate-600 transition hover:bg-violet-50"
          >
            Cancelar
          </button>

          <button type="submit" className="gradient-button">
            <Save size={18} />
            {isEditing ? 'Salvar alterações' : 'Criar campanha'}
          </button>
        </div>
      </form>
    </div>
  )
}

function SummaryCard({ label, value, description, icon: Icon }) {
  return (
    <div className="glass-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-bold uppercase tracking-[.12em] text-slate-400">
            {label}
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">{value}</div>
          <div className="mt-1 text-xs text-slate-500">{description}</div>
        </div>

        <div className="icon-bubble shrink-0">
          <Icon size={17} />
        </div>
      </div>
    </div>
  )
}

function CampaignCard({
  campaign,
  expanded,
  onToggleDetails,
  onEdit,
  onDelete,
  onStatusChange,
}) {
  const metrics = campaign.metrics || {
    messages: 0,
    responses: 0,
    interested: 0,
    appointments: 0,
  }

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

  return (
    <article className="glass-card overflow-hidden">
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="icon-bubble">
            <Send size={18} />
          </div>

          <StatusPill tone={getCampaignTone(campaign.status)}>
            {campaign.status}
          </StatusPill>
        </div>

        <h2 className="mt-5 text-lg font-black text-slate-900">
          {campaign.name}
        </h2>

        <div className="mt-2 text-xs font-bold uppercase tracking-[.12em] text-violet-500">
          {campaign.channel}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-violet-50 p-3">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <UsersRound size={14} />
              Público
            </div>
            <div className="mt-1 text-lg font-black text-slate-800">
              {campaign.audienceCount}
            </div>
          </div>

          <div className="rounded-2xl bg-violet-50 p-3">
            <div className="text-xs text-slate-500">Conversões</div>
            <div className="mt-1 text-lg font-black text-violet-700">
              {metrics.appointments}
            </div>
          </div>
        </div>

        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="font-bold text-slate-500">Conversão final</span>
            <span className="font-black text-violet-700">
              {conversionRate}%
            </span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-violet-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-700 via-fuchsia-500 to-purple-400 transition-all"
              style={{ width: `${Math.min(100, conversionRate)}%` }}
            />
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onToggleDetails(campaign.id)}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-violet-100 px-3 py-2.5 text-xs font-bold text-violet-700 transition hover:bg-violet-50"
          >
            <Eye size={15} />
            {expanded ? 'Ocultar' : 'Detalhes'}
          </button>

          <button
            type="button"
            onClick={() => onEdit(campaign)}
            className="grid h-10 w-10 place-items-center rounded-xl border border-violet-100 text-violet-700 transition hover:bg-violet-50"
            title="Editar campanha"
          >
            <Pencil size={15} />
          </button>

          {campaign.status === 'Em andamento' ? (
            <button
              type="button"
              onClick={() => onStatusChange(campaign.id, 'Pausada')}
              className="grid h-10 w-10 place-items-center rounded-xl border border-amber-100 text-amber-600 transition hover:bg-amber-50"
              title="Pausar campanha"
            >
              <Pause size={15} />
            </button>
          ) : campaign.status !== 'Concluída' ? (
            <button
              type="button"
              onClick={() => onStatusChange(campaign.id, 'Em andamento')}
              className="grid h-10 w-10 place-items-center rounded-xl border border-emerald-100 text-emerald-600 transition hover:bg-emerald-50"
              title="Ativar campanha"
            >
              <Play size={15} />
            </button>
          ) : null}

          {campaign.status !== 'Concluída' && (
            <button
              type="button"
              onClick={() => onStatusChange(campaign.id, 'Concluída')}
              className="grid h-10 w-10 place-items-center rounded-xl border border-violet-100 text-violet-700 transition hover:bg-violet-50"
              title="Concluir campanha"
            >
              <Check size={15} />
            </button>
          )}

          <button
            type="button"
            onClick={() => onDelete(campaign.id)}
            className="grid h-10 w-10 place-items-center rounded-xl border border-rose-100 text-rose-600 transition hover:bg-rose-50"
            title="Excluir campanha"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-violet-100 bg-violet-50/45 p-5">
          <div className="grid grid-cols-2 gap-3">
            {[
              [metrics.messages, 'Mensagens'],
              [metrics.responses, 'Respostas'],
              [metrics.interested, 'Interessados'],
              [metrics.appointments, 'Agendamentos'],
            ].map(([value, label]) => (
              <div
                key={label}
                className="rounded-2xl border border-violet-100 bg-white p-3"
              >
                <div className="text-xs text-slate-400">{label}</div>
                <div className="mt-1 text-xl font-black text-slate-800">
                  {value}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="rounded-xl bg-white p-3 text-center">
              <div className="text-[10px] text-slate-400">Resposta</div>
              <div className="mt-1 font-black text-slate-800">
                {responseRate}%
              </div>
            </div>

            <div className="rounded-xl bg-white p-3 text-center">
              <div className="text-[10px] text-slate-400">Interesse</div>
              <div className="mt-1 font-black text-slate-800">
                {interestRate}%
              </div>
            </div>

            <div className="rounded-xl bg-white p-3 text-center">
              <div className="text-[10px] text-slate-400">Conversão</div>
              <div className="mt-1 font-black text-violet-700">
                {conversionRate}%
              </div>
            </div>
          </div>

          <div className="mt-4 text-xs text-slate-400">
            Última atualização: {campaign.updatedAt || 'agora'}
          </div>
        </div>
      )}
    </article>
  )
}

export default function Campaigns() {
  const { notify } = useOutletContext()
  const [params] = useSearchParams()
  const [campaignList, setCampaignList] = useState(loadCampaigns)
  const [query, setQuery] = useState(params.get('campanha') || '')
  const [statusFilter, setStatusFilter] = useState('Todos')
  const [channelFilter, setChannelFilter] = useState('Todos')
  const [modalMode, setModalMode] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyCampaign)
  const [expandedId, setExpandedId] = useState(null)

  useEffect(() => {
    const value = params.get('campanha')
    if (value) setQuery(value)
  }, [params])

  const persistCampaigns = (nextCampaigns) => {
    const normalized = saveCampaigns(nextCampaigns)
    setCampaignList(normalized)
  }

  useEffect(() => {
    persistCampaigns(campaignList)
    // Run only on first mount to migrate/synchronize legacy campaign data.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const summary = useMemo(() => {
    const totalMessages = campaignList.reduce(
      (sum, campaign) => sum + (campaign.metrics?.messages || 0),
      0,
    )
    const totalAppointments = campaignList.reduce(
      (sum, campaign) => sum + (campaign.metrics?.appointments || 0),
      0,
    )
    const active = campaignList.filter(
      (campaign) => campaign.status === 'Em andamento',
    ).length
    const conversion =
      totalMessages > 0
        ? Math.round((totalAppointments / totalMessages) * 100)
        : 0

    return {
      total: campaignList.length,
      active,
      totalMessages,
      totalAppointments,
      conversion,
    }
  }, [campaignList])

  const filtered = useMemo(() => {
    const term = normalizeSearchText(query)

    return campaignList.filter((campaign) => {
      const matchesSearch =
        !term ||
        [
          campaign.name,
          campaign.status,
          campaign.result,
          campaign.audience,
          campaign.channel,
        ].some((value) => normalizeSearchText(value).includes(term))

      const matchesStatus =
        statusFilter === 'Todos' || campaign.status === statusFilter

      const matchesChannel =
        channelFilter === 'Todos' || campaign.channel === channelFilter

      return matchesSearch && matchesStatus && matchesChannel
    })
  }, [campaignList, channelFilter, query, statusFilter])

  const openNewCampaign = () => {
    setEditingId(null)
    setForm(emptyCampaign)
    setModalMode('create')
  }

  const openEditCampaign = (campaign) => {
    setEditingId(campaign.id)
    setForm(campaignToForm(campaign))
    setModalMode('edit')
  }

  const closeModal = () => {
    setModalMode(null)
    setEditingId(null)
    setForm(emptyCampaign)
  }

  const saveCampaign = (event) => {
    event.preventDefault()

    if (!form.name.trim()) {
      notify('Informe o nome da campanha')
      return
    }

    const audienceCount = numberValue(form.audienceCount)
    const messages = numberValue(form.messages, audienceCount || 999999)
    const responses = numberValue(form.responses, messages)
    const interested = numberValue(form.interested, responses)
    const appointments = numberValue(form.appointments, interested)

    const campaignData = {
      name: form.name.trim(),
      channel: form.channel,
      status: form.status,
      tone: getCampaignTone(form.status),
      audienceCount,
      audience: `${audienceCount} contatos`,
      result: `${appointments} agendamentos`,
      updatedAt: new Date().toLocaleDateString('pt-BR'),
      metrics: {
        messages,
        responses,
        interested,
        appointments,
      },
    }

    if (modalMode === 'edit') {
      const nextCampaigns = campaignList.map((campaign) =>
        campaign.id === editingId
          ? { ...campaign, ...campaignData }
          : campaign,
      )

      persistCampaigns(nextCampaigns)
      notify('Campanha atualizada')
    } else {
      const newCampaign = {
        id: `campaign-${Date.now()}`,
        ...campaignData,
      }

      persistCampaigns([newCampaign, ...campaignList])
      notify('Campanha criada com sucesso')
    }

    closeModal()
  }

  const changeStatus = (id, status) => {
    const nextCampaigns = campaignList.map((campaign) =>
      campaign.id === id
        ? {
            ...campaign,
            status,
            tone: getCampaignTone(status),
            updatedAt: new Date().toLocaleDateString('pt-BR'),
          }
        : campaign,
    )

    persistCampaigns(nextCampaigns)
    notify(
      status === 'Em andamento'
        ? 'Campanha ativada'
        : status === 'Pausada'
          ? 'Campanha pausada'
          : 'Campanha concluída',
    )
  }

  const deleteCampaign = (id) => {
    const nextCampaigns = campaignList.filter(
      (campaign) => campaign.id !== id,
    )

    persistCampaigns(nextCampaigns)

    if (expandedId === id) setExpandedId(null)

    notify('Campanha excluída')
  }

  const resetFilters = () => {
    setQuery('')
    setStatusFilter('Todos')
    setChannelFilter('Todos')
  }

  return (
    <div>
      <PageHeading
        eyebrow="Campaign Engine"
        title="Campanhas"
        description="Crie, acompanhe e atualize campanhas e seus resultados."
        action={
          <button onClick={openNewCampaign} className="gradient-button">
            <Plus size={18} />
            Nova campanha
          </button>
        }
      />

      <section className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <SummaryCard
          label="Campanhas"
          value={summary.total}
          description="cadastradas"
          icon={Send}
        />
        <SummaryCard
          label="Ativas"
          value={summary.active}
          description="em andamento"
          icon={Play}
        />
        <SummaryCard
          label="Mensagens"
          value={summary.totalMessages}
          description="enviadas"
          icon={UsersRound}
        />
        <SummaryCard
          label="Conversões"
          value={summary.totalAppointments}
          description="agendamentos"
          icon={CheckCircle2}
        />
        <SummaryCard
          label="Conversão"
          value={`${summary.conversion}%`}
          description="geral"
          icon={BarChart3}
        />
      </section>

      <div className="glass-card mb-5 p-4">
        <div className="grid gap-3 lg:grid-cols-[1fr_190px_170px_auto]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-violet-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="w-full rounded-2xl border border-violet-100 py-3 pl-10 pr-4 outline-none transition focus:ring-2 focus:ring-violet-300"
              placeholder="Buscar campanha..."
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-2xl border border-violet-100 bg-white px-3 py-3 text-sm font-bold text-slate-600 outline-none focus:ring-2 focus:ring-violet-300"
          >
            <option>Todos</option>
            <option>Em andamento</option>
            <option>Rascunho</option>
            <option>Pausada</option>
            <option>Concluída</option>
          </select>

          <select
            value={channelFilter}
            onChange={(event) => setChannelFilter(event.target.value)}
            className="rounded-2xl border border-violet-100 bg-white px-3 py-3 text-sm font-bold text-slate-600 outline-none focus:ring-2 focus:ring-violet-300"
          >
            <option>Todos</option>
            <option>WhatsApp</option>
            <option>Instagram</option>
            <option>E-mail</option>
            <option>SMS</option>
          </select>

          <button
            type="button"
            onClick={resetFilters}
            className="flex items-center justify-center gap-2 rounded-2xl border border-violet-100 px-4 py-3 text-sm font-bold text-violet-700 transition hover:bg-violet-50"
          >
            <Filter size={16} />
            Limpar
          </button>
        </div>

        <div className="mt-3 text-xs text-slate-400">
          {filtered.length} de {campaignList.length} campanhas exibidas
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="glass-card p-10 text-center">
          <Search className="mx-auto text-violet-500" size={28} />
          <h3 className="mt-4 text-lg font-black text-slate-900">
            Nenhuma campanha encontrada
          </h3>
          <p className="mt-2 text-sm text-slate-500">
            Ajuste os filtros ou crie uma nova campanha.
          </p>
          <button
            type="button"
            onClick={openNewCampaign}
            className="gradient-button mt-5"
          >
            <Plus size={17} />
            Criar campanha
          </button>
        </div>
      ) : (
        <section className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
          {filtered.map((campaign) => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              expanded={expandedId === campaign.id}
              onToggleDetails={(id) =>
                setExpandedId((current) => (current === id ? null : id))
              }
              onEdit={openEditCampaign}
              onDelete={deleteCampaign}
              onStatusChange={changeStatus}
            />
          ))}
        </section>
      )}

      {modalMode && (
        <CampaignModal
          mode={modalMode}
          form={form}
          setForm={setForm}
          onClose={closeModal}
          onSave={saveCampaign}
        />
      )}
    </div>
  )
}
