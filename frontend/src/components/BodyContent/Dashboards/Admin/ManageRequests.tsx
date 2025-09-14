import React, { useEffect, useState } from "react";
import api from "../../../../services/api";

interface RepairRequest {
  requestId: number;
  referenceNumber: string;
  customer: { firstName: string; lastName: string };
  device: string;
  brand: string;
  model: string;
  issue: string;
  status: string;
  estimatedCompletionDays?: number;
  technician?: { firstName: string; lastName: string };
}

const ManageRequests: React.FC = () => {
  const [requests, setRequests] = useState<RepairRequest[]>([]);
  const [technicians, setTechnicians] = useState<any[]>([]);

  useEffect(() => {
    fetchRequests();
    fetchTechnicians();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await api.get("/Repair/all");
      setRequests(res.data);
    } catch (err) {
      console.error("Failed to fetch requests", err);
    }
  };

  const fetchTechnicians = async () => {
    try {
      const res = await api.get("/Repair/technicians");
      setTechnicians(res.data);
    } catch (err) {
      console.error("Failed to fetch technicians", err);
    }
  };

  const assignTechnician = async (requestId: number, technicianId: number) => {
    try {
      await api.put(`/Repair/${requestId}/assign`, { technicianId });
      fetchRequests();
    } catch (err) {
      console.error("Failed to assign technician", err);
    }
  };

  const updateStatus = async (requestId: number, status: string) => {
    try {
      await api.put(`/Repair/${requestId}/status`, { status });
      fetchRequests();
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  const updateEstimatedDays = async (requestId: number, days: number) => {
    try {
      await api.put(`/Repair/${requestId}/estimated-days`, { estimatedCompletionDays: days });
      fetchRequests();
    } catch (err) {
      console.error("Failed to update estimated days", err);
    }
  };

  return (
    <div>
      <h2>Repair Requests</h2>
      <table border={1} cellPadding={5} style={{ width: "100%" }}>
        <thead>
          <tr>
            <th>Ref #</th>
            <th>Customer</th>
            <th>Device</th>
            <th>Issue</th>
            <th>Status</th>
            <th>Technician</th>
            <th>Estimated Days</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((r) => (
            <tr key={r.requestId}>
              <td>{r.referenceNumber}</td>
              <td>{r.customer?.firstName} {r.customer?.lastName}</td>
              <td>{r.device} ({r.brand} {r.model})</td>
              <td>{r.issue}</td>
              <td>{r.status}</td>
              <td>
                <select onChange={(e) => assignTechnician(r.requestId, parseInt(e.target.value))}>
                  <option value="">-- Assign --</option>
                  {technicians.map((t) => (
                    <option key={t.userId} value={t.userId}>
                      {t.firstName} {t.lastName}
                    </option>
                  ))}
                </select>
              </td>
              <td>
                <input
                  type="number"
                  placeholder="Days"
                  onBlur={(e) => updateEstimatedDays(r.requestId, parseInt(e.target.value))}
                />
              </td>
              <td>
                <button onClick={() => updateStatus(r.requestId, "InProgress")}>Start</button>
                <button onClick={() => updateStatus(r.requestId, "Completed")}>Complete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ManageRequests;
