import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../../../context/AuthContext";
import "./RepairHistory.css";
import api from "../../../../services/api";

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
  completedAt?: string;
}

const RepairHistory = () => {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [orders, setOrders] = useState<RepairOrder[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get("/Repair/my-requests", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const mappedOrders: RepairOrder[] = res.data.map((item: any) => ({
          repairRequestId: item.requestId,
          referenceNumber: item.referenceNumber,
          device: {
            make: item.brand,
            model: item.model,
            serialNumber: item.serialNumber || "N/A",
            deviceType: item.deviceType || "Electronic Device",
          },
          status: mapStatus(item.status),
          issueDescription: item.description || item.issue || "",
          createdAt: item.submittedAt,
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
      case 4: return "Ready for Delivery";
      case 5: return "Delivered";
      default: return "Unknown";
    }
  };

  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case "received": return "received";
      case "in progress": return "inprogress";
      case "completed": return "completed";
      case "cancelled": return "unpaid";
      case "ready for delivery": return "readyfordelivery";
      case "delivered": return "completed";
      default: return "received";
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesTab = activeTab === "all" || order.status.toLowerCase().replace(" ", "").replace("for", "") === activeTab;
    const matchesSearch = order.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.device.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.device.model.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status.toLowerCase().replace(" ", "").replace("for", "") === statusFilter;
    const matchesDate = !dateFilter || order.createdAt.includes(dateFilter);
    
    return matchesTab && matchesSearch && matchesStatus && matchesDate;
  });

  const getTabCount = (status: string) => {
    if (status === "all") return orders.length;
    return orders.filter(order => order.status.toLowerCase().replace(" ", "").replace("for", "") === status).length;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setDateFilter("");
  };

  if (isLoading) {
    return <div className="loading">Loading repair orders...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="manage-payments">
      <div className="header">
        <h1>My Repair History</h1>
        <button 
          className="btn-primary"
          onClick={() => navigate("/customer/add-repair")}
        >
          + New Repair Request
        </button>
      </div>

      <div className="tabs">
        <button 
          className={`tab ${activeTab === "all" ? "active" : ""}`}
          onClick={() => setActiveTab("all")}
        >
          All Orders ({getTabCount("all")})
        </button>
        <button 
          className={`tab ${activeTab === "received" ? "active" : ""}`}
          onClick={() => setActiveTab("received")}
        >
          Received ({getTabCount("received")})
        </button>
        <button 
          className={`tab ${activeTab === "inprogress" ? "active" : ""}`}
          onClick={() => setActiveTab("inprogress")}
        >
          In Progress ({getTabCount("inprogress")})
        </button>
        <button 
          className={`tab ${activeTab === "completed" ? "active" : ""}`}
          onClick={() => setActiveTab("completed")}
        >
          Completed ({getTabCount("completed")})
        </button>
        <button 
          className={`tab ${activeTab === "readydelivery" ? "active" : ""}`}
          onClick={() => setActiveTab("readydelivery")}
        >
          Ready for Delivery ({getTabCount("readydelivery")})
        </button>
        <button 
          className={`tab ${activeTab === "delivered" ? "active" : ""}`}
          onClick={() => setActiveTab("delivered")}
        >
          Delivered ({getTabCount("delivered")})
        </button>
        <button 
          className={`tab ${activeTab === "cancelled" ? "active" : ""}`}
          onClick={() => setActiveTab("cancelled")}
        >
          Cancelled ({getTabCount("cancelled")})
        </button>
      </div>

      <div className="filters-container">
        <div className="filter-row">
          <input
            type="text"
            placeholder="Search by reference number, device make or model..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="received">Received</option>
            <option value="inprogress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="readydelivery">Ready for Delivery</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <input
            type="month"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            placeholder="Filter by month"
          />
          <button onClick={clearFilters}>Clear Filters</button>
        </div>
      </div>

      <div className="table-container">
        <table className="payments-table">
          <thead>
            <tr>
              <th>Reference #</th>
              <th>Device</th>
              <th>Issue Description</th>
              <th>Status</th>
              <th>Submitted Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '40px' }}>
                  <div>
                    <h3>No repair orders found</h3>
                    <p>
                      {activeTab === "all" 
                        ? "You haven't submitted any repair requests yet." 
                        : `No orders with status "${activeTab}" found.`
                      }
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr key={order.repairRequestId}>
                  <td data-label="Reference #">
                    <strong>{order.referenceNumber}</strong>
                  </td>
                  <td data-label="Device">
                    <div>
                      <strong>{order.device.make} {order.device.model}</strong>
                      <br />
                      <small>{order.device.deviceType}</small>
                      {order.device.serialNumber !== "N/A" && (
                        <>
                          <br />
                          <small>Serial: {order.device.serialNumber}</small>
                        </>
                      )}
                    </div>
                  </td>
                  <td data-label="Issue Description">
                    <div style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {order.issueDescription.length > 50 
                        ? `${order.issueDescription.substring(0, 50)}...` 
                        : order.issueDescription
                      }
                    </div>
                  </td>
                  <td data-label="Status">
                    <span className={`status-badge ${getStatusClass(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td data-label="Submitted Date">
                    {formatDate(order.createdAt)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {filteredOrders.length > 0 && (
        <div className="statistics-container">
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Total Orders</h3>
              <p className="stat-number">{orders.length}</p>
            </div>
            <div className="stat-card">
              <h3>Completed Orders</h3>
              <p className="stat-number success">
                {orders.filter(o => o.status.toLowerCase() === "completed" || o.status.toLowerCase() === "delivered").length}
              </p>
            </div>
            <div className="stat-card">
              <h3>In Progress</h3>
              <p className="stat-number warning">
                {orders.filter(o => o.status.toLowerCase() === "in progress").length}
              </p>
            </div>
            <div className="stat-card">
              <h3>Total Spent</h3>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RepairHistory;