import { useState, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import "./DashboardNavBar.css"

const DashboardNavBar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useContext(AuthContext);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const getDashboardLinks = () => {
    switch (user?.role) {
      case "Admin":
        return (
          <>
            <Link to="/admin/dashboard" className="nav-link">Dashboard</Link>
            <Link to="/admin/users" className="nav-link">Users</Link>
            <Link to="/admin/reports" className="nav-link">Reports</Link>
            <Link to="/admin/settings" className="nav-link">Settings</Link>
          </>
        );
      case "Technician":
        return (
          <>
            <Link to="/technician/dashboard" className="nav-link">Dashboard</Link>
            <Link to="/technician/jobs" className="nav-link">Jobs</Link>
            <Link to="/technician/schedule" className="nav-link">Schedule</Link>
            <Link to="/technician/profile" className="nav-link">Profile</Link>
          </>
        );
      case "Customer":
        return (
          <>
            <Link to="/customer/dashboard" className="nav-link">Dashboard</Link>
            <Link to="/customer/add-repair" className="nav-link">New Order</Link>
            <Link to="/customer/repair-orders" className="nav-link">My Orders</Link>
            <Link to="/customer/edit-profile" className="nav-link">Profile</Link>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="dashboard-navbar">
      <div className="logo-section">
        <img src="" alt="Logo" />
        <Link to="/" className="brand-name">TechFix Pro</Link>
      </div>

      <div className="nav-center">
        {getDashboardLinks()}
      </div>

      <div className="nav-actions">
        <span className="user-info">Welcome, {user?.email}</span>
        <button onClick={logout} className="logout-btn">Logout</button>
      </div>

      <button 
        className={`mobile-menu-toggle ${isMobileMenuOpen ? 'active' : ''}`}
        onClick={toggleMobileMenu}
        aria-label="Toggle mobile menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <div className={`mobile-menu ${isMobileMenuOpen ? 'active' : ''}`}>
        {getDashboardLinks()}
        <div className="mobile-actions">
          <span className="mobile-user-info">Welcome, {user?.email}</span>
          <button onClick={logout} className="mobile-logout-btn">Logout</button>
        </div>
      </div>
    </div>
  );
};

export default DashboardNavBar;