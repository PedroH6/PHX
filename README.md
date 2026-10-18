# PHX — Outcome Growth OS

O PHX é uma plataforma de campanhas, CRM, agenda e IA orientada a resultados.

## Stack

- React
- React Router DOM
- Tailwind CSS
- Vite
- Node.js
- Express
- OpenAI Responses API
- Lucide React

## Rotas

- `/dashboard` — visão geral e métricas
- `/objetivos` — criação de outcomes e estratégias com IA
- `/campanhas` — campanhas
- `/inbox` — conversas
- `/clientes` — CRM
- `/agenda` — agenda e disponibilidade
- `/ia` — agente de IA
- `/configuracoes` — workspace e integrações

## Rodar localmente

Instale as dependências:

```bash
npm install
```

Crie o arquivo local de variáveis de ambiente a partir do exemplo.

No PowerShell:

```powershell
Copy-Item .env.example .env
```

No Prompt de Comando:

```cmd
copy .env.example .env
```

Edite o arquivo `.env` e configure:

```env
OPENAI_API_KEY=sua_chave_da_openai
OPENAI_MODEL=gpt-5-mini
PORT=3001
```

> Nunca envie a chave para o GitHub. O arquivo `.env` está ignorado pelo Git.

Depois rode:

```bash
npm run dev
```

Esse comando inicia:

- Vite/React no front-end;
- API PHX em `http://localhost:3001`;
- proxy local de `/api` para o backend.

## Criar estratégia com IA

A página `/objetivos` envia os dados do outcome para:

```text
POST /api/ai/strategy
```

O backend chama a OpenAI Responses API e devolve uma estratégia estruturada com:

- resumo;
- público recomendado;
- campanha;
- mensagem para WhatsApp;
- CTA;
- plano de ação;
- follow-ups;
- métricas;
- cuidados/riscos.

A chave da OpenAI fica exclusivamente no backend.

## Build

```bash
npm run build
```

O layout compartilhado fica em `src/components/AppLayout.jsx`. Cada página está em `src/pages/`, as rotas em `src/App.jsx` e a API em `server/index.js`.

## Repositório oficial

https://github.com/PedroH6/PHX
