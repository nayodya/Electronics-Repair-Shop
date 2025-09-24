import { AuthProvider } from "./context/AuthContext";
import { Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";

// Public pages
import Home from "./components/BodyContent/DefaultDashboard/Home";
import About from "./components/BodyContent/DefaultDashboard/About";
import Services from "./components/BodyContent/DefaultDashboard/Services";
import Contact from "./components/BodyContent/DefaultDashboard/Contact";
import Register from "./components/BodyContent/Register & Login/Register";
import LogIn from "./components/BodyContent/Register & Login/LogIn";
import ForgotPassword from "./components/BodyContent/Register & Login/ForgotPassword";
import ResetPassword from "./components/BodyContent/Register & Login/ResetPassword";

// Dashboard pages
import CustomerDashboard from "./components/BodyContent/Dashboards/Customer/CustomerDashboard";
import AddRepairOrderPage from "./components/BodyContent/Dashboards/Customer/AddRepair";
import RepairHistory from "./components/BodyContent/Dashboards/Customer/RepairHistory";


import TechnicianDashboard from "./components/BodyContent/Dashboards/Technician/TechnicianDashboard";
import AdminDashboard from "./components/BodyContent/Dashboards/Admin/AdminDashboard";
import PublicLayout from "./components/layouts/PublicLayout";
import DashboardLayout from "./components/layouts/DashboardLayout";
import ManageRequests from "./components/BodyContent/Dashboards/Admin/ManageRequests";
import ManageTechnicians from "./components/BodyContent/Dashboards/Admin/ManageTechnicians";
import ManageUsers from "./components/BodyContent/Dashboards/Admin/ManageUsers";
import CustomerDetails from "./components/BodyContent/Dashboards/Customer/Proofile";
import RepairingStatus from "./components/BodyContent/Dashboards/Technician/RepairingStatus";
import ManagePayments from "./components/BodyContent/Dashboards/Admin/ManagePayments";
import RepairPayments from "./components/BodyContent/Dashboards/Customer/RepairPayments";

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes with Public Layout */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="services" element={<Services />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="register" element={<Register />} />
          <Route path="login" element={<LogIn />} />
          <Route path="forgotpassword" element={<ForgotPassword />} />
          <Route path="reset-password" element={<ResetPassword />} />
        </Route>

        {/* Protected Customer Routes with Dashboard Layout */}
        <Route path="/customer" element={
          <ProtectedRoute allowedRoles={["Customer"]}>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route path="dashboard" element={<CustomerDashboard />} />
          <Route path="add-repair" element={<AddRepairOrderPage />} />
          <Route path="repair-orders" element={<RepairHistory />} />
          <Route path="edit-profile" element={<CustomerDetails />} />
          <Route path="repair-payments" element={<RepairPayments />} />
        </Route>

        {/* Protected Technician Routes with Dashboard Layout */}
        <Route path="/technician" element={
          <ProtectedRoute allowedRoles={["Technician"]}>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route path="dashboard" element={<TechnicianDashboard />} />
          <Route path="repairs" element={<div><RepairingStatus/></div>} />
          <Route path="schedule" element={<div>Technician Schedule</div>} />
          <Route path="profile" element={<div>Technician Profile</div>} />
        </Route>

        {/* Protected Admin Routes with Dashboard Layout */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={["Admin"]}>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="dashboard/requests" element={<div>{<ManageRequests/>}</div>} />
          <Route path="dashboard/technicians" element={<div>{<ManageTechnicians/>}</div>} />
          <Route path="dashboard/users" element={<div>{<ManageUsers/>}</div>} />
          <Route path="dashboard/payments" element={<div>{<ManagePayments/>}</div>} />
        </Route>

        {/* Catch-all route for 404 */}
        <Route path="*" element={
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            textAlign: 'center',
            padding: '2rem'
          }}>
            <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>404</h1>
            <h2 style={{ marginBottom: '1rem' }}>Page Not Found</h2>
            <p style={{ marginBottom: '2rem', color: '#666' }}>
              The page you're looking for doesn't exist.
            </p>
            <a href="/" style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#3b82f6',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '8px',
              fontWeight: '600'
            }}>
              Go Home
            </a>
          </div>
        } />
      </Routes>
    </AuthProvider>
  );
}

export default App;