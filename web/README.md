# Task Management System

A modern full-stack application for managing users and hobbies with end-to-end type safety.

## Tech Stack

**Backend:** Node.js, Express, TypeScript, tRPC, Drizzle ORM, PostgreSQL  
**Frontend:** React 18, TypeScript, Vite, Tailwind CSS v4, React Hook Form  
**Tooling:** pnpm workspace, ts-node-dev

## Quick Start

### Prerequisites
```bash
npm install -g pnpm
```

### Installation

1. **Clone and setup workspace**
```bash
git clone <repo-url>
cd taskdb-monorepo
pnpm install
```

2. **Configure database**

Create a PostgreSQL database (AWS RDS recommended) and update `apps/backend/.env`:

```env
DB_HOST=your-rds-endpoint.amazonaws.com
DB_PORT=5432
DB_NAME=taskdb
DB_USER=postgres
DB_PASSWORD=your_password
DB_SCHEMA=your_name
PORT=4000
FRONTEND_URL=http://localhost:5173
```

3. **Initialize database**
```bash
pnpm db:push
```

4. **Start development**
```bash
pnpm dev
```

Application runs at:
- Frontend: http://localhost:5173
- Backend: http://localhost:4000

## Project Structure

```
taskdb-monorepo/
├── apps/
│   ├── backend/          # tRPC API with Drizzle ORM
│   └── frontend/         # React SPA with Tailwind v4
├── package.json
└── pnpm-workspace.yaml
```

## Available Commands

```bash
pnpm dev              # Run both frontend and backend
pnpm build            # Build all apps
pnpm typecheck        # Type check all apps
pnpm db:push          # Sync database schema
pnpm db:studio        # Open Drizzle Studio
```

## Database Setup (AWS RDS)

1. Create PostgreSQL instance (Free tier)
2. Set **Public access: YES** for development
3. Configure security group: Allow port 5432
4. Create database schema matching `DB_SCHEMA` in `.env`

## Key Features

- Type-safe API with tRPC
- Form validation with React Hook Form + Zod
- Pagination support
- Cascading deletes (User → Hobbies)
- Real-time UI updates

## Database Schema

**Users Table**
- `id`, `firstName`, `lastName`, `address`, `phone`, `createdAt`, `updatedAt`
- Index on `(firstName, lastName)`

**Hobbies Table**
- `id`, `userId` (FK → users.id ON DELETE CASCADE), `hobby`, `createdAt`
- Index on `userId`

## Development

**Backend** (`apps/backend`)
- Framework: Express + tRPC
- ORM: Drizzle with PostgreSQL
- Validation: Zod schemas
- Dev server: ts-node-dev with hot reload

**Frontend** (`apps/frontend`)
- Build tool: Vite
- Styling: Tailwind CSS v4 (no config files)
- Forms: React Hook Form
- State: TanStack Query (via tRPC)

## Deployment

**Backend:**
```bash
cd apps/backend
pnpm build
pnpm start  # Requires production DB credentials
```

**Frontend:**
```bash
cd apps/frontend
pnpm build  # Output in dist/
```

Update `FRONTEND_URL` in backend `.env` for production.

## Troubleshooting

**Cannot connect to database**
- Check RDS security group allows your IP on port 5432
- Verify credentials in `.env`
- Ensure `DB_SCHEMA` exists in database

**Tailwind classes not working**
- Using Tailwind v4: No config files needed
- Custom colors defined in `@theme` block in `index.css`
- Restart Vite if changes don't reflect

**Type errors**
- Run `pnpm typecheck` to verify
- Ensure backend is running when developing frontend
- Check tRPC router exports in `apps/backend/src/routers/index.ts`
