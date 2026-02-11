# Swades

A customer support application with AI-powered chat agents, built as a Turborepo monorepo.

## Architecture

### Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              Swades Monorepo                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────┐     HTTP/REST      ┌─────────────────────────────┐     │
│  │   Web (Next.js) │ ◄────────────────► │   Backend (Hono + Node.js)  │     │
│  │   Port 3000     │   /api/v1/*        │   Port 3002                 │     │
│  └─────────────────┘                    └──────────────┬──────────────┘     │
│                                                          │                  │
│                                                          │                  │
│                                                          ▼                  │
│                                         ┌─────────────────────────────┐     │
│                                         │  PostgreSQL (Prisma)        │     │
│                                         │  + AI Agents (OpenAI)       │     │
│                                         └─────────────────────────────┘     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Project Structure

```
Swades/
├── my-app/                      # Turborepo monorepo root
│   ├── apps/
│   │   ├── backend/             # API server (Hono + Prisma + AI)
│   │   │   ├── prisma/         # Schema, migrations, seed
│   │   │   └── src/
│   │   │       ├── agents/     # AI agents: router, support, order, billing
│   │   │       ├── controllers/
│   │   │       ├── repositories/
│   │   │       ├── routes/
│   │   │       ├── services/
│   │   │       └── server.ts
│   │   ├── docs/               # Optional docs app (Next.js)
│   │   └── web/                # Main frontend (Next.js)
│   │       └── app/
│   │           ├── chats/      # Chat UI
│   │           └── components/
│   └── packages/
│       ├── ui/                 # Shared React components
│       ├── eslint-config/
│       └── typescript-config/
```

### Backend Architecture

| Layer         | Technology | Purpose                                              |
|---------------|------------|------------------------------------------------------|
| **Framework** | Hono       | Lightweight HTTP server with routing and middleware  |
| **Database**  | Prisma + PostgreSQL | ORM, migrations, schema management       |
| **AI**        | Vercel AI SDK + OpenAI | LLM-powered chat and agent routing   |
| **Agents**    | Router, Support, Order, Billing | Intent routing and specialized responses |

**Chat flow**

1. User sends a message → `POST /api/v1/chat/messages`
2. **Router agent** classifies intent: `support`, `order`, or `billing`
3. Request is delegated to the matching agent (support, order, or billing)
4. Agent streams the response via the AI SDK
5. Messages are stored in PostgreSQL via Prisma

**API routes**

| Method | Path                             | Description                          |
|--------|----------------------------------|--------------------------------------|
| POST   | `/api/v1/chat/messages`          | Send a message (streaming response)  |
| GET    | `/api/v1/chat/conversations`     | List conversations for a user         |
| GET    | `/api/v1/chat/conversations/messages` | List conversations with messages |
| GET    | `/api/v1/chat/conversations/:id`  | Get a single conversation            |
| DELETE | `/api/v1/chat/conversations/:id`  | Delete a conversation                |
| GET    | `/health`                        | Health check                          |

### Frontend Architecture

| Layer      | Technology | Purpose                                  |
|------------|------------|------------------------------------------|
| **Framework** | Next.js 16 | App router, React 19                     |
| **HTTP**   | Axios      | API calls to backend                     |
| **UI**     | @repo/ui   | Shared components from monorepo packages  |

---

## Prerequisites

- **Node.js** ≥ 18
- **PostgreSQL** database
- **OpenAI API key** (for AI agents)

---

## Environment Variables

### Backend (`my-app/apps/backend/.env`)

```env
DATABASE_URL="postgresql://user:password@localhost:5432/swades"
OPENAI_API_KEY="sk-..."
PORT=3002
```

### Frontend (`my-app/apps/web/.env.local`)

```env
NEXT_PUBLIC_API_URL="http://localhost:3002"
NEXT_PUBLIC_USER_ID="your-user-id"
```

---

## How to Run

### 1. Install dependencies

```bash
cd my-app
npm install
```

### 2. Configure environment

Create `.env` in `apps/backend/` and `.env.local` in `apps/web/` with the variables above.

### 3. Set up the database

```bash
cd apps/backend
npx prisma generate
npx prisma migrate dev
npm run seed    # optional
```

### 4. Run backend

From `my-app`:

```bash
npm run dev --workspace=backend
```

Or from `my-app/apps/backend`:

```bash
npm run dev
```

Backend runs at **http://localhost:3002**.

### 5. Run frontend

From `my-app`:

```bash
npm run dev --workspace=web
```

Or from `my-app/apps/web`:

```bash
npm run dev
```

Frontend runs at **http://localhost:3000**.

### 6. Run both together

From `my-app`:

```bash
npm run dev
```

This starts backend and web in parallel via Turborepo.

---

## Useful Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start all apps in dev mode (from `my-app`) |
| `npm run dev --workspace=backend` | Start backend only |
| `npm run dev --workspace=web` | Start frontend only |
| `npm run build` | Build all apps |
| `npm run lint` | Lint all packages |
| `npx prisma migrate dev` | Run migrations (from `apps/backend`) |
| `npm run seed` | Seed database (from `apps/backend`) |

---

## License

See [LICENSE](LICENSE).
