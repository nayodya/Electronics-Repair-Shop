// src/pages/CustomerDashboard.tsx
import { useContext } from "react";
import { AuthContext } from "../../../context/AuthContext";

const TechnicianDashboard = () => {
  const { logout, user } = useContext(AuthContext);
  return (
    <div>
      <h1>Technicaion Dashboard</h1>
      <p>Welcome, {user?.email}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

export default TechnicianDashboard;
