# Electronics Repair Shop (ERS)

A full-stack web application for managing electronics repair services. The system provides comprehensive tools for customers to submit repair requests, technicians to manage repairs, and administrators to oversee the entire operation.

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [CI/CD Pipeline](#cicd-pipeline)
- [Docker Deployment](#docker-deployment)
- [Kubernetes Deployment](#kubernetes-deployment)
- [Contributing](#contributing)

---

## 📖 Project Overview

The Electronics Repair Shop is a role-based web application that streamlines the repair service workflow:

- **Customers** can submit repair requests, track repair status, and manage payments
- **Technicians** can view assigned repairs and update their status
- **Administrators** can manage users, repair requests, payments, and system operations

The application uses JWT authentication, SendGrid email integration, and follows RESTful API design principles.

---

## ✨ Features

### Customer Features
- **User Registration & Authentication**: Secure email verification and JWT-based authentication
- **Submit Repair Requests**: Create repair requests with device details and issue descriptions
- **Track Repairs**: View real-time repair status (Received, In Progress, Completed, Ready for Delivery, Delivered)
- **Payment Management**: View repair estimates and make advance payments
- **Repair History**: Access complete history of past repairs
- **Profile Management**: Update account details and contact information
- **Password Reset**: Secure password reset via email

### Technician Features
- **Dashboard**: View all assigned repair requests
- **Update Repair Status**: Mark repairs as in progress, completed, or ready for delivery
- **View Repair Details**: Access device information and customer notes

### Administrator Features
- **User Management**: Create, update, and manage user roles (Customer, Technician, Admin)
- **Request Management**: View all repair requests and assign technicians
- **Estimate Management**: Set and update estimated completion days
- **Payment Tracking**: Monitor advance payments and payment status
- **Dashboard Analytics**: View statistics on repairs, payments, and system metrics
- **Role Assignment**: Assign and modify user roles in the system

---

## 🛠 Tech Stack

### Backend
- **Framework**: .NET 8 with ASP.NET Core
- **Database**: SQL Server 2022
- **ORM**: Entity Framework Core 9.0
- **Authentication**: JWT Bearer Token
- **Email Service**: SendGrid
- **Password Hashing**: BCrypt
- **API Documentation**: Swagger/OpenAPI

### Frontend
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Routing**: React Router v7
- **Icons**: React Icons
- **State Management**: React Context API
- **JWT Decoding**: jwt-decode

### DevOps & Infrastructure
- **Containerization**: Docker & Docker Compose
- **CI/CD**: Jenkins
- **Orchestration**: Kubernetes
- **Configuration Management**: Kustomize
- **Database Migration**: Entity Framework Migrations

---

## 📁 Project Structure

```
Electronics Repair Shop/
├── backend/                          # .NET Backend Application
│   ├── Controllers/                  # API Endpoints
│   │   ├── AdminController.cs        # Admin operations
│   │   ├── AuthController.cs         # Authentication & Authorization
│   │   ├── RepairController.cs       # Repair request management
│   │   └── TechnicianController.cs   # Technician operations
│   ├── Models/                       # Database models
│   │   ├── User.cs                   # User entity with roles
│   │   ├── RepairRequest.cs          # Repair request entity
│   │   └── Payment.cs                # Payment entity
│   ├── Services/                     # Business logic
│   │   ├── IAuthService.cs           # Auth service interface
│   │   ├── AuthService.cs            # Auth implementation
│   │   ├── IRepairService.cs         # Repair service interface
│   │   ├── RepairService.cs          # Repair service implementation
│   │   ├── IAdminService.cs          # Admin service interface
│   │   ├── AdminService.cs           # Admin service implementation
│   │   ├── TechnicianService.cs      # Technician service
│   │   ├── IEmailService.cs          # Email service interface
│   │   └── SendGridEmailService.cs   # SendGrid implementation
│   ├── Data/                         # Database context
│   │   └── ApplicationDbContext.cs   # EF Core DbContext
│   ├── Dto/                          # Data Transfer Objects
│   │   ├── LoginDto.cs
│   │   ├── CreateAccountDto.cs
│   │   ├── CreateRepairRequestDto.cs
│   │   ├── UpdateRepairStatusDto.cs
│   │   ├── PaymentDto.cs
│   │   ├── AdminDashboardStatsDto.cs
│   │   └── ... (more DTOs)
│   ├── Migrations/                   # Database migrations
│   ├── Properties/
│   │   └── launchSettings.json       # Launch configuration
│   ├── Program.cs                    # Application entry point
│   ├── backend.csproj                # Project file
│   ├── Dockerfile                    # Production Docker config
│   ├── Dockerfile.dev                # Development Docker config
│   ├── appsettings.json              # App configuration
│   └── appsettings.Development.json  # Dev configuration
│
├── frontend/                         # React Frontend Application
│   ├── src/
│   │   ├── components/
│   │   │   ├── BodyContent/
│   │   │   │   ├── DefaultDashboard/  # Public pages (Home, About, Services)
│   │   │   │   ├── Dashboards/
│   │   │   │   │   ├── Customer/      # Customer dashboard & features
│   │   │   │   │   ├── Technician/    # Technician dashboard
│   │   │   │   │   └── Admin/         # Admin dashboard & management
│   │   │   │   └── Register & Login/  # Auth pages
│   │   │   ├── layouts/               # Layout components
│   │   │   ├── NavBar/                # Navigation components
│   │   │   ├── Footer/                # Footer components
│   │   │   └── ProtectedRoute.tsx     # Route protection HOC
│   │   ├── context/
│   │   │   └── AuthContext.tsx        # Authentication context
│   │   ├── services/
│   │   │   └── api.ts                 # API client configuration
│   │   ├── App.tsx                    # Root component
│   │   ├── main.tsx                   # Application entry point
│   │   └── index.css                  # Global styles
│   ├── package.json                  # NPM dependencies
│   ├── vite.config.ts                # Vite configuration
│   ├── tsconfig.json                 # TypeScript configuration
│   ├── eslint.config.js              # ESLint configuration
│   ├── Dockerfile                    # Production Docker config
│   └── Dockerfile.dev                # Development Docker config
│
├── database/                         # Database documentation
│   ├── ERS.txt                       # Database schema
│   └── ERSnew.txt                    # Updated schema
│
├── kubernetes/                       # Kubernetes manifests
│   ├── kustomization.yaml            # Kustomize config
│   ├── backend/                      # Backend k8s resources
│   │   ├── deployment.yaml
│   │   ├── service.yaml
│   │   ├── configmap.yaml
│   │   ├── secret.yaml
│   │   └── namespace.yaml
│   ├── frontend/                     # Frontend k8s resources
│   │   ├── deployment.yaml
│   │   ├── service.yaml
│   │   ├── configmap.yaml
│   │   └── namespace.yaml
│   └── database/                     # Database k8s resources
│       ├── deployment.yaml
│       ├── service.yaml
│       ├── pvc.yaml
│       ├── configmap.yaml
│       ├── secret.yaml
│       └── namespace.yaml
│
├── jenkins/                          # Jenkins configuration
│   ├── docker-compose-jenkins-simple.yml
│   ├── config/                       # Jenkins configuration files
│   └── scripts/
│       ├── setup-jenkins.sh
│       └── setup-jenkins.bat
│
├── init-sql/                         # Database initialization scripts
│
├── docker-compose.yml                # Development Docker Compose
├── Jenkinsfile                       # Jenkins pipeline (full)
├── Jenkinsfile.minimal               # Jenkins pipeline (minimal)
├── package.json                      # Root package.json
└── .env.example                      # Environment variables template

```

---

## 📦 Prerequisites

### System Requirements
- Windows 10/11 or Linux
- Docker Desktop (for containerized deployment)
- Git

### Required Software
- **.NET 8 SDK**: [Download](https://dotnet.microsoft.com/download/dotnet/8.0)
- **Node.js** (v16+): [Download](https://nodejs.org/)
- **SQL Server 2022** (or Docker image): [Download](https://www.microsoft.com/en-us/sql-server/sql-server-downloads)

### Optional
- **Docker** & **Docker Compose**: For containerized setup
- **Jenkins**: For CI/CD pipeline
- **Kubernetes**: For production orchestration

---

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/nayodya/Electronics-Repair-Shop.git
cd "Electronics Repair Shop"
```

### 2. Backend Setup

#### Option A: Local Development (without Docker)

```bash
cd backend

# Restore NuGet packages
dotnet restore

# Install Entity Framework tools (if not already installed)
dotnet tool install -g dotnet-ef

# Create database and run migrations
dotnet ef database update

# Run the backend
dotnet run
```

The API will be available at `http://localhost:5062`

#### Option B: Docker Development

```bash
# Navigate to project root
cd ..

# Build and run with Docker Compose
docker-compose up --build
```

### 3. Frontend Setup

#### Option A: Local Development (without Docker)

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The UI will be available at `http://localhost:5173`

#### Option B: Docker Development

Docker Compose handles this automatically (see Option B in Backend Setup)

---

## ⚙️ Configuration

### Backend Configuration

Edit `backend/appsettings.json`:

```json
{
    "ConnectionStrings": {
        "DefaultConnection": "Server=sqlserver,1433;Database=ElectronicsRepairShop;User Id=sa;Password=YourStrong@Password123;TrustServerCertificate=True;"
    },
    "JwtConfig": {
        "Key": "your-secret-key-at-least-32-characters-long",
        "Issuer": "https://localhost:5062",
        "Audience": "https://localhost:5062",
        "TokenValidityMins": 60
    },
    "SendGridSettings": {
        "ApiKey": "your-sendgrid-api-key",
        "FromEmail": "your-email@example.com",
        "FromName": "Electronics Repair Shop"
    }
}
```

### Frontend Configuration

Create a `.env` file in the `frontend/` directory:

```env
VITE_API_URL=http://localhost:5062
VITE_HOST=0.0.0.0
```

### Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Key variables:
- `SA_PASSWORD`: SQL Server SA password
- `DB_NAME`: Database name
- `SENDGRID_API_KEY`: SendGrid API key for emails
- `JWT_KEY`: Secret key for JWT tokens

---

## 🏃 Running the Application

### Development Mode (Docker Compose)

```bash
# Build and start all services
docker-compose up --build

# Services will be available at:
# - Backend API: http://localhost:5062
# - Frontend UI: http://localhost:5173
# - SQL Server: localhost:1433
```

### Development Mode (Local)

**Terminal 1 - Backend:**
```bash
cd backend
dotnet run
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### Production Build

```bash
# Build frontend
cd frontend
npm run build

# Build backend
cd backend
dotnet publish -c Release -o ./publish
```

---

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
    "email": "user@example.com",
    "password": "SecurePass123!",
    "role": "Customer"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
    "email": "user@example.com",
    "password": "SecurePass123!"
}
```

Response:
```json
{
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": { "userId": 1, "email": "user@example.com", "role": "Customer" }
}
```

### Repair Endpoints

#### Create Repair Request
```http
POST /api/repair/create
Authorization: Bearer {token}
Content-Type: application/json

{
    "device": "Laptop",
    "brand": "Dell",
    "model": "XPS 13",
    "issue": "Screen not turning on",
    "description": "Additional details..."
}
```

#### Get Repair Requests
```http
GET /api/repair/requests
Authorization: Bearer {token}
```

#### Update Repair Status
```http
PUT /api/repair/update-status/{requestId}
Authorization: Bearer {token}
Content-Type: application/json

{
    "status": "InProgress"
}
```

### Payment Endpoints

#### Create Payment
```http
POST /api/payment/create
Authorization: Bearer {token}
Content-Type: application/json

{
    "requestId": 1,
    "totalAmount": 5000,
    "advancedPayment": 2500
}
```

#### Get Payments
```http
GET /api/payment/list
Authorization: Bearer {token}
```

### Admin Endpoints

#### Get Dashboard Stats
```http
GET /api/admin/dashboard-stats
Authorization: Bearer {token}
Role: Admin
```

#### Manage Users
```http
GET /api/admin/users
PUT /api/admin/users/{userId}/role
DELETE /api/admin/users/{userId}
```

Full API documentation available at `http://localhost:5062/swagger` when running locally.

---

## 🗄️ Database Schema

### User Table
- `UserId` (INT, PK)
- `Email` (VARCHAR, UNIQUE)
- `PasswordHash` (VARCHAR)
- `Role` (VARCHAR) - Customer, Technician, Admin
- `FirstName`, `LastName`, `Address`, `ContactNumber`
- `VerificationToken`, `VerificationTokenExpiresAt`
- `EmailVerifiedAt`
- `PasswordResetToken`, `ResetTokenExpiresAt`

### RepairRequest Table
- `RequestId` (INT, PK)
- `ReferenceNumber` (VARCHAR, UNIQUE)
- `CustomerId` (INT, FK)
- `Device`, `Brand`, `Model`, `Issue`, `Description`
- `Status` (INT) - Received=0, InProgress=1, Completed=2, Cancelled=3, ReadyForDelivery=4, Delivered=5
- `SubmittedAt` (DATETIME)
- `EstimatedCompletionDays` (INT)
- `TechnicianId` (INT, FK)

### Payment Table
- `PaymentId` (INT, PK)
- `RequestId` (INT, FK)
- `TotalAmount` (DECIMAL)
- `AdvancedPayment` (DECIMAL)
- `PaymentDate` (DATETIME)
- `Status` (VARCHAR)

---

## 🔄 CI/CD Pipeline

### Jenkins Stages

The project includes automated CI/CD using Jenkins:

1. **Checkout**: Clone repository from Git
2. **Build Backend**: Compile .NET application
3. **Build Frontend**: Build React application
4. **Backend Tests**: Run unit tests
5. **Security Scan**: npm audit and dependency checks
6. **Generate Report**: Create build report

### Running Jenkins

#### Quick Start with Docker Compose

```bash
cd jenkins
docker-compose -f docker-compose-jenkins-simple.yml up
```

Jenkins will be available at `http://localhost:8080`

#### Manual Setup

On Windows:
```bash
cd jenkins/scripts
./setup-jenkins.bat
```

On Linux/Mac:
```bash
cd jenkins/scripts
bash setup-jenkins.sh
```

---

## 🐳 Docker Deployment

### Services in docker-compose.yml

1. **SQL Server** (`sqlserver`): Port 1433
2. **Backend API** (`api`): Port 5062
3. **Frontend** (`client`): Port 5173

### Environment Variables

```yaml
SA_PASSWORD: YourStrong@Password123
DB_NAME: ElectronicsRepairShop
VITE_API_URL: http://api:5062
```

### Build Custom Images

```bash
# Backend
docker build -f backend/Dockerfile -t ers-backend:1.0 ./backend

# Frontend
docker build -f frontend/Dockerfile -t ers-frontend:1.0 ./frontend
```

---

## ☸️ Kubernetes Deployment

### Kubernetes Structure

```
kubernetes/
├── backend/
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── configmap.yaml
│   ├── secret.yaml
│   └── namespace.yaml
├── frontend/
│   ├── deployment.yaml
│   ├── service.yaml
│   └── configmap.yaml
└── database/
    ├── deployment.yaml
    ├── service.yaml
    ├── pvc.yaml
    └── secret.yaml
```

### Deploy to Kubernetes

```bash
# Using kubectl
kubectl apply -k kubernetes/

# Or with Kustomize
kustomize build kubernetes/ | kubectl apply -f -

# Check deployment status
kubectl get all -n ers-namespace
```

### Access Services

```bash
# Port forward backend
kubectl port-forward -n ers-namespace svc/backend-service 5062:5062

# Port forward frontend
kubectl port-forward -n ers-namespace svc/frontend-service 5173:5173

# Port forward database
kubectl port-forward -n ers-namespace svc/database-service 1433:1433
```

---

## 🔐 Security Considerations

### Authentication & Authorization
- JWT tokens with configurable expiration (default: 60 minutes)
- Role-based access control (RBAC)
- Email verification for user registration
- Secure password hashing with BCrypt

### Data Protection
- SQL Server connections use TrustServerCertificate
- Sensitive data in environment variables
- HTTPS recommended for production

### API Security
- CORS configured for development
- Request validation on all endpoints
- SQL injection protection via EF Core parameterized queries

---

## 📝 User Roles & Permissions

### Customer
- Register and login
- Submit repair requests
- View own repairs and payments
- Update profile
- Password reset

### Technician
- View assigned repairs
- Update repair status
- View customer details
- Cannot access admin functions

### Administrator
- Full system access
- Manage users and roles
- View all repairs and payments
- Dashboard analytics
- Payment tracking

---

## 🐛 Troubleshooting

### Database Connection Issues
```
Error: Cannot connect to database
Solution: Verify SA_PASSWORD and connection string in appsettings.json
```

### Port Already in Use
```bash
# Find process using port
netstat -ano | findstr :5062
# Kill process
taskkill /PID <PID> /F
```

### Frontend API Connection Failed
```
Error: CORS or API unreachable
Solution: Check VITE_API_URL environment variable and ensure backend is running
```

### Docker Compose Issues
```bash
# Clean up and restart
docker-compose down -v
docker-compose up --build
```

---

## 📧 Email Configuration

The application uses SendGrid for email notifications:

1. Get a SendGrid API key from [SendGrid Console](https://app.sendgrid.com/)
2. Update `appsettings.json` with your API key and from email
3. Emails are sent for:
   - User registration verification
   - Password reset
   - Repair status updates (future implementation)

---

## 🤝 Contributing

### Pull Request Process
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/AmazingFeature`
3. Commit changes: `git commit -m 'Add AmazingFeature'`
4. Push to branch: `git push origin feature/AmazingFeature`
5. Open a Pull Request

### Code Style
- Backend: Follow Microsoft C# naming conventions
- Frontend: Use functional components and hooks
- Use meaningful commit messages

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 👥 Authors

- **Nayodya Perera** - Project Lead and Developer

---

## 🔗 Resources

- [.NET 8 Documentation](https://learn.microsoft.com/en-us/dotnet/)
- [React Documentation](https://react.dev/)
- [Entity Framework Core](https://learn.microsoft.com/en-us/ef/core/)
- [Docker Documentation](https://docs.docker.com/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [SendGrid API](https://sendgrid.com/docs/)

---

