import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../../../../services/api";
import "./RepairPayments.css";

interface Payment {
  paymentId: number;
  requestId: number;
  totalAmount: number;
  advancedPayment: number | null;
  remainingBalance: number;
  paymentDate: string | null;
  isPaid: boolean;
}

interface RepairRequest {
  requestId: number;
  referenceNumber: string;
  device: string;
  brand: string;
  model: string;
  issue: string;
  description: string;
  status: string;
  submittedAt: string;
  estimatedCompletionDays: number | null;
  customer: {
    userId: number;
    name: string;
    email: string;
    phoneNumber: string;
  };
  technician: {
    userId: number;
    name: string;
    email: string;
  } | null;
  paymentDetails: Payment | null;
}

const RepairPayments = () => {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [repairs, setRepairs] = useState<RepairRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");

  useEffect(() => {
    fetchRepairs();
  }, []);

  const fetchRepairs = async () => {
    try {
      setLoading(true);
      const response = await api.get("Repair/my-requests", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRepairs(response.data);
    } catch (err: any) {
      setError("Failed to fetch repair requests");
      console.error("Error fetching repairs:", err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string | undefined | null) => {
    if (!status || typeof status !== 'string') return "status-default";
    
    switch (status.toLowerCase()) {
      case "received": return "status-received";
      case "inprogress": return "status-inprogress";
      case "completed": return "status-completed";
      case "readyfordelivery": return "status-ready";
      case "delivered": return "status-delivered";
      default: return "status-default";
    }
  };

  const getPaymentStatusColor = (payment: Payment | null) => {
    if (!payment) return "payment-no-quote";
    if (payment.isPaid) return "payment-paid";
    return "payment-pending";
  };

  const getPaymentStatusText = (payment: Payment | null) => {
    if (!payment) return "No Quote Yet";
    if (payment.isPaid) return "Fully Paid";
    if (payment.advancedPayment && payment.advancedPayment > 0) return "Partially Paid";
    return "Payment Pending";
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatStatus = (status: string | undefined | null) => {
    if (!status || typeof status !== 'string') return "Unknown";
    
    return status.replace(/([A-Z])/g, ' $1')
                .replace(/^./, str => str.toUpperCase())
                .trim();
  };

  const filteredRepairs = repairs.filter(repair => {
    // Safe string operations with null checks
    const referenceNumber = repair.referenceNumber || "";
    const device = repair.device || "";
    const brand = repair.brand || "";
    const model = repair.model || "";
    const status = repair.status || "";

    const matchesSearch = referenceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         device.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         model.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || status.toLowerCase() === statusFilter.toLowerCase();
    
    const matchesPayment = paymentFilter === "all" || 
                          (paymentFilter === "paid" && repair.paymentDetails?.isPaid) ||
                          (paymentFilter === "pending" && repair.paymentDetails && !repair.paymentDetails.isPaid) ||
                          (paymentFilter === "no-quote" && !repair.paymentDetails);

    return matchesSearch && matchesStatus && matchesPayment;
  });

  const calculateTotals = () => {
    const totalAmount = filteredRepairs
      .filter(r => r.paymentDetails)
      .reduce((sum, r) => sum + (r.paymentDetails?.totalAmount || 0), 0);

    const paidAmount = filteredRepairs
      .filter(r => r.paymentDetails?.isPaid)
      .reduce((sum, r) => sum + (r.paymentDetails?.totalAmount || 0), 0);

    const pendingAmount = filteredRepairs
      .filter(r => r.paymentDetails && !r.paymentDetails.isPaid)
      .reduce((sum, r) => sum + ((r.paymentDetails?.totalAmount || 0) - (r.paymentDetails?.advancedPayment || 0)), 0);

    return { totalAmount, paidAmount, pendingAmount };
  };

  const { totalAmount, paidAmount, pendingAmount } = calculateTotals();

  if (loading) {
    return (
      <div className="payments-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading payment details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="payments-container">
      <div className="payments-header">
        <button
          className="back-button"
          onClick={() => navigate("/customer/dashboard")}
        >
          ← Back to Dashboard
        </button>
        <div className="header-content">
          <h1>Payment Details</h1>
          <p>View and track payment information for your repair requests</p>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      {/* Payment Summary Cards */}
      <div className="payments-summary">
        <div className="summary-card total">
          <div className="card-icon">💰</div>
          <div className="card-content">
            <h3>Total Quoted</h3>
            <span className="summary-amount">{formatCurrency(totalAmount)}</span>
            <span className="summary-count">{filteredRepairs.filter(r => r.paymentDetails).length} repairs</span>
          </div>
        </div>
        
        <div className="summary-card paid">
          <div className="card-icon">✅</div>
          <div className="card-content">
            <h3>Paid Amount</h3>
            <span className="summary-amount">{formatCurrency(paidAmount)}</span>
            <span className="summary-count">{filteredRepairs.filter(r => r.paymentDetails?.isPaid).length} completed</span>
          </div>
        </div>
        
        <div className="summary-card pending">
          <div className="card-icon">⏳</div>
          <div className="card-content">
            <h3>Pending Payment</h3>
            <span className="summary-amount">{formatCurrency(pendingAmount)}</span>
            <span className="summary-count">{filteredRepairs.filter(r => r.paymentDetails && !r.paymentDetails.isPaid).length} outstanding</span>
          </div>
        </div>
        
        <div className="summary-card no-quote">
          <div className="card-icon">📋</div>
          <div className="card-content">
            <h3>Awaiting Quote</h3>
            <span className="summary-amount">-</span>
            <span className="summary-count">{filteredRepairs.filter(r => !r.paymentDetails).length} repairs</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="payments-filters">
        <div className="search-bar">
          <div className="search-input-container">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search by reference number, device, brand, or model..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        <div className="filter-controls">
          <div className="filter-group">
            <label>Repair Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Statuses</option>
              <option value="received">Received</option>
              <option value="inprogress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="readyfordelivery">Ready for Delivery</option>
              <option value="delivered">Delivered</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Payment Status:</label>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Payments</option>
              <option value="paid">Fully Paid</option>
              <option value="pending">Payment Pending</option>
              <option value="no-quote">No Quote Yet</option>
            </select>
          </div>
        </div>
      </div>

      {/* Payment Details List */}
      <div className="payments-list">
        {filteredRepairs.length === 0 ? (
          <div className="no-data">
            <div className="no-data-icon">💳</div>
            <h3>No repairs found</h3>
            <p>No repair requests match your current filters.</p>
            <button 
              className="create-repair-btn"
              onClick={() => navigate("/customer/add-repair")}
            >
              Submit New Repair Request
            </button>
          </div>
        ) : (
          filteredRepairs.map((repair) => (
            <div key={repair.requestId} className="payment-card">
              <div className="payment-card-header">
                <div className="repair-info">
                  <div className="reference-row">
                    <h3 className="reference-number">#{repair.referenceNumber || "N/A"}</h3>
                    <div className="status-badges">
                      <span className={`status-badge ${getStatusColor(repair.status)}`}>
                        {formatStatus(repair.status)}
                      </span>
                      <span className={`payment-badge ${getPaymentStatusColor(repair.paymentDetails)}`}>
                        {getPaymentStatusText(repair.paymentDetails)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="device-info">
                    <span className="device-name">{repair.brand || "Unknown"} {repair.model || "Unknown"}</span>
                    <span className="device-type">({repair.device || "Unknown"})</span>
                  </div>
                  
                  <p className="issue-summary">{repair.issue || "No issue description provided"}</p>
                  
                  <div className="timestamps">
                    <span className="submitted-date">
                      📅 Submitted: {repair.submittedAt ? formatDate(repair.submittedAt) : "Unknown"}
                    </span>
                    {repair.estimatedCompletionDays && (
                      <span className="estimated-days">
                        ⏱️ Est. {repair.estimatedCompletionDays} days
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="payment-card-body">
                {repair.paymentDetails ? (
                  <div className="payment-details">
                    <div className="payment-breakdown">
                      <div className="amount-section">
                        <h4>💰 Payment Breakdown</h4>
                        
                        <div className="amount-rows">
                          <div className="amount-row total">
                            <span className="label">Total Quote:</span>
                            <span className="amount">
                              {formatCurrency(repair.paymentDetails.totalAmount || 0)}
                            </span>
                          </div>
                          
                          {repair.paymentDetails.advancedPayment && repair.paymentDetails.advancedPayment > 0 && (
                            <div className="amount-row advanced">
                              <span className="label">Advanced Payment:</span>
                              <span className="amount">
                                -{formatCurrency(repair.paymentDetails.advancedPayment)}
                              </span>
                            </div>
                          )}
                          
                          <div className="amount-row remaining">
                            <span className="label">Remaining Balance:</span>
                            <span className={`amount ${(repair.paymentDetails.remainingBalance || 0) > 0 ? 'outstanding' : 'zero'}`}>
                              {formatCurrency(repair.paymentDetails.remainingBalance || 0)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {repair.paymentDetails.paymentDate && (
                        <div className="payment-date-section">
                          <div className="payment-completed">
                            <span className="completed-icon">✅</span>
                            <div className="completed-info">
                              <strong>Payment Completed</strong>
                              <span className="payment-date">
                                {formatDate(repair.paymentDetails.paymentDate)}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {!repair.paymentDetails.isPaid && (repair.paymentDetails.remainingBalance || 0) > 0 && (
                      <div className="payment-actions">
                        <div className="payment-notice">
                          <div className="notice-icon">💡</div>
                          <div className="notice-content">
                            <h5>Payment Required</h5>
                            <p>
                              Please complete your payment of{' '}
                              <strong>{formatCurrency(repair.paymentDetails.remainingBalance || 0)}</strong>
                            </p>
                            <div className="payment-methods">
                              <p><strong>Payment Options:</strong></p>
                              <ul>
                                <li>💳 Visit our office for card payment</li>
                                <li>💰 Cash payment at pickup</li>
                                <li>📞 Call us at (555) 123-4567 for other methods</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {repair.technician && (
                      <div className="technician-info">
                        <span className="technician-label">👨‍🔧 Assigned Technician:</span>
                        <span className="technician-name">{repair.technician.name || "Unknown"}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="no-payment-info">
                    <div className="quote-pending">
                      <div className="pending-icon">⏳</div>
                      <div className="pending-content">
                        <h4>Quote Pending</h4>
                        <p>Our technicians are evaluating your device to provide an accurate repair quote.</p>
                        <div className="quote-timeline">
                          <div className="timeline-item active">
                            <span className="timeline-dot">✅</span>
                            <span>Device Received</span>
                          </div>
                          <div className="timeline-item current">
                            <span className="timeline-dot">⏳</span>
                            <span>Diagnosis in Progress</span>
                          </div>
                          <div className="timeline-item">
                            <span className="timeline-dot">⭕</span>
                            <span>Quote Preparation</span>
                          </div>
                          <div className="timeline-item">
                            <span className="timeline-dot">⭕</span>
                            <span>Customer Notification</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Help Section */}
      <div className="help-section">
        <h3>💡 Need Help?</h3>
        <div className="help-content">
          <div className="help-item">
            <strong>📞 Phone:</strong> (555) 123-4567
          </div>
          <div className="help-item">
            <strong>📧 Email:</strong> support@repairshop.com
          </div>
          <div className="help-item">
            <strong>🕒 Business Hours:</strong> Mon-Fri 9:00 AM - 6:00 PM
          </div>
        </div>
      </div>
    </div>
  );
};

export default RepairPayments;