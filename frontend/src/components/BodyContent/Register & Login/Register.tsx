import React, { useState } from "react";
import api from "../../../services/api";
import { useNavigate } from "react-router-dom";
import "./Register.css";

const Register: React.FC = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            setIsSubmitting(false);
            return;
        }

        try {
            const payload = { email, password, confirmPassword };
            const response = await api.post("/Auth/register", payload);

            setSuccess(response.data.message);
            setError("");

            setEmail("");
            setPassword("");
            setConfirmPassword("");

            // Show success message for 3 seconds, then redirect to email verification info
            setTimeout(() => navigate("/email-verification-sent"), 2000);
        } catch (err: any) {
            console.log(err.response);
            setSuccess("");
            setError(err.response?.data?.message || "Registration Failed. Try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="register-container">
            {/* Left Side - Branding */}
            <div className="register-left">
                <div className="brand-section">
                    <div className="brand-logo">
                        <div className="logo-icon">
                            <img src="/images/logo.png" alt="TecFix Logo" className="logo-image" />
                        </div>
                        <span className="brand-name">TecFix </span>
                    </div>

                    <div className="brand-content">
                        <h1>Building the Future...</h1>
                        <p>
                            Join our platform for expert electronics repair services.
                            Get access to professional diagnostics and quality repairs
                            with our certified technicians.
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Side - Register Form */}
            <div className="register-right">
                <div className="register-form-container">
                    <div className="form-header">
                        <h2>LET'S GET YOU STARTED</h2>
                        <h1>Create an Account</h1>
                    </div>

                    <form onSubmit={handleRegister} className="register-form">
                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                placeholder="johnsondoe@nomail.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="form-input"
                                required
                                disabled={isSubmitting}
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
                                    className="form-input password-input"
                                    required
                                    disabled={isSubmitting}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirm</label>
                            <div className="password-input-container">
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    placeholder="••••••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="form-input password-input"
                                    required
                                    disabled={isSubmitting}
                                />
                            </div>
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

                        <button type="submit" className="register-button" disabled={isSubmitting}>
                            {isSubmitting ? "CREATING ACCOUNT..." : "GET STARTED"}
                        </button>

                        <div className="divider">
                            <span>Or</span>
                        </div>

                        <div className="login-prompt">
                            <span>Already have an account? </span>
                            <a href="/login" className="login-link">LOGIN HERE</a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Register;