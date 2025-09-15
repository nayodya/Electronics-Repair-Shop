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

  // Load account details on mount
  useEffect(() => {
    const fetchAccount = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await api.get("/Auth/my-account", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAccount(response.data);
      } catch (error) {
        setMessage("Failed to load account details.");
      } finally {
        setLoading(false);
      }
    };

    fetchAccount();
  }, []);

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAccount({ ...account, [e.target.name]: e.target.value });
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await api.put("/Auth/update-account", account, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage("✅ Account updated successfully!");
      setEditMode(false);
    } catch (error) {
      setMessage("❌ Failed to update account.");
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
          <input
            type="text"
            name="firstName"
            value={account.firstName}
            onChange={handleChange}
            placeholder="First Name"
            className="profile-input"
            autoFocus
          />
          <input
            type="text"
            name="lastName"
            value={account.lastName}
            onChange={handleChange}
            placeholder="Last Name"
            className="profile-input"
          />
          <input
            type="text"
            name="address"
            value={account.address}
            onChange={handleChange}
            placeholder="Address"
            className="profile-input"
          />
          <input
            type="text"
            name="contactNumber"
            value={account.contactNumber}
            onChange={handleChange}
            placeholder="Contact Number"
            className="profile-input"
          />

          <div className="profile-actions">
            <button type="submit" className="profile-button">
              💾 Save
            </button>
            <button
              type="button"
              className="profile-button cancel"
              onClick={() => setEditMode(false)}
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
