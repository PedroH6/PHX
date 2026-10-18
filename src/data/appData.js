export const clients = [
  { id: 'client-mariana-souza', name: 'Mariana Souza', phone: '(21) 98888-1234', service: 'Cardiologia', last: '12/10/2026', status: 'Ativo' },
  { id: 'client-carlos-mendes', name: 'Carlos Mendes', phone: '(21) 97771-9988', service: 'Clínica Médica', last: '28/09/2026', status: 'Ativo' },
  { id: 'client-fernanda-lima', name: 'Fernanda Lima', phone: '(21) 96662-4455', service: 'Dermatologia', last: '11/03/2026', status: 'Reativar' },
  { id: 'client-roberto-alves', name: 'Roberto Alves', phone: '(21) 95553-3322', service: 'Cardiologia', last: '07/02/2026', status: 'Reativar' },
]

export const campaigns = [
  {
    id: 'campaign-checkup-preventivo',
    name: 'Check-up Preventivo',
    audience: '280 contatos',
    audienceCount: 280,
    result: '9 agendamentos',
    status: 'Em andamento',
    tone: 'emerald',
    channel: 'WhatsApp',
    updatedAt: '18/10/2026',
    metrics: { messages: 280, responses: 67, interested: 21, appointments: 9 },
  },
  {
    id: 'campaign-agenda-cardiologia',
    name: 'Agenda aberta — Cardiologia',
    audience: '438 contatos',
    audienceCount: 438,
    result: '14 agendamentos',
    status: 'Concluída',
    tone: 'violet',
    channel: 'WhatsApp',
    updatedAt: '17/10/2026',
    metrics: { messages: 438, responses: 104, interested: 38, appointments: 14 },
  },
  {
    id: 'campaign-reativacao-6-meses',
    name: 'Reativação 6 meses',
    audience: '312 contatos',
    audienceCount: 312,
    result: '0 agendamentos',
    status: 'Rascunho',
    tone: 'slate',
    channel: 'WhatsApp',
    updatedAt: '16/10/2026',
    metrics: { messages: 0, responses: 0, interested: 0, appointments: 0 },
  },
]

export const conversations = [
  { id: 'conversation-mariana-souza', name: 'Mariana Souza', text: 'Olá! Gostaria de agendar uma consulta...', time: '19:42', unread: 1, initials: 'MS', channel: 'WhatsApp' },
  { id: 'conversation-carlos-mendes', name: 'Carlos Mendes', text: 'Vocês atendem convênio?', time: '18:17', unread: 0, initials: 'CM', channel: 'WhatsApp' },
  { id: 'conversation-fernanda-lima', name: 'Fernanda Lima', text: 'Obrigado! Vou confirmar o horário.', time: '16:03', unread: 0, initials: 'FL', channel: 'WhatsApp' },
  { id: 'conversation-roberto-alves', name: 'Roberto Alves', text: 'Perfeito! Até amanhã então. 😊', time: '14:21', unread: 0, initials: 'RA', channel: 'WhatsApp' },
]

const campaignToneByStatus = {
  'Em andamento': 'emerald',
  Concluída: 'violet',
  Rascunho: 'slate',
  Pausada: 'amber',
}

export function getCampaignTone(status) {
  return campaignToneByStatus[status] || 'slate'
}

function normalizeCampaign(campaign) {
  const metrics = {
    messages: Number(campaign.metrics?.messages) || 0,
    responses: Number(campaign.metrics?.responses) || 0,
    interested: Number(campaign.metrics?.interested) || 0,
    appointments: Number(campaign.metrics?.appointments) || 0,
  }

  const audienceCount =
    Number(campaign.audienceCount) ||
    Number.parseInt(String(campaign.audience || '').replace(/\D/g, ''), 10) ||
    0

  return {
    ...campaign,
    audienceCount,
    audience: `${audienceCount} contatos`,
    result: `${metrics.appointments} agendamentos`,
    tone: getCampaignTone(campaign.status),
    metrics,
  }
}

export function loadCampaigns() {
  try {
    const saved = localStorage.getItem('phx-campaigns')

    if (!saved) return campaigns.map(normalizeCampaign)

    const parsed = JSON.parse(saved)
    if (!Array.isArray(parsed)) return campaigns.map(normalizeCampaign)

    return parsed.map(normalizeCampaign)
  } catch {
    return campaigns.map(normalizeCampaign)
  }
}

export function saveCampaigns(nextCampaigns) {
  const normalized = nextCampaigns.map(normalizeCampaign)
  localStorage.setItem('phx-campaigns', JSON.stringify(normalized))

  const activeCount = normalized.filter(
    (campaign) => campaign.status === 'Em andamento',
  ).length
  localStorage.setItem('phx-active-campaigns', String(activeCount))

  const performance = normalized.reduce((result, campaign) => {
    result[campaign.id] = campaign.metrics
    return result
  }, {})
  localStorage.setItem('phx-campaign-performance', JSON.stringify(performance))

  return normalized
}

export const normalizeSearchText = (value = '') =>
  value.toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()

export function searchPHX(query) {
  const term = normalizeSearchText(query)
  if (!term) return { clients: [], campaigns: [], conversations: [], total: 0 }

  const includesTerm = (...values) =>
    values.some((value) => normalizeSearchText(value).includes(term))

  const clientResults = clients.filter((client) =>
    includesTerm(client.name, client.phone, client.service, client.status),
  )

  const campaignResults = loadCampaigns().filter((campaign) =>
    includesTerm(
      campaign.name,
      campaign.audience,
      campaign.result,
      campaign.status,
      campaign.channel,
    ),
  )

  const conversationResults = conversations.filter((conversation) =>
    includesTerm(conversation.name, conversation.text, conversation.channel),
  )

  return {
    clients: clientResults,
    campaigns: campaignResults,
    conversations: conversationResults,
    total:
      clientResults.length +
      campaignResults.length +
      conversationResults.length,
  }
}
