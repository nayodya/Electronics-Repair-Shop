import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../services/api";
import "./ForgotPassword.css";

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await api.post("/Auth/forgot-password", { email });

      // If backend returns a token (for demo/testing)
      const token = response.data.token;

      setSuccess(response.data.message || "Password reset link sent to your email.");
      setError("");
      setEmail("");

      // Redirect to ResetPassword page with token in URL after 3 seconds
      if (token) {
        setTimeout(() => {
          navigate(`/reset-password?token=${token}`);
        }, 3000);
      }
    } catch (err: any) {
      console.log(err.response);
      setError(err.response?.data?.message || "Failed to send reset link. Please try again.");
      setSuccess("");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="forgot-password-container">
      {/* Left Side - Branding */}
      <div className="forgot-left">
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
            <h1>Reset Your Password</h1>
            <p>
              Don't worry, it happens to the best of us. Enter your email address 
              and we'll send you a link to reset your password.
            </p>
            <div className="brand-accent"></div>
          </div>
        </div>
      </div>

      {/* Right Side - Forgot Password Form */}
      <div className="forgot-right">
        <div className="forgot-form-container">
          <div className="form-header">
            <div className="forgot-icon">🔑</div>
            <h2>FORGOT PASSWORD</h2>
            <h1>Reset Your Password</h1>
            <p>Enter your email address and we'll send you a password reset link</p>
          </div>

          <form onSubmit={handleForgotPassword} className="forgot-form">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                required
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="error-message">
                <span className="error-icon">⚠️</span>
                {error}
              </div>
            )}

            {success && (
              <div className="success-message">
                <span className="success-icon">✅</span>
                {success}
              </div>
            )}

            <button 
              type="submit" 
              className="forgot-button"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="loading-spinner"></span>
                  SENDING...
                </>
              ) : (
                'SEND RESET LINK'
              )}
            </button>

            <div className="form-footer">
              <div className="back-to-login">
                <span>Remembered your password? </span>
                <a href="/login" className="login-link">Back to Login</a>
              </div>
              
              <div className="divider">
                <span>OR</span>
              </div>
              
              <div className="contact-support">
                <span>Need help? </span>
                <a href="/contact" className="support-link">Contact Support</a>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
