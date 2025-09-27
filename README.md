# Electronics Repair Shop Management System

A comprehensive full-stack web application for managing electronics repair services, featuring React TypeScript frontend, ASP.NET Core backend, and SQL Server database - all fully containerized with Docker.

## 🚀 Features

### Customer Features
- **User Registration & Authentication** - Secure account creation with email verification
- **Device Repair Requests** - Submit repair requests for various electronic devices
- **Order Tracking** - Real-time repair status and progress tracking
- **Profile Management** - Update personal information and contact details
- **Payment Integration** - Secure payment processing for repair services
- **Repair History** - Complete history of all repair orders

### Technician Features
- **Repair Management** - Update repair status and estimated completion times
- **Work Queue** - View assigned repair tasks and priorities
- **Status Updates** - Communicate repair progress to customers

### Admin Features
- **Dashboard Analytics** - Comprehensive statistics and performance metrics
- **User Management** - Manage customer and technician accounts
- **Request Management** - Oversee all repair requests and assignments
- **Payment Management** - Handle payment processing and financial records
- **Role Assignment** - Assign roles and permissions to users

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **React Router** for navigation
- **Axios** for API communication
- **CSS3** with custom styling
- **React Icons** for UI icons

### Backend
- **ASP.NET Core 8.0** Web API
- **Entity Framework Core** for database operations
- **JWT Authentication** for secure API access
- **SendGrid** for email services
- **Swagger** for API documentation

### Database
- **SQL Server** with Entity Framework migrations
- **Dockerized** for easy deployment

### DevOps & Containerization
- **Docker** containerization for all services
- **Docker Compose** for orchestration
- **Multi-stage Docker builds** for optimization

## 📁 Project Structure

```
Electronics-Repair-Shop/
├── docker-compose.yml           # Docker Compose orchestration
├── .env                         # Environment variables
├── frontend/                    # React TypeScript application
│   ├── Dockerfile              # Frontend container configuration
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── context/           # React context for state management
│   │   ├── services/          # API service functions
│   │   └── App.tsx            # Main application component
│   └── package.json           # Frontend dependencies
├── backend/                     # ASP.NET Core Web API
│   ├── Dockerfile              # Backend container configuration
│   ├── Controllers/            # API controllers
│   ├── Services/              # Business logic services
│   ├── Models/                # Data models
│   ├── Data/                  # Database context
│   └── Program.cs             # Application entry point
├── init-sql/                   # Database initialization scripts
└── database/                   # Database documentation
```

## 🐳 Quick Start with Docker

### Prerequisites
- **Docker Desktop** (Windows/Mac) or **Docker Engine** (Linux)
- **Git** for cloning the repository
- **8GB+ RAM** recommended for smooth operation

### 🚀 One-Command Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/nayodya/Electronics-Repair-Shop.git
   cd Electronics-Repair-Shop
   ```

2. **Start the entire application stack**
   ```bash
   docker-compose up --build
   ```

That's it! The application will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5062
- **Swagger Documentation**: http://localhost:5062/swagger

### 🔧 Docker Services

The application consists of three containerized services:

| Service | Port | Description |
|---------|------|-------------|
| **frontend** | 5173 | React TypeScript application |
| **backend** | 5062 | ASP.NET Core Web API |
| **database** | 1433 | SQL Server database |

## ⚡ Docker Commands

### Development Commands
```bash
# Start all services in background
docker-compose up -d

# Start with real-time logs
docker-compose up

# Rebuild and start (after code changes)
docker-compose up --build

# Stop all services
docker-compose down

# Stop and remove volumes (complete reset)
docker-compose down -v
```

### Useful Docker Operations
```bash
# View running containers
docker ps

# View logs for specific service
docker-compose logs frontend
docker-compose logs backend
docker-compose logs database

# Access container shell
docker-compose exec backend bash
docker-compose exec frontend sh

