# Electronics Repair Shop Management System

A full-stack web application for managing electronics repair services, built with React TypeScript frontend and ASP.NET Core backend.

## 🚀 Features

### Customer Features
- **User Registration & Authentication** - Secure account creation with email verification
- **Device Repair Requests** - Submit repair requests for various electronic devices
- **Order Tracking** - Track repair status and progress in real-time
- **Profile Management** - Update personal information and contact details
- **Payment Integration** - Secure payment processing for repair services
- **Repair History** - View complete history of all repair orders

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
- **SQL Server** database
- **JWT Authentication** for secure API access
- **SendGrid** for email services
- **Swagger** for API documentation

### Development Tools
- **Docker** containerization support
- **ESLint** for code linting
- **Git** version control

## 📁 Project Structure

```
Electronics Repair Shop/
├── frontend/                 # React TypeScript application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   │   ├── BodyContent/ # Main content components
│   │   │   ├── Footer/      # Footer component
│   │   │   ├── NavBar/      # Navigation components
│   │   │   └── layouts/     # Layout components
│   │   ├── context/         # React context for state management
│   │   ├── services/        # API service functions
│   │   └── App.tsx          # Main application component
│   ├── public/              # Static assets
│   └── package.json         # Frontend dependencies
├── backend/                 # ASP.NET Core Web API
│   ├── Controllers/         # API controllers
│   ├── Services/            # Business logic services
│   ├── Models/             # Data models
│   ├── Dto/                # Data transfer objects
│   ├── Data/               # Database context
│   ├── Migrations/         # Entity Framework migrations
│   └── Program.cs          # Application entry point
└── database/               # Database scripts and documentation
```

## 🚦 Getting Started

### Prerequisites
- Node.js 18+ and npm
- .NET 8.0 SDK
- SQL Server (LocalDB or full instance)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Electronics\ Repair\ Shop
   ```

2. **Backend Setup**
   ```bash
   cd backend
   
   # Restore NuGet packages
   dotnet restore
   
   # Update database connection string in appsettings.json
   # Run database migrations
   dotnet ef database update
   
   # Start the backend server
   dotnet run
   ```
   Backend will run on `http://localhost:5062`

3. **Frontend Setup**
   ```bash
   cd frontend
   
   # Install dependencies
   npm install
   
   # Start development server
   npm run dev
   ```
   Frontend will run on `http://localhost:5173`

### Environment Configuration

**Backend (appsettings.json)**
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=ElectronicsRepairShop;Trusted_Connection=true;"
  },
  "SendGridSettings": {
    "ApiKey": "your-sendgrid-api-key",
    "SenderEmail": "your-email@domain.com"
  },
  "Jwt": {
    "Key": "your-jwt-secret-key",
    "Issuer": "your-issuer",
    "Audience": "your-audience"
  }
}
```

## 🐳 Docker Deployment

The project includes Docker support for easy deployment:

```bash
# Build and run with Docker Compose
docker-compose up --build
```

## 📋 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Password reset request
- `GET /api/auth/verify-email` - Email verification

### Repair Management
- `GET /api/repair/customer-orders` - Get customer repair orders
- `POST /api/repair/create-request` - Create new repair request
- `PUT /api/repair/update-status` - Update repair status

### Admin Operations
- `GET /api/admin/dashboard-stats` - Get dashboard statistics
- `GET /api/admin/users` - Manage users
- `POST /api/admin/assign-role` - Assign user roles

## 🔐 Authentication & Authorization

The application uses JWT-based authentication with role-based authorization:

- **Customer**: Can create repair requests, view order history, manage profile
- **Technician**: Can update repair status, view assigned repairs
- **Admin**: Full system access including user management and analytics

## 🎨 User Interface

### Public Pages
- **Home** - Service overview and company information
- **Services** - Detailed service offerings
- **About** - Company background and statistics
- **Contact** - Contact information and location

### Dashboard Pages
- **Customer Dashboard** - Order overview and quick actions
- **Technician Dashboard** - Assigned repairs and work queue
- **Admin Dashboard** - System analytics and management tools

## 🚀 Deployment

### Production Build
```bash
# Frontend
cd frontend
npm run build

# Backend
cd backend
dotnet publish -c Release
```

### Database Migration
```bash
cd backend
dotnet ef database update --environment Production
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support and questions:
- Email: support@techfixpro.com
- Documentation: Check the `/docs` folder for detailed API documentation
- Issues: Report bugs and feature requests in the GitHub Issues section

## 🔮 Roadmap

- [ ] Mobile application (React Native)
- [ ] Real-time notifications (SignalR)
- [ ] Advanced reporting and analytics
- [ ] Integration with parts inventory system
- [ ] Customer feedback and rating system
- [ ] Multi-language support

---

**Electronics Repair Shop Management System** - Streamlining repair services with modern technology.