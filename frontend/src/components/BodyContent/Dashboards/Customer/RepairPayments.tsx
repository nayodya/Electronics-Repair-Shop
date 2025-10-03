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
  const [activeTab, setActiveTab] = useState("all");
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

  const getStatusClass = (status: string | undefined | null) => {
    if (!status || typeof status !== 'string') return "received";
    
    switch (status.toLowerCase()) {
      case "received": return "received";
      case "inprogress": return "inprogress";
      case "completed": return "completed";
      case "readyfordelivery": return "completed";
      case "delivered": return "completed";
      default: return "received";
    }
  };

  const getPaymentStatusClass = (payment: Payment | null) => {
    if (!payment) return "unpaid";
    if (payment.isPaid) return "paid";
    return "unpaid";
  };

  const getPaymentStatusText = (payment: Payment | null) => {
    if (!payment) return "No Quote";
    if (payment.isPaid) return "Paid";
    if (payment.advancedPayment && payment.advancedPayment > 0) return "Partial";
    return "Pending";
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
      day: 'numeric'
    });
  };

  const formatStatus = (status: string | undefined | null) => {
    if (!status || typeof status !== 'string') return "Unknown";
    
    return status.replace(/([A-Z])/g, ' $1')
                .replace(/^./, str => str.toUpperCase())
                .trim();
  };

  const filteredRepairs = repairs.filter(repair => {
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

    const matchesTab = activeTab === "all" || 
                      (activeTab === "paid" && repair.paymentDetails?.isPaid) ||
                      (activeTab === "pending" && repair.paymentDetails && !repair.paymentDetails.isPaid) ||
                      (activeTab === "no-quote" && !repair.paymentDetails);

    return matchesSearch && matchesStatus && matchesPayment && matchesTab;
  });

  const getTabCount = (tab: string) => {
    if (tab === "all") return repairs.length;
    if (tab === "paid") return repairs.filter(r => r.paymentDetails?.isPaid).length;
    if (tab === "pending") return repairs.filter(r => r.paymentDetails && !r.paymentDetails.isPaid).length;
    if (tab === "no-quote") return repairs.filter(r => !r.paymentDetails).length;
    return 0;
  };

  const calculateTotals = () => {
    const totalAmount = repairs
      .filter(r => r.paymentDetails)
      .reduce((sum, r) => sum + (r.paymentDetails?.totalAmount || 0), 0);

    const paidAmount = repairs
      .filter(r => r.paymentDetails?.isPaid)
      .reduce((sum, r) => sum + (r.paymentDetails?.totalAmount || 0), 0);

    const pendingAmount = repairs
      .filter(r => r.paymentDetails && !r.paymentDetails.isPaid)
      .reduce((sum, r) => sum + ((r.paymentDetails?.totalAmount || 0) - (r.paymentDetails?.advancedPayment || 0)), 0);

    return { totalAmount, paidAmount, pendingAmount };
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setPaymentFilter("all");
  };

  if (loading) {
    return <div className="loading">Loading payment details...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  const { totalAmount, paidAmount, pendingAmount } = calculateTotals();

  return (
    <div className="manage-payments">
      <div className="header">
        <h1>My Payment History</h1>
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
          All Payments ({getTabCount("all")})
        </button>
        <button 
          className={`tab ${activeTab === "paid" ? "active" : ""}`}
          onClick={() => setActiveTab("paid")}
        >
          Paid ({getTabCount("paid")})
        </button>
        <button 
          className={`tab ${activeTab === "pending" ? "active" : ""}`}
          onClick={() => setActiveTab("pending")}
        >
          Pending ({getTabCount("pending")})
        </button>
        <button 
          className={`tab ${activeTab === "no-quote" ? "active" : ""}`}
          onClick={() => setActiveTab("no-quote")}
        >
          No Quote ({getTabCount("no-quote")})
        </button>
      </div>

      <div className="filters-container">
        <div className="filter-row">
          <input
            type="text"
            placeholder="Search by reference number, device, brand or model..."
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
            <option value="readyfordelivery">Ready for Delivery</option>
            <option value="delivered">Delivered</option>
          </select>
          <select 
            value={paymentFilter} 
            onChange={(e) => setPaymentFilter(e.target.value)}
          >
            <option value="all">All Payments</option>
            <option value="paid">Fully Paid</option>
            <option value="pending">Payment Pending</option>
            <option value="no-quote">No Quote Yet</option>
          </select>
          <button onClick={clearFilters}>Clear Filters</button>
        </div>
      </div>

      <div className="table-container">
        <table className="payments-table">
          <thead>
            <tr>
              <th>Reference #</th>
              <th>Device</th>
              <th>Repair Status</th>
              <th>Payment Status</th>
              <th>Total Amount</th>
              <th>Paid Amount</th>
              <th>Balance</th>
              <th>Submitted Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredRepairs.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '40px' }}>
                  <div>
                    <h3>No payment records found</h3>
                    <p>
                      {activeTab === "all" 
                        ? "You haven't submitted any repair requests yet." 
                        : `No payments with status "${activeTab}" found.`
                      }
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredRepairs.map((repair) => (
                <tr key={repair.requestId}>
                  <td data-label="Reference #">
                    <strong>{repair.referenceNumber || "N/A"}</strong>
                  </td>
                  <td data-label="Device">
                    <div>
                      <strong>{repair.brand} {repair.model}</strong>
                      <br />
                      <small>{repair.device}</small>
                    </div>
                  </td>
                  <td data-label="Repair Status">
                    <span className={`status-badge ${getStatusClass(repair.status)}`}>
                      {formatStatus(repair.status)}
                    </span>
                  </td>
                  <td data-label="Payment Status">
                    <span className={`status-badge ${getPaymentStatusClass(repair.paymentDetails)}`}>
                      {getPaymentStatusText(repair.paymentDetails)}
                    </span>
                  </td>
                  <td data-label="Total Amount">
                    {repair.paymentDetails ? formatCurrency(repair.paymentDetails.totalAmount) : "Pending Quote"}
                  </td>
                  <td data-label="Paid Amount">
                    {repair.paymentDetails ? 
                      formatCurrency((repair.paymentDetails.totalAmount || 0) - (repair.paymentDetails.remainingBalance || 0)) : 
                      "-"
                    }
                  </td>
                  <td data-label="Balance">
                    {repair.paymentDetails ? 
                      <span className={repair.paymentDetails.remainingBalance > 0 ? "text-danger" : "text-success"}>
                        {formatCurrency(repair.paymentDetails.remainingBalance)}
                      </span> : 
                      "-"
                    }
                  </td>
                  <td data-label="Submitted Date">
                    {formatDate(repair.submittedAt)}
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
              <h3>Total Quoted</h3>
              <p className="stat-number">{formatCurrency(totalAmount)}</p>
            </div>
            <div className="stat-card">
              <h3>Total Paid</h3>
              <p className="stat-number success">{formatCurrency(paidAmount)}</p>
            </div>
            <div className="stat-card">
              <h3>Pending Balance</h3>
              <p className="stat-number warning">{formatCurrency(pendingAmount)}</p>
            </div>
            <div className="stat-card">
              <h3>Repair Requests</h3>
              <p className="stat-number">{repairs.length}</p>
            </div>
          </div>

          <div className="monthly-stats">
            <h3>Payment Summary</h3>
            <div className="monthly-grid">
              <div className="monthly-card">
                <h4>Completed Payments</h4>
                <p>Count: {repairs.filter(r => r.paymentDetails?.isPaid).length}</p>
                <p>Amount: {formatCurrency(paidAmount)}</p>
              </div>
              <div className="monthly-card">
                <h4>Outstanding Payments</h4>
                <p>Count: {repairs.filter(r => r.paymentDetails && !r.paymentDetails.isPaid).length}</p>
                <p>Amount: {formatCurrency(pendingAmount)}</p>
              </div>
              <div className="monthly-card">
                <h4>Awaiting Quote</h4>
                <p>Count: {repairs.filter(r => !r.paymentDetails).length}</p>
                <p>Status: Under Evaluation</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RepairPayments;