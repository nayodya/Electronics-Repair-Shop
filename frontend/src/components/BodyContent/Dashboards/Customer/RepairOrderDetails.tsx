import { useLocation, useNavigate } from "react-router-dom";
import "./RepairOrderDetails.css";

const RepairOrderDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const order = location.state?.order;

  if (!order) {
    return (
      <div className="repair-order-details">
        <p>No order details found.</p>
        <button onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  return (
    <div className="repair-order-details">
      <button className="back-button" onClick={() => navigate(-1)}>← Back</button>
      <h2>Repair Order Details</h2>
      <ul className="details-list">
        <li><strong>Reference Number:</strong> {order.referenceNumber}</li>
        <li><strong>Status:</strong> {order.status}</li>
        <li><strong>Device Make:</strong> {order.device.make}</li>
        <li><strong>Device Model:</strong> {order.device.model}</li>
        <li><strong>Device Serial:</strong> {order.device.serialNumber}</li>
        <li><strong>Device Type:</strong> {order.device.deviceType}</li>
        <li><strong>Issue:</strong> {order.issueDescription}</li>
        <li><strong>Description:</strong> {order.description}</li>
        <li><strong>Created At:</strong> {order.createdAt}</li>
        <li><strong>Estimated Completion Days:</strong> {order.estimatedCompletionDays}</li>
        <li><strong>Estimated Cost:</strong> {order.estimatedCost}</li>
        <li><strong>Completed At:</strong> {order.completedAt}</li>
        {/* Add more fields as needed */}
      </ul>
    </div>
  );
};

export default RepairOrderDetails;