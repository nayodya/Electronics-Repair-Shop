import type React from "react";
import "./About.css"

const About : React.FC = () => {
    return (
        <div className="Aboutbody">
            {/* Hero Section */}
            <section className="about-hero">
                <div className="about-hero-content">
                    <h1>About TechFix Pro</h1>
                    <p>Your trusted partner in electronics repair since 2016</p>
                </div>
            </section>

            {/* Our Story Section */}
            <section className="our-story">
                <div className="story-container">
                    <div className="story-content">
                        <div className="story-text">
                            <h2>Our Story</h2>
                            <p>
                                Founded in 2016, TechFix Pro started as a small repair shop with a big vision: 
                                to make quality electronics repair accessible and affordable for everyone. What began 
                                as a two-person operation has grown into a trusted repair service center serving thousands 
                                of satisfied customers.
                            </p>
                            <p>
                                Our journey has been driven by a simple principle – every device deserves a second chance. 
                                We believe in sustainable technology practices and helping our customers get the most out 
                                of their electronic investments.
                            </p>
                        </div>
                        <div className="story-image">
                            <div className="story-placeholder">
                                <div className="story-icon">🔧</div>
                                <p>Since 2016</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Mission & Vision Section */}
            <section className="mission-vision">
                <div className="mv-container">
                    <div className="mission-card">
                        <div className="mv-icon">🎯</div>
                        <h3>Our Mission</h3>
                        <p>
                            To provide fast, reliable, and affordable electronics repair services while 
                            promoting sustainable technology practices and exceptional customer satisfaction.
                        </p>
                    </div>
                    <div className="vision-card">
                        <div className="mv-icon">👁️</div>
                        <h3>Our Vision</h3>
                        <p>
                            To be the leading electronics repair service provider, known for innovation, 
                            quality, and environmental responsibility in the technology repair industry.
                        </p>
                    </div>
                </div>
            </section>

            {/* Our Values Section */}
            <section className="our-values">
                <div className="values-container">
                    <h2>Our Core Values</h2>
                    <div className="values-grid">
                        <div className="value-item">
                            <div className="value-icon">⚡</div>
                            <h3>Quality First</h3>
                            <p>We use only genuine parts and proven repair methods to ensure lasting solutions.</p>
                        </div>
                        <div className="value-item">
                            <div className="value-icon">🤝</div>
                            <h3>Customer Trust</h3>
                            <p>Transparent pricing, honest communication, and reliable service build lasting relationships.</p>
                        </div>
                        <div className="value-item">
                            <div className="value-icon">🌱</div>
                            <h3>Sustainability</h3>
                            <p>Extending device lifespan reduces electronic waste and supports environmental conservation.</p>
                        </div>
                        <div className="value-item">
                            <div className="value-icon">🏆</div>
                            <h3>Excellence</h3>
                            <p>Continuous learning and improvement ensure we stay ahead in repair technology.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <section className="our-team">
                <div className="team-container">
                    <h2>Meet Our Expert Team</h2>
                    <div className="team-grid">
                        <div className="team-member">
                            <div className="member-avatar">👨‍💻</div>
                            <h3>John Smith</h3>
                            <p className="member-role">Lead Technician</p>
                            <p className="member-bio">
                                15+ years experience in electronics repair. Specialized in smartphone and laptop repairs.
                            </p>
                        </div>
                        <div className="team-member">
                            <div className="member-avatar">👩‍🔬</div>
                            <h3>Sarah Johnson</h3>
                            <p className="member-role">Senior Repair Specialist</p>
                            <p className="member-bio">
                                Expert in gaming console repairs and diagnostic services. 10+ years in the industry.
                            </p>
                        </div>
                        <div className="team-member">
                            <div className="member-avatar">👨‍🔧</div>
                            <h3>Mike Davis</h3>
                            <p className="member-role">Hardware Specialist</p>
                            <p className="member-bio">
                                Focuses on desktop and server repairs. Certified in multiple hardware platforms.
                            </p>
                        </div>
                        <div className="team-member">
                            <div className="member-avatar">👩‍💼</div>
                            <h3>Emily Chen</h3>
                            <p className="member-role">Customer Service Manager</p>
                            <p className="member-bio">
                                Ensures exceptional customer experience and manages service quality standards.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Statistics Section */}
            <section className="about-stats">
                <div className="stats-container">
                    <h2>Our Achievement in Numbers</h2>
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-number">8+</div>
                            <div className="stat-label">Years of Experience</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-number">15,000+</div>
                            <div className="stat-label">Devices Repaired</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-number">98%</div>
                            <div className="stat-label">Success Rate</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-number">24hrs</div>
                            <div className="stat-label">Average Turnaround</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-number">4.9⭐</div>
                            <div className="stat-label">Customer Rating</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-number">90 Days</div>
                            <div className="stat-label">Warranty Period</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Why Choose Us Section */}
            <section className="why-choose-us">
                <div className="choose-container">
                    <h2>Why Choose TechFix Pro?</h2>
                    <div className="choose-grid">
                        <div className="choose-item">
                            <div className="choose-number">01</div>
                            <h3>Expert Technicians</h3>
                            <p>Our certified professionals have years of experience with all major brands and devices.</p>
                        </div>
                        <div className="choose-item">
                            <div className="choose-number">02</div>
                            <h3>Fast Service</h3>
                            <p>Most repairs completed within 24-48 hours with rush service available for urgent needs.</p>
                        </div>
                        <div className="choose-item">
                            <div className="choose-number">03</div>
                            <h3>Quality Parts</h3>
                            <p>We use only genuine OEM parts and high-quality alternatives with full warranty coverage.</p>
                        </div>
                        <div className="choose-item">
                            <div className="choose-number">04</div>
                            <h3>Fair Pricing</h3>
                            <p>Transparent pricing with free diagnostics and competitive rates for all repair services.</p>
                        </div>
                        <div className="choose-item">
                            <div className="choose-number">05</div>
                            <h3>Data Security</h3>
                            <p>Your personal data and files are protected with our secure handling and privacy protocols.</p>
                        </div>
                        <div className="choose-item">
                            <div className="choose-number">06</div>
                            <h3>Warranty Support</h3>
                            <p>All repairs come with our comprehensive warranty and ongoing customer support.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="about-cta">
                <div className="cta-content">
                    <h2>Ready to Experience Our Service?</h2>
                    <p>Join thousands of satisfied customers who trust TechFix Pro with their devices.</p>
                    <div className="cta-buttons">
                        <a href="#contact" className="cta-button primary">Get Free Quote</a>
                        <a href="#contact" className="cta-button secondary">Contact Us</a>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default About;