# Guest Login Backend API Documentation

## Overview

This document describes the backend API endpoint required for guest login functionality.

## Endpoint: POST /api/auth/guest-login

### Description

Creates a new guest session with a unique guest ID and returns guest user data.

### Request

- **Method**: POST
- **URL**: `/api/auth/guest-login`
- **Headers**:
  - `Content-Type: application/json`
- **Body**: Empty (no request body required)

### Response

#### Success Response (200 OK)

```json
{
  "success": true,
  "guestId": "guest_f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "guestUser": {
    "id": "guest_f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "username": "Guest_f47ac10b",
    "email": null,
    "role": "guest",
    "isGuest": true,
    "createdAt": "2025-01-17T10:30:00.000Z"
  },
  "sessionToken": "optional_session_token_here"
}
```

#### Error Response (500 Internal Server Error)

```json
{
  "success": false,
  "message": "Failed to create guest session"
}
```

### Backend Implementation Requirements

1. **Generate Unique Guest ID**:

   - Use UUID v4 with "guest\_" prefix
   - Ensure uniqueness by checking against existing user IDs and guest sessions

2. **Create Guest User Object**:

   - Generate a readable username (e.g., "Guest_f47ac10b")
   - Set appropriate guest properties
   - Include timestamp for session tracking

3. **Optional Session Management**:

   - Create temporary session token for guest tracking
   - Set expiration time for guest sessions (e.g., 24 hours)
   - Store in database or cache for session validation

4. **Database Considerations**:
   - Store guest sessions in a separate table or mark users as guests
   - Implement cleanup for expired guest sessions
   - Ensure guest IDs don't conflict with regular user IDs

### Example Backend Implementation (Node.js/Express)

```javascript
app.post("/api/auth/guest-login", async (req, res) => {
  try {
    // Generate unique guest ID
    const guestId = `guest_${uuidv4()}`;

    // Check for uniqueness (implement your own logic)
    const existingUser = await User.findOne({ id: guestId });
    if (existingUser) {
      // Regenerate if collision (very unlikely with UUID)
      return res.status(500).json({
        success: false,
        message: "Failed to create unique guest session",
      });
    }

    // Create guest user object
    const guestUser = {
      id: guestId,
      username: `Guest_${guestId.substring(6, 14)}`, // Remove "guest_" prefix
      email: null,
      role: "guest",
      isGuest: true,
      createdAt: new Date(),
    };

    // Optional: Store guest session in database
    await GuestSession.create({
      guestId,
      userData: guestUser,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    });

    // Optional: Generate session token
    const sessionToken = jwt.sign(
      { guestId, isGuest: true },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      success: true,
      guestId,
      guestUser,
      sessionToken,
    });
  } catch (error) {
    console.error("Guest login error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create guest session",
    });
  }
});
```

### Security Considerations

1. **Rate Limiting**: Implement rate limiting to prevent abuse
2. **Session Expiration**: Set reasonable expiration times for guest sessions
3. **Data Cleanup**: Regularly clean up expired guest sessions
4. **Validation**: Validate guest sessions on protected routes
5. **Logging**: Log guest session creation for monitoring

### Frontend Integration

The frontend expects the following response structure:

- `guestId`: Unique identifier for the guest
- `guestUser`: Complete user object with guest properties
- `sessionToken`: Optional token for session management

The frontend will store this data in localStorage and use it for:

- User identification
- Session validation
- Display purposes
- API authentication (if session tokens are used)
