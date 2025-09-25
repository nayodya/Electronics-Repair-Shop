import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../../services/api';
import './TechnicianDashboard.css';

interface RepairRequest {
  requestId: number;
  referenceNumber: string;
  device: string;
  brand: string;
  model: string;
  issue: string;
  description?: string;
  status: RepairStatus;
  submittedAt: string;
  estimatedCompletionDays?: number;
  customer: {
    userId: number;
    name: string;
    email: string;
    phone: string;
  };
}

const RepairStatus = {
  Received: 0,
  InProgress: 1,
  Completed: 2,
  Cancelled: 3,
  ReadyForDelivery: 4,
  Delivered: 5
} as const;
type RepairStatus = typeof RepairStatus[keyof typeof RepairStatus];

interface TechnicianStatistics {
  totalAssigned: number;
  inProgress: number;
  completed: number;
  readyForDelivery: number;
  delivered: number;
  cancelled: number;
}

const TechnicianDashboard: React.FC = () => {
  const [repairs, setRepairs] = useState<RepairRequest[]>([]);
  const [statistics, setStatistics] = useState<TechnicianStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAssignedRepairs();
  }, []);

  const fetchAssignedRepairs = async () => {
    try {
      setLoading(true);
      
      console.log('Fetching assigned repairs...');
      
      const response = await api.get('/technician/assigned-repairs');
      
      console.log('Response received:', response.data);
      
      // Check if response.data is actually an array
      if (Array.isArray(response.data)) {
        setRepairs(response.data);
        calculateStatistics(response.data);
      } else {
        console.error('Response data is not an array:', response.data);
        setRepairs([]);
        calculateStatistics([]);
      }
      
      setError(null);
    } catch (err: any) {
      console.error('Error fetching repairs:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      
      let errorMessage = 'Failed to fetch repairs';
      
      // Check if we got HTML instead of JSON (means wrong endpoint)
      if (typeof err.response?.data === 'string' && err.response.data.includes('<!doctype html>')) {
        errorMessage = 'API endpoint not found - check if backend is running on port 5062';
      } else if (err.response?.status === 401) {
        errorMessage = 'Unauthorized - Please login again';
      } else if (err.response?.status === 403) {
        errorMessage = 'Access denied - Technician role required';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setRepairs([]);
      setStatistics(null);
    } finally {
      setLoading(false);
    }
  };

  const calculateStatistics = (repairData: RepairRequest[]) => {
    // Ensure repairData is an array
    if (!Array.isArray(repairData)) {
      console.warn('calculateStatistics called with non-array data:', repairData);
      repairData = [];
    }
    
    const stats: TechnicianStatistics = {
      totalAssigned: repairData.length,
      inProgress: repairData.filter(r => r.status === RepairStatus.InProgress).length,
      completed: repairData.filter(r => r.status === RepairStatus.Completed).length,
      readyForDelivery: repairData.filter(r => r.status === RepairStatus.ReadyForDelivery).length,
      delivered: repairData.filter(r => r.status === RepairStatus.Delivered).length,
      cancelled: repairData.filter(r => r.status === RepairStatus.Cancelled).length,
    };
    setStatistics(stats);
  };

  const handleViewAssignedRepairs = () => {
    navigate('/repairing-status');
  };

  if (loading) return <div className="loading">Loading...</div>;
  
  if (error) {
    return (
      <div className="error-container">
        <div className="error">Error: {error}</div>
        <button onClick={fetchAssignedRepairs} className="retry-btn">
          Retry
        </button>
        <div className="debug-info">
          <p><small>Debug: Make sure your backend is running on http://localhost:5062</small></p>
        </div>
      </div>
    );
  }

  return (
    <div className="technician-dashboard">
      <h1>Technician Dashboard</h1>

      {/* Statistics Cards */}
      {statistics && (
        <div className="statistics-grid">
          <div className="stat-card">
            <h3>Total Assigned</h3>
            <p className="stat-number">{statistics.totalAssigned}</p>
          </div>
          <div className="stat-card">
            <h3>In Progress</h3>
            <p className="stat-number">{statistics.inProgress}</p>
          </div>
          <div className="stat-card">
            <h3>Completed</h3>
            <p className="stat-number">{statistics.completed}</p>
          </div>
          <div className="stat-card">
            <h3>Ready for Delivery</h3>
            <p className="stat-number">{statistics.readyForDelivery}</p>
          </div>
          <div className="stat-card">
            <h3>Delivered</h3>
            <p className="stat-number">{statistics.delivered}</p>
          </div>
          <div className="stat-card">
            <h3>Cancelled</h3>
            <p className="stat-number">{statistics.cancelled}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TechnicianDashboard;
