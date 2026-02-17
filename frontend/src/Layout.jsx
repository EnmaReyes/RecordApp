import { Outlet } from "react-router-dom";
import Header from "./components/Header.jsx";
import MobileNavbar from "./components/MobileNavbar.jsx";

export const Layout = () => {
  return (
    <div className="bg-home-gradient min-h-screen text-white">
      {/* Header → tablet y desktop */}
      <div className="hidden md:block">
        <Header />
      </div>

      {/* Mobile Navbar → solo mobile */}
      <div className="block md:hidden">
        <MobileNavbar />
      </div>

      <main className="flex flex-col items-center mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
};
