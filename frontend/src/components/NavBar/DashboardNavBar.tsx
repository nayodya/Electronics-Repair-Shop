import { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import "./DashboardNavBar.css"

const DashboardNavBar: React.FC = () => {
  const { user, logout } = useContext(AuthContext);

  const getDashboardLinks = () => {
    switch (user?.role) {
      case "Admin":
        return (
          <>
            <Link to="/admin/dashboard" className="nav-link">Dashboard</Link>
            <Link to="/admin/dashboard/requests" className="nav-link">Repairs</Link>
            <Link to="/admin/dashboard/users" className="nav-link">Users</Link>
            <Link to="/admin/dashboard/payments" className="nav-link">Payments</Link>
          </>
        );
      case "Technician":
        return (
          <>
            <Link to="/technician/dashboard" className="nav-link">Dashboard</Link>
            <Link to="/technician/repairs" className="nav-link">Repairs</Link>
          </>
        );
      case "Customer":
        return (
          <>
            <Link to="/customer/dashboard" className="nav-link">Dashboard</Link>
            <Link to="/customer/add-repair" className="nav-link">New Order</Link>
            <Link to="/customer/repair-orders" className="nav-link">My Orders</Link>
            <Link to="/customer/edit-profile" className="nav-link">Profile</Link>
            <Link to="/customer/repair-payments" className="nav-link">Payments</Link>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="dashboard-navbar">
      <div className="logo-section">
        <img src="/images/logo.png" alt="Logo" />
        <Link to="/" className="brand-name">TechFix Pro</Link>
      </div>

      <div className="nav-center">
        {getDashboardLinks()}
      </div>

      <div className="nav-actions">
        <span className="user-info">Welcome</span>
        <button onClick={logout} className="logout-btn">Logout</button>
      </div>
    </div>
  );
};

export default DashboardNavBar;
