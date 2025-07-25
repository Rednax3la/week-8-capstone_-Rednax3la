# TaskFlow - Project Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Database Schema](#database-schema)
4. [API Documentation](#api-documentation)
5. [Authentication & Authorization](#authentication--authorization)
6. [Real-time Features](#real-time-features)
7. [File Upload System](#file-upload-system)
8. [Testing Strategy](#testing-strategy)
9. [Deployment Guide](#deployment-guide)
10. [Performance Optimization](#performance-optimization)
11. [Security Measures](#security-measures)
12. [Troubleshooting](#troubleshooting)

## Project Overview

TaskFlow is a comprehensive collaborative task management system built with the MERN stack. It enables teams to organize projects, manage tasks, track progress, and collaborate in real-time.

### Key Features
- **User Management**: Registration, authentication, profile management
- **Project Organization**: Create and manage multiple projects
- **Task Management**: Full CRUD operations with status tracking
- **Team Collaboration**: Invite members, assign roles, real-time updates
- **File Attachments**: Upload and manage project files
- **Real-time Communication**: Live updates, notifications, comments
- **Progress Tracking**: Visual dashboards and analytics
- **Responsive Design**: Works on desktop and mobile devices

### Technology Stack
- **Frontend**: React 18, React Router, Tailwind CSS, Socket.io Client
- **Backend**: Node.js, Express.js, Socket.io
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with secure HTTP-only cookies
- **File Storage**: Cloudinary for image and file uploads
- **Testing**: Jest, Supertest, React Testing Library
- **Deployment**: Docker, GitHub Actions CI/CD

## Architecture

### System Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Client  │    │  Express API    │    │   MongoDB       │
│                 │    │                 │    │                 │
│ - Components    │◄──►│ - Controllers   │◄──►│ - Users         │
│ - Context API   │    │ - Middleware    │    │ - Projects      │
│ - React Query   │    │ - Routes        │    │ - Tasks         │
│ - Socket.io     │    │ - Socket.io     │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Directory Structure
```
TaskFlow/
├── client/                 # React frontend
│   ├── public/            # Static assets
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Route components
│   │   ├── context/       # React context providers
│   │   ├── hooks/         # Custom React hooks
│   │   ├── services/      # API service functions
│   │   ├── utils/         # Utility functions
│   │   └── styles/        # CSS and styling
│   └── package.json
├── server/                # Node.js backend
│   ├── controllers/       # Route handlers
│   ├── models/            # Mongoose schemas
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   ├── utils/             # Utility functions
│   ├── config/            # Configuration files
│   ├── tests/             # Test files
│   └── package.json
├── docs/                  # Documentation
├── .github/workflows/     # GitHub Actions
└── docker-compose.yml     # Docker configuration
```

## Database Schema

### User Schema
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  avatar: {
    public_id: String,
    url: String
  },
  role: String (user|admin),
  bio: String,
  skills: [String],
  preferences: {
    notifications: {
      email: Boolean,
      push: Boolean,
      taskUpdates: Boolean,
      projectUpdates: Boolean
    },
    theme: String (light|dark|system)
  },
  lastActive: Date,
  isActive: Boolean,
  emailVerified: Boolean
}
```

### Project Schema
```javascript
{
  name: String,
  description: String,
  owner: ObjectId (User),
  members: [{
    user: ObjectId (User),
    role: String (owner|admin|member|viewer),
    joinedAt: Date,
    permissions: {
      canEditProject: Boolean,
      canDeleteTasks: Boolean,
      canInviteMembers: Boolean,
      canManageMembers: Boolean
    }
  }],
  status: String (planning|active|on-hold|completed|cancelled),
  priority: String (low|medium|high|urgent),
  startDate: Date,
  endDate: Date,
  tags: [String],
  color: String,
  isArchived: Boolean,
  lastActivity: Date
}
```

### Task Schema
```javascript
{
  title: String,
  description: String,
  project: ObjectId (Project),
  createdBy: ObjectId (User),
  assignedTo: [ObjectId (User)],
  status: String (todo|in-progress|review|completed|cancelled),
  priority: String (low|medium|high|urgent),
  category: String (bug|feature|improvement|documentation|research|other),
  tags: [String],
  dueDate: Date,
  estimatedHours: Number,
  actualHours: Number,
  progress: Number (0-100),
  attachments: [{
    filename: String,
    originalName: String,
    url: String,
    uploadedBy: ObjectId (User),
    uploadedAt: Date
  }],
  comments: [{
    user: ObjectId (User),
    text: String,
    createdAt: Date
  }],
  subtasks: [{
    title: String,
    completed: Boolean,
    assignedTo: ObjectId (User)
  }],
  timeTracking: [{
    user: ObjectId (User),
    startTime: Date,
    endTime: Date,
    duration: Number,
    description: String
  }],
  position: Number,
  completedAt: Date,
  lastActivity: Date
}
```

## API Documentation

### Authentication Endpoints
```
POST   /api/auth/register      # User registration
POST   /api/auth/login         # User login
POST   /api/auth/logout        # User logout
GET    /api/auth/me            # Get current user
PUT    /api/auth/profile       # Update user profile
PUT    /api/auth/password      # Update password
POST   /api/auth/forgot-password    # Request password reset
PUT    /api/auth/reset-password/:token   # Reset password
GET    /api/auth/verify-email/:token     # Verify email
```

### Project Endpoints
```
GET    /api/projects           # Get all user projects
POST   /api/projects           # Create new project
GET    /api/projects/:id       # Get project by ID
PUT    /api/projects/:id       # Update project
DELETE /api/projects/:id       # Delete project
POST   /api/projects/:id/invite     # Invite team member
PUT    /api/projects/:id/members/:userId   # Update member role
DELETE /api/projects/:id/members/:userId   # Remove member
```

### Task Endpoints
```
GET    /api/tasks              # Get all tasks (with filters)
POST   /api/tasks              # Create new task
GET    /api/tasks/:id          # Get task by ID
PUT    /api/tasks/:id          # Update task
DELETE /api/tasks/:id          # Delete task
POST   /api/tasks/:id/comments      # Add comment to task
PUT    /api/tasks/:id/comments/:commentId  # Update comment
DELETE /api/tasks/:id/comments/:commentId  # Delete comment
POST   /api/tasks/:id/time           # Add time entry
GET    /api/tasks/:id/time           # Get time entries
```

### Request/Response Examples

#### Register User
**Request:**
```json
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "id": "64a1b2c3d4e5f6789012345",
    "name": "John Doe",
    "email": "john@example.com",
    "avatar": {
      "url": "https://res.cloudinary.com/..."
    },
    "role": "user",
    "emailVerified": false
  },
  "message": "Registration successful! Please check your email to verify your account."
}
```

#### Create Project
**Request:**
```json
POST /api/projects
Authorization: Bearer <token>
{
  "name": "Website Redesign",
  "description": "Complete redesign of company website",
  "priority": "high",
  "startDate": "2024-01-01",
  "endDate": "2024-03-31",
  "tags": ["design", "development", "ui/ux"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "64a1b2c3d4e5f6789012346",
    "name": "Website Redesign",
    "description": "Complete redesign of company website",
    "owner": "64a1b2c3d4e5f6789012345",
    "members": [
      {
        "user": "64a1b2c3d4e5f6789012345",
        "role": "owner",
        "joinedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "status": "planning",
    "priority": "high",
    "progress": 0,
    "memberCount": 1,
    "taskCount": 0,
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Project created successfully"
}
```

## Authentication & Authorization

### JWT Implementation
- Access tokens stored in HTTP-only cookies
- Token expiration: 30 days (configurable)
- Automatic token refresh on valid requests
- Secure token storage prevents XSS attacks

### Role-Based Access Control
```javascript
// User Roles
- user: Standard user with basic permissions
- admin: Administrative privileges across the system

// Project Roles
- owner: Full control over project
- admin: Can manage project and members
- member: Can create/edit tasks, add comments
- viewer: Read-only access to project
```

### Permission System
```javascript
// Project Permissions
{
  canEditProject: Boolean,      // Edit project details
  canDeleteTasks: Boolean,      // Delete any task in project
  canInviteMembers: Boolean,    // Invite new team members
  canManageMembers: Boolean     // Change member roles/permissions
}
```

### Middleware Chain
```javascript
// Authentication middleware
protect → checkProjectMembership → checkProjectPermission → controller
```

## Real-time Features

### Socket.io Implementation
```javascript
// Connection Events
- authenticate: Verify user identity
- join_project: Join project room
- leave_project: Leave project room

// Task Events
- task_created: New task notification
- task_updated: Task status/details changed
- task_deleted: Task removed
- comment_added: New comment on task

// Collaboration Events
- user_typing: Show typing indicators
- user_joined_project: Member joined
- member_invited: New member invitation
```

### Real-time Notifications
- Task assignments and updates
- Project invitations
- Comment mentions
- Due date reminders
- Status change notifications

## File Upload System

### Cloudinary Integration
```javascript
// Supported File Types
Images: jpg, jpeg, png, gif
Documents: pdf, doc, docx, txt, csv, xlsx, xls

// File Constraints
- Maximum file size: 10MB
- Maximum files per task: 5
- Avatar size limit: 2MB
```

### Upload Process
1. Client selects files
2. Multer middleware processes uploads
3. Files uploaded to Cloudinary
4. URLs stored in database
5. Real-time notification sent

## Testing Strategy

### Backend Testing
```javascript
// Test Structure
├── tests/
│   ├── setup.js           # Test database setup
│   ├── auth.test.js       # Authentication tests
│   ├── projects.test.js   # Project CRUD tests
│   ├── tasks.test.js      # Task management tests
│   └── integration.test.js # End-to-end tests

// Test Coverage
- Unit tests for controllers
- Integration tests for API endpoints
- Database operation tests
- Authentication flow tests
```

### Frontend Testing
```javascript
// Test Structure
├── src/
│   ├── __tests__/         # Component tests
│   ├── components/
│   │   └── Component.test.js
│   └── utils/
│       └── helpers.test.js

// Test Types
- Component rendering tests
- User interaction tests
- Context provider tests
- Custom hooks tests
```

### Running Tests
```bash
# Backend tests
cd server
npm test
npm run test:coverage

# Frontend tests
cd client
npm test
npm test -- --coverage
```

## Deployment Guide

### Production Environment Setup
1. **Database Setup**
   - MongoDB Atlas cluster
   - Connection string configuration
   - Index optimization

2. **Environment Variables**
   ```bash
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://...
   JWT_SECRET=<strong-secret>
   CLIENT_URL=https://your-domain.com
   ```

3. **Backend Deployment (Render)**
   - Connect GitHub repository
   - Set environment variables
   - Configure build settings

4. **Frontend Deployment (Vercel)**
   - Connect GitHub repository
   - Set environment variables
   - Configure build command

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up -d

# Scale services
docker-compose up -d --scale backend=3

# View logs
docker-compose logs -f backend
```

### CI/CD Pipeline
```yaml
# GitHub Actions workflow
- Run tests on pull requests
- Deploy to staging on develop branch
- Deploy to production on main branch
- Automated database migrations
- Health checks and rollback
```

## Performance Optimization

### Database Optimization
- Proper indexing on frequently queried fields
- Aggregation pipelines for complex queries
- Connection pooling
- Query optimization

### Caching Strategy
- React Query for client-side caching
- Redis for session storage
- CDN for static assets
- Database query result caching

### Code Splitting
```javascript
// Lazy loading components
const Dashboard = lazy(() => import('./pages/Dashboard'));
const ProjectDetail = lazy(() => import('./pages/ProjectDetail'));
```

### Bundle Optimization
- Tree shaking for unused imports
- Code splitting by routes
- Image optimization with Cloudinary
- Minification and compression

## Security Measures

### Input Validation
- Express Validator for API inputs
- Yup schema validation on frontend
- File type validation for uploads
- SQL injection prevention with Mongoose

### Security Headers
```javascript
// Helmet.js configuration
- Content Security Policy
- XSS Protection
- HSTS headers
- Frame options
```

### Rate Limiting
```javascript
// API rate limiting
- 100 requests per 15 minutes per IP
- Stricter limits for auth endpoints
- User-based rate limiting for authenticated routes
```

### Data Protection
- Password hashing with bcrypt (12 rounds)
- JWT secret rotation
- HTTPS enforcement
- Secure cookie settings

## Troubleshooting

### Common Issues

#### Database Connection
```bash
# Check MongoDB connection
mongosh "mongodb://localhost:27017/taskflow"

# Verify environment variables
echo $MONGODB_URI
```

#### Authentication Problems
```javascript
// Check JWT token
console.log(localStorage.getItem('token'));

// Verify token expiration
const decoded = jwt.decode(token);
console.log(new Date(decoded.exp * 1000));
```

#### Socket.io Issues
```javascript
// Check connection status
socket.connected

// Monitor events
socket.onAny((event, ...args) => {
  console.log(event, args);
});
```

### Debug Commands
```bash
# Backend logs
cd server
npm run dev

# Frontend development
cd client
npm start

# Run specific tests
npm test -- --testNamePattern="auth"
```

### Health Checks
```bash
# API health check
curl http://localhost:5000/health

# Database connection test
npm run test:db

# Frontend build verification
npm run build
serve -s build
```

---

For additional support or questions, please refer to the project README.md or create an issue in the GitHub repository.
