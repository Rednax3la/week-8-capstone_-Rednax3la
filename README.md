# TaskFlow - Collaborative Task Management System

A full-stack MERN application for team-based task management with real-time collaboration features.

## 🚀 Live Demo

- **Frontend**: https://taskflow-frontend.vercel.app
- **Backend API**: https://taskflow-api.render.com
- **Demo Video**: https://www.youtube.com/watch?v=demo-video-id

## 📱 Screenshots

![Dashboard](screenshots/dashboard.png)
![Task Board](screenshots/task-board.png)
![Team Collaboration](screenshots/team-view.png)

## ✨ Features

### Core Functionality
- **User Authentication**: Secure registration and login with JWT
- **Task Management**: Create, edit, delete, and organize tasks
- **Team Collaboration**: Invite team members and assign tasks
- **Real-time Updates**: Live notifications and task updates via Socket.io
- **Project Organization**: Group tasks into projects with deadlines
- **Priority System**: Categorize tasks by priority levels
- **Status Tracking**: Track task progress through different stages

### Advanced Features
- **Dashboard Analytics**: Visual progress tracking and statistics
- **File Attachments**: Upload and manage task-related files
- **Comment System**: Team communication on individual tasks
- **Due Date Reminders**: Email notifications for upcoming deadlines
- **Activity Timeline**: Track all project and task activities
- **Search & Filter**: Advanced search and filtering capabilities
- **Responsive Design**: Optimized for desktop and mobile devices

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library with hooks
- **React Router v6** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client for API calls
- **Socket.io Client** - Real-time communication
- **React Query** - Data fetching and caching
- **React Hook Form** - Form handling and validation
- **Chart.js** - Data visualization
- **React Hot Toast** - Notifications

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **Socket.io** - Real-time bidirectional communication
- **JWT** - Authentication tokens
- **Bcrypt** - Password hashing
- **Multer** - File upload handling
- **Nodemailer** - Email notifications
- **Express Validator** - Input validation

### Testing
- **Jest** - Testing framework
- **Supertest** - HTTP assertion library
- **React Testing Library** - Component testing
- **MongoDB Memory Server** - In-memory database for testing

### Deployment & DevOps
- **Render** - Backend hosting
- **Vercel** - Frontend hosting
- **MongoDB Atlas** - Database hosting
- **GitHub Actions** - CI/CD pipeline
- **Cloudinary** - Image and file storage

## 🏗️ Architecture

```
TaskFlow/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Route components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API service functions
│   │   ├── utils/          # Utility functions
│   │   ├── context/        # React context providers
│   │   └── styles/         # CSS and styling
│   ├── package.json
│   └── tailwind.config.js
├── server/                 # Node.js backend
│   ├── controllers/        # Route handlers
│   ├── models/             # Mongoose schemas
│   ├── routes/             # API routes
│   ├── middleware/         # Custom middleware
│   ├── utils/              # Utility functions
│   ├── config/             # Configuration files
│   ├── tests/              # Test files
│   └── package.json
├── docs/                   # Documentation
├── screenshots/            # Application screenshots
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local installation or Atlas account)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/taskflow-mern.git
   cd taskflow-mern
   ```

2. **Install server dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install client dependencies**
   ```bash
   cd ../client
   npm install
   ```

4. **Environment Setup**
   
   Create `.env` file in the server directory:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/taskflow
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRE=30d
   
   # Email Configuration
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   
   # Cloudinary Configuration
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   
   # Client URL
   CLIENT_URL=http://localhost:3000
   ```

   Create `.env` file in the client directory:
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   REACT_APP_SOCKET_URL=http://localhost:5000
   ```

5. **Start the development servers**
   
   Terminal 1 (Backend):
   ```bash
   cd server
   npm run dev
   ```
   
   Terminal 2 (Frontend):
   ```bash
   cd client
   npm start
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000/api

## 🧪 Testing

### Run all tests
```bash
# Backend tests
cd server
npm test

# Frontend tests
cd client
npm test

# Test coverage
npm run test:coverage
```

### Test Structure
- **Unit Tests**: Individual functions and components
- **Integration Tests**: API endpoints and database operations
- **End-to-End Tests**: Complete user workflows

## 📚 API Documentation

### Authentication Endpoints
```
POST /api/auth/register     # User registration
POST /api/auth/login        # User login
GET  /api/auth/me          # Get current user
PUT  /api/auth/profile     # Update user profile
```

### Project Endpoints
```
GET    /api/projects       # Get all user projects
POST   /api/projects       # Create new project
GET    /api/projects/:id   # Get project by ID
PUT    /api/projects/:id   # Update project
DELETE /api/projects/:id   # Delete project
```

### Task Endpoints
```
GET    /api/tasks          # Get all tasks
POST   /api/tasks          # Create new task
GET    /api/tasks/:id      # Get task by ID
PUT    /api/tasks/:id      # Update task
DELETE /api/tasks/:id      # Delete task
POST   /api/tasks/:id/comments  # Add comment to task
```

### Team Endpoints
```
POST   /api/teams/invite   # Invite team member
GET    /api/teams/:id      # Get team details
PUT    /api/teams/:id/members  # Update member roles
```

## 🚀 Deployment

### Backend Deployment (Render)
1. Connect your GitHub repository to Render
2. Set environment variables in Render dashboard
3. Deploy with automatic builds on git push

### Frontend Deployment (Vercel)
1. Connect repository to Vercel
2. Set build command: `npm run build`
3. Set environment variables
4. Deploy with automatic deployments

### CI/CD Pipeline
GitHub Actions workflow automatically:
- Runs tests on pull requests
- Deploys to staging on develop branch
- Deploys to production on main branch

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Your Name**
- GitHub: [@yourusername](https://github.com/yourusername)
- LinkedIn: [Your LinkedIn](https://linkedin.com/in/yourprofile)
- Email: your.email@example.com

## 🙏 Acknowledgments

- MongoDB University for database design patterns
- React team for excellent documentation
- Socket.io team for real-time capabilities
- Tailwind CSS for rapid UI development

---

⭐ Star this repository if you found it helpful!
