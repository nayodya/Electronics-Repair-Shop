import { useContext } from "react";
import { AuthContext } from "../../../context/AuthContext";

const CustomerDashboard = () => {
  const { logout, user } = useContext(AuthContext);
  return (
    <div>
      <h1>Customer Dashboard</h1>
      <p>Welcome, {user?.email}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

export default CustomerDashboard;
