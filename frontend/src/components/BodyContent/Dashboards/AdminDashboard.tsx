import { useContext } from "react";
import { AuthContext } from "../../../context/AuthContext";

const AdminDashboard = () => {
  const { logout, user } = useContext(AuthContext);
  return (
    <div>
      <h1>Admin Dashboard</h1>
      <p>Welcome, {user?.email}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

export default AdminDashboard;
