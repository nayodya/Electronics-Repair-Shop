import type React from "react";
import { Route, Routes } from "react-router-dom";
import Home from "./Home";
import About from "./About";
import Services from "./Services";
import Contact from "./Contact";
import Register from "../Pages/Register";
import LogIn from "../Pages/LogIn"
import ForgotPassword from "../Pages/ForgotPassword";
import ResetPassword from "../Pages/ResetPassword";
import ProtectedRoute from "../ProtectedRoute";
import CustomerDashboard from "./Dashboards/CustomerDashboard";
import TechnicianDashboard from "./Dashboards/TechnicianDashboard";
import AdminDashboard from "./Dashboards/AdminDashboard";

const MainCOntent: React.FC = () => {
    return (
        <>
            <main>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/services" element={<Services />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/login" element={<LogIn />} />
                    <Route path="/forgotpassword" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/customer/dashboard" element={
                        <ProtectedRoute allowedRoles={["Customer"]}>
                            <CustomerDashboard />
                        </ProtectedRoute>
                    } />
                    <Route path="/technician/dashboard" element={
                        <ProtectedRoute allowedRoles={["Technician"]}>
                            <TechnicianDashboard />
                        </ProtectedRoute>
                    } />
                    <Route path="/admin/dashboard" element={
                        <ProtectedRoute allowedRoles={["Admin"]}>
                            <AdminDashboard />
                        </ProtectedRoute>
                    } />

                </Routes>
            </main>
        </>
    );
}

export default MainCOntent;