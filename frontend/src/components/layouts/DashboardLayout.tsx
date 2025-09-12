import React from "react";
import { Outlet } from "react-router-dom";
import DashboardNavBar from "../NavBar/DashboardNavBar";
import DashboardFooter from "../Footer/DashboardFooter";

const DashboardLayout: React.FC = () => {
  return (
    <>
      <DashboardNavBar />
      <main>
        <Outlet />
      </main>
      <DashboardFooter />
    </>
  );
};

export default DashboardLayout;