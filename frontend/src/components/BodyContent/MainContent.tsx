import type React from "react";
import { Outlet } from "react-router-dom";

const MainContent: React.FC = () => {
    return <Outlet />;
}

export default MainContent;