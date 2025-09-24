import React, { useState, useEffect } from 'react';
import api from '../../../../services/api';
import './AdminDashboard.css';

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
  pendingPayments: number;
  completedPayments: number;
  averageCompletionTime: number;
  monthlyRepairs: Array<{
    month: string;
    count: number;
    revenue: number;
  }>;
  recentRepairs: Array<{
    requestId: number;
    referenceNumber: string;
    customerName: string;
    device: string;
    status: string;
    submittedAt: string;
  }>;
}

interface QuickAction {
  title: string;
  description: string;
  icon: string;
  action: () => void;
  color: string;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Initialize default data
      let users: any[] = [];
      let repairs: any[] = [];
      let payments: any[] = [];

      // Fetch users
      try {
        const usersResponse = await api.get('/admin/users');
        users = Array.isArray(usersResponse.data) ? usersResponse.data : [];
        console.log('Users fetched:', users.length);
      } catch (err) {
        console.warn('Failed to fetch users:', err);
      }

      // Fetch repairs using debug endpoint
      try {
        const repairsResponse = await api.get('/admin/repairs/debug');
        const repairsData = repairsResponse.data;
        
        if (repairsData && repairsData.data) {
          repairs = Array.isArray(repairsData.data) ? repairsData.data : [];
        } else if (Array.isArray(repairsData)) {
          repairs = repairsData;
        }
        
        console.log('Debug repairs fetched:', repairs.length);
        if (repairs.length > 0) {
          console.log('Sample repair:', repairs[0]);
        }
      } catch (err) {
        console.warn('Failed to fetch repairs from debug endpoint:', err);
      }

      // Try to fetch payments (may not exist yet)
      try {
        const paymentsResponse = await api.get('/admin/payments');
        payments = Array.isArray(paymentsResponse.data) ? paymentsResponse.data : [];
        console.log('Payments fetched:', payments.length);
      } catch (err) {
        console.warn('Payments endpoint not available:', err);
        payments = [];
      }

      // Process the data with safer status checking
      const dashboardStats: DashboardStats = {
        totalUsers: users.length,
        totalCustomers: users.filter(u => 
          u.role && typeof u.role === 'string' && u.role.toLowerCase() === 'customer'
        ).length,
        totalTechnicians: users.filter(u => 
          u.role && typeof u.role === 'string' && u.role.toLowerCase() === 'technician'
        ).length,
        totalRepairs: repairs.length,
        pendingRepairs: repairs.filter(r => 
          r.statusNumber === 0 || 
          (r.status && typeof r.status === 'string' && r.status.toLowerCase() === 'received')
        ).length,
        inProgressRepairs: repairs.filter(r => 
          r.statusNumber === 1 || 
          (r.status && typeof r.status === 'string' && r.status.toLowerCase() === 'inprogress')
        ).length,
        completedRepairs: repairs.filter(r => 
          r.statusNumber === 2 || 
          (r.status && typeof r.status === 'string' && r.status.toLowerCase() === 'completed')
        ).length,
        readyForDeliveryRepairs: repairs.filter(r => 
          r.statusNumber === 4 || 
          (r.status && typeof r.status === 'string' && r.status.toLowerCase() === 'readyfordelivery')
        ).length,
        totalRevenue: calculateTotalRevenue(repairs, payments),
        pendingPayments: payments.filter(p => !p.isPaid).length,
        completedPayments: payments.filter(p => p.isPaid).length,
        averageCompletionTime: calculateAverageCompletionTime(repairs),
        monthlyRepairs: processMonthlyData(repairs),
        recentRepairs: processRecentRepairs(repairs)
      };

