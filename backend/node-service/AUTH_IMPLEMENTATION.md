# Authentication & User Service - Implementation Guide

## Overview

The authentication service is a Node.js/Express application that handles:
- User registration with email validation
- Secure login with bcrypt password hashing
- JWT token generation and refreshing
- User profile retrieval and updates
- Protected routes via auth middleware

## Architecture

```
src/
├── index.ts                 # Express server entry point
├── auth/
│   └── routes.ts           # Auth endpoints
├── services/
│   └── userService.ts      # Database operations for users
├── middleware/
│   ├── auth.ts             # JWT verification middleware
│   ├── errorHandler.ts     # Global error handling
│   └── rateLimiter.ts      # Rate limiting for API
└── db/
    └── connection.ts       # PostgreSQL connection pool
```

## Endpoints

### Public Endpoints

#### POST /auth/register
Register a new user.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (201):**
```json
{
  "user_id": "uuid-here",
  "email": "user@example.com",
  "token": "jwt-token-here",
  "plan": "free"
}
```

**Error (409):**
```json
{
  "error": "User already exists"
}
```

---

#### POST /auth/login
Authenticate a user and receive a JWT token.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "user_id": "uuid-here",
  "email": "user@example.com",
  "token": "jwt-token-here",
  "plan": "free"
}
```

**Error (401):**
```json
{
  "error": "Invalid credentials"
}
```

---

#### POST /auth/refresh
Refresh an expired JWT token.

**Request:**
```json
{
  "token": "jwt-token-here"
}
```

**Response (200):**
```json
{
  "token": "new-jwt-token"
}
```

**Error (401):**
```json
{
  "error": "Invalid token"
}
```

---

#### POST /auth/logout
Logout the current user (token invalidation via Redis in future).

**Request:**
(No body required)

**Response (200):**
```json
{
  "message": "Logged out"
}
```

---

### Protected Endpoints

All protected endpoints require the `Authorization` header:
```
Authorization: Bearer <jwt-token>
```

#### GET /auth/profile
Get the current user's profile.

**Response (200):**
```json
{
  "id": "user-uuid",
  "email": "user@example.com",
  "plan": "free",
  "created_at": "2026-04-07T10:30:00Z",
  "updated_at": "2026-04-07T10:30:00Z"
}
```

---

#### PUT /auth/profile
Update the current user's profile.

**Request:**
```json
{
  "plan": "pro"
}
```

**Response (200):**
```json
{
  "id": "user-uuid",
  "email": "user@example.com",
  "plan": "pro",
  "created_at": "2026-04-07T10:30:00Z",
  "updated_at": "2026-04-07T12:45:00Z"
}
```

---

## Database Schema

### users table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    plan VARCHAR(50) DEFAULT 'free', -- free, pro, business
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
```

### api_keys table
```sql
CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    key_hash VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_api_keys_user_id ON api_keys(user_id);
```

## Security Features

1. **Password Hashing**: Bcrypt with salt factor 10
2. **JWT Tokens**: 7-day expiry for access tokens
3. **Input Validation**: Email format + password length (min 8 chars)
4. **CORS**: Configurable origins (default: localhost:3000)
5. **Helmet**: Security headers via Helmet.js
6. **Rate Limiting**: Prevents abuse (configured in middleware)
7. **Auth Middleware**: Protects routes requiring authentication

## Configuration

### Environment Variables

Create a `.env` file in the `backend/node-service/` directory:

```env
# Server
PORT=3001
NODE_ENV=development

# Database
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cod_mvp

# JWT
JWT_SECRET=your-secret-key-here-change-in-production

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:3001

# Redis (for future use)
REDIS_HOST=localhost
REDIS_PORT=6379
```

## Running the Service

### Development

```bash
cd backend/node-service

# Install dependencies
npm install

# Start dev server (with auto-reload)
npm run dev
```

The server will run on `http://localhost:3001`

### Production

```bash
npm run build
npm run start
```

### Docker

```bash
docker build -t cod-node-service .
docker run -p 3001:3001 --env-file .env cod-node-service
```

## Testing

### Register a user
```bash
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123"
  }'
```

### Login
```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123"
  }'
```

### Access Protected Route (copy token from login response)
```bash
curl -X GET http://localhost:3001/auth/profile \
  -H "Authorization: Bearer <your-jwt-token>"
```

## Error Handling

Common status codes:

| Code | Meaning |
|------|---------|
| 201 | Created (registration success) |
| 200 | OK |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (invalid credentials/token) |
| 404 | Not Found |
| 409 | Conflict (user already exists) |
| 500 | Server Error |

## Next Steps

1. **Redis Integration**: Implement token blacklist for logout
2. **Email Verification**: Send verification email on registration
3. **Password Reset**: Implement forgot password flow
4. **2FA**: Add two-factor authentication
5. **API Key Management**: Implement `/auth/api-keys` endpoints
6. **OAuth**: Add social login (Google, Discord, etc.)

## Team Notes

- **Service Owner**: Backend Lead
- **Status**: ✅ Complete (MVP)
- **Ready for**: Integration with Frontend
- **Deployment**: Docker + PostgreSQL required
