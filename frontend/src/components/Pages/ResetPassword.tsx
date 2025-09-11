import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../../services/api";

const ResetPassword: React.FC = () => {
  const [params] = useSearchParams();
  const token = params.get("token");
  const navigate = useNavigate();

  const [newPassword, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await api.post("/Auth/reset-password", {
        token,
        newPassword,
      });

      setMessage("Password reset successful! Redirecting to login...");
      setTimeout(() => navigate("/login"), 3000);
      
    } catch (err: any) {
      setMessage(err.response?.data?.message || " Failed to reset password.");
    }
  };

  return (
    <div>
      <h2>Reset Password</h2>
      {message && <p>{message}</p>}

      <form onSubmit={handleReset}>
        <input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Confirm New Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        <button type="submit">Reset Password</button>
      </form>
    </div>
  );
};

export default ResetPassword;
