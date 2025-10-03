import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../../../context/AuthContext";
import api from "../../../../services/api";
import "./RepairingStatus.css";

interface RepairRequest {
  requestId: number;
  referenceNumber: string;
  device: string;
  brand: string;
  model: string;
  issue: string;
  description?: string;
  status: number;
  submittedAt: string;
  estimatedCompletionDays?: number;
  customer: {
    userId: number;
    name: string;
    email: string;
    phone: string;
  };
}

interface RepairOrder {
  requestId: number;
  referenceNumber: string;
  device: string;
  brand: string;
  model: string;
  issue: string;
  status: number;
  submittedAt: string;
  customerName?: string;
}

const RepairingStatus = () => {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [repairs, setRepairs] = useState<RepairRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedRepair, setSelectedRepair] = useState<RepairRequest | null>(null);
  const [newStatus, setNewStatus] = useState<number>(0);
  const [estimatedDays, setEstimatedDays] = useState<number | ''>('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState("");

  useEffect(() => {
    fetchAssignedRepairs();
  }, [token]);

  const fetchAssignedRepairs = async () => {
    try {
      setLoading(true);
      const response = await api.get('/technician/assigned-repairs', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (Array.isArray(response.data)) {
        setRepairs(response.data);
      } else {
        setRepairs([]);
      }
    } catch (err: any) {
      console.error('Error fetching repairs:', err);
      setError("Failed to fetch assigned repairs");
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (statusValue: number): string => {
    switch (statusValue) {
      case 0: return "Received";
      case 1: return "In Progress";
      case 2: return "Completed";
      case 3: return "Cancelled";
      case 4: return "Ready for Delivery";
      case 5: return "Delivered";
      default: return "Unknown";
    }
  };

  const getStatusClass = (statusValue: number): string => {
    switch (statusValue) {
      case 0: return "received";
      case 1: return "inprogress";
      case 2: return "completed";
      case 3: return "unpaid";
      case 4: return "readyfordelivery";
      case 5: return "completed";
      default: return "received";
    }
  };

  const getStatusOptions = (currentStatus: number) => {
    switch (currentStatus) {
      case 0: return [
        { value: 0, label: "Received" },
        { value: 1, label: "In Progress" },
        { value: 3, label: "Cancelled" }
      ];
      case 1: return [
        { value: 1, label: "In Progress" },
        { value: 2, label: "Completed" },
        { value: 3, label: "Cancelled" }
      ];
      case 2: return [
        { value: 2, label: "Completed" },
        { value: 4, label: "Ready for Delivery" }
      ];
      case 4: return [
        { value: 4, label: "Ready for Delivery" },
        { value: 5, label: "Delivered" }
      ];
      default: return [
        { value: currentStatus, label: getStatusLabel(currentStatus) }
      ];
    }
  };

  const canUpdateStatus = (statusValue: number): boolean => {
    return statusValue !== 5 && statusValue !== 3;
  };

  const filteredRepairs = repairs.filter(repair => {
    const matchesTab = activeTab === "all" || 
                      (activeTab === "received" && repair.status === 0) ||
                      (activeTab === "inprogress" && repair.status === 1) ||
                      (activeTab === "completed" && repair.status === 2) ||
                      (activeTab === "ready" && repair.status === 4);

    const matchesSearch = repair.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         repair.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         repair.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         repair.customer.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || repair.status.toString() === statusFilter;
    const matchesDate = !dateFilter || repair.submittedAt.includes(dateFilter);

    return matchesTab && matchesSearch && matchesStatus && matchesDate;
  });

  const getTabCount = (status: string) => {
    if (status === "all") return repairs.length;
    if (status === "received") return repairs.filter(r => r.status === 0).length;
    if (status === "inprogress") return repairs.filter(r => r.status === 1).length;
    if (status === "completed") return repairs.filter(r => r.status === 2).length;
    if (status === "ready") return repairs.filter(r => r.status === 4).length;
    return 0;
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

  const handleUpdateClick = (repair: RepairRequest) => {
    setSelectedRepair(repair);
    setNewStatus(repair.status);
    setEstimatedDays('');
    setUpdateMessage("");
    setShowModal(true);
  };

  const handleStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRepair) return;

    setIsUpdating(true);
    setUpdateMessage("");

    try {
      const requestBody: any = { status: newStatus };

      if (newStatus === 1 && estimatedDays !== '') {
        requestBody.estimatedCompletionDays = estimatedDays;
      }

      await api.put(`/technician/repair/${selectedRepair.requestId}/status`, requestBody, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setUpdateMessage("Status updated successfully!");
      
      setTimeout(() => {
        setShowModal(false);
        fetchAssignedRepairs();
        setSelectedRepair(null);
        setUpdateMessage("");
      }, 1500);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Failed to update status.";
      setUpdateMessage(errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading assigned repairs...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="manage-payments">
      <div className="header">
        <h1>Repair Status Management</h1>
        <button 
          className="btn-primary"
          onClick={() => navigate("/technician/dashboard")}
        >
          ← Back to Dashboard
        </button>
      </div>

      <div className="tabs">
        <button 
          className={`tab ${activeTab === "all" ? "active" : ""}`}
          onClick={() => setActiveTab("all")}
        >
          All Repairs ({getTabCount("all")})
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
          className={`tab ${activeTab === "ready" ? "active" : ""}`}
          onClick={() => setActiveTab("ready")}
        >
          Ready ({getTabCount("ready")})
        </button>
      </div>

      <div className="filters-container">
        <div className="filter-row">
          <input
            type="text"
            placeholder="Search by reference number, device, or customer name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="0">Received</option>
            <option value="1">In Progress</option>
            <option value="2">Completed</option>
            <option value="3">Cancelled</option>
            <option value="4">Ready for Delivery</option>
            <option value="5">Delivered</option>
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
              <th>Issue</th>
              <th>Customer</th>
              <th>Status</th>
              <th>Submitted Date</th>
              <th>Est. Days</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRepairs.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '40px' }}>
                  <div>
                    <h3>No repairs found</h3>
                    <p>
                      {activeTab === "all" 
                        ? "No repairs assigned yet." 
                        : `No repairs with status "${activeTab}" found.`
                      }
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredRepairs.map((repair) => (
                <tr key={repair.requestId}>
                  <td data-label="Reference #">
                    <strong>{repair.referenceNumber}</strong>
                  </td>
                  <td data-label="Device">
                    <div>
                      <strong>{repair.brand} {repair.model}</strong>
                      <br />
                      <small>{repair.device}</small>
                    </div>
                  </td>
                  <td data-label="Issue">
                    <div style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {repair.issue.length > 50 
                        ? `${repair.issue.substring(0, 50)}...` 
                        : repair.issue
                      }
                    </div>
                  </td>
                  <td data-label="Customer">
                    <div>
                      <strong>{repair.customer.name}</strong>
                      <br />
                      <small>{repair.customer.phone}</small>
                    </div>
                  </td>
                  <td data-label="Status">
                    <span className={`status-badge ${getStatusClass(repair.status)}`}>
                      {getStatusLabel(repair.status)}
                    </span>
                  </td>
                  <td data-label="Submitted Date">
                    {formatDate(repair.submittedAt)}
                  </td>
                  <td data-label="Est. Days">
                    {repair.estimatedCompletionDays || "Not set"}
                  </td>
                  <td data-label="Actions">
                    <div className="actions">
                      {canUpdateStatus(repair.status) ? (
                        <button
                          className="btn-edit"
                          onClick={() => handleUpdateClick(repair)}
                        >
                          Update Status
                        </button>
                      ) : (
                        <span style={{ color: '#6c757d', fontSize: '12px' }}>
                          Cannot Update
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {filteredRepairs.length > 0 && (
        <div className="statistics-container">
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Total Assigned</h3>
              <p className="stat-number">{repairs.length}</p>
            </div>
            <div className="stat-card">
              <h3>In Progress</h3>
              <p className="stat-number warning">
                {repairs.filter(r => r.status === 1).length}
              </p>
            </div>
            <div className="stat-card">
              <h3>Completed</h3>
              <p className="stat-number success">
                {repairs.filter(r => r.status === 2).length}
              </p>
            </div>
            <div className="stat-card">
              <h3>Ready for Delivery</h3>
              <p className="stat-number">
                {repairs.filter(r => r.status === 4).length}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {showModal && selectedRepair && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Update Repair Status</h2>
              <button onClick={() => setShowModal(false)}>×</button>
            </div>
            
            <form onSubmit={handleStatusUpdate}>
              <div style={{ padding: '20px' }}>
                <div style={{ marginBottom: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '5px' }}>
                  <p><strong>Reference:</strong> {selectedRepair.referenceNumber}</p>
                  <p><strong>Device:</strong> {selectedRepair.brand} {selectedRepair.model}</p>
                  <p><strong>Customer:</strong> {selectedRepair.customer.name}</p>
                  <p><strong>Current Status:</strong> {getStatusLabel(selectedRepair.status)}</p>
                </div>

                <div className="form-group">
                  <label htmlFor="status-select">New Status</label>
                  <select
                    id="status-select"
                    value={newStatus}
                    onChange={(e) => setNewStatus(Number(e.target.value))}
                    disabled={isUpdating}
                  >
                    {getStatusOptions(selectedRepair.status).map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                {newStatus === 1 && (
                  <div className="form-group">
                    <label htmlFor="estimated-days">Estimated Completion Days (Optional)</label>
                    <input
                      id="estimated-days"
                      type="number"
                      value={estimatedDays}
                      onChange={(e) => setEstimatedDays(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="Enter estimated days"
                      min="1"
                      disabled={isUpdating}
                    />
                  </div>
                )}

                {updateMessage && (
                  <div style={{ 
                    padding: '10px', 
                    borderRadius: '4px', 
                    marginBottom: '15px',
                    background: updateMessage.includes('successfully') ? '#d4edda' : '#f8d7da',
                    color: updateMessage.includes('successfully') ? '#155724' : '#721c24'
                  }}>
                    {updateMessage}
                  </div>
                )}
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={isUpdating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                >
                  {isUpdating ? "Updating..." : "Update Status"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RepairingStatus;