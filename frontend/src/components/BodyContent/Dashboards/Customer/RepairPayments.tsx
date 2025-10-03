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
  status: number; // Added missing status field
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
  }, [token]); // Added token dependency

  const fetchRepairs = async () => {
    try {
      setLoading(true);
      const response = await api.get("/Repair/my-requests", {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log("Repairs API response:", response.data); // Debug log
      
      // Map the response to match our interface
      const mappedRepairs: RepairRequest[] = response.data.map((item: any) => ({
        requestId: item.requestId || item.id,
        referenceNumber: item.referenceNumber || "N/A",
        device: item.device || item.deviceType || "Unknown Device",
        brand: item.brand || "Unknown Brand",
        model: item.model || "Unknown Model",
        issue: item.issue || item.description || "",
        description: item.description || item.issue || "",
        status: item.status || 0,
        submittedAt: item.submittedAt || item.createdAt || new Date().toISOString(),
        estimatedCompletionDays: item.estimatedCompletionDays || null,
        customer: {
          userId: item.customer?.userId || item.customerId || 0,
          name: item.customer?.name || item.customerName || "Unknown",
          email: item.customer?.email || item.customerEmail || "",
          phoneNumber: item.customer?.phoneNumber || item.customerPhone || ""
        },
        technician: item.technician ? {
          userId: item.technician.userId || 0,
          name: item.technician.name || "Unassigned",
          email: item.technician.email || ""
        } : null,
        paymentDetails: item.paymentDetails ? {
          paymentId: item.paymentDetails.paymentId || 0,
          requestId: item.requestId || item.id,
          totalAmount: item.paymentDetails.totalAmount || 0,
          advancedPayment: item.paymentDetails.advancedPayment || null,
          remainingBalance: item.paymentDetails.remainingBalance || 0,
          paymentDate: item.paymentDetails.paymentDate || null,
          isPaid: item.paymentDetails.isPaid || false
        } : null
      }));
      
      console.log("Mapped repairs:", mappedRepairs); // Debug log
      setRepairs(mappedRepairs);
    } catch (err: any) {
      console.error("Error fetching repairs:", err);
      setError("Failed to fetch repair requests: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Add status mapping functions
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

  const getStatusClass = (statusValue: number) => {
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

  const getPaymentStatusClass = (payment: Payment | null) => {
    if (!payment) return "unpaid";
    if (payment.isPaid) return "paid";
    if (payment.advancedPayment && payment.advancedPayment > 0) return "partial";
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

  const filteredRepairs = repairs.filter(repair => {
    const referenceNumber = repair.referenceNumber || "";
    const device = repair.device || "";
    const brand = repair.brand || "";
    const model = repair.model || "";

    const matchesSearch = referenceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         device.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         model.toLowerCase().includes(searchTerm.toLowerCase());

    // Fix the status filter - it was referencing undefined 'status' variable
    const matchesStatus = statusFilter === "all" || repair.status.toString() === statusFilter;
    
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

    // Fix: Calculate paid amount correctly
    const paidAmount = repairs
      .filter(r => r.paymentDetails)
      .reduce((sum, r) => {
        if (r.paymentDetails?.isPaid) {
          // If fully paid, the paid amount is the total amount
          return sum + (r.paymentDetails.totalAmount || 0);
        } else if (r.paymentDetails?.advancedPayment) {
          // If partially paid, add the advanced payment
          return sum + (r.paymentDetails.advancedPayment || 0);
        }
        return sum;
      }, 0);

    const pendingAmount = repairs
      .filter(r => r.paymentDetails && !r.paymentDetails.isPaid)
      .reduce((sum, r) => sum + (r.paymentDetails?.remainingBalance || 0), 0);

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
            <option value="0">Received</option>
            <option value="1">In Progress</option>
            <option value="2">Completed</option>
            <option value="3">Cancelled</option>
            <option value="4">Ready for Delivery</option>
            <option value="5">Delivered</option>
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
                    <strong>{repair.referenceNumber}</strong>
                  </td>
                  <td data-label="Device">
                    <div>
                      <strong>{repair.brand} {repair.model}</strong>
                      <br />
                      <small>{repair.device}</small>
                    </div>
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
                      (() => {
                        if (repair.paymentDetails.isPaid) {
                          return formatCurrency(repair.paymentDetails.totalAmount);
                        } else if (repair.paymentDetails.advancedPayment) {
                          return formatCurrency(repair.paymentDetails.advancedPayment);
                        } else {
                          return formatCurrency(0);
                        }
                      })() : 
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