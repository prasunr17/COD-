# API Reference

## Base URLs

- **Node.js (Auth + Payments):** `http://localhost:3001`
- **FastAPI (Data + Insights):** `http://localhost:8000`

All endpoints return JSON.

---

## Authentication

### Register

Create a new user account.

```
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "secure_password_8+"
}
```

**Response (201):**
```json
{
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "plan": "free"
}
```

### Login

Authenticate and receive JWT token.

```
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "secure_password_8+"
}
```

**Response (200):**
```json
{
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "plan": "free"
}
```

### Refresh Token

Get a new JWT token.

```
POST /auth/refresh
Content-Type: application/json

{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## Payments (Non-Custodial)

### Create Payment Link

Generate a payment link for receiving USDT TRC20.

```
POST /payments/create
Authorization: Bearer {token}
Content-Type: application/json

{
  "amount": 100,
  "currency": "USDT",
  "recipient_address": "TPaymentAddressHere"
}
```

**Response (201):**
```json
{
  "payment_id": "550e8400-e29b-41d4-a716-446655440000",
  "amount": 100,
  "currency": "USDT",
  "recipient_address": "TPaymentAddressHere",
  "status": "pending",
  "payment_link": "http://localhost:3000/pay/550e8400-e29b-41d4-a716-446655440000",
  "qr_code": "https://api.qrserver.com/...",
  "expires_at": "2026-04-08T12:00:00Z"
}
```

### Get Payment Status

Check if payment has been confirmed.

```
GET /payments/550e8400-e29b-41d4-a716-446655440000
```

**Response (200):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "amount": 100,
  "currency": "USDT",
  "status": "confirmed",
  "tx_hash": "0x1234567890abcdef...",
  "created_at": "2026-04-07T12:00:00Z",
  "confirmed": true
}
```

### List User Payments

Get all payments for authenticated user.

```
GET /payments
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "payments": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "amount": 100,
      "currency": "USDT",
      "status": "confirmed",
      "created_at": "2026-04-07T12:00:00Z"
    }
  ],
  "total": 1
}
```

---

## Portfolio

### Add Asset

Add a holding to portfolio (manual entry).

```
POST /api/v1/portfolio/add-asset
Authorization: Bearer {token}
Content-Type: application/json

{
  "symbol": "BTC",
  "quantity": 0.5,
  "avg_cost": 40000,
  "tags": ["hodl", "long-term"]
}
```

**Response (201):**
```json
{
  "id": "asset_550e8400-e29b-41d4-a716-446655440000",
  "symbol": "BTC",
  "quantity": 0.5,
  "avg_cost": 40000,
  "current_price": 43000,
  "current_value": 21500,
  "pnl": 1500,
  "pnl_percent": 7.5,
  "tags": ["hodl", "long-term"],
  "created_at": "2026-04-07T12:00:00Z"
}
```

### Get Full Portfolio

Retrieve all holdings with real-time prices and allocation.

```
GET /api/v1/portfolio
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "assets": [
    {
      "id": "asset_1",
      "symbol": "BTC",
      "quantity": 0.5,
      "current_price": 43000,
      "current_value": 21500,
      "pnl": 1500,
      "pnl_percent": 7.5,
      "allocation": 31.2
    }
  ],
  "summary": {
    "total_value": 69000,
    "total_invested": 67000,
    "total_pnl": 2000,
    "total_pnl_percent": 2.99
  }
}
```

### Get Portfolio Summary

Quick overview of portfolio health.

```
GET /api/v1/portfolio/summary
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "total_value": 69000,
  "total_invested": 67000,
  "total_pnl": 2000,
  "allocation": {
    "BTC": 31.2,
    "USDT": 64.6,
    "Other": 4.2
  },
  "top_performer": {
    "symbol": "BTC",
    "pnl_percent": 7.5
  },
  "worst_performer": {
    "symbol": "DOGE",
    "pnl_percent": -15.2
  }
}
```

---

## Trades

### Log a Trade

Add entry to trading journal.

```
POST /api/v1/trades/add
Authorization: Bearer {token}
Content-Type: application/json

{
  "asset": "BTC",
  "entry_price": 42000,
  "exit_price": 43500,
  "quantity": 0.5,
  "trade_type": "long",
  "notes": "Breakout above resistance",
  "strategy": "momentum",
  "emotion": "confident"
}
```

**Response (201):**
```json
{
  "id": "trade_550e8400-e29b-41d4-a716-446655440000",
  "user_id": "user_id",
  "asset": "BTC",
  "entry_price": 42000,
  "exit_price": 43500,
  "quantity": 0.5,
  "pnl": 750,
  "pnl_percent": 3.57,
  "status": "closed",
  "created_at": "2026-04-07T12:00:00Z"
}
```

### Get Trade History

