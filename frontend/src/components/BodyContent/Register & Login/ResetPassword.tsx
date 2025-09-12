import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../../../services/api";
import "./ResetPassword.css";

const ResetPassword: React.FC = () => {
  const [params] = useSearchParams();
  const token = params.get("token");
  const navigate = useNavigate();

  const [newPassword, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      await api.post("/Auth/reset-password", {
        token,
        newPassword,
      });

      setMessage("Password reset successful! Redirecting to login...");
      setTimeout(() => navigate("/login"), 3000);
      
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to reset password.");
    }
  };

  if (!token) {
    return (
      <div className="reset-password-container">
        <div className="reset-error-page">
          <div className="error-content">
            <div className="error-icon">⚠️</div>
            <h1>Invalid Reset Link</h1>
            <p>This password reset link is invalid or has expired.</p>
            <a href="/forgot-password" className="back-button">Request New Reset Link</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="reset-password-container">
      <div className="reset-left">
        <div className="brand-section">
          <div className="brand-logo">
            <div className="logo-icon">
              <span className="logo-bars">
                <span></span>
                <span></span>
                <span></span>
              </span>
            </div>
            <span className="brand-name">TechFix Pro</span>
          </div>
          
          <div className="brand-content">
            <h1>Almost There...</h1>
            <p>
              You're just one step away from securing your account. 
              Create a strong new password to protect your device repair history and personal information.
            </p>
            <div className="brand-accent"></div>
          </div>
        </div>
      </div>

      <div className="reset-right">
        <div className="reset-form-container">
          <div className="form-header">
            <div className="reset-icon">🔒</div>
            <h1>Create New Password</h1>
          </div>

          <form onSubmit={handleReset} className="reset-form">
            <div className="form-group">
              <label htmlFor="newPassword">New Password</label>
              <div className="password-input-container">
                <input
                  type="password"
                  id="newPassword"
                  placeholder="Enter your new password"
                  value={newPassword}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input password-input"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <div className="password-input-container">
                <input
                  type="password"
                  id="confirmPassword"
                  placeholder="Confirm your new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="form-input password-input"
                  required
                  minLength={6}
                />
              </div>
            </div>

            {error && (
              <div className="error-message">
                <span className="error-icon">⚠️</span>
                {error}
              </div>
            )}

            {message && (
              <div className="success-message">
                <span className="success-icon">✅</span>
                {message}
              </div>
            )}

            <button 
              type="submit" 
              className="reset-button"
            >
              Update
            </button>

            <div className="form-footer">
              <div className="back-to-login">
                <span>Remember your password? </span>
                <a href="/login" className="login-link">Back to Login</a>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;