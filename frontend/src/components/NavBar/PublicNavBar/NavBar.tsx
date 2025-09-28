
import { useState } from "react";
import "./Navbar.css";
import { Link } from "react-router-dom";

function NavBar() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    return (
        <div className="navbar">
            {/* Logo Section */}
            <div className="logo-section">
                <img src="" alt="Logo" />
                <a href="#home" className="brand-name">TechFix Pro</a>
            </div>

            {/* Desktop Navigation Links */}
            <div className="nav-center">
                <Link to="/" className="nav-link">Home</Link>
                <Link to="/services" className="nav-link">Services</Link>
                <Link to="/about" className="nav-link">About us</Link>
                <Link to="/contact" className="nav-link">Contact Us</Link>
            </div>

            {/* Right Side Actions */}
            <div className="nav-actions">
                <Link to="/login" className="login-btn">SignIn</Link>
                <Link to="/register" className="register-btn">Join Now</Link>
            </div>

            {/* Mobile Menu Toggle */}
            <button 
                className="mobile-menu-toggle"
                onClick={toggleMobileMenu}
                aria-label="Toggle mobile menu"
            >
                <span></span>
                <span></span>
                <span></span>
            </button>

            {/* Mobile Menu */}
            <div className={`mobile-menu ${isMobileMenuOpen ? 'active' : ''}`}>
                <Link to="/" className="mobile-nav-link">Home</Link>
                <Link to="/services" className="mobile-nav-link">Services</Link>
                <Link to="/about" className="mobile-nav-link">About us</Link>
                <Link to="/contact" className="mobile-nav-link">Contact Us</Link>
                <div className="mobile-actions">
                    <Link to="/login" className="mobile-login-btn">SignIn</Link>
                    <Link to="/register" className="mobile-register-btn">Join Now</Link>
                </div>
            </div>
        </div>
    );
}

export default NavBar;