# REPAIRO - Complete API Documentation

## System Overview
Repairo is a repair request management system that connects customers with technicians for device repair services.

---

## Main Interfaces

### 1. User Interface
```typescript
interface User {
  _id: string;              // MongoDB ObjectId
  username: string;         // Display name (3-50 chars)
  email: string;            // Unique email (5-100 chars)
  password: string;         // Hashed password (never sent to client)
  role: 'user' | 'technician' | 'admin';
  phone?: string;           // Phone number (technicians only)
  skills?: string[];        // Array of skills (technicians only)
  certifications?: string;  // Certifications (technicians only)
  bio?: string;             // Professional bio (technicians only)
  createdAt: Date;
  updatedAt?: Date;
}
```

### 2. RepairJob Interface
```typescript
interface RepairJob {
  _id: string;
  title: string;            // Format: "DeviceType - Model"
  description: string;      // Detailed issue description
  status: 'Pending' | 'Assigned' | 'In Progress' | 'Completed' | 'Cancelled';
  userId: string;           // Customer ObjectId reference
  technicianId?: string;    // Technician ObjectId reference (null if unclaimed)
  createdAt: Date;
  updatedAt: Date;
}
```

### 3. Message Interface
```typescript
interface Message {
  _id: string;
  senderId: string;         // User ObjectId reference
  receiverId: string;       // User ObjectId reference
  repairId: string;         // Repair ObjectId reference
  content: string;          // Max 2000 characters
  read: boolean;
  createdAt: Date;
}
```

### 4. AuthResponse Interface
```typescript
interface AuthResponse {
  token: string;            // JWT token (7 day expiry)
  user: User;               // User object without password
  message?: string;
}
```

### 5. Conversation Interface
```typescript
interface Conversation {
  repairId: string;
  repair: {
    _id: string;
    title: string;
    status: string;
  };
  customer: User;
  technician: User;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
}
```

---

## API Endpoints

### Authentication

#### POST /api/auth/login
Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "string (required, 5-100 chars)",
  "password": "string (required, 8-100 chars)"
}
```

**Response:** `200 OK`
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "username": "johndoe",
    "role": "user"
  }
}
```

**Error Responses:**
- `400 Bad Request` - Missing credentials
- `401 Unauthorized` - Invalid credentials
- `500 Internal Server Error` - Server error

---

#### POST /api/auth/register
Create new user account (customer or technician).

**Request Body:**
```json
{
  "email": "string (required, 5-100 chars)",
  "username": "string (required, 3-50 chars)",
  "password": "string (required, 8-100 chars)",
  "confirmPassword": "string (required)",
  "role": "user | technician (optional, default: user)",
  "phone": "string (optional, for technicians)",
  "skills": "string[] (optional, for technicians)",
  "certifications": "string (optional, for technicians)",
  "bio": "string (optional, for technicians)"
}
```

**Response:** `201 Created`
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "username": "johndoe",
    "role": "user"
  },
  "message": "User created successfully"
}
```

**Error Responses:**
- `400 Bad Request` - Validation error or user exists
- `500 Internal Server Error` - Server error

---

#### GET /api/auth/profile
Get current user profile.

**Headers:** 
- `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "username": "johndoe",
    "role": "user",
    "phone": "+1234567890",
    "skills": ["iPhone Repair", "Android Repair"],
    "certifications": "Apple Certified",
    "bio": "10 years experience...",
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
```

**Error Responses:**
- `401 Unauthorized` - Missing or invalid token
- `404 Not Found` - User not found
- `500 Internal Server Error` - Server error

---

#### PUT /api/auth/profile
Update user profile.

**Headers:** 
- `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "username": "string (optional, 3-50 chars)",
  "email": "string (optional, 5-100 chars)",
  "phone": "string (optional, technicians only)",
  "skills": "string[] (optional, technicians only)",
  "certifications": "string (optional, technicians only)",
  "bio": "string (optional, technicians only)",
  "currentPassword": "string (required if changing password)",
  "newPassword": "string (optional, min 8 chars)"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "user": { /* updated user object */ },
  "message": "Profile updated successfully"
}
```

**Error Responses:**
- `400 Bad Request` - Validation error
- `401 Unauthorized` - Missing or invalid token
- `404 Not Found` - User not found
- `500 Internal Server Error` - Server error

---

### Repair Requests

#### GET /api/repairs
Get repair requests for current user.

**Headers:** 
- `Authorization: Bearer <token>`

**Filtering:** 
- Customers see only their own repair requests
- Technicians see only repairs they are assigned to

**Response:** `200 OK`
```json
[
  {
    "_id": "507f1f77bcf86cd799439012",
    "title": "Phone - iPhone 12",
    "description": "Screen is cracked and not responding",
    "status": "Pending",
    "userId": {
      "username": "johndoe",
      "email": "john@example.com"
    },
    "technicianId": null,
    "createdAt": "2025-12-05T10:00:00.000Z",
    "updatedAt": "2025-12-05T10:00:00.000Z"
  }
]
```

**Error Responses:**
- `401 Unauthorized` - Missing or invalid token
- `500 Internal Server Error` - Server error

---

#### POST /api/repairs
Create new repair request (customers only).

**Headers:** 
- `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "title": "string (required)",
  "description": "string (required)",
  "status": "string (optional, default: 'Pending')"
}
```

**Response:** `201 Created`
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "title": "Phone - iPhone 12",
  "description": "Screen is cracked",
  "status": "Pending",
  "userId": "507f1f77bcf86cd799439011",
  "createdAt": "2025-12-05T10:00:00.000Z",
  "updatedAt": "2025-12-05T10:00:00.000Z"
}
```

