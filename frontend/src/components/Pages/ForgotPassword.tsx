import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await api.post("/Auth/forgot-password", { email });

      // If backend returns a token (for demo/testing)
      const token = response.data.token;

      setSuccess(response.data.message || "Password reset link sent.");
      setError("");
      setEmail("");

      // Redirect to ResetPassword page with token in URL
      if (token) {
        navigate(`/reset-password?token=${token}`);
      }
    } catch (err: any) {
      console.log(err.response);
      setError(err.response?.data?.message || "Failed to send reset link.");
      setSuccess("");
    }
  };

  return (
    <div>
      <form onSubmit={handleForgotPassword}>
        <h2>Forgot Password</h2>

        {error && <p>{error}</p>}
        {success && <p>{success}</p>}

        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <button type="submit">Send Reset Link</button>

        <p>
          Remembered your password? <a href="/login">Login</a>
        </p>
      </form>
    </div>
  );
};

export default ForgotPassword;
