# Discord Clone - Friendship API Postman Collection

## 📋 Overview
This Postman collection contains all the API endpoints for the Discord Clone friendship features.

## 🚀 Quick Start

### 1. Import Collection
1. Open Postman
2. Click "Import" button
3. Select `Discord_Clone_Friendship_API.postman_collection.json`
4. Click "Import"

### 2. Set Environment Variables
The collection uses these variables:
- `baseUrl`: Your API base URL (default: `http://localhost:3000/api/v1`)
- `accessToken`: JWT token (auto-extracted from login)
- `userId`: User ID (auto-extracted from profile)
- `friendshipId`: Friendship ID (auto-extracted from requests)

### 3. Authentication Flow
1. **Register** a new user
2. **Login** to get access token (auto-saved)
3. **Get Profile** to get user ID (auto-saved)
4. Use other endpoints with auto-saved tokens

## 📚 API Endpoints

### Health Check
- `GET /health` - Complete health check with database status
- `GET /health/ready` - Readiness check for Kubernetes
- `GET /health/live` - Liveness check for Kubernetes

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user

### User Profile
- `GET /users/profile` - Get current user profile

### Friendship Management
- `POST /users/friends/request` - Send friend request
- `PUT /users/friends/respond` - Accept/Reject friend request
- `DELETE /users/friends/remove` - Remove friend

### Friends Lists
- `GET /users/friends` - Get friends list (with pagination)
- `GET /users/friends/requests/incoming` - Get incoming requests
- `GET /users/friends/requests/outgoing` - Get outgoing requests

### Advanced Features
- `GET /users/friends/mutual/:userId` - Get mutual friends
- `GET /users/friends/check/:userId` - Check friendship status

## 🔧 Request Examples

### Send Friend Request
```json
{
  "userId": "1234567890"
}
```

### Respond to Friend Request
```json
{
  "friendshipId": "1234567890",
  "status": "ACCEPTED" // or "REJECTED"
}
```

### Get Friends with Pagination
```
GET /users/friends?page=1&limit=20&status=ACCEPTED
```

## 📝 Response Examples

### Login Response
```json
{
  "status": "success",
  "code": 200,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Friends List Response
```json
{
  "status": "success",
  "code": 200,
  "message": "",
  "data": {
    "friends": [
      {
        "id": "1234567890",
        "username": "friend1",
        "email": "friend1@example.com",
        "avatar": "https://example.com/avatar.jpg",
        "friendshipId": "9876543210",
        "status": "ACCEPTED",
        "createdAt": "2025-10-19T01:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1,
      "totalPages": 1
    }
  }
}
```

## 🎯 Testing Scenarios

### Complete Friendship Flow
1. **Register** two users
2. **Login** with first user
3. **Get Profile** to get user ID
4. **Login** with second user
5. **Send Friend Request** from first user to second
6. **Get Incoming Requests** for second user
7. **Respond to Friend Request** (accept/reject)
8. **Get Friends** list
9. **Check Friendship Status**

### Error Testing
- Try to send friend request to yourself
- Try to send duplicate friend request
- Try to respond to non-existent request
- Try to access protected endpoints without token

## 🔐 Security Notes
- All endpoints except auth require Bearer token
- Tokens are automatically extracted and saved
- User IDs are automatically extracted from responses
- Collection includes proper error handling

## 📊 Status Codes
- `200` - Success
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `409` - Conflict

## 🚨 Common Issues
1. **401 Unauthorized**: Make sure to login first
2. **400 Bad Request**: Check request body format
3. **404 Not Found**: Verify user ID exists
4. **409 Conflict**: Check if friendship already exists

## 📞 Support
For issues or questions, check the API documentation or contact the development team.
