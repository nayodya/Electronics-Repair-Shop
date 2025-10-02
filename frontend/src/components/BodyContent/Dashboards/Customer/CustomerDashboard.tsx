import { useContext, useEffect, useState } from "react";
import { GiAutoRepair } from "react-icons/gi";
import { TbReportSearch } from "react-icons/tb";
import { FaPersonCirclePlus } from "react-icons/fa6";
import { MdAttachMoney, MdNotificationsActive } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../../../context/AuthContext";
import api from "../../../../services/api";
import "./CustomerDashboard.css";
import { GrCompliance } from "react-icons/gr";
import { RiMoneyDollarCircleFill } from "react-icons/ri";

interface RepairOrder {
  repairRequestId: number;
  referenceNumber: string;
  device: {
    make: string;
    model: string;
    serialNumber: string;
    deviceType?: string;
  };
  status: string;
  issueDescription: string;
  createdAt: string;
  estimatedCost?: number;
  completedAt?: string;
}

interface CustomerStats {
  activeOrders: number;
  completedOrders: number;
  totalSaved: number;
}

interface RecentActivity {
  id: string;
  title: string;
  subtitle: string;
  time: string;
  icon: string;
  type: 'status_update' | 'completion' | 'new_request';
}

const CustomerDashboard = () => {
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [orders, setOrders] = useState<RepairOrder[]>([]);
  const [stats, setStats] = useState<CustomerStats>({
    activeOrders: 0,
    completedOrders: 0,
    totalSaved: 0
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const quickActions = [
    {
      title: "New Repair Request",
      description: "Submit a new device for repair",
      icon: <GiAutoRepair />,
      action: () => navigate("/customer/add-repair"),
      color: "primary"
    },
    {
      title: "My Orders",
      description: "View and track your repair orders",
      icon: <TbReportSearch />,
      action: () => navigate("/customer/repair-orders"),
      color: "secondary"
    },
    {
      title: "Profile Settings",
      description: "Update your account information",
      icon: <FaPersonCirclePlus />,
      action: () => navigate("/customer/edit-profile"),
      color: "tertiary"
    },
    {
      title: "Payments",
      description: "View and manage your payments",
      icon: <MdAttachMoney />,
      action: () => navigate("/customer/repair-payments"),
      color: "yellow"
    }
  ];

  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        setIsLoading(true);

        // Fetch repair orders
        const ordersResponse = await api.get("/Repair/my-requests", {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Map backend data to frontend shape
        const ordersData: RepairOrder[] = ordersResponse.data.map((item: any) => ({
          repairRequestId: item.requestId,
          referenceNumber: item.referenceNumber,
          device: {
            make: item.brand,
            model: item.model,
            serialNumber: "", // or item.serialNumber if available
            deviceType: "",   // or item.deviceType if available
          },
          status: mapStatus(item.status), // convert status number to string
          issueDescription: item.description || item.issue || "",
          createdAt: item.submittedAt,
          estimatedCost: item.estimatedCost,
          completedAt: item.completedAt,
        }));

        setOrders(ordersData);

        // Calculate stats
        const activeOrders = ordersData.filter(order => 
          order.status.toLowerCase() !== 'completed' && 
          order.status.toLowerCase() !== 'cancelled'
        ).length;

        const completedOrders = ordersData.filter(order => 
          order.status.toLowerCase() === 'completed'
        ).length;

        // Calculate total saved (sum of completed repair costs)
        const totalSaved = ordersData
          .filter(order => order.status.toLowerCase() === 'completed' && order.estimatedCost)
          .reduce((sum, order) => sum + (order.estimatedCost || 0), 0);

        setStats({
          activeOrders,
          completedOrders,
          totalSaved
        });

        // Generate recent activity from orders
        const activities = generateRecentActivity(ordersData);
        setRecentActivity(activities);

      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to fetch customer data.");
        console.error("Error fetching customer data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      fetchCustomerData();
    }
  }, [token]);

  const generateRecentActivity = (orders: RepairOrder[]): RecentActivity[] => {
    const activities: RecentActivity[] = [];

    // Sort orders by creation date (most recent first)
    const sortedOrders = [...orders].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    sortedOrders.slice(0, 5).forEach((order) => {
      const timeAgo = getTimeAgo(order.createdAt);
      
      if (order.status.toLowerCase() === 'completed' && order.completedAt) {
        activities.push({
          id: `completed-${order.repairRequestId}`,
          title: `${order.device.make} ${order.device.model} Repair`,
          subtitle: "Repair completed successfully",
          time: getTimeAgo(order.completedAt),
          icon: "✅",
          type: 'completion'
        });
      } else if (order.status.toLowerCase() === 'in progress') {
        activities.push({
          id: `progress-${order.repairRequestId}`,
          title: `${order.device.make} ${order.device.model} Repair`,
          subtitle: 'Status updated to "In Progress"',
          time: timeAgo,
          icon: "🔧",
          type: 'status_update'
        });
      } else if (order.status.toLowerCase() === 'received') {
        activities.push({
          id: `received-${order.repairRequestId}`,
          title: `${order.device.make} ${order.device.model} Repair`,
          subtitle: 'Device received and being evaluated',
          time: timeAgo,
          icon: "📥",
          type: 'status_update'
        });
      } else {
        activities.push({
          id: `new-${order.repairRequestId}`,
          title: "New repair request submitted",
          subtitle: `${order.device.make} ${order.device.model} - ${order.issueDescription.substring(0, 50)}${order.issueDescription.length > 50 ? '...' : ''}`,
          time: timeAgo,
          icon: "📝",
          type: 'new_request'
        });
      }
    });

    return activities.slice(0, 3); // Show only 3 most recent activities
  };

  const getTimeAgo = (dateString: string): string => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      return diffInMinutes < 1 ? 'Just now' : `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: diffInDays > 365 ? 'numeric' : undefined
      });
    }
  };

  const getDisplayName = (): string => {
    if (user?.email) return user.email.split('@')[0];
    return "Customer";
  };

  const mapStatus = (status: number): string => {
    switch (status) {
      case 0: return "Received";
      case 1: return "In Progress";
      case 2: return "Completed";
      case 3: return "Cancelled";
      default: return "Unknown";
    }
  };

  if (isLoading) {
    return (
      <div className="customer-dashboard">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="customer-dashboard">
        <div className="error-container">
          <div className="error-icon">❌</div>
          <h2>Unable to load dashboard</h2>
          <p>{error}</p>
          <button 
            className="retry-button"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const statsData = [
    { 
      label: "Active Orders", 
      value: stats.activeOrders.toString(), 
      icon: <MdNotificationsActive />,
      color: "blue" 
    },
    { 
      label: "Completed", 
      value: stats.completedOrders.toString(), 
      icon: <GrCompliance />,
      color: "green" 
    },
    { 
      label: "Total Saved", 
      value: `$${stats.totalSaved.toFixed(2)}`, 
      icon: <RiMoneyDollarCircleFill />,
      color: "yellow" 
    }
  ];

  return (
    <div className="customer-dashboard">
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1>Welcome back, {getDisplayName()}!</h1>
          <p>Manage your device repairs and track progress from your dashboard</p>
        </div>
        <div className="dashboard-stats">
          {statsData.map((stat, index) => (
            <div key={index} className={`stat-card ${stat.color}`}>
              <div className="stat-icon">{stat.icon}</div>
              <div className="stat-content">
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="actions-grid">
          {quickActions.map((action, index) => (
            <div 
              key={index} 
              className={`action-card ${action.color}`}
              onClick={action.action}
            >
              <div className="action-icon">{action.icon}</div>
              <div className="action-content">
                <h3>{action.title}</h3>
                <p>{action.description}</p>
              </div>
              <div className="action-arrow">→</div>
            </div>
          ))}
        </div>
      </div>

      <div className="recent-activity">
        <h2>Recent Activity</h2>
        {recentActivity.length === 0 ? (
          <div className="no-activity">
            <h3>No recent activity</h3>
            <p>Submit your first repair request to see activity here.</p>
            <button 
              className="start-button"
              onClick={() => navigate("/customer/add-repair")}
            >
              Submit Repair Request
            </button>
          </div>
        ) : (
          <div className="activity-list">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="activity-item">
                <div className="activity-icon">{activity.icon}</div>
                <div className="activity-content">
                  <div className="activity-title">{activity.title}</div>
                  <div className="activity-subtitle">{activity.subtitle}</div>
                  <div className="activity-time">{activity.time}</div>
                </div>
              </div>
            ))}
            
            {orders.length > 3 && (
              <div className="view-all-activity">
                <button 
                  className="view-all-button"
                  onClick={() => navigate("/customer/repair-orders")}
                >
                  View All Orders →
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerDashboard;