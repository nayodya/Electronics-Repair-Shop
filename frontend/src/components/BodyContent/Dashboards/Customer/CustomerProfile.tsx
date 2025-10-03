import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../../services/api";
import "./CustomerProfile.css";

interface Account {
  firstName: string;
  lastName: string;
  address: string;
  contactNumber: string;
}

const CustomerProfile: React.FC = () => {
  const navigate = useNavigate();
  const [account, setAccount] = useState<Account>({
    firstName: "",
    lastName: "",
    address: "",
    contactNumber: "",
  });

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");
  const [editMode, setEditMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load account details on mount
  useEffect(() => {
    const fetchAccount = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await api.get("/Auth/my-account", {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        setAccount({
          firstName: response.data.firstName || "",
          lastName: response.data.lastName || "",
          address: response.data.address || "",
          contactNumber: response.data.contactNumber || "",
        });
      } catch (error: any) {
        console.error("Error fetching account:", error);
        setMessage("Failed to load account details. Please try again.");
        setMessageType("error");
      } finally {
        setLoading(false);
      }
    };

    fetchAccount();
  }, [navigate]);

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAccount((prev) => ({ ...prev, [name]: value }));
  };

  // Validate form before submission
  const validateForm = () => {
    const errors: string[] = [];

    if (!account.firstName.trim()) {
      errors.push("First Name");
    }

    if (!account.lastName.trim()) {
      errors.push("Last Name");
    }

    if (!account.contactNumber.trim()) {
      errors.push("Contact Number");
    }

    if (!account.address.trim()) {
      errors.push("Address");
    }

    return errors;
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous messages
    setMessage("");
    setMessageType("");

    // Validate form
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setMessage(`Please fill in the following required fields: ${validationErrors.join(", ")}`);
      setMessageType("error");
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setMessage("Authentication token not found. Please log in again.");
        setMessageType("error");
        return;
      }

      // Prepare data
      const updateData = {
        firstName: account.firstName.trim(),
        lastName: account.lastName.trim(),
        address: account.address.trim(),
        contactNumber: account.contactNumber.trim(),
      };

      await api.put("/Auth/update-account", updateData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      setMessage("Profile updated successfully!");
      setMessageType("success");
      setEditMode(false);

      // Refresh the account data
      const refreshResponse = await api.get("/Auth/my-account", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAccount({
        firstName: refreshResponse.data.firstName || "",
        lastName: refreshResponse.data.lastName || "",
        address: refreshResponse.data.address || "",
        contactNumber: refreshResponse.data.contactNumber || "",
      });
    } catch (error: any) {
      console.error("Update error:", error);
      
      let errorMessage = "Failed to update profile. Please try again.";
      
      if (error.response?.data) {
        if (typeof error.response.data === "string") {
          errorMessage = error.response.data;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.errors) {
          if (Array.isArray(error.response.data.errors)) {
            errorMessage = error.response.data.errors.join(", ");
          } else if (typeof error.response.data.errors === "object") {
            errorMessage = Object.values(error.response.data.errors).flat().join(", ");
          }
        }
      }

      setMessage(errorMessage);
      setMessageType("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setEditMode(false);
    setMessage("");
    setMessageType("");
    // Reset form to original values
    const fetchAccount = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await api.get("/Auth/my-account", {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        setAccount({
          firstName: response.data.firstName || "",
          lastName: response.data.lastName || "",
          address: response.data.address || "",
          contactNumber: response.data.contactNumber || "",
        });
      } catch (error) {
        console.error("Error refreshing account:", error);
      }
    };
    fetchAccount();
  };

  if (loading) {
    return (
      <div className="add-repair-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="add-repair-container">
      <div className="add-repair-header">
        <button 
          className="back-button"
          onClick={() => navigate("/customer/dashboard")}
        >
          ← Back to Dashboard
        </button>
        <h1>My Profile</h1>
        <p>Manage your personal information and contact details</p>
      </div>

      <div className="repair-form-container">
        <div className="repair-form">
          {message && (
            <div className={`message ${messageType}`}>
              <span className="message-icon">
                {messageType === "success" ? "✅" : "⚠️"}
              </span>
              <span className="message-text">{message}</span>
            </div>
          )}

          {!editMode ? (
            <>
              {/* View Mode */}
              <div className="form-section">
                <h3>Account Information</h3>
                
                <div className="profile-view">
                  <div className="profile-field">
                    <label>Email Address</label>
                  </div>

                  <div className="form-row">
                    <div className="profile-field">
                      <label>First Name</label>
                      <div className="field-value">
                        {account.firstName || "Not set"}
                      </div>
                    </div>

                    <div className="profile-field">
                      <label>Last Name</label>
                      <div className="field-value">
                        {account.lastName || "Not set"}
                      </div>
                    </div>
                  </div>

                  <div className="profile-field">
                    <label>Contact Number</label>
                    <div className="field-value">
                      {account.contactNumber || "Not set"}
                    </div>
                  </div>

                  <div className="profile-field">
                    <label>Address</label>
                    <div className="field-value">
                      {account.address || "Not set"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="submit-button"
                  onClick={() => setEditMode(true)}
                >
                  ✏️ Edit Profile
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Edit Mode */}
              <form onSubmit={handleSubmit}>
                <div className="form-section">
                  <h3>Edit Profile Information</h3>
                  

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="firstName">
                        First Name <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={account.firstName}
                        onChange={handleChange}
                        placeholder="Enter your first name"
                        required
                        disabled={isSubmitting}
                        autoFocus
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="lastName">
                        Last Name <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={account.lastName}
                        onChange={handleChange}
                        placeholder="Enter your last name"
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="contactNumber">
                      Contact Number <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="tel"
                      id="contactNumber"
                      name="contactNumber"
                      value={account.contactNumber}
                      onChange={handleChange}
                      placeholder="Enter your phone number"
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="address">
                      Address <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={account.address}
                      onChange={handleChange}
                      placeholder="Enter your complete address"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="cancel-button"
                    onClick={handleCancel}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="submit-button"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="loading-spinner"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        💾 Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerProfile;