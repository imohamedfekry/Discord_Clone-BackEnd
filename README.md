# Discord Clone Backend

Backend API لـ Discord Clone مبني بـ NestJS مع نظام Presence بالكامل باستخدام Redis.

---

## 📚 Documentation

### 🚀 Quick Start
- **[Quick Start Guide](./docs/QUICK_START_GUIDE.md)** - دليل سريع لاستخدام الـ APIs

### 📖 API Documentation
- **[API Documentation](./docs/API_DOCUMENTATION.md)** - تفاصيل كاملة لجميع REST APIs

### 🔴 Presence System
- **[Redis Presence System](./docs/REDIS_PRESENCE_SYSTEM.md)** - نظام Presence باستخدام Redis (مثل Discord)
- **[Status System](./docs/STATUS_SYSTEM.md)** - شرح Display Status vs Connection Status

### 🔌 WebSocket
- **[Socket.IO Guide](./docs/SOCKET_IO_GUIDE.md)** - دليل WebSocket Events
- **[WebSocket Testing](./docs/WEBSOCKET_POSTMAN_TESTING.md)** - كيفية Testing WebSocket

### 🏗️ Architecture
- **[Backend Architecture](./docs/BACKEND_ARCHITECTURE.md)** - البنية المعمارية الكاملة

---

## ✨ المميزات الرئيسية

✅ **Redis-Based Presence System** - نظام presence مثل Discord تماماً  
✅ **Real-time Status Updates** - تحديثات فورية عبر WebSocket  
✅ **Friends System** - نظام أصدقاء كامل  
✅ **User Relations** - Block, Ignore, Mute  
✅ **JWT Authentication** - أمان عالي  
✅ **Scalable Architecture** - يدعم Multi-instance deployment  

---

## 🚀 Quick Start

### Installation

```bash
npm install
```

### Environment Setup

إنشاء ملف `.env`:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/discord_clone
CACHE_HOST=localhost
CACHE_PORT=6379
CACHE_PASS=
JWT_SECRET_ACCESS=your_secret_key
JWT_EXPIRES_IN=7d
PORT=3000
```

### Database Setup

```bash
npx prisma migrate dev
npx prisma generate
```

### Run Application

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

---

## 📋 Tech Stack

- **Framework**: NestJS
- **Database**: PostgreSQL + Prisma
- **Cache/Presence**: Redis
- **WebSocket**: Socket.IO
- **Authentication**: JWT
- **Validation**: Class Validator

---

## 🔑 Key Features

### 1. Redis Presence System
- ✅ Presence في Redis فقط (volatile)
- ✅ Auto-cleanup عند restart
- ✅ Real-time status updates
- ✅ Multi-instance support

### 2. REST APIs
- ✅ Authentication (Register/Login)
- ✅ Profile Management
- ✅ Friends System
- ✅ User Relations (Block/Ignore/Mute)

### 3. WebSocket
- ✅ Real-time presence updates
- ✅ Friend request notifications
- ✅ Status changes broadcasting

---

## 📖 API Examples

### Get Profile

```http
GET /api/v1/users/@me
Authorization: Bearer <token>
```

**Response:**
```json
{
  "data": {
    "id": "5280662395293696",
    "username": "john_doe",
    "isOnline": true,    // ✅ From Redis (real-time)
    "status": "ONLINE"   // ✅ Display status
  }
}
```

### Update Status

```http
PUT /api/v1/users/@me/update/presenceStatus
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "IDLE"
}
```

---

## 🔌 WebSocket Connection

```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:3000', {
  auth: { token: 'your_jwt_token' }
});

socket.on('connected', (data) => {
  console.log('Connected:', data.userId);
});

socket.on('presence:updated', (data) => {
  console.log(`${data.username} is now ${data.status}`);
});
```

---

## 📂 Project Structure

```
src/
├── modules/
│   ├── auth/              # Authentication
│   ├── users/             # User management
│   └── websocket/         # WebSocket Gateway
│
├── common/
│   ├── database/          # Repositories
│   ├── Global/cache/      # Redis services
│   └── guards/            # Auth guards
│
└── main.ts
```

---

## 📚 Documentation Files

| File | Description |
|------|-------------|
| [QUICK_START_GUIDE.md](./docs/QUICK_START_GUIDE.md) | دليل سريع للبدء |
| [API_DOCUMENTATION.md](./docs/API_DOCUMENTATION.md) | تفاصيل REST APIs |
| [REDIS_PRESENCE_SYSTEM.md](./docs/REDIS_PRESENCE_SYSTEM.md) | نظام Presence |
| [BACKEND_ARCHITECTURE.md](./docs/BACKEND_ARCHITECTURE.md) | البنية المعمارية |
| [SOCKET_IO_GUIDE.md](./docs/SOCKET_IO_GUIDE.md) | WebSocket Guide |
| [STATUS_SYSTEM.md](./docs/STATUS_SYSTEM.md) | Status System |

---

## 🧪 Testing

### Test WebSocket

افتح `public/websocket-test.html` في المتصفح لـ testing مباشر.

### Postman Collections

جميع الـ collections موجودة في `postman/`:
- `User1_Alice.postman_collection.json`
- `User2_Bob.postman_collection.json`
- `User3_Charlie.postman_collection.json`
- `WebSocket_Testing.postman_collection.json`

---

## ⚙️ Configuration

### Required Services

1. **PostgreSQL** - Database
2. **Redis** - Cache & Presence
3. **Node.js** - Runtime

### Environment Variables

راجع [Quick Start Guide](./docs/QUICK_START_GUIDE.md) للـ environment variables الكاملة.

---

## 🐛 Troubleshooting

### Presence Issues

إذا كان المستخدم يظهر online وهو offline:
- ✅ استخدم `getPresenceStatus()` من Redis
- ❌ لا تستخدم `isOnline` من Database

راجع [Redis Presence System](./docs/REDIS_PRESENCE_SYSTEM.md) للتفاصيل.

---

## 📝 Important Notes

### ✅ DO

- ✅ استخدم Redis للـ presence
- ✅ استخدم REST API لتحديث Status
- ✅ استمع لـ WebSocket events

### ❌ DON'T

- ❌ لا تستخدم Database `isOnline` field
- ❌ لا تُحدث `isOnline` في Database
- ❌ لا تعتمد على Database للـ presence

---

## 🔗 Links

- [API Documentation](./docs/API_DOCUMENTATION.md)
- [Quick Start](./docs/QUICK_START_GUIDE.md)
- [Redis Presence](./docs/REDIS_PRESENCE_SYSTEM.md)
- [Architecture](./docs/BACKEND_ARCHITECTURE.md)

---

## 📄 License

Private project

---

**Last Updated:** 2024-01-15
