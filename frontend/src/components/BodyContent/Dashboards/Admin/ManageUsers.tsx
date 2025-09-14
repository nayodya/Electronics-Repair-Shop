import React, { useEffect, useState } from "react";
import api from "../../../../services/api";

interface User {
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

const ManageUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get("/admin/users");
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to fetch users", err);
    }
  };

  const deleteUser = async (userId: number) => {
    try {
      await api.delete(`/admin/users/${userId}`);
      fetchUsers();
    } catch (err) {
      console.error("Failed to delete user", err);
    }
  };

  const assignRole = async (userId: number, role: string) => {
    try {
      await api.put(`/admin/users/${userId}/assign-role`, { role });
      fetchUsers();
    } catch (err) {
      console.error("Failed to assign role", err);
    }
  };

  return (
    <div>
      <h2>Manage Users</h2>
      <table border={1} cellPadding={5} style={{ width: "100%" }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Email</th>
            <th>Name</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.userId}>
              <td>{u.userId}</td>
              <td>{u.email}</td>
              <td>{u.firstName} {u.lastName}</td>
              <td>{u.role}</td>
              <td>
                <select onChange={(e) => assignRole(u.userId, e.target.value)} defaultValue={u.role}>
                  <option value="Customer">Customer</option>
                  <option value="Technician">Technician</option>
                  <option value="Admin">Admin</option>
                </select>
                <button onClick={() => deleteUser(u.userId)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ManageUsers;
