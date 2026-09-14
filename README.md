# Prismo Constructions - Frontend

A modern, responsive web application for Prismo Constructions, built with React 19, Vite, and Tailwind CSS. This application provides a comprehensive project management platform for construction projects with role-based dashboards, real-time collaboration, and advanced UI features.

## 🚀 Features

### Core Functionality
- **Multi-Role Authentication System**: Secure login with role-based access control (Admin, CEO, Project Manager, Client, Site Engineer)
- **Interactive Dashboards**: Role-specific dashboards with real-time data visualization
- **Project Management**: Complete project lifecycle management from creation to completion
- **Task Management**: Create, assign, and track tasks with status updates
- **Progress Tracking**: Submit and view progress logs with photo attachments
- **Issue Reporting**: Report and track site issues with detailed comments and meetings
- **Approval Workflow**: Request and manage approvals for project milestones
- **Document Management**: Upload and manage project documents
- **Real-time Communication**: Floating chat widget for instant messaging
- **Consultation System**: Schedule and manage consultations between stakeholders

### User Interface
- **Modern Design**: Clean, professional interface with Tailwind CSS
- **Smooth Animations**: Framer Motion for enhanced user experience
- **Responsive Layout**: Fully responsive design for all screen sizes
- **Interactive Components**: Modals, carousels, and dynamic forms
- **Photo Gallery**: Image carousel for project photos
- **Navigation**: Intuitive routing with React Router

## 🛠️ Tech Stack

### Frontend Framework
- **React 19.2.8**: Latest React with improved performance and features
- **Vite 8.2.2**: Fast build tool and development server
- **React Router 7.18.3**: Client-side routing

### Styling & UI
- **Tailwind CSS 4.3.3**: Utility-first CSS framework
- **Framer Motion 13.1.1**: Animation library for React
- **Lucide React 1.35.0**: Beautiful icon library
- **clsx 2.1.1 & tailwind-merge 3.6.0**: Utility functions for className management

### State Management & Data
- **React Context API**: Authentication and data context
- **Axios 1.20.0**: HTTP client for API requests
- **date-fns 4.4.0**: Date manipulation and formatting

### Development Tools
- **@vitejs/plugin-react 6.1.0**: Vite plugin for React
- **oxlint 1.79.0**: Fast JavaScript linter
- **PostCSS 8.5.26 & Autoprefixer 10.5.4**: CSS processing

## 📋 Prerequisites

Before running this application, ensure you have:

- **Node.js**: Version 18.0 or higher
- **npm**: Version 9.0 or higher (comes with Node.js)
- **Backend API**: Running Prismo Constructions backend server

## 🔧 Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd prismo-construction/frontend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:8080
VITE_API_TIMEOUT=30000
```

## 🚀 Running the Application

### Development Mode
```bash
npm run dev
```
The application will be available at `http://localhost:5173`

### Production Build
```bash
npm run build
```
The optimized production files will be in the `dist/` directory.

### Preview Production Build
```bash
npm run preview
```

### Linting
```bash
npm run lint
```

## 📁 Project Structure

```
frontend/
├── public/                 # Static assets
├── src/
│   ├── assets/            # Images, fonts, and other assets
│   ├── components/         # Reusable React components
│   │   ├── ClientDashboard.jsx
│   │   ├── PMDashboard.jsx
│   │   ├── CEODashboard.jsx
│   │   ├── SiteEngineerDashboard.jsx
│   │   ├── Layout.jsx
│   │   ├── FloatingChatWidget.jsx
│   │   └── ...            # Other UI components
│   ├── context/           # React Context providers
│   │   ├── AuthContext.jsx
│   │   └── DataContext.jsx
│   ├── pages/             # Page components
│   │   ├── LandingPage.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Projects.jsx
│   │   ├── Login.jsx
│   │   └── ...            # Other pages
│   ├── utils/             # Utility functions
│   ├── App.jsx            # Main app component with routing
│   ├── main.jsx           # Application entry point
│   ├── index.css          # Global styles
│   └── App.css            # App-specific styles
├── index.html             # HTML template
├── package.json           # Dependencies and scripts
├── vite.config.js         # Vite configuration
└── README.md              # This file
```

## 🔐 Authentication Flow

The application uses JWT-based authentication:

1. **Login**: Users authenticate via `/login` endpoint
2. **Token Storage**: JWT token stored in localStorage
3. **Protected Routes**: Authentication checks via `RequireAuth` component
4. **Role-Based Access**: Different dashboards based on user role
5. **Auto-Logout**: Token expiration handling

