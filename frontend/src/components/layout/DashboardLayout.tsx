import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

export default function DashboardLayout() {
  return (
    <div className="flex h-screen bg-slate-900 text-white">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <div className="p-6 overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
