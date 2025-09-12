import type React from "react";
import "./Service.css"

const Services : React.FC = () => {
  return (
    <div className="services-container">
      <div className="services-header">
        <h1>Our Services</h1>
        <p>We offer a wide range of electronics repair services to meet your needs.</p>
      </div>
      
      <div className="services-grid">
        <div className="service-card">
          <div className="service-icon">📱</div>
          <h3>Smartphone Repair</h3>
          <p>Complete smartphone repair including screen replacement, battery issues, and software problems.</p>
        </div>
        
        <div className="service-card">
          <div className="service-icon">💻</div>
          <h3>Laptop Repair</h3>
          <p>Professional laptop repair services covering hardware and software issues.</p>
        </div>
        
        <div className="service-card">
          <div className="service-icon">📟</div>
          <h3>Tablet Repair</h3>
          <p>Expert tablet repair for all major brands and models.</p>
        </div>
        
        <div className="service-card">
          <div className="service-icon">🎮</div>
          <h3>Gaming Console Repair</h3>
          <p>Gaming console repair for PlayStation, Xbox, Nintendo, and more.</p>
        </div>
        
        <div className="service-card">
          <div className="service-icon">💾</div>
          <h3>Data Recovery</h3>
          <p>Professional data recovery services for damaged or corrupted storage devices.</p>
        </div>
        
        <div className="service-card">
          <div className="service-icon">🖥️</div>
          <h3>Screen Replacement</h3>
          <p>High-quality screen replacement for smartphones, tablets, and laptops.</p>
        </div>
      </div>
    </div>
  );
}

export default Services;