### User Roles
- **admin**: Full system access and user management
- **ceo**: Strategic oversight and consultations
- **project_manager**: Project creation and management
- **client**: Project viewing and approval
- **site_engineer**: Progress reporting and issue tracking

## 🌐 API Integration

The frontend communicates with the backend via RESTful API:

### Base URL
Configured via `VITE_API_URL` environment variable

### Key Endpoints
- `POST /api/auth/login` - User authentication
- `POST /api/auth/register` - User registration
- `GET /api/projects` - List projects
- `POST /api/projects` - Create project
- `GET /api/projects/:id` - Project details
- `POST /api/progress` - Submit progress log
- `POST /api/issues` - Report issue
- `GET /api/tasks` - List tasks
- `POST /api/approvals` - Request approval

### Error Handling
- Axios interceptors for request/response handling
- Centralized error handling in context
- User-friendly error messages

## 🎨 Key Components

### Dashboards
- **ClientDashboard**: Project overview and approval management
- **PMDashboard**: Project creation and team management
- **CEODashboard**: Strategic oversight and consultations
- **SiteEngineerDashboard**: Progress reporting and issue tracking

### Project Management
- **ProjectTable**: Sortable, filterable project listing
- **ProjectDetailPage**: Comprehensive project view with tabs
- **CreateProjectForm**: Multi-step project creation wizard
- **MilestoneFormList**: Milestone management interface

### Collaboration
- **FloatingChatWidget**: Real-time messaging interface
- **TaskDetailModal**: Task management with comments
- **ApprovalDetailModal**: Approval request handling
- **ReportIssueModal**: Issue reporting with attachments

### UI Components
- **Layout**: Main application layout with navigation
- **PhotoGallery**: Image carousel with lightbox
- **ImageCarousel**: Smooth image slider
- **PortfolioSummaryCards**: Project portfolio display

## 🧪 Testing

While the project currently uses manual testing, here's the recommended approach:

```bash
# Install testing dependencies (when needed)
npm install --save-dev @testing-library/react @testing-library/jest-dom vitest

# Run tests (when configured)
npm run test
```

## 📦 Deployment

### Build for Production
```bash
npm run build
```

### Deployment Options

#### 1. Static Hosting (Vercel, Netlify, GitHub Pages)
```bash
# Deploy dist/ folder to your hosting service
```

#### 2. Docker Deployment
Create a `Dockerfile`:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 5173
CMD ["npm", "run", "preview"]
```

#### 3. Traditional Server
Upload `dist/` contents to your web server and configure it to serve static files.

## 🔧 Configuration

### Vite Configuration
Located in `vite.config.js`:
- React plugin configuration
- Tailwind CSS integration
- Build optimization settings

### Tailwind Configuration
Uses Tailwind CSS v4 with Vite plugin for optimal performance.

### Environment Variables
- `VITE_API_URL`: Backend API endpoint
- `VITE_API_TIMEOUT`: Request timeout in milliseconds

## 🐛 Troubleshooting

### Common Issues

**Port Already in Use**
```bash
# Kill process on port 5173
npx kill-port 5173
```

**Module Not Found**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**API Connection Issues**
- Verify backend is running on configured port
- Check CORS settings in backend
- Ensure environment variables are set correctly

**Build Errors**
```bash
# Clear Vite cache
rm -rf node_modules/.vite
npm run build
```

## 📝 Development Guidelines

### Code Style
- Use functional components with hooks
- Follow React best practices
- Maintain consistent naming conventions
- Add comments for complex logic

### Component Structure
- Keep components small and focused
- Use props for data passing
- Leverage context for global state
- Implement proper error boundaries

### Performance
- Use React.memo for expensive components
- Implement lazy loading for routes
- Optimize images and assets
- Minimize re-renders

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is proprietary software for Prismo Constructions.

## 📞 Support

For support and questions:
- Email: support@prismo-constructions.com
- Documentation: [Internal Wiki]
- Issue Tracker: [Internal Jira]

## 🗺️ Roadmap

### Upcoming Features
- [ ] Enhanced offline support with service workers
- [ ] Advanced analytics dashboard
- [ ] Mobile app version
- [ ] Video conferencing integration
- [ ] Advanced document collaboration
- [ ] AI-powered project insights
- [ ] Enhanced reporting and export features

---

**Built with ❤️ for Prismo Constructions**
