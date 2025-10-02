import { useEffect, useState } from "react";
import api from "../../../../services/api";
import "./Profile.css";

interface Account {
  firstName: string;
  lastName: string;
  address: string;
  contactNumber: string;
}

const fieldLabels: Record<string, string> = {
  firstName: "First Name",
  lastName: "Last Name",
  address: "Address",
  contactNumber: "Contact Number",
};

const CustomerDetails: React.FC = () => {
  const [account, setAccount] = useState<Account>({
    firstName: "",
    lastName: "",
    address: "",
    contactNumber: "",
  });

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load account details on mount
  useEffect(() => {
    const fetchAccount = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await api.get("/Auth/my-account", {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Ensure all fields have string values, not null/undefined
        setAccount({
          firstName: response.data.firstName || "",
          lastName: response.data.lastName || "",
          address: response.data.address || "",
          contactNumber: response.data.contactNumber || "",
        });
      } catch (error: any) {
        console.error("Error fetching account:", error);
        setMessage("Failed to load account details.");
      } finally {
        setLoading(false);
      }
    };

    fetchAccount();
  }, []);

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAccount((prev) => ({ ...prev, [name]: value }));
  };

  // Validate form before submission
  const validateForm = () => {
    const errors: string[] = [];

    if (!account.firstName.trim()) {
      errors.push("First Name is required");
    }

    if (!account.lastName.trim()) {
      errors.push("Last Name is required");
    }

    if (!account.contactNumber.trim()) {
      errors.push("Contact Number is required");
    }

    if (!account.address.trim()) {
      errors.push("Address is required");
    }

    return errors;
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous messages
    setMessage("");

    // Validate form
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setMessage(
        `❌ Please fill in all required fields: ${validationErrors.join(", ")}`
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setMessage("❌ Authentication token not found. Please log in again.");
        return;
      }

      // Prepare data - ensure no empty strings are sent as null
      const updateData = {
        firstName: account.firstName.trim(),
        lastName: account.lastName.trim(),
        address: account.address.trim(),
        contactNumber: account.contactNumber.trim(),
      };

      console.log("Token:", token);
      console.log("Updating account with data:", updateData);
      console.log("Request headers:", {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      });

      const response = await api.put("/Auth/update-account", updateData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("Update response:", response.data);
      setMessage("✅ Account updated successfully!");
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
      console.error("Full error object:", error);
      console.error("Error response:", error.response);
      console.error("Error response data:", error.response?.data);
      console.error("Error response status:", error.response?.status);
      console.error("Error response headers:", error.response?.headers);

      if (error.response) {
        // Server responded with error status
        let errorMessage = "Unknown server error";

        if (error.response.data) {
          if (typeof error.response.data === "string") {
            errorMessage = error.response.data;
          } else if (error.response.data.message) {
            errorMessage = error.response.data.message;
          } else if (error.response.data.errors) {
            if (Array.isArray(error.response.data.errors)) {
              errorMessage = error.response.data.errors.join(", ");
            } else if (typeof error.response.data.errors === "object") {
              errorMessage = Object.values(error.response.data.errors)
                .flat()
                .join(", ");
            } else {
              errorMessage = error.response.data.errors.toString();
            }
          }
        }

        setMessage(`❌ ${errorMessage}`);
      } else if (error.request) {
        // Request was made but no response received
        setMessage("❌ Network error. Please check your connection.");
      } else {
        // Something else happened
        setMessage("❌ Failed to update account. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <p className="profile-message">Loading account...</p>;

  return (
    <div className="profile-container">
      <h2 className="profile-title">My Account</h2>
      {message && <p className="profile-message">{message}</p>}

      {!editMode ? (
        <div>
          <div className="profile-form" style={{ gap: "0.7rem" }}>
            {Object.keys(fieldLabels).map((key) => (
              <div className="profile-field-row" key={key}>
                <span className="profile-field-label">{fieldLabels[key]}:</span>
                <span
                  className={
                    "profile-field-value" +
                    (!account[key as keyof Account] ? " empty" : "")
                  }
                  title={
                    !account[key as keyof Account]
                      ? "Not set"
                      : account[key as keyof Account]
                  }
                >
                  {account[key as keyof Account] || "Not set"}
                </span>
              </div>
            ))}
          </div>
          <div className="profile-actions">
            <button
              className="profile-button"
              onClick={() => setEditMode(true)}
            >
              ✏️ Edit
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="profile-form">
          <div className="profile-input-group">
            <label htmlFor="firstName" className="profile-label">
              First Name *
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={account.firstName}
              onChange={handleChange}
              placeholder="Enter your first name"
              className="profile-input"
              autoFocus
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="profile-input-group">
            <label htmlFor="lastName" className="profile-label">
              Last Name *
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={account.lastName}
              onChange={handleChange}
              placeholder="Enter your last name"
              className="profile-input"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="profile-input-group">
            <label htmlFor="address" className="profile-label">
              Address *
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={account.address}
              onChange={handleChange}
              placeholder="Enter your complete address"
              className="profile-input"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="profile-input-group">
            <label htmlFor="contactNumber" className="profile-label">
              Contact Number *
            </label>
            <input
              type="tel"
              id="contactNumber"
              name="contactNumber"
              value={account.contactNumber}
              onChange={handleChange}
              placeholder="Enter your phone number"
              className="profile-input"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="profile-actions">
            <button
              type="submit"
              className="profile-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? "💾 Saving..." : "💾 Save"}
            </button>
            <button
              type="button"
              className="profile-button cancel"
              onClick={() => {
                setEditMode(false);
                setMessage("");
              }}
              disabled={isSubmitting}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default CustomerDetails;
