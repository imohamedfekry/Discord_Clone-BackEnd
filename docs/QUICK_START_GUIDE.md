# Quick Start Guide

## Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Redis 6+

## Setup
1. Install dependencies:
```bash
npm install
```
2. Configure environment (.env):
```env
DATABASE_URL=postgresql://user:pass@localhost:5432/discord_clone
CACHE_HOST=localhost
CACHE_PORT=6379
CACHE_PASS=
JWT_SECRET_ACCESS=your_secret
JWT_EXPIRES_IN=7d
PORT=3000
```
3. Database:
```bash
npx prisma migrate dev
npx prisma generate
```
4. Run:
```bash
npm run start:dev
```

## URLs
- REST Base: `http://localhost:3000/api/v1`
- WebSocket: `http://localhost:3000`

## Test Flow
1. Register/Login via REST
2. Connect WebSocket with `Authorization: Bearer <token>`
3. Update presence via REST `PUT /users/@me/update/presenceStatus`
4. Observe `PRESENCE_UPDATE` broadcast to friends


