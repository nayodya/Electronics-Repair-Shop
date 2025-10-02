import React from "react";
import { useNavigate } from "react-router-dom";
import "./EmailVerificationSent.css";

const EmailVerificationSent: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="verification-container">
            {/* Left Side - Branding */}
            <div className="verification-left">
                <div className="brand-section">
                    <div className="brand-logo">
            <div className="logo-icon">
              <img src="/images/logo.png" alt="TecFix Logo" className="logo-image" />
            </div>
            <span className="brand-name">TecFix </span>
          </div>
                    
                    <div className="brand-content">
                        <h1>Almost There...</h1>
                        <p>
                            We've sent you a verification email to confirm your account.
                            Check your inbox and click the verification link to complete
                            your registration with our repair platform.
                        </p>
                        <div className="brand-accent"></div>
                    </div>
                </div>
            </div>

            {/* Right Side - Verification Content */}
            <div className="verification-right">
                <div className="verification-content">
                    <div className="verification-icon">
                        <span className="email-icon">📧</span>
                    </div>
                    
                    <h1>Check Your Email</h1>
                    <p>
                        We've sent a verification link to your email address. 
                        Please check your inbox and click the link to verify your account.
                    </p>
                    
                    <div className="verification-info">
                        <div className="info-item">
                            <span className="info-icon">⏰</span>
                            <span>Verification link expires in 24 hours</span>
                        </div>
                        <div className="info-item">
                            <span className="info-icon">📁</span>
                            <span>Don't forget to check your spam folder</span>
                        </div>
                        <div className="info-item">
                            <span className="info-icon">🔒</span>
                            <span>Your account is secure and protected</span>
                        </div>
                    </div>

                    <div className="verification-actions">
                        <button 
                            onClick={() => navigate("/login")} 
                            className="login-button"
                        >
                            GO TO LOGIN
                        </button>
                        <button 
                            onClick={() => navigate("/register")} 
                            className="back-button"
                        >
                            BACK TO REGISTER
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmailVerificationSent;