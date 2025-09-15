// src/pages/ShowRepairOrdersPage.tsx
import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../../../context/AuthContext";
import "./RepairHistory.css";
import api from "../../../../services/api";

interface RepairOrder {
  repairRequestId: number; // Changed from string to number
  referenceNumber: string;
  device: {
    make: string;
    model: string;
    serialNumber: string; // Added serialNumber
    deviceType?: string; // Made optional since it's not in your backend response
  };
  status: string;
  issueDescription: string;
  createdAt: string;
  estimatedCost?: number;
  completedAt?: string;
}

const RepairHistory = () => {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [orders, setOrders] = useState<RepairOrder[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<RepairOrder | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get("/Repair/my-requests", {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Map backend data to frontend shape
        const mappedOrders: RepairOrder[] = res.data.map((item: any) => ({
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
        setOrders(mappedOrders);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to fetch orders.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, [token]);

  const mapStatus = (status: number): string => {
    switch (status) {
      case 0: return "Received";
      case 1: return "In Progress";
      case 2: return "Completed";
      case 3: return "Cancelled";
      default: return "Unknown";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending": return "pending";
      case "received": return "pending"; // Added for your "Received" status
      case "in progress": return "progress";
      case "completed": return "completed";
      case "cancelled": return "cancelled";
      default: return "pending";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending": return "⏳";
      case "received": return "📥"; // Added icon for "Received" status
      case "in progress": return "🔧";
      case "completed": return "✅";
      case "cancelled": return "❌";
      default: return "⏳";
    }
  };

  const filteredOrders = orders.filter(order => {
    if (filter === "all") return true;
    // Handle both "received" and "pending" in the same filter for now
    if (filter === "pending") {
      return order.status.toLowerCase() === "pending" || order.status.toLowerCase() === "received";
    }
    return order.status.toLowerCase() === filter;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="repair-history-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your repair orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="repair-history-container">
      <div className="repair-history-header">
        <button 
          className="back-button"
          onClick={() => navigate("/customer/dashboard")}
        >
          ← Back to Dashboard
        </button>
        <h1>My Repair Orders</h1>
        <p>Track and manage all your device repair requests</p>
      </div>

      {error && (
        <div className="error-message">
          <div className="error-icon">❌</div>
          <div className="error-text">{error}</div>
        </div>
      )}

      <div className="filter-section">
        <div className="filter-buttons">
          <button 
            className={filter === "all" ? "active" : ""}
            onClick={() => setFilter("all")}
          >
            All Orders ({orders.length})
          </button>
          <button 
            className={filter === "pending" ? "active" : ""}
            onClick={() => setFilter("pending")}
          >
            Pending/Received ({orders.filter(o => 
              o.status.toLowerCase() === "pending" || o.status.toLowerCase() === "received"
            ).length})
          </button>
          <button 
            className={filter === "in progress" ? "active" : ""}
            onClick={() => setFilter("in progress")}
          >
            In Progress ({orders.filter(o => o.status.toLowerCase() === "in progress").length})
          </button>
          <button 
            className={filter === "completed" ? "active" : ""}
            onClick={() => setFilter("completed")}
          >
            Completed ({orders.filter(o => o.status.toLowerCase() === "completed").length})
          </button>
        </div>
      </div>

      <div className="orders-container">
        {filteredOrders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>No repair orders found</h3>
            <p>
              {filter === "all" 
                ? "You haven't submitted any repair requests yet." 
                : `No orders with status "${filter}" found.`
              }
            </p>
            <button 
              className="create-order-button"
              onClick={() => navigate("/customer/add-repair")}
            >
              Submit New Repair Request
            </button>
          </div>
        ) : (
          <div className="orders-grid">
            {filteredOrders.map((order) => (
              <div key={order.repairRequestId} className="order-card">
                <div className="order-header">
                  <div className="order-reference">
                    <h3>{order.referenceNumber}</h3>
                    <span className={`status-badge ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)} {order.status}
                    </span>
                  </div>
                  <div className="order-date">
                    {formatDate(order.createdAt)}
                  </div>
                </div>

                <div className="device-info">
                  <div className="device-details">
                    <h4>{order.device.make} {order.device.model}</h4>
                    {order.device.deviceType && (
                      <p className="device-type">{order.device.deviceType}</p>
                    )}
                    <p className="serial-number">Serial: {order.device.serialNumber}</p>
                  </div>
                </div>

                <div className="issue-description">
                  <h5>Issue Description:</h5>
                  <p>{order.issueDescription}</p>
                </div>

                {order.estimatedCost && (
                  <div className="cost-info">
                    <span className="cost-label">Estimated Cost:</span>
                    <span className="cost-value">${order.estimatedCost}</span>
                  </div>
                )}

                {order.completedAt && (
                  <div className="completion-info">
                    <span className="completion-label">Completed on:</span>
                    <span className="completion-date">{formatDate(order.completedAt)}</span>
                  </div>
                )}

                <div className="order-actions">
                  <button
                    className="view-details-button"
                    onClick={() => navigate("/customer/repair-order-details", { state: { order } })}
                  >
                    View Details
                  </button>
                  {order.status.toLowerCase() === "completed" && (
                    <button className="download-receipt-button">
                      Download Receipt
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RepairHistory;