**Error Responses:**
- `400 Bad Request` - Missing required fields
- `401 Unauthorized` - Missing or invalid token
- `500 Internal Server Error` - Server error

---

#### GET /api/repairs/available
Get unclaimed repair requests (technicians only).

**Headers:** 
- `Authorization: Bearer <token>`
- User must have role: `technician` or `admin`

**Response:** `200 OK`
```json
[
  {
    "_id": "507f1f77bcf86cd799439012",
    "title": "Laptop - Dell XPS 13",
    "description": "Battery not charging",
    "status": "Pending",
    "userId": {
      "username": "janedoe",
      "email": "jane@example.com"
    },
    "createdAt": "2025-12-05T10:00:00.000Z"
  }
]
```

**Error Responses:**
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Not a technician
- `500 Internal Server Error` - Server error

---

#### POST /api/repairs/:id/claim
Claim an unclaimed repair request (technicians only).

**Headers:** 
- `Authorization: Bearer <token>`
- User must have role: `technician` or `admin`

**URL Parameters:**
- `id` - Repair request ID

**Response:** `200 OK`
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "title": "Laptop - Dell XPS 13",
  "description": "Battery not charging",
  "status": "Assigned",
  "userId": {
    "username": "janedoe",
    "email": "jane@example.com"
  },
  "technicianId": {
    "username": "techsmith",
    "email": "tech@example.com",
    "phone": "+1234567890"
  },
  "createdAt": "2025-12-05T10:00:00.000Z",
  "updatedAt": "2025-12-05T11:30:00.000Z"
}
```

**Error Responses:**
- `400 Bad Request` - Repair already claimed
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Not a technician
- `404 Not Found` - Repair not found
- `500 Internal Server Error` - Server error

---

### Messages

#### GET /api/messages
Get messages for repair request or list all conversations.

**Headers:** 
- `Authorization: Bearer <token>`

**Query Parameters:**
- `repairId` (optional) - Get messages for specific repair

**Without repairId - Get all conversations:**
```json
[
  {
    "repairId": "507f1f77bcf86cd799439012",
    "repair": {
      "_id": "507f1f77bcf86cd799439012",
      "title": "Phone - iPhone 12",
      "status": "In Progress"
    },
    "user": { /* customer user object */ },
    "technician": { /* technician user object */ },
    "lastMessage": "I'll arrive at 3 PM",
    "lastMessageTime": "2025-12-05T14:00:00.000Z",
    "unreadCount": 2
  }
]
```

**With repairId - Get specific conversation:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439013",
    "senderId": {
      "username": "johndoe",
      "email": "john@example.com",
      "role": "user"
    },
    "receiverId": {
      "username": "techsmith",
      "email": "tech@example.com",
      "role": "technician"
    },
    "repairId": "507f1f77bcf86cd799439012",
    "content": "When can you arrive?",
    "read": true,
    "createdAt": "2025-12-05T13:00:00.000Z"
  }
]
```

**Error Responses:**
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Not participant in repair
- `404 Not Found` - Repair not found
- `500 Internal Server Error` - Server error

---

#### POST /api/messages
Send message in repair conversation.

**Headers:** 
- `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "repairId": "string (required)",
  "receiverId": "string (required)",
  "content": "string (required, max 2000 chars)"
}
```

