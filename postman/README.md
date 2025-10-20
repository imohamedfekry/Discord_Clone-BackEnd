# Discord Clone API - Postman Collection

## 📋 Overview
This Postman collection provides a complete testing suite for the Discord Clone API with automatic token management and smart variable updates.

## 🚀 Quick Start

### 1. Import Collection
- Import the `Discord Clone - Complete API.postman_collection.json` file into Postman
- The collection includes all necessary environment variables

### 2. Set Environment Variables
The collection comes with pre-configured variables:
- `baseUrl`: `http://localhost:3000/api/v1`
- `username`: `testuser`
- `email`: `test@example.com`
- `password`: `password123`
- `phone`: `+1234567890`

### 3. Authentication Flow
1. **Register** - Create a new account
2. **Login** - Get access tokens (automatically saved)
3. **Get Profile** - View user profile

## 🔧 API Endpoints

### Health Check
- `GET /health` - Basic health check
- `GET /health/ready` - Readiness check
- `GET /health/live` - Liveness check

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login

### User Profile Management
- `GET /users/profile` - Get current user profile
- `PUT /users/profile/password` - Update password
- `PUT /users/profile/global-name` - Update global name
- `PUT /users/profile/custom-status` - Update custom status
- `PUT /users/profile/username` - Update username

### Friendship Management
- `POST /users/friends/request` - Send friend request
- `PUT /users/friends/respond` - Respond to friend request
- `DELETE /users/friends/remove` - Remove friend

### Friends Lists
- `GET /users/friends` - Get friends list
- `GET /users/friends/requests/incoming` - Get incoming requests
- `GET /users/friends/requests/outgoing` - Get outgoing requests

### Advanced Features
- `GET /users/friends/mutual/{userId}` - Get mutual friends
- `GET /users/friends/check/{userId}` - Check friendship status

## 🎯 Auto Features

### Token Management
- Access tokens are automatically extracted and saved
- Refresh tokens are automatically managed
- Bearer token is automatically added to protected endpoints

### Variable Management
- User IDs are automatically extracted and saved
- Friendship IDs are automatically captured
- Username updates automatically update the username variable

### Response Logging
- All responses are logged with status codes
- Success/failure messages are displayed
- Response data is automatically parsed and logged

## 📝 Usage Examples

### Update Profile
```json
// Update Global Name
PUT /users/profile/global-name
{
  "globalName": "John Doe"
}

// Update Custom Status
PUT /users/profile/custom-status
{
  "customStatus": "Playing Minecraft"
}

// Update Username
PUT /users/profile/username
{
  "username": "newusername"
}

// Update Password
PUT /users/profile/password
{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword"
}
```

### Friendship Management
```json
// Send Friend Request
POST /users/friends/request
{
  "username": "friendusername"
}

// Respond to Friend Request
PUT /users/friends/respond
{
  "friendshipId": "123456789",
  "status": "ACCEPTED"
}
```

## 🔒 Security Features

- All protected endpoints require Bearer token authentication
- Password updates require current password verification
- Username updates check for uniqueness
- Global name and custom status have length validation

## 📊 Response Format

All API responses follow this format:
```json
{
  "status": "success",
  "code": 200,
  "message": "Operation successful",
  "data": {
    // Response data here
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 🐛 Error Handling

The collection includes comprehensive error handling:
- HTTP status code validation
- Response structure validation
- Automatic error logging
- Clear error messages

## 🎨 Collection Organization

- **Health Check** - Basic API health endpoints
- **Authentication** - Login/Register functionality
- **User Profile** - Profile management and updates
- **Friendship Management** - Friend request operations
- **Friends Lists** - Friends and requests listing
- **Advanced Features** - Mutual friends and status checks

## 🔄 Workflow

1. Start with Health Check to ensure API is running
2. Register a new user or login with existing credentials
3. Get profile to verify authentication
4. Update profile fields as needed
5. Send friend requests to other users
6. Manage friendships and view friends lists
7. Use advanced features for mutual friends and status checks

## 📈 Monitoring

The collection includes:
- Response time monitoring
- Response size tracking
- Success/failure rate logging
- Automatic variable updates
- Comprehensive logging

## 🛠️ Customization

You can easily customize the collection by:
- Modifying environment variables
- Adding new test scripts
- Updating request bodies
- Adding new endpoints
- Customizing response validation

## 📞 Support

For issues or questions:
- Check the console logs for detailed information
- Verify environment variables are set correctly
- Ensure the API server is running
- Check network connectivity

---

**Happy Testing! 🚀**
