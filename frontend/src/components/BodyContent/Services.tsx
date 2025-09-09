import type React from "react";
import "./Home.css"

const Services : React.FC = () => {
  return (
    <div className="Mainbody">
        <h1>Our Services</h1>
        <p>We offer a wide range of electronics repair services to meet your needs.</p>
        <ul>
            <li>Smartphone Repair</li>
            <li>Laptop Repair</li>
            <li>Tablet Repair</li>
            <li>Gaming Console Repair</li>
            <li>Data Recovery</li>
            <li>Screen Replacement</li>
        </ul>
    </div>
  );
}

export default Services;