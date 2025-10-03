import React, { useEffect, useState } from "react";
import api from "../../../../services/api";
import "./ManageRequests.css";

interface RepairRequest {
  requestId: number;
  referenceNumber: string;
  customerId: number;
  customerEmail: string;
  device: string;
  brand: string;
  model: string;
  issue: string;
  description?: string;
  status: number;
  submittedAt: string;
  estimatedCompletionDays: number | null;
  technicianId?: number | null;
  technicianEmail?: string | null;
  hasPayment: boolean;
  paymentAmount: number;
}

interface Technician {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
}

interface PaymentDto {
  amount: number;
  advancedPayment?: number;
}

interface EstimatedDaysDto {
  estimatedCompletionDays: number;
}

const ManageRequests: React.FC = () => {
  const [requests, setRequests] = useState<RepairRequest[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<RepairRequest | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  
  // Payment form state
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentData, setPaymentData] = useState<PaymentDto>({
    amount: 0,
    advancedPayment: 0
  });
  const [selectedPaymentRequest, setSelectedPaymentRequest] = useState<RepairRequest | null>(null);

  // Estimated days form state
  const [showEstimatedDaysForm, setShowEstimatedDaysForm] = useState(false);
  const [estimatedDaysData, setEstimatedDaysData] = useState<EstimatedDaysDto>({
    estimatedCompletionDays: 0
  });
  const [selectedEstimatedDaysRequest, setSelectedEstimatedDaysRequest] = useState<RepairRequest | null>(null);

  useEffect(() => {
    fetchRequests();
    fetchTechnicians();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("token");
      
      if (!token) {
        setError("No authentication token found");
        return;
      }

      const res = await api.get("/Admin/repairs/debug", {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log("API Response:", res.data);
      
      let requestsData = [];
      if (res.data && res.data.data && Array.isArray(res.data.data)) {
        requestsData = res.data.data;
      } else if (Array.isArray(res.data)) {
        requestsData = res.data;
      } else {
        console.error("Unexpected API response format:", res.data);
        setError("Unexpected data format from server");
        return;
      }
      
      const validatedRequests = requestsData.filter((item: any) => {
        return item && typeof item === 'object' && item.requestId;
      });
      
      setRequests(validatedRequests);
      
    } catch (err: any) {
      console.error("Fetch requests error:", err);
      const errorMessage = err.response?.data?.message || err.message || "Failed to fetch requests";
      setError(errorMessage);
      setMessage(`❌ ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchTechnicians = async () => {
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        console.error("No token for fetching technicians");
        return;
      }

      const res = await api.get("/Admin/technicians", {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const techniciansData = Array.isArray(res.data) ? res.data : [];
      setTechnicians(techniciansData);
      
    } catch (err: any) {
      console.error("Failed to fetch technicians:", err);
    }
  };

  const assignTechnician = async (requestId: number, technicianId: number) => {
    if (!technicianId) return;
    
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("token");
      
      await api.put(`/Admin/repairs/${requestId}/assign-technician`, 
        { technicianId }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setMessage("✅ Technician assigned successfully!");
      await fetchRequests();
      
      setTimeout(() => setMessage(""), 3000);
      
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to assign technician";
      setError(errorMessage);
      setMessage(`❌ ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (requestId: number, status: number) => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("token");
      
      await api.put(`/Admin/repairs/${requestId}/update-status`, 
        { status }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setMessage("✅ Status updated successfully!");
      await fetchRequests();
      
      setTimeout(() => setMessage(""), 3000);
      
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to update status";
      setError(errorMessage);
      setMessage(`❌ ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const deleteRequest = async (requestId: number) => {
    if (!window.confirm("Are you sure you want to delete this repair request?")) return;
    
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("token");
      
      await api.delete(`/Admin/repairs/debug/${requestId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setMessage("✅ Repair request deleted successfully!");
      await fetchRequests();
      
      setTimeout(() => setMessage(""), 3000);
      
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to delete request";
      setError(errorMessage);
      setMessage(`❌ ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // Payment functions
  const openPaymentForm = (request: RepairRequest) => {
    setSelectedPaymentRequest(request);
    setPaymentData({
      amount: request.hasPayment ? request.paymentAmount : 0,
      advancedPayment: 0
    });
    setShowPaymentForm(true);
    setError("");
  };

  const closePaymentForm = () => {
    setShowPaymentForm(false);
    setSelectedPaymentRequest(null);
    setPaymentData({ amount: 0, advancedPayment: 0 });
    setError("");
  };

  const handleUpdatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPaymentRequest) return;

    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("token");
      
      await api.put(`/Admin/repairs/${selectedPaymentRequest.requestId}/payment`, paymentData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setMessage("✅ Payment updated successfully!");
      setShowPaymentForm(false);
      setSelectedPaymentRequest(null);
      await fetchRequests();
      
      setTimeout(() => setMessage(""), 3000);
      
    } catch (err: any) {
      console.error("Failed to update payment:", err);
      const errorMessage = err.response?.data?.message || err.message || "Failed to update payment";
      setError(errorMessage);
      setMessage(`❌ ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // Estimated days functions
  const openEstimatedDaysForm = (request: RepairRequest) => {
    setSelectedEstimatedDaysRequest(request);
    setEstimatedDaysData({
      estimatedCompletionDays: request.estimatedCompletionDays || 0
    });
    setShowEstimatedDaysForm(true);
    setError("");
  };

  const closeEstimatedDaysForm = () => {
    setShowEstimatedDaysForm(false);
    setSelectedEstimatedDaysRequest(null);
    setEstimatedDaysData({ estimatedCompletionDays: 0 });
    setError("");
  };

  const handleUpdateEstimatedDays = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEstimatedDaysRequest) return;

    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("token");
      
      await api.put(`/Repair/${selectedEstimatedDaysRequest.requestId}/estimated-days`, estimatedDaysData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setMessage("✅ Estimated completion days updated successfully!");
      setShowEstimatedDaysForm(false);
      setSelectedEstimatedDaysRequest(null);
      await fetchRequests();
      
      setTimeout(() => setMessage(""), 3000);
      
    } catch (err: any) {
      console.error("Failed to update estimated days:", err);
      const errorMessage = err.response?.data?.message || err.message || "Failed to update estimated days";
      setError(errorMessage);
      setMessage(`❌ ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = (status: number): string => {
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

  const getStatusClass = (status: number): string => {
    const statusClassMap: { [key: number]: string } = {
      0: "received",
      1: "in-progress",
      2: "completed",
      3: "cancelled",
      4: "ready-for-delivery",
      5: "delivered"
    };
    return statusClassMap[status] || "unknown";
  };

  const filteredRequests = requests.filter(req => {
    if (!req || typeof req !== 'object') return false;
    return filterStatus === "all" || req.status?.toString() === filterStatus;
  });

  if (error && !loading && !showPaymentForm && !showEstimatedDaysForm) {
    return (
      <div className="admin-container">
        <div className="admin-error">
          <h3>⚠️ Error Loading Requests</h3>
          <p>{error}</p>
          <button 
            className="admin-btn admin-btn-primary"
            onClick={() => {
              setError("");
              setMessage("");
              fetchRequests();
            }}
          >
            🔄 Retry
          </button>
        </div>
      </div>
    );
  }

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

      {message && (
        <div className={`admin-message ${message.includes('❌') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      {loading ? (
        <div className="admin-loading">
          <div className="loading-spinner"></div>
          Loading requests...
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="admin-no-data">
          <h3>📝 No Repair Requests Found</h3>
          <p>
            {filterStatus === "all" 
              ? "There are no repair requests to display." 
              : `No requests found with status: ${getStatusText(parseInt(filterStatus))}`
            }
          </p>
        </div>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Ref #</th>
                <th>Device</th>
                <th>Issue</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Technician</th>
                <th>Est. Days</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((request) => (
                <tr key={request.requestId}>
                  <td className="ref-number">{request.referenceNumber || 'N/A'}</td>
                  <td>
                    <div className="device-info">
                      <strong>{request.brand || ''} {request.model || ''}</strong>
                      <br />
                      <small>{request.device || 'No device info'}</small>
                    </div>
                  </td>
                  <td className="issue-text">{request.issue || 'No issue description'}</td>
                  <td>
                    <span className={`status-badge status-${getStatusClass(request.status)}`}>
                      {getStatusText(request.status)}
                    </span>
                  </td>
                  <td>
                    <div className="payment-info">
                      {request.hasPayment ? (
                        <div className="payment-amount">
                          <span className="payment-badge payment-paid">
                            💰 ${request.paymentAmount.toFixed(2)}
                          </span>
                          <button 
                            className="admin-btn admin-btn-info admin-btn-small"
                            onClick={() => openPaymentForm(request)}
                            disabled={loading}
                            title="Update payment"
                          >
                            ✏️ Edit
                          </button>
                        </div>
                      ) : (
                        <button 
                          className="admin-btn admin-btn-primary admin-btn-small"
                          onClick={() => openPaymentForm(request)}
                          disabled={loading}
                          title="Add payment"
                        >
                          💰 Add Payment
                        </button>
                      )}
                    </div>
                  </td>
                  <td>
                    {request.technicianEmail ? (
                      <span className="technician-assigned">
                        {request.technicianEmail}
                      </span>
                    ) : (
                      <select 
                        onChange={(e) => {
                          const techId = parseInt(e.target.value);
                          if (techId) {
                            assignTechnician(request.requestId, techId);
                          }
                        }}
                        className="admin-select-small"
                        defaultValue=""
                        disabled={loading}
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
                  <td>
                    <div className="estimated-days-cell">
                      {request.estimatedCompletionDays ? (
                        <div className="estimated-days-info">
                          <span className="days-badge">
                            📅 {request.estimatedCompletionDays} days
                          </span>
                          <button 
                            className="admin-btn admin-btn-info admin-btn-small"
                            onClick={() => openEstimatedDaysForm(request)}
                            disabled={loading}
                            title="Update estimated days"
                          >
                            ✏️ Edit
                          </button>
                        </div>
                      ) : (
                        <button 
                          className="admin-btn admin-btn-secondary admin-btn-small"
                          onClick={() => openEstimatedDaysForm(request)}
                          disabled={loading}
                          title="Set estimated days"
                        >
                          📅 Set Days
                        </button>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="admin-actions">
                      <button 
                        className="admin-btn admin-btn-info admin-btn-small"
                        onClick={() => setSelectedRequest(request)}
                        disabled={loading}
                      >
                         View
                      </button>
                      <select 
                        onChange={(e) => {
                          const newStatus = parseInt(e.target.value);
                          if (newStatus !== request.status) {
                            updateStatus(request.requestId, newStatus);
                          }
                        }}
                        className="admin-select-small"
                        value={request.status}
                        disabled={loading}
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
                        disabled={loading}
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

      {/* Estimated Days Form Modal */}
      {showEstimatedDaysForm && selectedEstimatedDaysRequest && (
        <div className="admin-modal-overlay" onClick={closeEstimatedDaysForm}>
          <div className="admin-modal estimated-days-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>
                📅 {selectedEstimatedDaysRequest.estimatedCompletionDays ? 'Update' : 'Set'} Estimated Days - {selectedEstimatedDaysRequest.referenceNumber}
              </h3>
              <button 
                className="admin-modal-close"
                onClick={closeEstimatedDaysForm}
              >
                ✕
              </button>
            </div>
            
            <div className="admin-modal-content">
              {error && (
                <div className="payment-error">
                  ⚠️ {error}
                </div>
              )}
              
              <div className="payment-request-info">
                <h4>🔧 Request Information</h4>
                <div className="request-info-grid">
                  <div>
                    <strong>Customer:</strong> {selectedEstimatedDaysRequest.customerEmail}
                  </div>
                  <div>
                    <strong>Device:</strong> {selectedEstimatedDaysRequest.brand} {selectedEstimatedDaysRequest.model}
                  </div>
                  <div>
                    <strong>Issue:</strong> {selectedEstimatedDaysRequest.issue}
                  </div>
                  <div>
                    <strong>Status:</strong> 
                    <span className={`status-badge status-${getStatusClass(selectedEstimatedDaysRequest.status)}`}>
                      {getStatusText(selectedEstimatedDaysRequest.status)}
                    </span>
                  </div>
                </div>
              </div>

              <form onSubmit={handleUpdateEstimatedDays} className="payment-form">
                <div className="payment-form-grid">
                  <div className="payment-form-group">
                    <label>
                      <span>📅</span>
                      Estimated Completion Days *
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="365"
                      value={estimatedDaysData.estimatedCompletionDays}
                      onChange={(e) => setEstimatedDaysData({estimatedCompletionDays: Number(e.target.value)})}
                      placeholder="Enter days (1-365)"
                      required
                    />
                    <small style={{ color: '#666', fontSize: '12px', marginTop: '4px' }}>
                      Enter the estimated number of days to complete this repair (1-365 days)
                    </small>
                  </div>
                </div>

                <div className="payment-summary">
                  <h4>📊 Completion Summary</h4>
                  <div className="summary-grid">
                    <div className="summary-item">
                      <span>Current Estimated Days:</span>
                      <strong>{selectedEstimatedDaysRequest.estimatedCompletionDays || 'Not set'}</strong>
                    </div>
                    <div className="summary-item">
                      <span>New Estimated Days:</span>
                      <strong>{estimatedDaysData.estimatedCompletionDays} days</strong>
                    </div>
                    {estimatedDaysData.estimatedCompletionDays > 0 && (
                      <div className="summary-item summary-remaining">
                        <span>Expected Completion:</span>
                        <strong>
                          {new Date(Date.now() + estimatedDaysData.estimatedCompletionDays * 24 * 60 * 60 * 1000).toLocaleDateString()}
                        </strong>
                      </div>
                    )}
                  </div>
                </div>

                <div className="payment-form-actions">
                  <button 
                    type="submit" 
                    className="admin-btn admin-btn-primary"
                    disabled={loading || estimatedDaysData.estimatedCompletionDays <= 0}
                  >
                    {loading ? "⏳ Processing..." : selectedEstimatedDaysRequest.estimatedCompletionDays ? "📅 Update Days" : "📅 Set Days"}
                  </button>
                  <button 
                    type="button" 
                    className="admin-btn admin-btn-secondary"
                    onClick={closeEstimatedDaysForm}
                    disabled={loading}
                  >
                    ❌ Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Payment Form Modal */}
      {showPaymentForm && selectedPaymentRequest && (
        <div className="admin-modal-overlay" onClick={closePaymentForm}>
          <div className="admin-modal payment-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>
                💰 {selectedPaymentRequest.hasPayment ? 'Update Payment' : 'Add Payment'} - {selectedPaymentRequest.referenceNumber}
              </h3>
              <button 
                className="admin-modal-close"
                onClick={closePaymentForm}
              >
                ✕
              </button>
            </div>
            
            <div className="admin-modal-content">
              {error && (
                <div className="payment-error">
                  ⚠️ {error}
                </div>
              )}
              
              <div className="payment-request-info">
                <h4>📱 Request Information</h4>
                <div className="request-info-grid">
                  <div>
                    <strong>Customer:</strong> {selectedPaymentRequest.customerEmail}
                  </div>
                  <div>
                    <strong>Device:</strong> {selectedPaymentRequest.brand} {selectedPaymentRequest.model}
                  </div>
                  <div>
                    <strong>Issue:</strong> {selectedPaymentRequest.issue}
                  </div>
                  <div>
                    <strong>Status:</strong> 
                    <span className={`status-badge status-${getStatusClass(selectedPaymentRequest.status)}`}>
                      {getStatusText(selectedPaymentRequest.status)}
                    </span>
                  </div>
                </div>
              </div>

              <form onSubmit={handleUpdatePayment} className="payment-form">
                <div className="payment-form-grid">
                  <div className="payment-form-group">
                    <label>
                      <span>💵</span>
                      Total Amount ($) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={paymentData.amount}
                      onChange={(e) => setPaymentData({...paymentData, amount: Number(e.target.value)})}
                      placeholder="0.00"
                      required
                    />
                  </div>

                  <div className="payment-form-group">
                    <label>
                      <span>💳</span>
                      Advanced Payment ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max={paymentData.amount}
                      value={paymentData.advancedPayment || 0}
                      onChange={(e) => setPaymentData({...paymentData, advancedPayment: Number(e.target.value)})}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="payment-summary">
                  <h4>💰 Payment Summary</h4>
                  <div className="summary-grid">
                    <div className="summary-item">
                      <span>Total Amount:</span>
                      <strong>${paymentData.amount.toFixed(2)}</strong>
                    </div>
                    <div className="summary-item">
                      <span>Advanced Payment:</span>
                      <strong>${(paymentData.advancedPayment || 0).toFixed(2)}</strong>
                    </div>
                    <div className="summary-item summary-remaining">
                      <span>Remaining Balance:</span>
                      <strong>${(paymentData.amount - (paymentData.advancedPayment || 0)).toFixed(2)}</strong>
                    </div>
                  </div>
                </div>

                <div className="payment-form-actions">
                  <button 
                    type="submit" 
                    className="admin-btn admin-btn-primary"
                    disabled={loading}
                  >
                    {loading ? "⏳ Processing..." : selectedPaymentRequest.hasPayment ? "💾 Update Payment" : "💰 Add Payment"}
                  </button>
                  <button 
                    type="button" 
                    className="admin-btn admin-btn-secondary"
                    onClick={closePaymentForm}
                    disabled={loading}
                  >
                    ❌ Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
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
                  <p><strong>Email:</strong> {selectedRequest.customerEmail || 'No email'}</p>
                  <p><strong>Customer ID:</strong> {selectedRequest.customerId}</p>
                </div>

                <div className="admin-detail-section">
                  <h4>📱 Device Information</h4>
                  <p><strong>Device:</strong> {selectedRequest.device || 'Not specified'}</p>
                  <p><strong>Brand:</strong> {selectedRequest.brand || 'Not specified'}</p>
                  <p><strong>Model:</strong> {selectedRequest.model || 'Not specified'}</p>
                  <p><strong>Issue:</strong> {selectedRequest.issue || 'No issue description'}</p>
                  <p><strong>Description:</strong> {selectedRequest.description || 'No description'}</p>
                </div>

                <div className="admin-detail-section">
                  <h4>🔧 Repair Information</h4>
                  <p><strong>Status:</strong> 
                    <span className={`status-badge status-${getStatusClass(selectedRequest.status)}`}>
                      {getStatusText(selectedRequest.status)}
                    </span>
                  </p>
                  <p><strong>Submitted:</strong> {
                    selectedRequest.submittedAt 
                      ? new Date(selectedRequest.submittedAt).toLocaleString()
                      : 'Not available'
                  }</p>
                  <p><strong>Estimated Days:</strong> {
                    selectedRequest.estimatedCompletionDays 
                      ? `${selectedRequest.estimatedCompletionDays} days`
                      : 'Not specified'
                  }</p>
                  <p><strong>Technician:</strong> {
                    selectedRequest.technicianEmail || "Not assigned"
                  }</p>
                  <button 
                    className="admin-btn admin-btn-secondary admin-btn-small"
                    onClick={() => {
                      setSelectedRequest(null);
                      openEstimatedDaysForm(selectedRequest);
                    }}
                    style={{ marginTop: '0.5rem', marginRight: '0.5rem' }}
                  >
                    {selectedRequest.estimatedCompletionDays ? '📅 Edit Days' : '📅 Set Days'}
                  </button>
                </div>

                <div className="admin-detail-section">
                  <h4>💰 Payment Information</h4>
                  <p><strong>Payment Status:</strong> {
                    selectedRequest.hasPayment 
                      ? <span className="payment-badge payment-paid">✅ Payment Added</span>
                      : <span className="payment-badge payment-pending">⏳ Payment Pending</span>
                  }</p>
                  {selectedRequest.hasPayment && (
                    <p><strong>Amount:</strong> ${selectedRequest.paymentAmount.toFixed(2)}</p>
                  )}
                  <button 
                    className="admin-btn admin-btn-primary admin-btn-small"
                    onClick={() => {
                      setSelectedRequest(null);
                      openPaymentForm(selectedRequest);
                    }}
                    style={{ marginTop: '0.5rem' }}
                  >
                    {selectedRequest.hasPayment ? '✏️ Edit Payment' : '💰 Add Payment'}
                  </button>
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