# Slotr — Backend API

**Slotr** is an end-to-end timeslot booking system. The backend provides a RESTful API and WebSocket gateway for managing bookings (fields: `name`, `date`, `time_slot`, `note`) with simple but robust persistence.

### Project Overview (Based on Challenge Requirements)
- **CRUD Bookings**: Create, read, delete, and view occupied slots for a given date.
- **Data Integrity & Concurrency**: A strict uniqueness constraint on `(date, time_slot)` ensures it is impossible to create two bookings for the same time slot. The backend automatically handles conflicts and rejects them with an appropriate error response (`409 Conflict`).
- **Real-time Temporary Lock (Bonus)**: While a user is viewing or selecting a slot, websockets ensure no other user can see it as available or book it. This temporary lock is synced in real-time across different clients.
- **Architecture**: Modular structure utilizing NestJS, with DTOs validated via `class-validator` and `class-transformer`.

---

### Tech Stack

* **Framework**: NestJS (TypeScript)
* **Database**: PostgreSQL (Prisma ORM / TypeORM)
* **Real-time / Caching**: WebSockets (NestJS Gateways) & Redis (for temporary locks)
* **Testing**: Jest (Unit & E2E)

---

### Requirements

* **Docker** & **Docker Compose**
* Alternatively: Node.js (>= 20.x) and pnpm / npm

---

### Quick Start

Slotr provides two Docker Compose configurations depending on your workflow.
> **Note for Local Deployment:** You need to create your own `docker-compose.override.yml` starting from the provided example file to make the deployment work locally. This file is ignored by Git.
> ```bash
> cp docker-compose.override.yml.example docker-compose.override.yml
> ```

#### Option A: Full Stack with Docker Compose (API + Database + Redis)

Spin up the entire environment (Backend API, PostgreSQL Database, and Redis) with a single command:

```bash
docker compose up -d
# or using package scripts:
pnpm run compose:up
```

This starts:
- **`slotr-postgres`**: PostgreSQL 15 on port `5435`
- **`slotr-redis`**: Redis 7 on port `6380`
- **`slotr-api`**: NestJS application on port `3000` (automatically syncs Prisma database schema on start)

The API will be immediately available at: `http://localhost:3000`

To stop the full stack:
```bash
docker compose down
# or:
pnpm run compose:down
```

---

#### Option B: Resources Only with Docker Compose (Database + Redis) & Local API Execution

If you prefer to develop the backend locally (with fast hot-reload or debugging), start only the infrastructure backing services:

1. **Start PostgreSQL and Redis:**
   ```bash
   docker compose -f docker-compose.resources.yml up -d
   # or using package scripts:
   pnpm run compose:resources
   ```

2. **Configure local environment variables:**
   ```bash
   cp .env.example .env
   ```

3. **Synchronize database schema:**
   ```bash
   pnpm run db:push
   # or: pnpm run db:migrate
   ```

4. **Start the local development server:**
   ```bash
   pnpm run start:dev
   ```

To stop the backing resource containers:
```bash
docker compose -f docker-compose.resources.yml down
# or:
pnpm run compose:resources:down
```

---

### Testing

```bash
# Unit Tests
pnpm run test

# End-to-End (E2E) Tests to verify conflicts and concurrency
pnpm run test:e2e
```

---

### Architectural Documentation

For technical decisions, transparency on AI usage, project structure, and details, please see the **[`NOTES.md`](./NOTES.md)** file.