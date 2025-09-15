import { useState, useContext } from "react";
import { AuthContext } from "../../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../../../../services/api";
import "./AddRepair.css";

const AddRepairOrderPage = () => {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    make: "",
    model: "",
    serialNumber: "",
    issueDescription: "",
    deviceType: ""
  });
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const deviceTypes = [
    "Smartphone",
    "Laptop",
    "Tablet",
    "Desktop Computer",
    "Gaming Console",
    "Smart Watch",
    "Other"
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
        "/repairs/submit",
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(`Repair Request Created Successfully! Reference Number: ${res.data.referenceNumber}`);
      setIsSuccess(true);
      // Clear form
      setFormData({
        make: "",
        model: "",
        serialNumber: "",
        issueDescription: "",
        deviceType: ""
      });
      setTimeout(()=> navigate("/customer/dashboard"),300)

    } catch (err: any) {
      setMessage(err.response?.data?.message || "Failed to create repair request.");
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
    }
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
              <label htmlFor="deviceType">Device Type</label>
              <select
                id="deviceType"
                name="deviceType"
                value={formData.deviceType}
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
                <label htmlFor="make">Device Make</label>
                <input
                  type="text"
                  id="make"
                  name="make"
                  value={formData.make}
                  onChange={handleChange}
                  placeholder="e.g., Apple, Samsung, HP"
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
                  placeholder="e.g., iPhone 13, Galaxy S21"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="serialNumber">Serial Number</label>
              <input
                type="text"
                id="serialNumber"
                name="serialNumber"
                value={formData.serialNumber}
                onChange={handleChange}
                placeholder="Enter device serial number"
                required
              />
            </div>
          </div>

          <div className="form-section">
            <h3>Issue Description</h3>
            <div className="form-group">
              <label htmlFor="issueDescription">Describe the problem</label>
              <textarea
                id="issueDescription"
                name="issueDescription"
                value={formData.issueDescription}
                onChange={handleChange}
                placeholder="Please describe the issue in detail. Include when it started, any error messages, and what you were doing when the problem occurred."
                rows={6}
                required
              />
            </div>
          </div>

          {message && (
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
    </div>
  );
};

export default AddRepairOrderPage;
