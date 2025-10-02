import "./Navbar.css";
import { Link } from "react-router-dom";

function NavBar() {
    return (
        <div className="navbar">
            <div className="logo-section">
                <img src="/images/logo.png" alt="Logo" />
                <a href="/" className="brand-name">TecFix</a>
            </div>

            <div className="nav-center">
                <Link to="/" className="nav-link">Home</Link>
                <Link to="/services" className="nav-link">Services</Link>
                <Link to="/about" className="nav-link">About us</Link>
                <Link to="/contact" className="nav-link">Contact Us</Link>
            </div>

            <div className="nav-actions">
                <Link to="/login" className="login-btn">SignIn</Link>
                <Link to="/register" className="register-btn">Join Now</Link>
            </div>
        </div>
    );
}

export default NavBar;