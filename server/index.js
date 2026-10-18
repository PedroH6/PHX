import express from 'express'
import 'dotenv/config'

const app = express()
const port = Number(process.env.PORT || 3001)

app.use(express.json({ limit: '100kb' }))

const strategySchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    title: { type: 'string' },
    summary: { type: 'string' },
    audience: { type: 'string' },
    campaign: {
      type: 'object',
      additionalProperties: false,
      properties: {
        name: { type: 'string' },
        channel: { type: 'string' },
        message: { type: 'string' },
        cta: { type: 'string' },
      },
      required: ['name', 'channel', 'message', 'cta'],
    },
    actions: {
      type: 'array',
      minItems: 3,
      maxItems: 6,
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          order: { type: 'integer' },
          title: { type: 'string' },
          description: { type: 'string' },
        },
        required: ['order', 'title', 'description'],
      },
    },
    followUps: {
      type: 'array',
      minItems: 1,
      maxItems: 4,
      items: { type: 'string' },
    },
    successMetrics: {
      type: 'object',
      additionalProperties: false,
      properties: {
        primaryKpi: { type: 'string' },
        target: { type: 'string' },
        secondaryKpis: {
          type: 'array',
          minItems: 1,
          maxItems: 4,
          items: { type: 'string' },
        },
      },
      required: ['primaryKpi', 'target', 'secondaryKpis'],
    },
    risks: {
      type: 'array',
      minItems: 1,
      maxItems: 4,
      items: { type: 'string' },
    },
  },
  required: [
    'title',
    'summary',
    'audience',
    'campaign',
    'actions',
    'followUps',
    'successMetrics',
    'risks',
  ],
}

function extractOutputText(response) {
  for (const item of response.output || []) {
    if (item.type !== 'message') continue

    for (const content of item.content || []) {
      if (content.type === 'output_text' && content.text) {
        return content.text
      }
    }
  }

  return ''
}

function normalizeRequest(body = {}) {
  return {
    objective: String(body.objective || '').trim(),
    service: String(body.service || '').trim(),
    professional: String(body.professional || '').trim(),
    availableSlots: Number(body.availableSlots),
    target: Number(body.target),
    context: String(body.context || '').trim().slice(0, 1500),
  }
}

function validateStrategyRequest(payload) {
  if (!payload.objective) return 'Informe o objetivo.'
  if (!payload.service) return 'Informe o serviço.'
  if (!Number.isFinite(payload.availableSlots) || payload.availableSlots < 1) {
    return 'Informe uma quantidade válida de vagas disponíveis.'
  }
  if (!Number.isFinite(payload.target) || payload.target < 1) {
    return 'Informe uma meta válida.'
  }
  if (payload.target > payload.availableSlots) {
    return 'A meta não pode ser maior que as vagas disponíveis.'
  }

  return null
}

app.get('/api/health', (_request, response) => {
  response.json({
    ok: true,
    aiConfigured: Boolean(process.env.OPENAI_API_KEY),
    model: process.env.OPENAI_MODEL || 'gpt-5-mini',
  })
})

app.post('/api/ai/strategy', async (request, response) => {
  const payload = normalizeRequest(request.body)
  const validationError = validateStrategyRequest(payload)

  if (validationError) {
    return response.status(400).json({ error: validationError })
  }

  if (!process.env.OPENAI_API_KEY) {
    return response.status(503).json({
      error:
        'A IA ainda não está configurada. Adicione OPENAI_API_KEY ao arquivo .env do backend.',
    })
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 45000)

  try {
    const apiResponse = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-5-mini',
        store: false,
        max_output_tokens: 1800,
        instructions: [
          'Você é o estrategista de crescimento do PHX, uma plataforma Outcome as a Service para pequenos negócios e clínicas.',
          'Crie uma estratégia prática e curta para atingir o objetivo informado.',
          'Priorize campanhas éticas, consentidas e adequadas ao canal.',
          'Não prometa resultados garantidos e não invente dados reais de clientes.',
          'Quando o negócio envolver saúde, trate a comunicação como administrativa e de marketing, sem diagnóstico ou aconselhamento médico.',
          'Escreva em português do Brasil.',
        ].join(' '),
        input: `Dados do objetivo:
- Objetivo: ${payload.objective}
- Serviço: ${payload.service}
- Profissional: ${payload.professional || 'Não informado'}
- Vagas disponíveis: ${payload.availableSlots}
- Meta desejada: ${payload.target}
- Contexto adicional: ${payload.context || 'Nenhum'}

Monte uma estratégia de campanha que ajude o negócio a perseguir essa meta. A mensagem de campanha deve ser curta, clara e adequada para WhatsApp.`,
        text: {
          format: {
            type: 'json_schema',
            name: 'phx_growth_strategy',
            description:
              'Estratégia estruturada de crescimento gerada pelo PHX.',
            strict: true,
            schema: strategySchema,
          },
        },
      }),
    })

    const data = await apiResponse.json()

    if (!apiResponse.ok) {
      console.error('OpenAI API error:', data)
      return response.status(apiResponse.status).json({
        error:
          data?.error?.message ||
          'Não foi possível gerar a estratégia neste momento.',
      })
    }

    const outputText = extractOutputText(data)

    if (!outputText) {
      console.error('OpenAI response without output text:', data)
      return response.status(502).json({
        error: 'A IA respondeu sem uma estratégia utilizável.',
      })
    }

    let strategy

    try {
      strategy = JSON.parse(outputText)
    } catch (error) {
      console.error('Unable to parse structured strategy:', error, outputText)
      return response.status(502).json({
        error: 'A resposta da IA chegou em um formato inesperado.',
      })
    }

    return response.json({
      strategy,
      meta: {
        model: data.model,
        responseId: data.id,
      },
    })
  } catch (error) {
    if (error.name === 'AbortError') {
      return response.status(504).json({
        error: 'A geração demorou mais que o esperado. Tente novamente.',
      })
    }

    console.error('PHX strategy generation error:', error)
    return response.status(500).json({
      error: 'Erro interno ao gerar a estratégia.',
    })
  } finally {
    clearTimeout(timeout)
  }
})

app.listen(port, () => {
  console.log(`PHX API running on http://localhost:${port}`)
})
