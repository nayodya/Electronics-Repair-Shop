import type React from "react";
import "./Main.css"

const Main :React.FC = () => {
  return (
    <>
      {/* Hero Section */}
      <section className="hero-section bg-gradient-to-r from-blue-600 to-purple-700 text-white py-20">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-5xl font-bold mb-6">Professional Electronics Repair</h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Fast, reliable, and affordable repair services for all your electronic devices.
            Expert technicians with years of experience.
          </p>
          <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition duration-300">
            Get Free Quote
          </button>
        </div>
      </section>

      {/* Services Section */}
      <section className="services-section py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-800">Our Services</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="service-card bg-white p-6 rounded-lg shadow-lg text-center">
              <div className="text-4xl mb-4">📱</div>
              <h3 className="text-xl font-semibold mb-3">Mobile Devices</h3>
              <p className="text-gray-600">Screen replacement, battery repair, water damage restoration</p>
            </div>
            <div className="service-card bg-white p-6 rounded-lg shadow-lg text-center">
              <div className="text-4xl mb-4">💻</div>
              <h3 className="text-xl font-semibold mb-3">Computers & Laptops</h3>
              <p className="text-gray-600">Hardware upgrades, virus removal, system optimization</p>
            </div>
            <div className="service-card bg-white p-6 rounded-lg shadow-lg text-center">
              <div className="text-4xl mb-4">🎮</div>
              <h3 className="text-xl font-semibold mb-3">Gaming Consoles</h3>
              <p className="text-gray-600">Console repair, controller fixes, system maintenance</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section py-16">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6 text-gray-800">Why Choose Us?</h2>
              <div className="space-y-4">
                <div className="flex items-center">
                  <span className="text-green-500 text-xl mr-3">✓</span>
                  <span className="text-lg">Quick turnaround time</span>
                </div>
                <div className="flex items-center">
                  <span className="text-green-500 text-xl mr-3">✓</span>
                  <span className="text-lg">90-day warranty on all repairs</span>
                </div>
                <div className="flex items-center">
                  <span className="text-green-500 text-xl mr-3">✓</span>
                  <span className="text-lg">Certified technicians</span>
                </div>
                <div className="flex items-center">
                  <span className="text-green-500 text-xl mr-3">✓</span>
                  <span className="text-lg">Free diagnostics</span>
                </div>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 p-8 rounded-lg">
                <div className="text-6xl mb-4">🔧</div>
                <h3 className="text-2xl font-semibold text-gray-800">Expert Repairs</h3>
                <p className="text-gray-600 mt-2">Professional service you can trust</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="stats-section bg-blue-600 text-white py-16">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">5000+</div>
              <div className="text-lg">Devices Repaired</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">98%</div>
              <div className="text-lg">Success Rate</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">24hrs</div>
              <div className="text-lg">Average Repair Time</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">5⭐</div>
              <div className="text-lg">Customer Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section py-16 bg-gray-900 text-white text-center">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold mb-4">Ready to Fix Your Device?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Contact us today for a free diagnostic and quote. We'll have your device working like new!
          </p>
          <div className="space-x-4">
            <button className="bg-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-300">
              Book Repair
            </button>
            <button className="border-2 border-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-gray-900 transition duration-300">
              Call Us Now
            </button>
          </div>
        </div>
      </section>
    </>
  );
}

export default Main