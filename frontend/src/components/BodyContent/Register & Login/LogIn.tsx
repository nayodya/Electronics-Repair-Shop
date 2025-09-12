import { useState, useContext } from "react";
import { AuthContext } from "../../../context/AuthContext";
import api from "../../../services/api";
import "./Login.css";

const LoginPage = () => {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post("/Auth/login", { email, password });
      login(res.data.token);
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed.");
    }
  };

  return (
    <div className="login-container">
      {/* Left Side - Branding */}
      <div className="login-left">
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
            <h1>Fixing the Future...</h1>
            <p>
              Expert electronics repair services with cutting-edge technology.
              Join our platform to manage your repairs and track your devices.
            </p>
            <div className="brand-accent"></div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="login-right">
        <div className="login-form-container">
          <div className="form-header">
            <h2>WELCOME BACK</h2>
            <h1>Log In to your Account</h1>
          </div>

          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                placeholder="john.doe@techfixpro.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="password-input-container">
                <input
                  type="password"
                  id="password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input"
                  required
                />
              </div>
            </div>

            <div className="form-options">
              <a href="/forgotpassword" className="forgot-password">
                Forgot Password?
              </a>
            </div>

            {error && (
              <div className="error-message">
                <span className="error-icon">⚠️</span>
                {error}
              </div>
            )}

            <button type="submit" className="login-button">
              LOGIN
            </button>

            <div className="divider">
              <span>OR</span>
            </div>

            <div className="signup-prompt">
              <span>New USER? SIGN UP </span>
              <a href="/register" className="signup-link">HERE</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
