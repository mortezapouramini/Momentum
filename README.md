# Momentum — Task Management API

A backend REST API for personal task management, built with Node.js and Express. Features a production-grade authentication system with JWT access tokens, refresh token rotation, and token theft detection.

---

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express 5
- **Database**: PostgreSQL
- **Cache / Queue**: Redis + BullMQ
- **Auth**: JWT (RS256) + Argon2 + Refresh Token Rotation
- **Email**: Nodemailer (async via BullMQ)

---

## Architecture

```
src/
├── config/         # Database, Redis, email, and cookie configuration
├── constants/      # Shared constants (route paths)
├── controllers/    # Request handling and response formatting
├── middlewares/    # Auth middleware and error handler
├── queues/         # BullMQ email queue
├── routes/         # Route definitions
├── services/       # Business logic
├── utils/          # AppError and responder helpers
└── workers/        # BullMQ email worker
```

Follows a layered architecture: `routes → controllers → services → database`

---

## Authentication System

- **Registration**: stores pending user data in Redis (5 min TTL), sends a 6-digit verification code via email (async via BullMQ), and inserts into PostgreSQL only after email verification
- **Login**: supports email or username, returns a short-lived JWT access token (15 min) and a long-lived refresh token (7 days) stored in an `httpOnly` cookie
- **Refresh Token Rotation**: each use of a refresh token issues a new one and revokes the old one
- **Token Theft Detection**: if a revoked token is reused, all active sessions for that user are immediately invalidated
- **Secure Storage**: only an HMAC-SHA256 hash of the refresh token is stored in the database — the raw token is never persisted

---

## API Endpoints

### Auth

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/v1/auth/register` | Register a new user | — |
| `POST` | `/api/v1/auth/verify-email` | Verify email with code | — |
| `POST` | `/api/v1/auth/login` | Login with email or username | — |
| `GET` | `/api/v1/auth/logout` | Logout and revoke session | — |
| `GET` | `/api/v1/auth/refresh-token` | Rotate refresh token | — |

### Tasks *(in progress)*

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/v1/tasks` | Create a new task | ✅ |
| `GET` | `/api/v1/tasks` | List all tasks for current user | ✅ |
| `GET` | `/api/v1/tasks/:id` | Get a single task | ✅ |
| `PATCH` | `/api/v1/tasks/:id` | Update a task | ✅ |
| `DELETE` | `/api/v1/tasks/:id` | Delete a task | ✅ |

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
```

### Running

```bash
# Start the API server
npm run dev

# Start the email worker (required for email delivery)
npm run worker:dev
```

> Both the API server and the email worker must be running for full functionality.

---

## Database Schema

```sql
-- Users
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  user_name     VARCHAR(200) UNIQUE NOT NULL,
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
```

---

## Author

**Morteza Pouramini** — [GitHub](https://github.com/mortezapouramini)