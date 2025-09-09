import type React from "react";
import "./Home.css"

const Contact : React.FC = () => {
  return (
    <div className="Mainbody">
        <h1>Contact Us</h1>
        <p>If you have any questions or need assistance, feel free to reach out to us!</p>
        <ul>
            <li>Email:</li>
            <li>Phone:</li>
            <li>Address:</li>
        </ul>
    </div>
  );
}

export default Contact;