# Restart specific service
docker-compose restart backend
```

## 🔐 Default Admin Account

The system automatically creates an admin account:
- **Email**: admin@ers.com
- **Password**: AdminPassword123
- **Role**: Admin

## 📊 Application URLs

### Public Pages
- **Home**: http://localhost:5173/
- **Services**: http://localhost:5173/services
- **About**: http://localhost:5173/about
- **Contact**: http://localhost:5173/contact

### Authentication
- **Login**: http://localhost:5173/login
- **Register**: http://localhost:5173/register

### Dashboards
- **Customer Dashboard**: http://localhost:5173/customer/dashboard
- **Technician Dashboard**: http://localhost:5173/technician/dashboard
- **Admin Dashboard**: http://localhost:5173/admin/dashboard

### API Documentation
- **Swagger UI**: http://localhost:5062/swagger

## 🗄️ Database

The SQL Server database is automatically configured with:
- **Initial schema** from Entity Framework migrations
- **Seed data** including admin user
- **Persistent volume** for data retention

### Database Connection
- **Server**: localhost,1433
- **Database**: ElectronicsRepairShop
- **Username**: sa
- **Password**: YourStrong@Passw0rd

## 🔧 Environment Configuration

The application uses environment variables for configuration. Key settings are managed through Docker Compose:

### Backend Environment Variables
```yaml
ConnectionStrings__DefaultConnection: "Server=database;Database=ElectronicsRepairShop;User Id=sa;Password=YourStrong@Passw0rd;TrustServerCertificate=true;"
Jwt__Key: "your-super-secret-jwt-key-that-is-at-least-32-characters-long"
Jwt__Issuer: "ElectronicsRepairShop"
Jwt__Audience: "ElectronicsRepairShop"
```

## 🚀 Production Deployment

### Docker Compose for Production
```bash
# Use production docker-compose file
docker-compose -f docker-compose.prod.yml up -d

# Scale services if needed
docker-compose up --scale backend=2 -d
```

### Health Checks
All services include health checks:
- **Frontend**: Checks if Vite dev server is responsive
- **Backend**: Checks API health endpoint
- **Database**: Checks SQL Server connectivity

## 🛠️ Development Workflow

### Making Code Changes
1. **Make changes** to your code
2. **Rebuild specific service**:
   ```bash
   docker-compose up --build frontend  # For frontend changes
   docker-compose up --build backend   # For backend changes
   ```

### Database Migrations
```bash
# Access backend container
docker-compose exec backend bash

# Run migrations
dotnet ef database update
```

### Debugging
```bash
# View detailed logs
docker-compose logs -f backend

# Access database directly
docker-compose exec database sqlcmd -S localhost -U sa -P YourStrong@Passw0rd
```

## 📋 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Password reset

### Repair Management
- `GET /api/repair/my-requests` - Get customer repair orders
- `POST /api/repair/submit` - Create new repair request
- `PUT /api/repair/update-status` - Update repair status

### Admin Operations
- `GET /api/admin/users` - Manage users
- `GET /api/admin/repairs/debug` - Get all repair requests
- `POST /api/admin/assign-role` - Assign user roles

## 🐛 Troubleshooting

### Common Issues

**Port Already in Use**
```bash
# Check what's using the port
netstat -tulpn | grep :5173
# or on Windows
netstat -ano | findstr :5173

# Kill the process or change ports in docker-compose.yml
```

**Database Connection Issues**
```bash
# Restart database service
docker-compose restart database

# Check database logs
docker-compose logs database
```

**Frontend Not Loading**
```bash
# Check if frontend service is running
docker-compose ps frontend

# View frontend logs
docker-compose logs frontend
```

### Reset Everything
```bash
# Complete reset (removes all data)
docker-compose down -v
docker system prune -a
docker-compose up --build
```

## 📞 Support

For support and questions:
- **GitHub Issues**: https://github.com/nayodya/Electronics-Repair-Shop/issues
- **Email**: nayodyaperera@gmail.com

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Test with Docker: `docker-compose up --build`
5. Commit changes: `git commit -m 'Add amazing feature'`
6. Push to branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🔮 Roadmap

- [ ] **Kubernetes deployment** configurations
- [ ] **CI/CD pipeline** with GitHub Actions
- [ ] **Redis caching** layer
- [ ] **Microservices architecture** migration
- [ ] **Real-time notifications** with SignalR
- [ ] **Mobile app** with React Native
- [ ] **Advanced monitoring** with Prometheus/Grafana

---

**Electronics Repair Shop Management System** - Professional repair service management, fully containerized and ready to deploy! 🚀

[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://www.docker.com/)
[![.NET Core](https://img.shields.io/badge/.NET%20Core-8.0-purple.svg)](https://dotnet.microsoft.com/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)