import React, { useState, useEffect } from 'react';
import api from '../../../../services/api';
import './ManagePayments.css';

interface Payment {
  paymentId: number;
  requestId: number;
  referenceNumber: string;
  customerEmail: string;
  customerName: string;
  device: string;
  totalAmount: number;
  advancedPayment?: number;
  remainingBalance: number;
  paymentDate?: string;
  isPaid: boolean;
  repairStatus: string;
  createdAt: string;
}

interface PaymentStatistics {
  totalPayments: number;
  paidPayments: number;
  pendingPayments: number;
  totalRevenue: number;
  pendingAmount: number;
  averagePaymentAmount: number;
  totalAdvancedPayments: number;
  monthlyPayments: Array<{
    year: number;
    month: number;
    monthName: string;
    revenue: number;
    paymentCount: number;
  }>;
}

interface PaymentFilter {
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  isPaid?: boolean;
  requestId?: number;
  sortBy?: string;
  sortOrder?: string;
  pageNumber?: number;
  pageSize?: number;
}

interface CreatePaymentForm {
  totalAmount: number;
  advancedPayment?: number;
  paymentDate?: string;
}

interface UpdatePaymentForm {
  totalAmount: number;
  advancedPayment?: number;
  paymentDate?: string;
}

const ManagePayments: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [statistics, setStatistics] = useState<PaymentStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'completed' | 'statistics'>('all');
  const [filter, setFilter] = useState<PaymentFilter>({});
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedRepairId, setSelectedRepairId] = useState<number | null>(null);
  const [selectedPaymentId, setSelectedPaymentId] = useState<number | null>(null);
  const [createForm, setCreateForm] = useState<CreatePaymentForm>({
    totalAmount: 0
  });
  const [updateForm, setUpdateForm] = useState<UpdatePaymentForm>({
    totalAmount: 0
  });

  useEffect(() => {
    fetchPayments();
    fetchStatistics();
  }, [activeTab, filter]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      let url = '/admin/payments';
      
      if (activeTab === 'pending') {
        url = '/admin/payments/pending';
      } else if (activeTab === 'completed') {
        url = '/admin/payments/completed';
      }

      // Add filter parameters
      const params = new URLSearchParams();
      if (filter.startDate) params.append('startDate', filter.startDate);
      if (filter.endDate) params.append('endDate', filter.endDate);
      if (filter.minAmount) params.append('minAmount', filter.minAmount.toString());
      if (filter.maxAmount) params.append('maxAmount', filter.maxAmount.toString());
      if (filter.isPaid !== undefined) params.append('isPaid', filter.isPaid.toString());
      if (filter.requestId) params.append('requestId', filter.requestId.toString());
      if (filter.sortBy) params.append('sortBy', filter.sortBy);
      if (filter.sortOrder) params.append('sortOrder', filter.sortOrder);
      if (filter.pageNumber) params.append('pageNumber', filter.pageNumber.toString());
      if (filter.pageSize) params.append('pageSize', filter.pageSize.toString());

      if (params.toString() && activeTab === 'all') {
        url += `?${params.toString()}`;
      }

      const response = await api.get(url);
      setPayments(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch payments');
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await api.get('/admin/payments/statistics');
      setStatistics(response.data);
    } catch (err: any) {
      console.error('Failed to fetch statistics:', err);
    }
  };

  const handleCreatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRepairId) return;

    try {
      await api.post(`/admin/repairs/${selectedRepairId}/payment`, createForm);
      setShowCreateModal(false);
      setCreateForm({ totalAmount: 0 });
      setSelectedRepairId(null);
      fetchPayments();
      alert('Payment created successfully!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create payment');
    }
  };

  const handleUpdatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPaymentId) return;

    try {
      await api.put(`/admin/payments/${selectedPaymentId}`, updateForm);
      setShowUpdateModal(false);
      setUpdateForm({ totalAmount: 0 });
      setSelectedPaymentId(null);
      fetchPayments();
      alert('Payment updated successfully!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update payment');
    }
  };

  const handleMarkAsPaid = async (paymentId: number) => {
    if (!confirm('Mark this payment as paid?')) return;

    try {
      await api.put(`/admin/payments/${paymentId}/mark-paid`, {
        paymentDate: new Date().toISOString()
      });
      fetchPayments();
      alert('Payment marked as paid successfully!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to mark payment as paid');
    }
  };

  const handleDeletePayment = async (paymentId: number) => {
    if (!confirm('Are you sure you want to delete this payment?')) return;

    try {
      await api.delete(`/admin/payments/${paymentId}`);
      fetchPayments();
      alert('Payment deleted successfully!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete payment');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not paid';
    return new Date(dateString).toLocaleDateString();
  };

  const openCreateModal = (repairId: number) => {
    setSelectedRepairId(repairId);
    setShowCreateModal(true);
  };

  const openUpdateModal = (payment: Payment) => {
    setSelectedPaymentId(payment.paymentId);
    setUpdateForm({
      totalAmount: payment.totalAmount,
      advancedPayment: payment.advancedPayment || undefined,
      paymentDate: payment.paymentDate || undefined
    });
    setShowUpdateModal(true);
  };

  const renderStatistics = () => {
    if (!statistics) return <div>Loading statistics...</div>;

    return (
      <div className="statistics-container">
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Payments</h3>
            <p className="stat-number">{statistics.totalPayments}</p>
          </div>
          <div className="stat-card">
            <h3>Paid Payments</h3>
            <p className="stat-number success">{statistics.paidPayments}</p>
          </div>
          <div className="stat-card">
            <h3>Pending Payments</h3>
            <p className="stat-number warning">{statistics.pendingPayments}</p>
          </div>
          <div className="stat-card">
            <h3>Total Revenue</h3>
            <p className="stat-number">{formatCurrency(statistics.totalRevenue)}</p>
          </div>
          <div className="stat-card">
            <h3>Pending Amount</h3>
            <p className="stat-number warning">{formatCurrency(statistics.pendingAmount)}</p>
          </div>
          <div className="stat-card">
            <h3>Average Payment</h3>
            <p className="stat-number">{formatCurrency(statistics.averagePaymentAmount)}</p>
          </div>
        </div>

        <div className="monthly-stats">
          <h3>Monthly Revenue</h3>
          <div className="monthly-grid">
            {statistics.monthlyPayments.map((month, index) => (
              <div key={index} className="monthly-card">
                <h4>{month.monthName}</h4>
                <p>Revenue: {formatCurrency(month.revenue)}</p>
                <p>Payments: {month.paymentCount}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderFilters = () => (
    <div className="filters-container">
      <div className="filter-row">
        <input
          type="date"
          placeholder="Start Date"
          value={filter.startDate || ''}
          onChange={(e) => setFilter({ ...filter, startDate: e.target.value })}
        />
        <input
          type="date"
          placeholder="End Date"
          value={filter.endDate || ''}
          onChange={(e) => setFilter({ ...filter, endDate: e.target.value })}
        />
        <input
          type="number"
          placeholder="Min Amount"
          value={filter.minAmount || ''}
          onChange={(e) => setFilter({ ...filter, minAmount: parseFloat(e.target.value) || undefined })}
        />
        <input
          type="number"
          placeholder="Max Amount"
          value={filter.maxAmount || ''}
          onChange={(e) => setFilter({ ...filter, maxAmount: parseFloat(e.target.value) || undefined })}
        />
        <select
          value={filter.isPaid === undefined ? '' : filter.isPaid.toString()}
          onChange={(e) => setFilter({ ...filter, isPaid: e.target.value === '' ? undefined : e.target.value === 'true' })}
        >
          <option value="">All Payments</option>
          <option value="true">Paid Only</option>
          <option value="false">Unpaid Only</option>
        </select>
        <button onClick={() => setFilter({})}>Clear Filters</button>
      </div>
    </div>
  );

  const renderPaymentsTable = () => (
    <div className="table-container">
      <table className="payments-table">
        <thead>
          <tr>
            <th>Payment ID</th>
            <th>Reference</th>
            <th>Customer</th>
            <th>Device</th>
            <th>Total Amount</th>
            <th>Advanced Payment</th>
            <th>Remaining</th>
            <th>Status</th>
            <th>Payment Date</th>
            <th>Repair Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((payment) => (
            <tr key={payment.paymentId}>
              <td>{payment.paymentId}</td>
              <td>{payment.referenceNumber}</td>
              <td>
                <div>
                  <div>{payment.customerName}</div>
                  <small>{payment.customerEmail}</small>
                </div>
              </td>
              <td>{payment.device}</td>
              <td>{formatCurrency(payment.totalAmount)}</td>
              <td>{payment.advancedPayment ? formatCurrency(payment.advancedPayment) : '-'}</td>
              <td>{formatCurrency(payment.remainingBalance)}</td>
              <td>
                <span className={`status-badge ${payment.isPaid ? 'paid' : 'unpaid'}`}>
                  {payment.isPaid ? 'Paid' : 'Unpaid'}
                </span>
              </td>
              <td>{formatDate(payment.paymentDate)}</td>
              <td>
                <span className={`status-badge ${payment.repairStatus.toLowerCase()}`}>
                  {payment.repairStatus}
                </span>
              </td>
              <td>
                <div className="actions">
                  <button
                    className="btn-edit"
                    onClick={() => openUpdateModal(payment)}
                  >
                    Edit
                  </button>
                  {!payment.isPaid && (
                    <button
                      className="btn-success"
                      onClick={() => handleMarkAsPaid(payment.paymentId)}
                    >
                      Mark Paid
                    </button>
                  )}
                  <button
                    className="btn-delete"
                    onClick={() => handleDeletePayment(payment.paymentId)}
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  if (loading) return <div className="loading">Loading payments...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="manage-payments">
      <div className="header">
        <h1>Manage Payments</h1>
        <button
          className="btn-primary"
          onClick={() => {
            const repairId = prompt('Enter Repair ID to create payment for:');
            if (repairId) openCreateModal(parseInt(repairId));
          }}
        >
          Create Payment
        </button>
      </div>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All Payments
        </button>
        <button
          className={`tab ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          Pending Payments
        </button>
        <button
          className={`tab ${activeTab === 'completed' ? 'active' : ''}`}
          onClick={() => setActiveTab('completed')}
        >
          Completed Payments
        </button>
        <button
          className={`tab ${activeTab === 'statistics' ? 'active' : ''}`}
          onClick={() => setActiveTab('statistics')}
        >
          Statistics
        </button>
      </div>

      {activeTab !== 'statistics' && renderFilters()}

      {activeTab === 'statistics' ? renderStatistics() : renderPaymentsTable()}

      {/* Create Payment Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Create Payment</h2>
              <button onClick={() => setShowCreateModal(false)}>×</button>
            </div>
            <form onSubmit={handleCreatePayment}>
              <div className="form-group">
                <label>Total Amount</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={createForm.totalAmount}
                  onChange={(e) => setCreateForm({ ...createForm, totalAmount: parseFloat(e.target.value) })}
                />
              </div>
              <div className="form-group">
                <label>Advanced Payment (Optional)</label>
                <input
                  type="number"
                  step="0.01"
                  value={createForm.advancedPayment || ''}
                  onChange={(e) => setCreateForm({ ...createForm, advancedPayment: parseFloat(e.target.value) || undefined })}
                />
              </div>
              <div className="form-group">
                <label>Payment Date (Optional)</label>
                <input
                  type="datetime-local"
                  value={createForm.paymentDate || ''}
                  onChange={(e) => setCreateForm({ ...createForm, paymentDate: e.target.value || undefined })}
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit">Create Payment</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Payment Modal */}
      {showUpdateModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Update Payment</h2>
              <button onClick={() => setShowUpdateModal(false)}>×</button>
            </div>
            <form onSubmit={handleUpdatePayment}>
              <div className="form-group">
                <label>Total Amount</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={updateForm.totalAmount}
                  onChange={(e) => setUpdateForm({ ...updateForm, totalAmount: parseFloat(e.target.value) })}
                />
              </div>
              <div className="form-group">
                <label>Advanced Payment (Optional)</label>
                <input
                  type="number"
                  step="0.01"
                  value={updateForm.advancedPayment || ''}
                  onChange={(e) => setUpdateForm({ ...updateForm, advancedPayment: parseFloat(e.target.value) || undefined })}
                />
              </div>
              <div className="form-group">
                <label>Payment Date (Optional)</label>
                <input
                  type="datetime-local"
                  value={updateForm.paymentDate || ''}
                  onChange={(e) => setUpdateForm({ ...updateForm, paymentDate: e.target.value || undefined })}
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowUpdateModal(false)}>Cancel</button>
                <button type="submit">Update Payment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagePayments;