# Backend Architecture

## Stack
- NestJS, Prisma (PostgreSQL), Redis, Socket.IO

## Modules
- `modules/auth` → Authentication
- `modules/users/v1` → User profile, friends, relations
- `modules/websocket/User` → Gateway, presence, friends notifications

## Common Layer
- `common/helpers/api-response.helper.ts` → ApiResponse
- `common/interceptors/response.interceptor.ts` → Global response shape
- `common/filters/*.ts` → Unified error responses
- `common/constants/events.constants.ts` → WebSocket events

## Presence Flow
1. Client connects → JWT auth → join `user:{id}`
2. Presence `markOnline` → Redis keys set, Pub/Sub publish
3. Initial batch presence sync for friends via pipeline
4. Display status updates via REST → Redis + DB presence table → broadcast
5. Disconnect → `markOffline` → keys cleanup + publish

## Scaling
- Redis Pub/Sub for cross-instance presence
- Keys TTL for auto-cleanup after restarts
- Batch Redis pipeline for friend/member lists


