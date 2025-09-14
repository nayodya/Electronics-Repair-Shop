import { useContext } from "react";
import { AuthContext } from "../../../../context/AuthContext";
import { Link } from "react-router-dom";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="admin-dashboard-container">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <span role="img" aria-label="Admin">
            👑
          </span>
          <span>Admin Panel</span>
        </div>
        <nav className="admin-nav">
          <Link to="requests" className="admin-nav-link">
             Manage Repair Requests
          </Link>
          <Link to="users" className="admin-nav-link">
             Manage Users
          </Link>
          <Link to="technicians" className="admin-nav-link">
             Manage Technicians
          </Link>
        </nav>
      </aside>
      <main className="admin-main">
        <header className="admin-header">
          <h1>Welcome, {user?.email || "Admin"}</h1>
          <p>Manage all aspects of your repair shop from this dashboard.</p>
        </header>
        {/* Here you can render nested routes or dashboard widgets */}
      </main>
    </div>
  );
};

export default AdminDashboard;
