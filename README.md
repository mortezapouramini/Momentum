# Momentum — Task Management API

A backend REST API for personal task management, built with Node.js and Express. Features a production-grade authentication system with JWT access tokens, refresh token rotation and theft detection, plus a full task/category/notes domain with rate limiting, structured logging, and layered architecture. Currently being incrementally migrated to TypeScript.

---

## Tech Stack

- **Runtime**: Node.js
- **Language**: JavaScript, migrating to TypeScript (incremental — `allowJs` enabled)
- **Framework**: Express 5
- **Database**: PostgreSQL (`pg`, raw SQL — no ORM)
- **Cache / Queue**: Redis (`ioredis`) + BullMQ
- **Auth**: JWT (RS256) + Argon2 + Refresh Token Rotation
- **Email**: Nodemailer (async via BullMQ)
- **Validation**: Yup
- **Security**: Helmet, `express-rate-limit` with a Redis store
- **Logging**: Pino + Pino HTTP (+ Pino Pretty in dev)
- **Testing**: Jest (unit) + Supertest (integration, against a real local Postgres/Redis test instance)

---

## Architecture

```
src/
├── config/         # DB, Redis, email, cookie, logger config + env validation
├── constants/       # Shared constants (route paths)
├── middlewares/     # Auth, rate limiting, validation, error handling
├── modules/
│   ├── auth/         # Register, verify-email, login, logout, refresh-token
│   ├── user/          # Get/update user profile
│   ├── tasks/         # Task CRUD, filtering, category linking
│   ├── categories/    # Category CRUD
│   └── notes/          # Per-task notes CRUD (nested under tasks)
├── queues/          # BullMQ email queue
├── shared/          # token.service, session.repository, shared param/user schemas
├── types/           # TypeScript type definitions (models, Express augmentation)
├── utils/           # AppError and response helpers
└── workers/         # BullMQ email worker
```

Follows a layered architecture: `routes → controllers → services → repository → database`

Each layer has a single responsibility:

- **Controllers**: parse requests, send responses
- **Services**: business logic and validation
- **Repositories**: all direct database queries, no logic

Every module (`auth`, `user`, `tasks`, `categories`, `notes`) follows the same five-file shape: `*.routes.js`, `*.controller.js`, `*.service.js`, `*.repository.js`, `*.schema.js`.

---

## Authentication System

- **Registration**: stores pending user data in Redis (5 min TTL), sends a 6-digit verification code via email (async via BullMQ), and inserts into PostgreSQL only after email verification
- **Login**: supports email or username, returns a short-lived JWT access token (15 min) and a long-lived refresh token (7 days) stored in an `httpOnly` cookie
- **Refresh Token Rotation**: each use of a refresh token issues a new one and revokes the old one
- **Token Theft Detection**: if a revoked token is reused, all active sessions for that user are immediately invalidated
- **Secure Storage**: only an HMAC-SHA256 hash of the refresh token is stored in the database — the raw token is never persisted
- **Rate limiting**: per-route Redis-backed limits on register, login, verify-email and refresh-token to slow brute-force/credential-stuffing attempts

---

## API Endpoints

### Auth

| Method | Endpoint                     | Description                  | Auth |
| ------ | ----------------------------- | ------------------------------ | ---- |
| `POST` | `/api/v1/auth/register`      | Register a new user          | —    |
| `POST` | `/api/v1/auth/verify-email`  | Verify email with code       | —    |
| `POST` | `/api/v1/auth/login`         | Login with email or username | —    |
| `GET`  | `/api/v1/auth/logout`        | Logout and revoke session    | —    |
| `GET`  | `/api/v1/auth/refresh-token` | Rotate refresh token         | —    |

### Users

| Method  | Endpoint             | Description         | Auth |
| ------- | --------------------- | --------------------- | ---- |
| `GET`   | `/api/v1/users/:userId` | Get a user profile  | ✅   |
| `PATCH` | `/api/v1/users/:userId` | Update a user profile | ✅   |

### Tasks

| Method   | Endpoint                                       | Description                                         | Auth |
| -------- | ------------------------------------------------ | ------------------------------------------------------ | ---- |
| `POST`   | `/api/v1/tasks`                                | Create a new task (optionally with `categoryIds`)   | ✅   |
| `GET`    | `/api/v1/tasks`                                | List tasks — filterable by `status`, `priority`, `q` (title search), `minDueDate`, `maxDueDate` | ✅   |
| `GET`    | `/api/v1/tasks/:taskId`                        | Get a single task                                   | ✅   |
| `PATCH`  | `/api/v1/tasks/:taskId`                        | Update a task                                       | ✅   |
| `DELETE` | `/api/v1/tasks/:taskId`                        | Delete a task                                       | ✅   |
| `POST`   | `/api/v1/tasks/:taskId/categories/:categoryId` | Attach a category to a task                         | ✅   |
| `DELETE` | `/api/v1/tasks/:taskId/categories/:categoryId` | Remove a category from a task                       | ✅   |

