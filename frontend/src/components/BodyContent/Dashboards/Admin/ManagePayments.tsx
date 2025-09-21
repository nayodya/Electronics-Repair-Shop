import { useState, useEffect } from "react";
import api from "../../../../services/api";
import "./AdminStyles.css";

interface Payment {
  paymentId: number;
  requestId: number;
  totalAmount: number;
  advancedPayment: number | null;
  paymentDate: string | null;
  repairRequest: {
    referenceNumber: string;
    customer: {
      firstName: string;
      lastName: string;
      email: string;
    };
    device: string;
    brand: string;
    status: number;
  };
}

interface PaymentDto {
  amount: number;
  advancedPayment?: number;
}

const statusMap: Record<number, string> = {
  0: "Received",
  1: "In Progress", 
  2: "Completed",
  3: "Cancelled",
  4: "Ready for Delivery",
  5: "Delivered"
};

const ManagePayments = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [repairs, setRepairs] = useState<any[]>([]);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedRepair, setSelectedRepair] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [paymentData, setPaymentData] = useState<PaymentDto>({
    amount: 0,
    advancedPayment: 0
  });

  useEffect(() => {
    fetchPayments();
    fetchRepairs();
  }, []);

  const fetchPayments = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.get("/Admin/repairs", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Filter repairs that have payment details
      const paymentsData = response.data
        .filter((repair: any) => repair.paymentDetails)
        .map((repair: any) => ({
          paymentId: repair.paymentDetails.paymentId,
          requestId: repair.requestId,
          totalAmount: repair.paymentDetails.totalAmount,
          advancedPayment: repair.paymentDetails.advancedPayment,
          paymentDate: repair.paymentDetails.paymentDate,
          repairRequest: repair
        }));
      
      setPayments(paymentsData);
    } catch (err: any) {
      setError("Failed to fetch payments");
    }
  };

  const fetchRepairs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await api.get("/Admin/repairs", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRepairs(response.data);
    } catch (err: any) {
      setError("Failed to fetch repairs");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRepair) return;

    try {
      const token = localStorage.getItem("token");
      await api.put(`/Admin/repairs/${selectedRepair.requestId}/payment`, paymentData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage("Payment updated successfully!");
      setShowPaymentForm(false);
      setSelectedRepair(null);
      fetchPayments();
      fetchRepairs();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update payment");
    }
  };

  const handleMarkReadyForDelivery = async (requestId: number) => {
    try {
      const token = localStorage.getItem("token");
      await api.put(`/Admin/repairs/${requestId}/ready-for-delivery`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage("Repair marked as ready for delivery!");
      fetchPayments();
      fetchRepairs();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to mark as ready for delivery");
    }
  };

  const openPaymentForm = (repair: any) => {
    setSelectedRepair(repair);
    setPaymentData({
      amount: repair.paymentDetails?.totalAmount || 0,
      advancedPayment: repair.paymentDetails?.advancedPayment || 0
    });
    setShowPaymentForm(true);
  };

  if (loading) return <div className="admin-loading">Loading payments...</div>;

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1>Manage Payments</h1>
      </div>

      {error && <div className="admin-error">{error}</div>}
      {message && <div className="admin-success">{message}</div>}

      {showPaymentForm && selectedRepair && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Update Payment - {selectedRepair.referenceNumber}</h2>
              <button 
                className="close-btn"
                onClick={() => setShowPaymentForm(false)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleUpdatePayment}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Total Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    value={paymentData.amount}
                    onChange={(e) => setPaymentData({...paymentData, amount: Number(e.target.value)})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Advanced Payment</label>
                  <input
                    type="number"
                    step="0.01"
                    value={paymentData.advancedPayment || 0}
                    onChange={(e) => setPaymentData({...paymentData, advancedPayment: Number(e.target.value)})}
                  />
                </div>
              </div>
              <div className="form-actions">
                <button type="submit" className="primary-btn">
                  Update Payment
                </button>
                <button 
                  type="button" 
                  className="secondary-btn"
                  onClick={() => setShowPaymentForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="payments-section">
        <h2>Payment Records</h2>
        <div className="data-table">
          <table>
            <thead>
              <tr>
                <th>Reference</th>
                <th>Customer</th>
                <th>Device</th>
                <th>Total Amount</th>
                <th>Advanced Payment</th>
                <th>Payment Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.paymentId}>
                  <td>{payment.repairRequest.referenceNumber}</td>
                  <td>{`${payment.repairRequest.customer?.firstName || ""} ${payment.repairRequest.customer?.lastName || ""}`.trim()}</td>
                  <td>{`${payment.repairRequest.brand} ${payment.repairRequest.device}`}</td>
                  <td>${payment.totalAmount.toFixed(2)}</td>
                  <td>${(payment.advancedPayment || 0).toFixed(2)}</td>
                  <td>{payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : "Pending"}</td>
                  <td>
                    <span className={`status-badge status-${statusMap[payment.repairRequest.status]?.toLowerCase().replace(" ", "-")}`}>
                      {statusMap[payment.repairRequest.status]}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="edit-btn"
                        onClick={() => openPaymentForm(payment.repairRequest)}
                      >
                        Update
                      </button>
                      {payment.repairRequest.status === 2 && payment.paymentDate && (
                        <button 
                          className="primary-btn"
                          onClick={() => handleMarkReadyForDelivery(payment.requestId)}
                        >
                          Ready for Delivery
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="unpaid-repairs-section">
        <h2>Repairs Without Payment</h2>
        <div className="data-table">
          <table>
            <thead>
              <tr>
                <th>Reference</th>
                <th>Customer</th>
                <th>Device</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {repairs.filter(repair => !repair.paymentDetails).map((repair) => (
                <tr key={repair.requestId}>
                  <td>{repair.referenceNumber}</td>
                  <td>{`${repair.customer?.firstName || ""} ${repair.customer?.lastName || ""}`.trim()}</td>
                  <td>{`${repair.brand} ${repair.device}`}</td>
                  <td>
                    <span className={`status-badge status-${statusMap[repair.status]?.toLowerCase().replace(" ", "-")}`}>
                      {statusMap[repair.status]}
                    </span>
                  </td>
                  <td>
                    <button 
                      className="primary-btn"
                      onClick={() => openPaymentForm(repair)}
                    >
                      Add Payment
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManagePayments;