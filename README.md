# Crypto Operating Dashboard (COD) MVP

**Status:** 🚀 Production-ready scaffold  
**Launch Target:** May 7, 2026  
**Stack:** FastAPI + Node.js + PostgreSQL + Redis + Next.js

---

## 📋 What's Included

✅ Backend service scaffold (FastAPI + Node.js)  
✅ Database schema (PostgreSQL migrations)  
✅ Frontend scaffold (Next.js + TypeScript)  
✅ Docker Compose for local development  
✅ API stubs (auth, payments, portfolio, insights, trades)  
✅ Security middleware (JWT, rate limiting, CORS, helmet)  
✅ Configuration templates  

---

## 🚀 Quick Start

### Prerequisites
- Docker + Docker Compose
- Node.js 20+ (for local dev)
- Python 3.11+ (for local dev)

### 1. Clone & Setup

```bash
cd cod-mvp
cp .env.example .env
```

### 2. Start Services

```bash
docker-compose up -d
```

This starts:
- PostgreSQL (port 5432)
- Redis (port 6379)
- FastAPI (port 8000)
- Node.js (port 3001)
- Next.js Frontend (port 3000)

### 3. Access Services

- **Frontend:** http://localhost:3000
- **FastAPI Docs:** http://localhost:8000/docs
- **API Health:** http://localhost:3001/health

---

## 📁 Folder Structure

```
cod-mvp/
├── backend/
│   ├── fastapi-service/          # AI + data services
│   │   ├── app/
│   │   │   ├── api/              # Endpoints (insights, trades, portfolio)
│   │   │   ├── models/           # Data models
│   │   │   ├── services/         # Business logic
│   │   │   └── utils/            # Helpers
│   │   ├── requirements.txt
│   │   └── Dockerfile
│   ├── node-service/             # Auth + payments
│   │   ├── src/
│   │   │   ├── auth/             # Login/register
│   │   │   ├── payments/         # Payment links + Tron
│   │   │   └── middleware/       # JWT, rate limit
│   │   ├── package.json
│   │   └── Dockerfile
│   └── docker-compose.yml
├── frontend/
│   ├── app/
│   │   ├── (dashboard)/          # Dashboard pages
│   │   ├── (auth)/               # Login/signup
│   │   └── (learn)/              # SEO content pages
│   ├── components/               # Reusable UI
│   ├── lib/                      # API client, utils
│   └── package.json
├── migrations/                   # Database schema
├── docs/                         # Documentation
├── .env.example                  # Configuration template
└── README.md
```

---

## 🔌 API Endpoints (MVP)

### Auth (Node.js)
```
POST   /auth/register          # User signup
POST   /auth/login             # User login
POST   /auth/refresh           # Refresh JWT token
POST   /auth/logout            # Logout (optional)
```

### Payments (Node.js, non-custodial)
```
POST   /payments/create        # Create payment link (USDT TRC20)
GET    /payments/:payment_id   # Get payment status
GET    /payments/              # List user's payments
POST   /payments/webhook       # Webhook for on-chain detection
```

### Portfolio (FastAPI)
```
POST   /api/v1/portfolio/add-asset     # Add asset to portfolio
GET    /api/v1/portfolio/              # Get full portfolio
GET    /api/v1/portfolio/summary       # Portfolio summary
PUT    /api/v1/portfolio/asset/{id}    # Update asset
DELETE /api/v1/portfolio/asset/{id}    # Remove asset
```

### Trades (FastAPI)
```
POST   /api/v1/trades/add              # Log a trade
GET    /api/v1/trades/                 # Get trade history
GET    /api/v1/trades/stats            # Trade statistics + AI feedback
GET    /api/v1/trades/{trade_id}       # Get specific trade
PUT    /api/v1/trades/{trade_id}       # Update trade (exit price, notes)
DELETE /api/v1/trades/{trade_id}       # Delete trade
```

### Insights (FastAPI)
```
GET    /api/v1/insights/assets         # All assets with sentiment
GET    /api/v1/insights/{asset}        # Single asset insights
GET    /api/v1/insights/sentiment/top-movers    # Top gainers/losers
GET    /api/v1/insights/whale-activity          # Whale transactions (premium)
```

---

## 🗄️ Database Schema

Core tables:
- `users` — User accounts + plans
- `wallets` — Read-only wallet tracking
- `payments` — Payment links + confirmations
- `portfolio_assets` — User holdings
- `trades` — Trade journal
- `insights` — Market sentiment + trends
- `alerts` — User notifications
- `notifications` — Delivery log

See [init.sql](./init.sql) for full schema.

---

## 🔐 Security Features

✅ **JWT Authentication** — Refresh token rotation  
✅ **Rate Limiting** — 100 req/min per user, 5 attempts auth  
✅ **CORS** — Whitelist configured  
✅ **Helmet** — Security headers  
✅ **Input Validation** — Pydantic + express-validator  
✅ **Environment Secrets** — .env for sensitive keys  

**Next:** Add 2FA, API key rotation, IP whitelist (Phase 2)

---

## 🚀 Next Steps (Phase 2–4)

### Phase 2: Alerts + Webhooks
- [ ] Telegram bot integration
- [ ] Email notifications
- [ ] Real-time whale tracking

### Phase 3: UI Polish + Mobile
- [ ] Responsive design (mobile-first)
- [ ] Dashboard widgets (charts, stats)
- [ ] Mobile app (React Native)

### Phase 4: Scale
- [ ] Multi-chain support
- [ ] Advanced AI insights
- [ ] Plugin ecosystem (Shopify, WooCommerce)

---

## 📚 Documentation

- [SETUP.md](./docs/SETUP.md) — Detailed development setup
- [API.md](./docs/API.md) — Full API reference
- [DEPLOYMENT.md](./docs/DEPLOYMENT.md) — Production deployment

---

## 💰 Monetization (Day 1)

| Plan | Price | Features |
|------|-------|----------|
| **Free** | $0 | Basic portfolio, manual journal |
| **Pro** | $9/mo | AI insights, alerts, whale tracking |
| **Business** | $49/mo+ | Payment APIs, higher limits |
| **Affiliate** | Ongoing | Exchange referrals |

---

## ⚖️ Legal Compliance

✅ **Software vendor**, not financial broker/exchange  
✅ **Non-custodial** — Users own keys/funds  
✅ **Disclaimers** — "Informational only, not financial advice"  

Add disclaimer to every page.

---

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/my-feature`
2. Commit: `git commit -m "Add feature"`
3. Push: `git push origin feature/my-feature`
4. PR to `main`

---

## 📞 Support

- Docs: [docs/](./docs/)
- Issues: GitHub Issues
- Email: support@cod-mvp.local

---

## 📄 License

MIT License — See LICENSE file

---

**Build by May 7. Launch MVP. Scale thereafter.** 🚀
