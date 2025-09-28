import React from "react";
import "./Home.css";
import { MdFeaturedPlayList } from "react-icons/md";
import { BsLaptop } from "react-icons/bs";
import { GiAutoRepair } from "react-icons/gi";
import { MdEngineering } from "react-icons/md";

const Home: React.FC = () => {
  return (
    <div className="Mainbody">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h1>Professional Electronics Repair Services</h1>
            <p >Expert solutions for all your electronic devices with 8+ years of experience</p>
            <button className="cta-button">Repair</button>
          </div>
          <div className="hero-image">
            <div className="repair-illustration">
              <div className="device-icon"><BsLaptop /></div>
              <div className="repair-tools"><GiAutoRepair /></div>
              <div className="technician"><MdEngineering /></div>
            </div>
          </div>
        </div>
      </section>
{/* 
      Photo collage section
      <section className="photo-collage">
        <div className="collage-grid">
          <img src="/images/image1.jpg" alt="Repair 1" className="collage-image" />
          <img src="/images/image2.jpg" alt="Repair 2" className="collage-image" />
          <img src="/images/image3.jpg" alt="Repair 3" className="collage-image" />
          <img src="/images/image4.jpg" alt="Repair 4" className="collage-image" />
          <img src="/images/image5.jpeg" alt="Repair 5" className="collage-image" />
          <img src="/images/image6.jpeg" alt="Repair 6" className="collage-image" />
          <img src="/images/image7.jpg" alt="Repair 7" className="collage-image" />
          <img src="/images/image8.jpeg" alt="Repair 8" className="collage-image" />
          <img src="/images/image9.jpg" alt="Repair 9" className="collage-image" />
          <img src="/images/image10.jpg" alt="Repair " className="collage-image" />
        </div>
      </section> */}


      {/* Client Logos Section */}
      <section className="clients-section">
        <h3>Our Clients</h3>
        <div className="client-logos">
          <div className="logo-item">Apple</div>
          <div className="logo-item">Samsung</div>
          <div className="logo-item">Sony</div>
          <div className="logo-item">LG</div>
          <div className="logo-item">HP</div>
        </div>
      </section>

      {/* Services Section */}
      <section className="services-section">
        <div className="service-card main-service">
          <h2>Manage your entire electronics repair in one system</h2>
          <div className="service-features">
            <div className="feature-item">
              <div className="feature-icon"><MdFeaturedPlayList /></div>
              <div>
                <h4>Diagnostic Services</h4>
                <p>Complete device analysis</p>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-icon">⚡</div>
              <div>
                <h4>Quick Repairs</h4>
                <p>Fast turnaround time</p>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-icon">💎</div>
              <div>
                <h4>Quality Parts</h4>
                <p>Original components only</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="stats-section">
        <div className="stats-container">
          <div className="stats-text">
            <h2>The impact of spending three years at TechFix Pro</h2>
          </div>
          <div className="stats-visual">
            <div className="repair-animation">
              <div className="broken-device">📱💥</div>
              <div className="arrow">→</div>
              <div className="fixed-device">📱✨</div>
            </div>
          </div>
        </div>
      </section>

      {/* Business Growth Section */}
      <section className="growth-section">
        <div className="growth-content">
          <div className="growth-text">
            <h2>Building a local business network itself</h2>
            <div className="growth-stats">
              <div className="stat-item">
                <span className="stat-number">5,000+</span>
                <span className="stat-label">Devices Repaired</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">98%</span>
                <span className="stat-label">Success Rate</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">24hrs</span>
                <span className="stat-label">Average Repair Time</span>
              </div>
            </div>
          </div>
          <div className="growth-visual">
            <div className="network-illustration">
              <div className="center-node">🏪</div>
              <div className="connection-nodes">
                <div className="node">👥</div>
                <div className="node">🔧</div>
                <div className="node">📱</div>
                <div className="node">💻</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How We Help Section */}
      <section className="help-section">
        <div className="help-content">
          <div className="help-visual">
            <div className="phone-repair">
              <div className="phone-screen">📱</div>
              <div className="repair-process">
                <div className="step">1️⃣</div>
                <div className="step">2️⃣</div>
                <div className="step">3️⃣</div>
              </div>
            </div>
          </div>
          <div className="help-text">
            <h2>Here's to helping your day further like we did</h2>
            <p>Our comprehensive repair process ensures your device gets the best care possible.</p>
            <button className="learn-more-btn">Learn More</button>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="testimonial-section">
        <div className="testimonial-content">
          <div className="testimonial-logo">
            <div className="logo-placeholder">⚡</div>
          </div>
          <blockquote>
            "TechFix Pro saved my business laptop when I thought it was beyond repair. Their expertise and quick service got me back to work in no time!"
          </blockquote>
          <div className="client-logos-small">
            <span>Trusted by 1000+ customers</span>
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section className="blog-section">
        <h2>Caring is the new marketing</h2>
        <div className="blog-grid">
          <article className="blog-card">
            <div className="blog-image">📱</div>
            <h3>5 Signs Your Phone Needs Professional Repair</h3>
            <p>Learn when to bring your device to professionals...</p>
            <span className="read-time">5 min read</span>
          </article>
          <article className="blog-card">
            <div className="blog-image">💻</div>
            <h3>Laptop Maintenance Tips for Longevity</h3>
            <p>Keep your laptop running smoothly with these tips...</p>
            <span className="read-time">7 min read</span>
          </article>
          <article className="blog-card">
            <div className="blog-image">🎮</div>
            <h3>Gaming Console Repair: What We Fix</h3>
            <p>From controllers to system errors, we fix it all...</p>
            <span className="read-time">4 min read</span>
          </article>
        </div>
      </section>

      {/* CTA Section */}
      <section className="final-cta">
        <h2>Ready to fix your device?</h2>
        <p>Get professional repair services today</p>
        <button className="cta-button large">Get Started</button>
      </section>
    </div>
  );
}

export default Home;