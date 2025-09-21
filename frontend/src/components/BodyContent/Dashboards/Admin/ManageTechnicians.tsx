import React, { useEffect, useState } from "react";
import api from "../../../../services/api";
import "./AdminStyles.css";

interface Technician {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  contactNumber: string;
  address: string;
  emailVerifiedAt: string;
}

interface AssignedRepair {
  requestId: number;
  referenceNumber: string;
  device: string;
  brand: string;
  status: number;
  customerName: string;
}

const ManageTechnicians: React.FC = () => {
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [selectedTechnician, setSelectedTechnician] = useState<Technician | null>(null);
  const [technicianRepairs, setTechnicianRepairs] = useState<AssignedRepair[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchTechnicians();
  }, []);

  const fetchTechnicians = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await api.get("/admin/technicians", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTechnicians(res.data);
    } catch (err: any) {
      setMessage("Failed to fetch technicians: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const viewTechnicianDetails = async (technician: Technician) => {
    setSelectedTechnician(technician);
    try {
      // Fetch assigned repairs for this technician
      const token = localStorage.getItem("token");
      const res = await api.get(`/admin/technicians/${technician.userId}/repairs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTechnicianRepairs(res.data);
    } catch (err: any) {
      setMessage("Failed to fetch technician repairs: " + (err.response?.data?.message || err.message));
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

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h2>🔧 Manage Technicians</h2>
        <div className="admin-stats">
          <span className="admin-stat">Total: {technicians.length}</span>
        </div>
      </div>

      {message && <div className="admin-message">{message}</div>}

      {loading ? (
        <div className="admin-loading">Loading technicians...</div>
      ) : (
        <div className="admin-content">
          {/* Technicians List */}
          <div className="admin-section">
            <h3>Technicians List</h3>
            {technicians.length === 0 ? (
              <p className="admin-empty">No technicians found.</p>
            ) : (
              <div className="admin-cards">
                {technicians.map((technician) => (
                  <div key={technician.userId} className="admin-card">
                    <div className="admin-card-header">
                      <h4>{technician.firstName} {technician.lastName}</h4>
                      <span className={`admin-badge ${technician.emailVerifiedAt ? 'admin-badge-success' : 'admin-badge-warning'}`}>
                        {technician.emailVerifiedAt ? '✅ Verified' : '⚠️ Unverified'}
                      </span>
                    </div>
                    <div className="admin-card-content">
                      <p><strong>📧 Email:</strong> {technician.email}</p>
                      <p><strong>📞 Contact:</strong> {technician.contactNumber || "N/A"}</p>
                      <p><strong>📍 Address:</strong> {technician.address || "N/A"}</p>
                    </div>
                    <div className="admin-card-actions">
                      <button 
                        className="admin-btn admin-btn-info"
                        onClick={() => viewTechnicianDetails(technician)}
                      >
                        👁️ View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Technician Details Modal */}
          {selectedTechnician && (
            <div className="admin-modal-overlay" onClick={() => setSelectedTechnician(null)}>
              <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
                <div className="admin-modal-header">
                  <h3>👨‍🔧 {selectedTechnician.firstName} {selectedTechnician.lastName}</h3>
                  <button 
                    className="admin-modal-close"
                    onClick={() => setSelectedTechnician(null)}
                  >
                    ✕
                  </button>
                </div>
                
                <div className="admin-modal-content">
                  <div className="admin-technician-info">
                    <h4>📋 Technician Information</h4>
                    <p><strong>Email:</strong> {selectedTechnician.email}</p>
                    <p><strong>Contact:</strong> {selectedTechnician.contactNumber || "N/A"}</p>
                    <p><strong>Address:</strong> {selectedTechnician.address || "N/A"}</p>
                    <p><strong>Status:</strong> {selectedTechnician.emailVerifiedAt ? "✅ Verified" : "⚠️ Unverified"}</p>
                  </div>

                  <div className="admin-assigned-repairs">
                    <h4>🔧 Assigned Repairs ({technicianRepairs.length})</h4>
                    {technicianRepairs.length === 0 ? (
                      <p className="admin-empty">No assigned repairs</p>
                    ) : (
                      <div className="admin-table-container">
                        <table className="admin-table admin-table-small">
                          <thead>
                            <tr>
                              <th>Ref #</th>
                              <th>Device</th>
                              <th>Customer</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {technicianRepairs.map((repair) => (
                              <tr key={repair.requestId}>
                                <td>{repair.referenceNumber}</td>
                                <td>{repair.brand} {repair.device}</td>
                                <td>{repair.customerName}</td>
                                <td>
                                  <span className={`admin-badge admin-badge-status-${repair.status}`}>
                                    {getStatusText(repair.status)}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ManageTechnicians;
