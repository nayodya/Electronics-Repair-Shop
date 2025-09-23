import { useState, useEffect } from "react";
import api from "../../../../services/api";
import "./ManageUsers.css";

interface User {
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  contactNumber: string;
  role: string;
  emailVerifiedAt: string;
}

interface CreateUserDto {
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  contactNumber: string;
  role: string;
}

const ManageUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [formData, setFormData] = useState<CreateUserDto>({
    email: "",
    firstName: "",
    lastName: "",
    address: "",
    contactNumber: "",
    role: "Customer"
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, roleFilter, statusFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("token");
      
      if (!token) {
        setError("Authentication required. Please login again.");
        return;
      }

      const response = await api.get("/Admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const usersData = Array.isArray(response.data) ? response.data : [];
      setUsers(usersData);
      
    } catch (err: any) {
      console.error("Failed to fetch users:", err);
      setError(err.response?.data?.message || "Failed to fetch users. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users.filter((user) => {
      const matchesSearch = 
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.contactNumber?.includes(searchTerm);

      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      
      const matchesStatus = statusFilter === "all" || 
        (statusFilter === "verified" && user.emailVerifiedAt) ||
        (statusFilter === "pending" && !user.emailVerifiedAt);

      return matchesSearch && matchesRole && matchesStatus;
    });
    
    setFilteredUsers(filtered);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      await api.post("/Admin/users", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setMessage("✅ User created successfully!");
      setShowCreateForm(false);
      resetForm();
      await fetchUsers();
      
      // Clear success message after 5 seconds
      setTimeout(() => setMessage(""), 5000);
      
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create user. Please check the form and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      await api.put(`/Admin/users/${editingUser.userId}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setMessage("✅ User updated successfully!");
      setEditingUser(null);
      resetForm();
      setShowCreateForm(false);
      await fetchUsers();
      
      // Clear success message after 5 seconds
      setTimeout(() => setMessage(""), 5000);
      
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update user. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: number, userEmail: string) => {
    const confirmMessage = `Are you sure you want to delete user "${userEmail}"?\n\nThis action cannot be undone.`;
    if (!window.confirm(confirmMessage)) return;

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      await api.delete(`/Admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setMessage("✅ User deleted successfully!");
      await fetchUsers();
      
      // Clear success message after 5 seconds
      setTimeout(() => setMessage(""), 5000);
      
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete user. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      email: "",
      firstName: "",
      lastName: "",
      address: "",
      contactNumber: "",
      role: "Customer"
    });
  };

  const startEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      address: user.address || "",
      contactNumber: user.contactNumber || "",
      role: user.role
    });
    setShowCreateForm(true);
    setError("");
  };

  const closeForm = () => {
    setShowCreateForm(false);
    setEditingUser(null);
    resetForm();
    setError("");
  };

  const clearFilters = () => {
    setSearchTerm("");
    setRoleFilter("all");
    setStatusFilter("all");
  };

  if (loading && users.length === 0) {
    return (
      <div className="users-container">
        <div className="users-loading">
          <div className="loading-spinner"></div>
          <p>Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="users-container">
      {/* Header Section */}
      <div className="users-header">
        <div className="users-title">
          <h1>👥 User Management</h1>
          <p>Manage system users, roles, and permissions</p>
        </div>
        <button 
          className="users-btn users-btn-primary"
          onClick={() => {
            setShowCreateForm(true);
            setEditingUser(null);
            resetForm();
          }}
          disabled={loading}
        >
          <span>➕</span>
          Add New User
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div className="users-message users-message-error">
          <span>⚠️</span>
          <div>
            <strong>Error:</strong> {error}
            <button 
              className="users-message-close"
              onClick={() => setError("")}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {message && (
        <div className="users-message users-message-success">
          <span>✅</span>
          <div>
            {message}
            <button 
              className="users-message-close"
              onClick={() => setMessage("")}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Filters Section */}
      <div className="users-filters">
        <div className="users-search">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="users-search-input"
          />
        </div>
        
        <div className="users-filter-group">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="users-filter-select"
          >
            <option value="all">All Roles</option>
            <option value="Admin">Admin</option>
            <option value="Customer">Customer</option>
            <option value="Technician">Technician</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="users-filter-select"
          >
            <option value="all">All Status</option>
            <option value="verified">Verified</option>
            <option value="pending">Pending</option>
          </select>

          <button 
            className="users-btn users-btn-secondary users-btn-small"
            onClick={clearFilters}
          >
            🗑️ Clear
          </button>

          <button 
            className="users-btn users-btn-secondary users-btn-small"
            onClick={fetchUsers}
            disabled={loading}
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="users-stats">
        <div className="users-stat-card">
          <span className="stat-icon">👥</span>
          <div>
            <strong>{filteredUsers.length}</strong>
            <span>Total Users</span>
          </div>
        </div>
        <div className="users-stat-card">
          <span className="stat-icon">👑</span>
          <div>
            <strong>{filteredUsers.filter(u => u.role === 'Admin').length}</strong>
            <span>Admins</span>
          </div>
        </div>
        <div className="users-stat-card">
          <span className="stat-icon">👤</span>
          <div>
            <strong>{filteredUsers.filter(u => u.role === 'Customer').length}</strong>
            <span>Customers</span>
          </div>
        </div>
        <div className="users-stat-card">
          <span className="stat-icon">✅</span>
          <div>
            <strong>{filteredUsers.filter(u => u.emailVerifiedAt).length}</strong>
            <span>Verified</span>
          </div>
        </div>
      </div>

      {/* User Form Modal */}
      {showCreateForm && (
        <div className="users-modal-overlay" onClick={closeForm}>
          <div className="users-modal" onClick={(e) => e.stopPropagation()}>
            <div className="users-modal-header">
              <h2>
                {editingUser ? "✏️ Edit User" : "➕ Create New User"}
              </h2>
              <button className="users-modal-close" onClick={closeForm}>
                ✕
              </button>
            </div>
            
            <form onSubmit={editingUser ? handleUpdateUser : handleCreateUser} className="users-form">
              <div className="users-form-grid">
                <div className="users-form-group">
                  <label>
                    <span>📧</span>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="user@example.com"
                    required
                  />
                </div>

                <div className="users-form-group">
                  <label>
                    <span>👤</span>
                    Role *
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                    required
                  >
                    <option value="Customer">Customer</option>
                    <option value="Admin">Admin</option>
                    <option value="Technician">Technician</option>
                  </select>
                </div>

                <div className="users-form-group">
                  <label>
                    <span>👨‍💼</span>
                    First Name
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    placeholder="John"
                  />
                </div>

                <div className="users-form-group">
                  <label>
                    <span>👨‍💼</span>
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    placeholder="Doe"
                  />
                </div>

                <div className="users-form-group">
                  <label>
                    <span>📱</span>
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.contactNumber}
                    onChange={(e) => setFormData({...formData, contactNumber: e.target.value})}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div className="users-form-group users-form-group-full">
                  <label>
                    <span>🏠</span>
                    Address
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    placeholder="123 Main Street, City, State 12345"
                  />
                </div>
              </div>

              <div className="users-form-actions">
                <button 
                  type="submit" 
                  className="users-btn users-btn-primary"
                  disabled={loading}
                >
                  {loading ? "⏳ Processing..." : editingUser ? "💾 Update User" : "➕ Create User"}
                </button>
                <button 
                  type="button" 
                  className="users-btn users-btn-secondary"
                  onClick={closeForm}
                  disabled={loading}
                >
                  ❌ Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Users Table */}
      {filteredUsers.length === 0 ? (
        <div className="users-no-data">
          <div className="no-data-icon">👥</div>
          <h3>No Users Found</h3>
          <p>
            {searchTerm || roleFilter !== "all" || statusFilter !== "all" 
              ? "No users match your current filters. Try adjusting your search criteria."
              : "No users have been created yet. Click 'Add New User' to get started."
            }
          </p>
          {(searchTerm || roleFilter !== "all" || statusFilter !== "all") && (
            <button className="users-btn users-btn-secondary" onClick={clearFilters}>
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="users-table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Contact</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.userId}>
                  <td>
                    <div className="user-info">
                      <div className="user-avatar">
                        {user.role === 'Admin' ? '👑' : user.role === 'Technician' ? '🔧' : '👤'}
                      </div>
                      <div className="user-details">
                        <strong>
                          {`${user.firstName || ""} ${user.lastName || ""}`.trim() || "N/A"}
                        </strong>
                        <span className="user-email">{user.email}</span>
                        <span className="user-id">ID: {user.userId}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="contact-info">
                      <span className="contact-phone">
                        📱 {user.contactNumber || "No phone"}
                      </span>
                      <span className="contact-address">
                        🏠 {user.address || "No address"}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className={`users-role-badge role-${user.role.toLowerCase()}`}>
                      {user.role === 'Admin' && '👑'}
                      {user.role === 'Technician' && '🔧'}
                      {user.role === 'Customer' && '👤'}
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <span className={`users-status-badge ${user.emailVerifiedAt ? "verified" : "pending"}`}>
                      {user.emailVerifiedAt ? "✅ Verified" : "⏳ Pending"}
                    </span>
                  </td>
                  <td>
                    <div className="users-actions">
                      <button 
                        className="users-btn users-btn-info users-btn-small"
                        onClick={() => startEdit(user)}
                        disabled={loading}
                        title="Edit user"
                      >
                        ✏️ Edit
                      </button>
                      <button 
                        className="users-btn users-btn-danger users-btn-small"
                        onClick={() => handleDeleteUser(user.userId, user.email)}
                        disabled={loading}
                        title="Delete user"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;