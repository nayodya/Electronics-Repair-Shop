import type React from "react";
import { Route, Routes } from "react-router-dom";
import Home from "./Home";
import About from "./About";
import Services from "./Services";
import Contact from "./Contact";

const MainCOntent : React.FC = () => {
    return (
        <>
        <main>
            <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/services" element={<Services />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />       
            </Routes>
        </main>            
        </>
    );
}

export default MainCOntent;