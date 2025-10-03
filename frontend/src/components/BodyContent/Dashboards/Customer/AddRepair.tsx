import { useState, useContext } from "react";
import { AuthContext } from "../../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../../../../services/api";
import "./AddRepair.css";
import { FaCopy } from "react-icons/fa6";
import { TbArrowBigRightLineFilled } from "react-icons/tb";

const AddRepairOrderPage = () => {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    device: "",
    brand: "",
    model: "",
    issue: "",
    description: ""
  });
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const deviceTypes = [
    "Laptop",
    "Desktop Computer"
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const res = await api.post(
        "Repair/submit",
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setReferenceNumber(res.data.referenceNumber);
      setMessage(`Repair Request Created Successfully! Reference Number: ${res.data.referenceNumber}`);
      setIsSuccess(true);
      setShowSuccessModal(true);
      
      // Clear form
      setFormData({
        device: "",
        brand: "",
        model: "",
        issue: "",
        description: ""
      });
      

    } catch (err: any) {
      setMessage(err.response?.data?.message || "Failed to create repair request.");
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
    navigate("/customer/dashboard");
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referenceNumber);
    // You could add a toast notification here
  };

  return (
    <div className="add-repair-container">
      <div className="add-repair-header">
        <button
          className="back-button"
          onClick={() => navigate("/customer/dashboard")}
        >
          ← Back to Dashboard
        </button>
        <h1>Submit Repair Request</h1>
        <p>Fill out the form below to submit your device for repair</p>
      </div>

      <div className="repair-form-container">
        <form onSubmit={handleSubmit} className="repair-form">
          <div className="form-section">
            <h3>Device Information</h3>

            <div className="form-group">
              <label htmlFor="device">Device Type</label>
              <select
                id="device"
                name="device"
                value={formData.device}
                onChange={handleChange}
                required
              >
                <option value="">Select device type</option>
                {deviceTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="brand">Device Brand</label>
                <input
                  type="text"
                  id="brand"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  placeholder="e.g., Azus, Dell"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="model">Device Model</label>
                <input
                  type="text"
                  id="model"
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  placeholder="e.g., M15, M2"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="issue">Issue Summary</label>
              <input
                type="text"
                id="issue"
                name="issue"
                value={formData.issue}
                onChange={handleChange}
                placeholder="Summary of the problem"
                required
              />
            </div>
          </div>

          <div className="form-section">
            <h3>Issue Description</h3>
            <div className="form-group">
              <label htmlFor="description">Describe the problem in detail</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Please describe the issue in detail. Include when it started, any error messages, and what you were doing when the problem occurred."
                rows={6}
                required
              />
            </div>
          </div>

          {message && !showSuccessModal && (
            <div className={`message ${isSuccess ? 'success' : 'error'}`}>
              <div className="message-icon">
                {isSuccess ? "✅" : "❌"}
              </div>
              <div className="message-text">{message}</div>
            </div>
          )}

          <div className="form-actions">
            <button
              type="button"
              className="cancel-button"
              onClick={() => navigate("/customer/dashboard")}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="submit-button"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="loading-spinner"></span>
                  Submitting...
                </>
              ) : (
                "Submit Repair Request"
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="modal-overlay">
          <div className="success-modal">
            <div className="modal-header">
              <div className="success-icon"><TbArrowBigRightLineFilled /></div>
              <h2>Request Submitted Successfully!</h2>
            </div>
            
            <div className="modal-body">
              <p>Your repair request has been submitted successfully.</p>
              <p>Please save your reference number for tracking:</p>
              
              <div className="reference-number-container">
                <div className="reference-number">
                  <span className="label">Reference Number:</span>
                  <span className="number">{referenceNumber}</span>
                  <button 
                    type="button"
                    className="copy-button"
                    onClick={copyToClipboard}
                    title="Copy to clipboard"
                  >
                    <FaCopy />
                  </button>
                </div>
              </div>
            </div>
            
            <div className="modal-actions">
              <button 
                className="primary-button"
                onClick={handleCloseModal}
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddRepairOrderPage;
