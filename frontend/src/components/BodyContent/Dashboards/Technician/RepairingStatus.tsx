import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../../../services/api";
import "./RepairingStatus.css";

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

const statusOptions = [
  { value: 0, label: "Received" },
  { value: 1, label: "In Progress" },
  { value: 2, label: "Completed" },
  { value: 3, label: "Cancelled" },
];

const RepairingStatus = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const order: RepairOrder | undefined = location.state?.order;

  const [status, setStatus] = useState<number>(order?.status ?? 0);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!order) {
      setMessage("No repair order selected.");
    }
  }, [order]);

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatus(Number(e.target.value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;
    setLoading(true);
    setMessage("");
    try {
      const token = localStorage.getItem("token");
      await api.put(`/Repair/update-status/${order.requestId}`, { status }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage("✅ Status updated successfully!");
      setTimeout(() => navigate(-1), 1200);
    } catch (err) {
      setMessage("❌ Failed to update status.");
    } finally {
      setLoading(false);
    }
  };

  if (!order) {
    return (
      <div className="repair-status-container">
        <p>{message || "No repair order found."}</p>
        <button className="repair-status-back" onClick={() => navigate(-1)}>Back</button>
      </div>
    );
  }

  return (
    <div className="repair-status-container">
      <h2>Update Repair Status</h2>
      <div className="repair-status-details">
        <div><strong>Reference:</strong> {order.referenceNumber}</div>
        <div><strong>Device:</strong> {order.brand} {order.model} ({order.device})</div>
        <div><strong>Issue:</strong> {order.issue}</div>
        <div><strong>Customer:</strong> {order.customerName || "N/A"}</div>
      </div>
      <form onSubmit={handleSubmit} className="repair-status-form">
        <label htmlFor="status-select"><strong>Status:</strong></label>
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
        <div className="repair-status-actions">
          <button
            type="submit"
            className="repair-status-btn"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save"}
          </button>
          <button
            type="button"
            className="repair-status-back"
            onClick={() => navigate(-1)}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
        {message && <div className="repair-status-message">{message}</div>}
      </form>
    </div>
  );
};

export default RepairingStatus;