List all trades for user.

```
GET /api/v1/trades?limit=50
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "trades": [
    {
      "id": "trade_1",
      "asset": "BTC",
      "entry_price": 42000,
      "exit_price": 43500,
      "quantity": 0.5,
      "pnl": 750,
      "status": "closed",
      "created_at": "2026-04-07T12:00:00Z"
    }
  ],
  "total": 42,
  "pagination": { "limit": 50 }
}
```

### Get Trade Statistics

Get win rate, R:R ratio, and AI feedback.

```
GET /api/v1/trades/stats
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "total_trades": 42,
  "win_rate": 0.58,
  "avg_win": 1850,
  "avg_loss": -950,
  "profit_factor": 2.1,
  "risk_reward_ratio": 1.95,
  "discipline_score": 72,
  "ai_feedback": {
    "patterns": [
      "Morning entries higher win rate",
      "Revenge trading costly"
    ],
    "mistakes": [
      "3 consecutive losses without analyzing"
    ],
    "recommendation": "Wait for setup confirmation before entry"
  }
}
```

### Update Trade

Add exit price or update notes.

```
PUT /api/v1/trades/trade_1
Authorization: Bearer {token}
Content-Type: application/json

{
  "exit_price": 43500,
  "notes": "Exited at target"
}
```

**Response (200):**
```json
{
  "message": "Trade updated",
  "trade_id": "trade_1"
}
```

### Delete Trade

Remove a trade from journal.

```
DELETE /api/v1/trades/trade_1
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "message": "Trade deleted",
  "trade_id": "trade_1"
}
```

---

## Insights

### Get All Assets Insights

Market sentiment and trends across tracked assets.

```
GET /api/v1/insights/assets
```

**Response (200):**
```json
{
  "assets": [
    {
      "symbol": "USDT",
      "sentiment_score": 0.72,
      "trend": "bullish",
      "confidence": 0.85,
      "timestamp": "2026-04-07T12:00:00Z"
    },
    {
      "symbol": "BTC",
      "sentiment_score": 0.68,
      "trend": "neutral",
      "confidence": 0.78,
      "timestamp": "2026-04-07T12:00:00Z"
    }
  ]
}
```

### Get Single Asset Insights

Detailed insights for one asset.

```
GET /api/v1/insights/BTC
```

**Response (200):**
```json
{
  "asset": "BTC",
  "sentiment_score": 0.68,
  "trend": "bullish",
  "confidence": 0.82,
  "volatility": 45,
  "data_sources": ["news", "social", "onchain"],
  "timestamp": "2026-04-07T12:00:00Z"
}
```

### Get Top Movers

Gainers and losers across 24h.

```
GET /api/v1/insights/sentiment/top-movers?limit=10
```

**Response (200):**
```json
{
  "gainers": [
    { "symbol": "SOL", "change_24h": 12.5, "sentiment": "bullish" },
    { "symbol": "XRP", "change_24h": 8.3, "sentiment": "bullish" }
  ],
  "losers": [
    { "symbol": "DOGE", "change_24h": -4.2, "sentiment": "bearish" },
    { "symbol": "ADA", "change_24h": -2.1, "sentiment": "neutral" }
  ]
}
```

### Get Whale Activity (Premium)

Large transactions on-chain.

```
GET /api/v1/insights/whale-activity
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "whale_moves": [
    {
      "asset": "BTC",
      "amount": 25.5,
      "usd_value": 1020000,
      "from": "0x1234...",
      "to": "0x5678...",
      "tx_hash": "0xabcd...",
      "timestamp": "2026-04-07T12:00:00Z"
    }
  ],
  "significance": "high",
  "alert_level": "premium"
}
```

---

## Error Responses

### 400 Bad Request

```json
{
  "error": "Invalid request",
  "details": "Missing required field: amount"
}
```

### 401 Unauthorized

```json
{
  "error": "Invalid or expired token"
}
```

### 404 Not Found

```json
{
  "error": "Resource not found",
  "path": "/api/v1/trades/invalid_id"
}
```

### 429 Too Many Requests

```json
{
  "error": "Rate limit exceeded",
  "retry_after": 60
}
```

### 500 Internal Server Error

```json
{
  "error": "Internal server error"
}
```

---

## Rate Limits

- **General:** 100 requests/minute per user
- **Auth:** 5 attempts/15 minutes
- **Payments:** 10 requests/minute

Response headers include:
- `X-RateLimit-Limit`
- `X-RateLimit-Remaining`
- `X-RateLimit-Reset`

---

## Status Codes

- `200` — OK
- `201` — Created
- `400` — Bad Request
- `401` — Unauthorized
- `404` — Not Found
- `429` — Rate Limited
- `500` — Server Error

---

**Last Updated:** April 7, 2026  
**API Version:** 0.1.0