      console.log('Dashboard stats processed:', dashboardStats);
      setStats(dashboardStats);
      setError(null);
    } catch (err: any) {
      console.error('Dashboard fetch error:', err);
      setError('Unable to load dashboard data. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalRevenue = (repairs: any[], payments: any[]): number => {
    // Calculate from repairs that have payment amounts
    let revenue = 0;
    
    repairs.forEach(repair => {
      if (repair.hasPayment && repair.paymentAmount > 0) {
        revenue += repair.paymentAmount;
      }
    });

    // Add from separate payments if available
    payments.forEach(payment => {
      if (payment.isPaid && payment.totalAmount > 0) {
        revenue += payment.totalAmount;
      }
    });

    return revenue;
  };

  const processRecentRepairs = (repairs: any[]): DashboardStats['recentRepairs'] => {
    return repairs
      .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
      .slice(0, 5)
      .map(r => ({
        requestId: r.requestId || 0,
        referenceNumber: r.referenceNumber || `REP-${r.requestId}`,
        customerName: r.customerEmail || 'Unknown Customer',
        device: getDeviceName(r),
        status: getStatusText(r.statusNumber, r.status),
        submittedAt: r.submittedAt || new Date().toISOString()
      }));
  };

  const getDeviceName = (repair: any): string => {
    if (repair.device) return repair.device;
    if (repair.brand && repair.model) {
      return `${repair.brand} ${repair.model}`.trim();
    }
    return 'Unknown Device';
  };

  const getStatusText = (statusNumber?: number, statusString?: any): string => {
    // Prioritize statusNumber as it's more reliable
    if (typeof statusNumber === 'number') {
      switch (statusNumber) {
        case 0: return 'Received';
        case 1: return 'In Progress';
        case 2: return 'Completed';
        case 3: return 'Cancelled';
        case 4: return 'Ready for Delivery';
        default: return 'Unknown';
      }
    }
    
    // Fallback to status string if it exists and is a string
    if (statusString && typeof statusString === 'string') {
      return statusString.replace(/([A-Z])/g, ' $1').trim();
    }
    
    return 'Unknown';
  };

  const calculateAverageCompletionTime = (repairs: any[]): number => {
    const completedRepairs = repairs.filter(r => 
      r.statusNumber === 2 || r.statusNumber === 4
    );
    
    if (completedRepairs.length === 0) return 0;

    const totalDays = completedRepairs.reduce((sum, repair) => {
      try {
        const submitted = new Date(repair.submittedAt);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - submitted.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return sum + diffDays;
      } catch {
        return sum; // Skip invalid dates
      }
    }, 0);

    return Math.round(totalDays / completedRepairs.length);
  };

  const processMonthlyData = (repairs: any[]): DashboardStats['monthlyRepairs'] => {
    const monthlyData: { [key: string]: { count: number; revenue: number } } = {};
    
    repairs.forEach(repair => {
      try {
        const date = new Date(repair.submittedAt);
        const monthKey = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
        
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { count: 0, revenue: 0 };
        }
        
        monthlyData[monthKey].count++;
        
        if (repair.hasPayment && repair.paymentAmount > 0) {
          monthlyData[monthKey].revenue += repair.paymentAmount;
        }
      } catch (err) {
        console.warn('Error processing repair date:', err);
      }
    });

    return Object.entries(monthlyData)
      .map(([month, data]) => ({
        month,
        count: data.count,
        revenue: data.revenue
      }))
      .sort((a, b) => {
        try {
          return new Date(a.month + ' 1').getTime() - new Date(b.month + ' 1').getTime();
        } catch {
          return 0;
        }
      })
      .slice(-6);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  const quickActions: QuickAction[] = [
    {
      title: 'Manage Repairs',
      description: 'View and manage repair requests',
      icon: '🔧',
      action: () => console.log('Navigate to repairs'),
      color: '#007bff'
    },
    {
      title: 'Manage Users',
      description: 'Add, edit, or remove users',
      icon: '👥',
      action: () => console.log('Navigate to users'),
      color: '#28a745'
    },
    {
      title: 'View Payments',
      description: 'Manage payment records',
      icon: '💳',
      action: () => console.log('Navigate to payments'),
      color: '#ffc107'
    },
    {
      title: 'System Reports',
      description: 'Generate system reports',
      icon: '📊',
      action: () => handleRefresh(),
      color: '#17a2b8'
    }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Invalid Date';
    }
  };

  const getStatusColor = (status: string) => {
    if (!status || typeof status !== 'string') return '#6c757d';
    
    const statusLower = status.toLowerCase();
    if (statusLower.includes('received')) return '#6c757d';
    if (statusLower.includes('progress')) return '#ffc107';
    if (statusLower.includes('completed')) return '#28a745';
    if (statusLower.includes('ready')) return '#007bff';
    if (statusLower.includes('cancelled')) return '#dc3545';
    return '#6c757d';
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-dashboard">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h2>Dashboard Error</h2>
          <p>{error}</p>
          <button className="retry-button" onClick={handleRefresh}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="admin-dashboard">
        <div className="no-data">
          <h2>No data available</h2>
          <button className="retry-button" onClick={handleRefresh}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Admin Dashboard</h1>
          <p>Electronics Repair Shop Management System</p>
        </div>
        <button 
          className={`refresh-btn ${refreshing ? 'refreshing' : ''}`}
          onClick={handleRefresh}
          disabled={refreshing}
        >
          🔄 {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Key Metrics */}
      <div className="metrics-grid">
        <div className="metric-card primary">
          <div className="metric-icon">📊</div>
          <div className="metric-content">
            <h3>Total Repairs</h3>
            <p className="metric-number">{stats.totalRepairs}</p>
            <small>All repair requests</small>
          </div>
        </div>
        
        <div className="metric-card success">
          <div className="metric-icon">✅</div>
          <div className="metric-content">
            <h3>Completed</h3>
            <p className="metric-number">{stats.completedRepairs}</p>
            <small>Successfully finished</small>
          </div>
        </div>
        
        <div className="metric-card warning">
          <div className="metric-icon">⏳</div>
          <div className="metric-content">
            <h3>In Progress</h3>
            <p className="metric-number">{stats.inProgressRepairs}</p>
            <small>Currently being worked on</small>
          </div>
        </div>
        
        <div className="metric-card info">
          <div className="metric-icon">💰</div>
          <div className="metric-content">
            <h3>Total Revenue</h3>
            <p className="metric-number">{formatCurrency(stats.totalRevenue)}</p>
            <small>Total earnings</small>
          </div>
        </div>
      </div>

      {/* Secondary Metrics */}
      <div className="secondary-metrics">
        <div className="metric-row">
          <div className="metric-item">
            <span className="metric-label">Total Users</span>
            <span className="metric-value">{stats.totalUsers}</span>
          </div>
          <div className="metric-item">
            <span className="metric-label">Customers</span>
            <span className="metric-value">{stats.totalCustomers}</span>
          </div>
          <div className="metric-item">
            <span className="metric-label">Technicians</span>
            <span className="metric-value">{stats.totalTechnicians}</span>
          </div>
          <div className="metric-item">
            <span className="metric-label">Pending Repairs</span>
            <span className="metric-value">{stats.pendingRepairs}</span>
          </div>
          <div className="metric-item">
            <span className="metric-label">Avg. Completion</span>
            <span className="metric-value">{stats.averageCompletionTime} days</span>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        {/* Quick Actions */}
        <div className="dashboard-section">
          <h2>Quick Actions</h2>
          <div className="quick-actions">
            {quickActions.map((action, index) => (
              <div 
                key={index} 
                className="action-card"
                onClick={action.action}
                style={{ borderLeftColor: action.color }}
              >
                <div className="action-icon">{action.icon}</div>
                <div className="action-content">
                  <h3>{action.title}</h3>
                  <p>{action.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Repairs */}
        <div className="dashboard-section">
          <h2>Recent Repairs</h2>
          <div className="recent-repairs">
            {stats.recentRepairs.length > 0 ? (
              <div className="repairs-table">
                <table>
                  <thead>
                    <tr>
                      <th>Reference</th>
                      <th>Customer</th>
                      <th>Device</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentRepairs.map((repair) => (
                      <tr key={repair.requestId}>
                        <td className="reference">{repair.referenceNumber}</td>
                        <td>{repair.customerName}</td>
                        <td>{repair.device}</td>
                        <td>
                          <span 
                            className="status-badge"
                            style={{ backgroundColor: getStatusColor(repair.status) }}
                          >
                            {repair.status}
                          </span>
                        </td>
                        <td>{formatDate(repair.submittedAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="no-data">
                <p>No recent repairs found</p>
                <small>New repair requests will appear here</small>
              </div>
            )}
          </div>
        </div>

        {/* Monthly Overview */}
        <div className="dashboard-section">
          <h2>Monthly Overview</h2>
          <div className="monthly-overview">
            {stats.monthlyRepairs.length > 0 ? (
              stats.monthlyRepairs.map((month, index) => (
                <div key={index} className="month-card">
                  <h4>{month.month}</h4>
                  <div className="month-stats">
                    <div className="month-stat">
                      <span className="stat-label">Repairs</span>
                      <span className="stat-value">{month.count}</span>
                    </div>
                    <div className="month-stat">
                      <span className="stat-label">Revenue</span>
                      <span className="stat-value">{formatCurrency(month.revenue)}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-data">
                <p>No monthly data available</p>
                <small>Data will appear as repairs are processed</small>
              </div>
            )}
          </div>
        </div>

        {/* Status Distribution */}
        <div className="dashboard-section">
          <h2>Repair Status Distribution</h2>
          <div className="status-distribution">
            {stats.totalRepairs > 0 ? (
              <>
                <div className="status-item">
                  <div className="status-bar">
                    <div 
                      className="status-fill pending"
                      style={{ 
                        width: `${(stats.pendingRepairs / stats.totalRepairs) * 100}%` 
                      }}
                    ></div>
                  </div>
                  <div className="status-info">
                    <span>Pending ({stats.pendingRepairs})</span>
                    <span>{Math.round((stats.pendingRepairs / stats.totalRepairs) * 100)}%</span>
                  </div>
                </div>
                
                <div className="status-item">
                  <div className="status-bar">
                    <div 
                      className="status-fill progress"
                      style={{ 
                        width: `${(stats.inProgressRepairs / stats.totalRepairs) * 100}%` 
                      }}
                    ></div>
                  </div>
                  <div className="status-info">
                    <span>In Progress ({stats.inProgressRepairs})</span>
                    <span>{Math.round((stats.inProgressRepairs / stats.totalRepairs) * 100)}%</span>
                  </div>
                </div>
                
                <div className="status-item">
                  <div className="status-bar">
                    <div 
                      className="status-fill completed"
                      style={{ 
                        width: `${(stats.completedRepairs / stats.totalRepairs) * 100}%` 
                      }}
                    ></div>
                  </div>
                  <div className="status-info">
                    <span>Completed ({stats.completedRepairs})</span>
                    <span>{Math.round((stats.completedRepairs / stats.totalRepairs) * 100)}%</span>
                  </div>
                </div>
                
                <div className="status-item">
                  <div className="status-bar">
                    <div 
                      className="status-fill ready"
                      style={{ 
                        width: `${(stats.readyForDeliveryRepairs / stats.totalRepairs) * 100}%` 
                      }}
                    ></div>
                  </div>
                  <div className="status-info">
                    <span>Ready ({stats.readyForDeliveryRepairs})</span>
                    <span>{Math.round((stats.readyForDeliveryRepairs / stats.totalRepairs) * 100)}%</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="no-data">
                <p>No repair data for distribution</p>
                <small>Charts will appear once repairs are created</small>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;