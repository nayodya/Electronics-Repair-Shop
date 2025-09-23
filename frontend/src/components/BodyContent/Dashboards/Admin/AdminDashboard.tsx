import { useState, useEffect } from "react";
import api from "../../../../services/api";

interface DashboardStats {
  totalUsers: number;
  totalCustomers: number;
  totalTechnicians: number;
  totalRepairs: number;
  pendingRepairs: number;
  inProgressRepairs: number;
  completedRepairs: number;
  readyForDeliveryRepairs: number;
  totalRevenue: number;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await api.get("/Admin/dashboard/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(response.data);
    } catch (err: any) {
      setError("Failed to load dashboard statistics");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="admin-loading">Loading dashboard...</div>;
  if (error) return <div className="admin-error">{error}</div>;
  if (!stats) return <div className="admin-error">No data available</div>;

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p>Welcome to the Electronics Repair Shop Management System</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card users">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>Total Users</h3>
            <span className="stat-number">{stats.totalUsers}</span>
          </div>
        </div>

        <div className="stat-card customers">
          <div className="stat-icon">👤</div>
          <div className="stat-content">
            <h3>Customers</h3>
            <span className="stat-number">{stats.totalCustomers}</span>
          </div>
        </div>

        <div className="stat-card technicians">
          <div className="stat-icon">🔧</div>
          <div className="stat-content">
            <h3>Technicians</h3>
            <span className="stat-number">{stats.totalTechnicians}</span>
          </div>
        </div>

        <div className="stat-card repairs">
          <div className="stat-icon">📱</div>
          <div className="stat-content">
            <h3>Total Repairs</h3>
            <span className="stat-number">{stats.totalRepairs}</span>
          </div>
        </div>

        <div className="stat-card pending">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <h3>Pending</h3>
            <span className="stat-number">{stats.pendingRepairs}</span>
          </div>
        </div>

        <div className="stat-card in-progress">
          <div className="stat-icon">⚙️</div>
          <div className="stat-content">
            <h3>In Progress</h3>
            <span className="stat-number">{stats.inProgressRepairs}</span>
          </div>
        </div>

        <div className="stat-card completed">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>Completed</h3>
            <span className="stat-number">{stats.completedRepairs}</span>
          </div>
        </div>

        <div className="stat-card revenue">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>Total Revenue</h3>
            <span className="stat-number">${stats.totalRevenue.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