**Response:** `201 Created`
```json
{
  "_id": "507f1f77bcf86cd799439013",
  "senderId": {
    "username": "johndoe",
    "email": "john@example.com",
    "role": "user"
  },
  "receiverId": {
    "username": "techsmith",
    "email": "tech@example.com",
    "role": "technician"
  },
  "repairId": "507f1f77bcf86cd799439012",
  "content": "When can you arrive?",
  "read": false,
  "createdAt": "2025-12-05T13:00:00.000Z"
}
```

**Error Responses:**
- `400 Bad Request` - Missing fields or message too long
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Not participant in repair
- `404 Not Found` - Repair not found
- `500 Internal Server Error` - Server error

---

## Data Fetching Strategy

### Custom React Hooks

The application uses custom hooks instead of React Query:

#### 1. useAuth Hook
```typescript
const { 
  login,         // (email, password) => Promise<AuthResponse>
  register,      // (payload) => Promise<AuthResponse>
  logout,        // () => void
  loadProfile,   // () => Promise<User | null>
  isAuthenticated, // boolean
  user,          // User | null
  loading,       // boolean
  error          // string | null
} = useAuth();
```

#### 2. useApi Hook
```typescript
const { 
  data,      // T | null
  loading,   // boolean
  error,     // Error | null
  refetch    // () => Promise<void>
} = useApi({
  endpoint: '/repairs',
  method: 'GET',
  body: null,
  params: {},
  immediate: true,
  withAuth: true,
  deps: []
});
```

#### 3. useProfile Hook
```typescript
const { 
  profile,   // User | null
  loading,   // boolean
  error,     // Error | null
  refresh    // () => Promise<User | null>
} = useProfile({ immediate: true });
```

---

## Middleware Implementation

The Next.js middleware handles:
1. **Authentication checks** - Validates JWT tokens
2. **Role-based routing** - Redirects users based on role
3. **Security headers** - Adds security headers to all responses
4. **Protected routes** - Blocks unauthenticated access

**Key Features:**
- Edge runtime for faster performance
- Cookie and Authorization header support
- Automatic redirect to appropriate dashboard
- Technician/customer route protection

---

## Data Fetching Strategies by Page

### Login Page (SSG)
- Static generation (`force-static`)
- No revalidation
- Lazy loaded LoginClient component

### Dashboard Pages (SSR)
- Dynamic rendering (`force-dynamic`)
- No caching (`revalidate: 0`)
- Server-side token validation
- Initial data fetching on server
- Client-side polling every 30 seconds

### Technician Pages (SSR)
- Dynamic rendering (`force-dynamic`)
- No caching (`revalidate: 0`)
- Real-time job updates
- Role-based access control

---

## SEO Implementation

### Metadata Structure
All pages include:
- Title with template
- Description (120-160 characters)
- Keywords array
- OpenGraph tags
- Twitter card data
- Robots directives
- Canonical URLs

### Example (Dashboard):
```javascript
export const metadata = {
  title: "Dashboard",
  description: "Manage your repair requests, track device repair status...",
  keywords: ["repair dashboard", "track repair", "repair status"],
  openGraph: {
    title: "Dashboard — Repairo",
    description: "Manage your repair requests...",
    type: "website",
  },
  robots: {
    index: false,  // Don't index authenticated pages
    follow: false,
  },
};
```

---

## Component Props

### NewRepairRequest
```typescript
interface Props {
  onSubmit?: (newRepair: RepairJob) => void;
}
```

### RepairHistory
```typescript
interface Props {
  items?: Array<{
    id: string;
    device: string;
    model: string;
    issue: string;
    date: string;
    status: string;
  }>;
  filterStatus?: string | null;
}
```

### DashboardClient
```typescript
interface Props {
  initialJobs?: RepairJob[];
}
```

### TechnicianClient
```typescript
interface Props {
  initialJobs?: RepairJob[];
}
```

---

## Status Codes Reference

- `200 OK` - Successful GET/PUT request
- `201 Created` - Successful POST (resource created)
- `400 Bad Request` - Validation error or malformed request
- `401 Unauthorized` - Missing or invalid authentication
- `403 Forbidden` - Authenticated but insufficient permissions
- `404 Not Found` - Resource doesn't exist
- `500 Internal Server Error` - Server-side error

---

## Environment Variables

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/repairo

# JWT Configuration
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d

# API Base URL
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api

# Site URL (for metadata)
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Node Environment
NODE_ENV=development
```

