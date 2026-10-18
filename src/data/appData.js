export const clients = [
  { id: 'client-mariana-souza', name: 'Mariana Souza', phone: '(21) 98888-1234', service: 'Cardiologia', last: '12/10/2026', status: 'Ativo' },
  { id: 'client-carlos-mendes', name: 'Carlos Mendes', phone: '(21) 97771-9988', service: 'Clínica Médica', last: '28/09/2026', status: 'Ativo' },
  { id: 'client-fernanda-lima', name: 'Fernanda Lima', phone: '(21) 96662-4455', service: 'Dermatologia', last: '11/03/2026', status: 'Reativar' },
  { id: 'client-roberto-alves', name: 'Roberto Alves', phone: '(21) 95553-3322', service: 'Cardiologia', last: '07/02/2026', status: 'Reativar' },
]

export const campaigns = [
  { id: 'campaign-checkup-preventivo', name: 'Check-up Preventivo', audience: '280 contatos', result: '9 agendamentos', status: 'Em andamento', tone: 'emerald', channel: 'WhatsApp' },
  { id: 'campaign-agenda-cardiologia', name: 'Agenda aberta — Cardiologia', audience: '438 contatos', result: '14 agendamentos', status: 'Concluída', tone: 'violet', channel: 'WhatsApp' },
  { id: 'campaign-reativacao-6-meses', name: 'Reativação 6 meses', audience: '312 contatos', result: '23 respostas', status: 'Rascunho', tone: 'slate', channel: 'WhatsApp' },
]

export const conversations = [
  { id: 'conversation-mariana-souza', name: 'Mariana Souza', text: 'Olá! Gostaria de agendar uma consulta...', time: '19:42', unread: 1, initials: 'MS', channel: 'WhatsApp' },
  { id: 'conversation-carlos-mendes', name: 'Carlos Mendes', text: 'Vocês atendem convênio?', time: '18:17', unread: 0, initials: 'CM', channel: 'WhatsApp' },
  { id: 'conversation-fernanda-lima', name: 'Fernanda Lima', text: 'Obrigado! Vou confirmar o horário.', time: '16:03', unread: 0, initials: 'FL', channel: 'WhatsApp' },
  { id: 'conversation-roberto-alves', name: 'Roberto Alves', text: 'Perfeito! Até amanhã então. 😊', time: '14:21', unread: 0, initials: 'RA', channel: 'WhatsApp' },
]

export const normalizeSearchText = (value = '') =>
  value.toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()

export function searchPHX(query) {
  const term = normalizeSearchText(query)
  if (!term) return { clients: [], campaigns: [], conversations: [], total: 0 }
  const includesTerm = (...values) => values.some((value) => normalizeSearchText(value).includes(term))
  const clientResults = clients.filter((client) => includesTerm(client.name, client.phone, client.service, client.status))
  const campaignResults = campaigns.filter((campaign) => includesTerm(campaign.name, campaign.audience, campaign.result, campaign.status, campaign.channel))
  const conversationResults = conversations.filter((conversation) => includesTerm(conversation.name, conversation.text, conversation.channel))
  return {
    clients: clientResults,
    campaigns: campaignResults,
    conversations: conversationResults,
    total: clientResults.length + campaignResults.length + conversationResults.length,
  }
}
