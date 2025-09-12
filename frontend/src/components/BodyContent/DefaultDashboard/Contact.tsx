import type React from "react";
import "./Contact.css"

const Contact : React.FC = () => {
  return (
    <div className="Contactbody">
      {/* Hero Section */}
      <section className="contact-hero">
        <div className="contact-hero-content">
          <h1>Get In Touch</h1>
          <p>Ready to fix your device? Have questions about our services? We're here to help!</p>
        </div>
      </section>

      {/* Main Contact Section */}
      <section className="contact-main">
        <div className="contact-container">
          {/* Contact Form */}
          <div className="contact-form-section">
            <h2>Send Us a Message</h2>
            <form className="contact-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName">First Name</label>
                  <input type="text" id="firstName" name="firstName" required />
                </div>
                <div className="form-group">
                  <label htmlFor="lastName">Last Name</label>
                  <input type="text" id="lastName" name="lastName" required />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input type="email" id="email" name="email" required />
                </div>
                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input type="tel" id="phone" name="phone" />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="device">Device Type</label>
                <select id="device" name="device">
                  <option value="">Select Device Type</option>
                  <option value="smartphone">Smartphone</option>
                  <option value="laptop">Laptop</option>
                  <option value="tablet">Tablet</option>
                  <option value="desktop">Desktop Computer</option>
                  <option value="gaming-console">Gaming Console</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="issue">Describe Your Issue</label>
                <textarea 
                  id="issue" 
                  name="issue" 
                  rows={5} 
                  placeholder="Please describe the problem with your device..."
                  required
                ></textarea>
              </div>

              <div className="form-group">
                <label htmlFor="urgency">Urgency Level</label>
                <div className="radio-group">
                  <label className="radio-label">
                    <input type="radio" name="urgency" value="low" />
                    <span>Low - No rush</span>
                  </label>
                  <label className="radio-label">
                    <input type="radio" name="urgency" value="medium" defaultChecked />
                    <span>Medium - Within a week</span>
                  </label>
                  <label className="radio-label">
                    <input type="radio" name="urgency" value="high" />
                    <span>High - ASAP</span>
                  </label>
                </div>
              </div>

              <button type="submit" className="submit-btn">
                Send Message
              </button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="contact-info-section">
            <h2>Contact Information</h2>
            
            <div className="contact-cards">
              <div className="contact-card">
                <div className="contact-icon">📧</div>
                <h3>Email Us</h3>
                <p>support@techfixpro.com</p>
                <p>info@techfixpro.com</p>
                <a href="mailto:support@techfixpro.com" className="contact-link">
                  Send Email
                </a>
              </div>

              <div className="contact-card">
                <div className="contact-icon">📞</div>
                <h3>Call Us</h3>
                <p>+1 (555) 123-4567</p>
                <p>Mon-Fri: 9AM-6PM</p>
                <a href="tel:+15551234567" className="contact-link">
                  Call Now
                </a>
              </div>

              <div className="contact-card">
                <div className="contact-icon">📍</div>
                <h3>Visit Us</h3>
                <p>123 Tech Street</p>
                <p>Electronics District, TD 12345</p>
                <a href="#" className="contact-link">
                  Get Directions
                </a>
              </div>

              <div className="contact-card">
                <div className="contact-icon">🕒</div>
                <h3>Business Hours</h3>
                <div className="hours-list">
                  <p><span>Mon-Fri:</span> 9:00 AM - 6:00 PM</p>
                  <p><span>Saturday:</span> 10:00 AM - 4:00 PM</p>
                  <p><span>Sunday:</span> Closed</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq-section">
        <div className="faq-container">
          <h2>Frequently Asked Questions</h2>
          <div className="faq-grid">
            <div className="faq-item">
              <h3>How long does a typical repair take?</h3>
              <p>Most repairs are completed within 24-48 hours. Complex issues may take longer.</p>
            </div>
            <div className="faq-item">
              <h3>Do you offer warranties on repairs?</h3>
              <p>Yes! We provide a 90-day warranty on all repair services.</p>
            </div>
            <div className="faq-item">
              <h3>What devices do you repair?</h3>
              <p>We repair smartphones, laptops, tablets, desktops, and gaming consoles.</p>
            </div>
            <div className="faq-item">
              <h3>Do you provide free estimates?</h3>
              <p>Yes, we offer free diagnostic and repair estimates for all devices.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="map-section">
        <div className="map-container">
          <h2>Find Our Location</h2>
          <div className="map-placeholder">
            <div className="map-content">
              <div className="map-icon">🗺️</div>
              <p>Interactive map coming soon</p>
              <p>123 Tech Street, Electronics District, TD 12345</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Contact;