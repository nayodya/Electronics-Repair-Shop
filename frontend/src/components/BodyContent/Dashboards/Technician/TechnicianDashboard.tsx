// src/pages/CustomerDashboard.tsx
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../../../context/AuthContext";
import api from "../../../../services/api";
import "./TechnicianDashboard.css";

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

const statusMap: Record<number, string> = {
  0: "Received",
  1: "In Progress",
  2: "Completed",
  3: "Cancelled",
};

const TechnicianDashboard = () => {
  const [orders, setOrders] = useState<RepairOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const res = await api.get("/Repair/assigned", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrders(res.data);
      } catch (err: any) {
        setError("Failed to load assigned repairs.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  return (
    <div className="tech-dashboard-container">
      <h2 className="tech-dashboard-section-title">Assigned Repair Orders</h2>
      {loading ? (
        <div className="tech-dashboard-message">Loading...</div>
      ) : error ? (
        <div className="tech-dashboard-error">{error}</div>
      ) : orders.length === 0 ? (
        <div className="tech-dashboard-message">No assigned repair orders.</div>
      ) : (
        <div className="tech-orders-list">
          {orders.map((order) => (
            <div className="tech-order-card" key={order.requestId}>
              <div className="tech-order-header">
                <span className="tech-order-ref">#{order.referenceNumber}</span>
                <span className={`tech-order-status status-${statusMap[order.status]?.toLowerCase().replace(" ", "-")}`}>
                  {statusMap[order.status] || "Unknown"}
                </span>
              </div>
              <div className="tech-order-details">
                <div><strong>Device:</strong> {order.brand} {order.model} ({order.device})</div>
                <div><strong>Issue:</strong> {order.issue}</div>
                <div><strong>Submitted:</strong> {new Date(order.submittedAt).toLocaleString()}</div>
                {order.customerName && (
                  <div><strong>Customer:</strong> {order.customerName}</div>
                )}
              </div>
              {/* You can add action buttons here, e.g. "Update Status" */}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TechnicianDashboard;
