import React from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "../components/Sidebar";

const MainLayout: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-dark-bg">
      <Sidebar setShowEnhancePrompt={() => {}} />
      <main className="flex-1 ml-16 transition-all duration-300 ease-in-out overflow-y-auto scrollbar-hide">
        <div className="pt-2">
          <div className="min-h-[calc(100vh-3rem)]">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