### Categories

| Method   | Endpoint                          | Description         | Auth |
| -------- | ------------------------------------ | ---------------------- | ---- |
| `POST`   | `/api/v1/categories`                | Create a category    | ✅   |
| `GET`    | `/api/v1/categories`                | List categories      | ✅   |
| `PATCH`  | `/api/v1/categories/:categoryId`    | Update a category    | ✅   |
| `DELETE` | `/api/v1/categories/:categoryId`    | Delete a category    | ✅   |

### Notes _(nested under a task)_

| Method   | Endpoint                                 | Description               | Auth |
| -------- | ------------------------------------------ | ---------------------------- | ---- |
| `POST`   | `/api/v1/tasks/:taskId/notes`             | Add a note to a task       | ✅   |
| `GET`    | `/api/v1/tasks/:taskId/notes`             | List notes for a task      | ✅   |
| `PATCH`  | `/api/v1/tasks/:taskId/notes/:noteId`     | Update a note              | ✅   |
| `DELETE` | `/api/v1/tasks/:taskId/notes/:noteId`     | Delete a note              | ✅   |

`✅` routes require the auth middleware — a valid access token is checked at the parent `/tasks` router, so it also covers the nested notes routes.

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL
- Redis

### Installation

```bash
git clone https://github.com/mortezapouramini/Momentum.git
cd Momentum
npm install
```

Load the schema into your database:

```bash
psql -U your_db_user -d momentum -f schema.sql
```

### Environment Variables

Create a `.env` file in the root directory:

```env
NODE_ENV=development
SERVER_PORT=5000

# Database
DATABASE=momentum
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_HOST=localhost
DB_PORT=5432

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT (RS256 keys encoded in base64)
ACCESS_PRIVATE_KEY_BASE64=your_private_key_base64
ACCESS_PUBLIC_KEY_BASE64=your_public_key_base64
JWT_ALGORITHM=RS256
REFRESH_TOKEN_HASH_SECRET=your_hmac_secret

# Email (SMTP)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_email
SMTP_PASS=your_password

# CORS
CORS_ORIGIN=http://localhost:5173
```

Sensitive values (like the RS256 keys) can also be loaded from a separate `.env.keys` file — `server.js` loads `.env.keys` before `.env`.

### Running

```bash
# Start the API server + email worker together
npm run dev

# Or run the worker on its own
npm run worker:dev
```

> Both the API server and the email worker must be running for full functionality (registration email delivery depends on the worker).

### Testing

```bash
npm test
```

Runs Jest unit tests for the auth and tasks modules (schema + service layers, with repository/Redis/Argon2/token/email-queue dependencies mocked), plus Supertest integration tests that exercise the full register → verify-email → login flow against a real local Postgres test database and Redis instance.

---

## Database Schema

The database has six tables: `users`, `refresh_tokens`, `tasks`, `categories`, `task_categories` (many-to-many join table), and `notes`.

```sql
-- Users
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  user_name     VARCHAR(30) UNIQUE NOT NULL CHECK (length(user_name) >= 3),
  role          VARCHAR(100) NOT NULL DEFAULT 'user'
                CHECK (role IN ('admin', 'user')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Refresh tokens
CREATE TABLE refresh_tokens (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_hash  VARCHAR(128) NOT NULL,
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_agent  TEXT NOT NULL,
  ip_address  INET NOT NULL,
  expires_at  TIMESTAMPTZ NOT NULL,
  revoked_at  TIMESTAMPTZ,
  replaced_by VARCHAR(128) DEFAULT NULL
);

-- Tasks
CREATE TABLE tasks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title       VARCHAR(50) NOT NULL,
  description VARCHAR(1000),
  priority    VARCHAR(20) NOT NULL DEFAULT 'low'
              CHECK (priority IN ('low', 'medium', 'high')),
  status      VARCHAR(20) NOT NULL DEFAULT 'pending'
              CHECK (status IN ('pending', 'in-progress', 'done')),
  due_date    TIMESTAMP NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Categories
CREATE TABLE categories (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name       VARCHAR(100) NOT NULL,
  color      VARCHAR(7),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, name)
);

-- Task <-> Category (many-to-many)
CREATE TABLE task_categories (
  task_id     UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (task_id, category_id)
);

-- Notes (per task)
CREATE TABLE notes (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id    UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content    VARCHAR(1000) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

The full dump, including indexes and foreign keys, is in [`schema.sql`](./schema.sql).

---

## Roadmap

- Finish the incremental migration to TypeScript across all modules
- Move toward a more explicit modular-monolith structure with message queuing and multi-tenant RBAC

---

## Author

**Morteza Pouramini** — [GitHub](https://github.com/mortezapouramini)
