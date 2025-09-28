import React from "react";
import { Outlet } from "react-router-dom";
import PublicFooter from "../Footer/Footer";
import PublicNavBar from "../NavBar/PublicNavBar/Navbar";

const PublicLayout: React.FC = () => {
  return (
    <>
      <PublicNavBar />
      <main>
        <Outlet />
      </main>
      <PublicFooter />
    </>
  );
};

export default PublicLayout;