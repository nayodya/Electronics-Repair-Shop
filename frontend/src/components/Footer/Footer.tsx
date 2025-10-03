import { FaFacebook, FaInstagram, FaLinkedin, FaTwitter } from "react-icons/fa6";
import "./Footer.css";

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <div className="footer-brand">
            <img src="images/logo.png" alt="Electronics Repair Shop" className="footer-logo" />
            <h3>Electronics Repair Shop</h3>
            <p>Your trusted partner for all electronics repair needs. Quality service, guaranteed results.</p>
          </div>
        </div>

        <div className="footer-section">
          <h4>Services</h4>
          <ul>
            <li><a href="#smartphone-repair">Smartphone Repair</a></li>
            <li><a href="#laptop-repair">Laptop Repair</a></li>
            <li><a href="#tablet-repair">Tablet Repair</a></li>
            <li><a href="#gaming-console">Gaming Console</a></li>
            <li><a href="#data-recovery">Data Recovery</a></li>
            <li><a href="#screen-replacement">Screen Replacement</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Contact Info</h4>
          <div className="contact-info">
            <div className="contact-item">
              <span className="contact-icon"></span>
              <p>123 Tech Street<br />Electronics City, EC 12345</p>
            </div>
            <div className="contact-item">
              <span className="contact-icon"></span>
              <p>(555) 123-TECH<br />(555) 123-8324</p>
            </div>
            <div className="contact-item">
              <span className="contact-icon"></span>
              <p>info@electrorepair.com<br />support@electrorepair.com</p>
            </div>
            <div className="contact-item">
              <span className="contact-icon"></span>
              <p>Mon-Fri: 9AM-7PM<br />Sat: 10AM-5PM</p>
            </div>
          </div>
        </div>

        <div className="footer-section">
          <h4>Follow Us</h4>
          <div className="social-links">
            <a href="#facebook" aria-label="Facebook"><FaFacebook /></a>
            <a href="#twitter" aria-label="Twitter"><FaTwitter /></a>
            <a href="#instagram" aria-label="Instagram"><FaInstagram /></a>
            <a href="#linkedin" aria-label="LinkedIn"><FaLinkedin /></a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-content">
          <p>&copy; 2024 Electronics Repair Shop. All rights reserved.</p>
          <div className="footer-links">
            <a href="#privacy">Privacy Policy</a>
            <a href="#terms">Terms of Service</a>
            <a href="#sitemap">Sitemap</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;