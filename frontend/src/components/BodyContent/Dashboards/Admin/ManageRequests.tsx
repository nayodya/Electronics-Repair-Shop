import React, { useEffect, useState } from "react";
import api from "../../../../services/api";
import "./AdminStyles.css";

interface RepairRequest {
  requestId: number;
  referenceNumber: string;
  customerId: number;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
  };
  device: string;
  brand: string;
  model: string;
  issue: string;
  description: string;
  status: number;
  submittedAt: string;
  estimatedCompletionDays: number;
  technicianId?: number;
  technician?: {
    firstName: string;
    lastName: string;
  };
}

interface Technician {
  userId: number;
  firstName: string;
  lastName: string;
}

const ManageRequests: React.FC = () => {
  const [requests, setRequests] = useState<RepairRequest[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<RepairRequest | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  useEffect(() => {
    fetchRequests();
    fetchTechnicians();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await api.get("/admin/repairs", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRequests(res.data);
    } catch (err: any) {
      setMessage("Failed to fetch requests: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const fetchTechnicians = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/admin/technicians", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTechnicians(res.data);
    } catch (err: any) {
      console.error("Failed to fetch technicians", err);
    }
  };

  const assignTechnician = async (requestId: number, technicianId: number) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      await api.put(`/admin/repairs/${requestId}/assign-technician`, 
        { technicianId }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("✅ Technician assigned successfully!");
      fetchRequests();
    } catch (err: any) {
      setMessage("❌ Failed to assign technician: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (requestId: number, status: number) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      await api.put(`/admin/repairs/${requestId}/update-status`, 
        { status }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("✅ Status updated successfully!");
      fetchRequests();
    } catch (err: any) {
      setMessage("❌ Failed to update status: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const deleteRequest = async (requestId: number) => {
    if (!window.confirm("Are you sure you want to delete this repair request?")) return;
    
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      await api.delete(`/admin/repairs/${requestId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage("✅ Repair request deleted successfully!");
      fetchRequests();
    } catch (err: any) {
      setMessage("❌ Failed to delete request: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = (status: number) => {
    const statusMap: { [key: number]: string } = {
      0: "Received",
      1: "In Progress", 
      2: "Completed",
      3: "Cancelled",
      4: "Ready for Delivery",
      5: "Delivered"
    };
    return statusMap[status] || "Unknown";
  };

  const filteredRequests = requests.filter(req => 
    filterStatus === "all" || req.status.toString() === filterStatus
  );

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h2>🔧 Manage Repair Requests</h2>
        <div className="admin-filters">
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="admin-select"
          >
            <option value="all">All Status</option>
            <option value="0">Received</option>
            <option value="1">In Progress</option>
            <option value="2">Completed</option>
            <option value="3">Cancelled</option>
            <option value="4">Ready for Delivery</option>
            <option value="5">Delivered</option>
          </select>
        </div>
      </div>

      {message && <div className="admin-message">{message}</div>}

      {loading ? (
        <div className="admin-loading">Loading requests...</div>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Ref #</th>
                <th>Customer</th>
                <th>Device</th>
                <th>Issue</th>
                <th>Status</th>
                <th>Technician</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((request) => (
                <tr key={request.requestId}>
                  <td>{request.referenceNumber}</td>
                  <td>
                    <div>
                      <strong>{request.customer.firstName} {request.customer.lastName}</strong>
                      <br />
                      <small>{request.customer.email}</small>
                    </div>
                  </td>
                  <td>
                    <div>
                      <strong>{request.brand} {request.model}</strong>
                      <br />
                      <small>{request.device}</small>
                    </div>
                  </td>
                  <td>{request.issue}</td>
                  <td>
                    <span className={`admin-badge admin-badge-status-${request.status}`}>
                      {getStatusText(request.status)}
                    </span>
                  </td>
                  <td>
                    {request.technician ? (
                      <span>{request.technician.firstName} {request.technician.lastName}</span>
                    ) : (
                      <select 
                        onChange={(e) => assignTechnician(request.requestId, parseInt(e.target.value))}
                        className="admin-select-small"
                        defaultValue=""
                      >
                        <option value="">Assign Technician</option>
                        {technicians.map(tech => (
                          <option key={tech.userId} value={tech.userId}>
                            {tech.firstName} {tech.lastName}
                          </option>
                        ))}
                      </select>
                    )}
                  </td>
                  <td>{new Date(request.submittedAt).toLocaleDateString()}</td>
                  <td>
                    <div className="admin-actions">
                      <button 
                        className="admin-btn admin-btn-info admin-btn-small"
                        onClick={() => setSelectedRequest(request)}
                      >
                        👁️ View
                      </button>
                      <select 
                        onChange={(e) => updateStatus(request.requestId, parseInt(e.target.value))}
                        className="admin-select-small"
                        value={request.status}
                      >
                        <option value={0}>Received</option>
                        <option value={1}>In Progress</option>
                        <option value={2}>Completed</option>
                        <option value={3}>Cancelled</option>
                        <option value={4}>Ready for Delivery</option>
                        <option value={5}>Delivered</option>
                      </select>
                      <button 
                        className="admin-btn admin-btn-danger admin-btn-small"
                        onClick={() => deleteRequest(request.requestId)}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Request Details Modal */}
      {selectedRequest && (
        <div className="admin-modal-overlay" onClick={() => setSelectedRequest(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>🔧 Repair Request Details - {selectedRequest.referenceNumber}</h3>
              <button 
                className="admin-modal-close"
                onClick={() => setSelectedRequest(null)}
              >
                ✕
              </button>
            </div>
            
            <div className="admin-modal-content">
              <div className="admin-request-details">
                <div className="admin-detail-section">
                  <h4>👤 Customer Information</h4>
                  <p><strong>Name:</strong> {selectedRequest.customer.firstName} {selectedRequest.customer.lastName}</p>
                  <p><strong>Email:</strong> {selectedRequest.customer.email}</p>
                </div>

                <div className="admin-detail-section">
                  <h4>📱 Device Information</h4>
                  <p><strong>Device:</strong> {selectedRequest.device}</p>
                  <p><strong>Brand:</strong> {selectedRequest.brand}</p>
                  <p><strong>Model:</strong> {selectedRequest.model}</p>
                  <p><strong>Issue:</strong> {selectedRequest.issue}</p>
                  <p><strong>Description:</strong> {selectedRequest.description}</p>
                </div>

                <div className="admin-detail-section">
                  <h4>🔧 Repair Information</h4>
                  <p><strong>Status:</strong> 
                    <span className={`admin-badge admin-badge-status-${selectedRequest.status}`}>
                      {getStatusText(selectedRequest.status)}
                    </span>
                  </p>
                  <p><strong>Submitted:</strong> {new Date(selectedRequest.submittedAt).toLocaleString()}</p>
                  <p><strong>Estimated Days:</strong> {selectedRequest.estimatedCompletionDays}</p>
                  <p><strong>Technician:</strong> {
                    selectedRequest.technician 
                      ? `${selectedRequest.technician.firstName} ${selectedRequest.technician.lastName}`
                      : "Not assigned"
                  }</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageRequests;