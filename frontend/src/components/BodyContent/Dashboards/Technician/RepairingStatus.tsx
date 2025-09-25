import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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
  const location = useLocation();
  const navigate = useNavigate();
  const order: RepairOrder | undefined = location.state?.order;

  const [repairs, setRepairs] = useState<RepairRequest[]>([]);
  const [selectedRepair, setSelectedRepair] = useState<RepairRequest | null>(null);
  const [status, setStatus] = useState<number>(0);
  const [estimatedDays, setEstimatedDays] = useState<number | ''>('');
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);

  useEffect(() => {
    if (order) {
      // If coming from dashboard with specific order, set it as selected
      const mockRepair: RepairRequest = {
        requestId: order.requestId,
        referenceNumber: order.referenceNumber,
        device: order.device,
        brand: order.brand,
        model: order.model,
        issue: order.issue,
        status: order.status,
        submittedAt: order.submittedAt,
        customer: {
          userId: 0,
          name: order.customerName || '',
          email: '',
          phone: ''
        }
      };
      setSelectedRepair(mockRepair);
      setStatus(order.status);
    } else {
      // Otherwise, fetch all assigned repairs
      fetchAssignedRepairs();
    }
  }, [order]);

  const fetchAssignedRepairs = async () => {
    try {
      setFetchLoading(true);
      const response = await api.get('/technician/assigned-repairs');
      
      if (Array.isArray(response.data)) {
        setRepairs(response.data);
      } else {
        setRepairs([]);
      }
    } catch (err: any) {
      console.error('Error fetching repairs:', err);
      setMessage("Failed to fetch assigned repairs");
    } finally {
      setFetchLoading(false);
    }
  };

  const getStatusOptions = (currentStatus: number) => {
    // Define valid status transitions based on current status
    switch (currentStatus) {
      case 0: // Received
        return [
          { value: 0, label: "Received" },
          { value: 1, label: "In Progress" },
          { value: 3, label: "Cancelled" }
        ];
      case 1: // In Progress
        return [
          { value: 1, label: "In Progress" },
          { value: 2, label: "Completed" },
          { value: 3, label: "Cancelled" }
        ];
      case 2: // Completed
        return [
          { value: 2, label: "Completed" },
          { value: 4, label: "Ready for Delivery" }
        ];
      case 4: // Ready for Delivery
        return [
          { value: 4, label: "Ready for Delivery" },
          { value: 5, label: "Delivered" }
        ];
      default:
        return [
          { value: currentStatus, label: getStatusLabel(currentStatus) }
        ];
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

  const getStatusColor = (statusValue: number): string => {
    switch (statusValue) {
      case 0: return '#ffc107';
      case 1: return '#17a2b8';
      case 2: return '#28a745';
      case 3: return '#dc3545';
      case 4: return '#6f42c1';
      case 5: return '#20c997';
      default: return '#6c757d';
    }
  };

  const canUpdateStatus = (statusValue: number): boolean => {
    return statusValue !== 5 && statusValue !== 3; // Can't update if Delivered or Cancelled
  };

  const handleRepairSelect = (repair: RepairRequest) => {
    setSelectedRepair(repair);
    setStatus(repair.status);
    setEstimatedDays('');
    setMessage('');
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = Number(e.target.value);
    setStatus(newStatus);
    
    // Clear estimated days if not changing to "In Progress"
    if (newStatus !== 1) {
      setEstimatedDays('');
    }
  };

  const handleEstimatedDaysChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEstimatedDays(value === '' ? '' : Number(value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRepair) return;
    
    setLoading(true);
    setMessage("");
    
    try {
      const requestBody: any = {
        status: status
      };

      // Add estimated completion days if status is "In Progress" and days are provided
      if (status === 1 && estimatedDays !== '') {
        requestBody.estimatedCompletionDays = estimatedDays;
      }

      await api.put(`/technician/repair/${selectedRepair.requestId}/status`, requestBody);
      
      setMessage("✅ Status updated successfully!");
      
      // Refresh the repairs list if we're showing all repairs
      if (!order) {
        setTimeout(() => {
          fetchAssignedRepairs();
          setSelectedRepair(null);
          setMessage('');
        }, 1200);
      } else {
        setTimeout(() => navigate(-1), 1200);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.response?.data || "Failed to update status.";
      setMessage(`❌ ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return <div className="repair-status-container loading">Loading assigned repairs...</div>;
  }

  // If we have a specific order from dashboard, show the update form
  if (order || selectedRepair) {
    const currentRepair = selectedRepair || order;
    if (!currentRepair) return null;

    const statusOptions = getStatusOptions(currentRepair.status);
    const showEstimatedDays = status === 1;

    return (
      <div className="repair-status-container">
        <h2>Update Repair Status</h2>
        <div className="repair-status-details">
          <div><strong>Reference:</strong> {currentRepair.referenceNumber}</div>
          <div><strong>Device:</strong> {currentRepair.brand} {currentRepair.model} ({currentRepair.device})</div>
          <div><strong>Issue:</strong> {currentRepair.issue}</div>
          <div><strong>Customer:</strong> {selectedRepair?.customer?.name || ("customerName" in currentRepair ? (currentRepair as RepairOrder).customerName : "") || "N/A"}</div>
          <div><strong>Current Status:</strong> {getStatusLabel(currentRepair.status)}</div>
          <div><strong>Submitted:</strong> {new Date(currentRepair.submittedAt).toLocaleDateString()}</div>
        </div>
        
        <form onSubmit={handleSubmit} className="repair-status-form">
          <label htmlFor="status-select"><strong>New Status:</strong></label>
          <select
            id="status-select"
            value={status}
            onChange={handleStatusChange}
            className="repair-status-select"
            disabled={loading}
          >
            {statusOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>

          {showEstimatedDays && (
            <div className="estimated-days-section">
              <label htmlFor="estimated-days"><strong>Estimated Completion Days:</strong></label>
              <input
                id="estimated-days"
                type="number"
                value={estimatedDays}
                onChange={handleEstimatedDaysChange}
                placeholder="Enter estimated days (optional)"
                className="repair-status-input"
                min="1"
                disabled={loading}
              />
            </div>
          )}

          <div className="repair-status-actions">
            <button
              type="submit"
              className="repair-status-btn"
              disabled={loading}
            >
              {loading ? "Saving..." : "Update Status"}
            </button>
            <button
              type="button"
              className="repair-status-back"
              onClick={() => order ? navigate(-1) : setSelectedRepair(null)}
              disabled={loading}
            >
              {order ? "Cancel" : "Back to List"}
            </button>
          </div>
          {message && <div className="repair-status-message">{message}</div>}
        </form>
      </div>
    );
  }

  // Show all assigned repairs list
  return (
    <div className="repair-status-container">
      <h2>Assigned Repairs</h2>
      
      {repairs.length === 0 ? (
        <div className="no-repairs">
          <p>No repairs assigned yet.</p>
          <button 
            className="repair-status-back"
            onClick={() => navigate(-1)}
          >
            Back to Dashboard
          </button>
        </div>
      ) : (
        <div className="repairs-list">
          {repairs.map(repair => (
            <div key={repair.requestId} className="repair-item">
              <div className="repair-item-header">
                <h3>#{repair.referenceNumber}</h3>
                <span 
                  className="status-badge" 
                  style={{ backgroundColor: getStatusColor(repair.status) }}
                >
                  {getStatusLabel(repair.status)}
                </span>
              </div>
              
              <div className="repair-item-details">
                <p><strong>Device:</strong> {repair.brand} {repair.model} ({repair.device})</p>
                <p><strong>Issue:</strong> {repair.issue}</p>
                {repair.description && (
                  <p><strong>Description:</strong> {repair.description}</p>
                )}
                <p><strong>Customer:</strong> {repair.customer?.name || 'N/A'}</p>
                <p><strong>Phone:</strong> {repair.customer?.phone || 'N/A'}</p>
                <p><strong>Email:</strong> {repair.customer?.email || 'N/A'}</p>
                <p><strong>Submitted:</strong> {new Date(repair.submittedAt).toLocaleDateString()}</p>
                {repair.estimatedCompletionDays && (
                  <p><strong>Est. Completion:</strong> {repair.estimatedCompletionDays} days</p>
                )}
              </div>

              <div className="repair-item-actions">
                {canUpdateStatus(repair.status) ? (
                  <button 
                    className="update-status-btn"
                    onClick={() => handleRepairSelect(repair)}
                  >
                    Update Status
                  </button>
                ) : (
                  <span className="status-final">Status cannot be changed</span>
                )}
              </div>
            </div>
          ))}
          
          <div className="back-section">
            <button 
              className="repair-status-back"
              onClick={() => navigate(-1)}
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RepairingStatus;