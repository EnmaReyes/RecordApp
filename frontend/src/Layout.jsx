import { Outlet } from "react-router-dom";
import Header from "./components/Header.jsx";

export const Layout = () => {
  return (
    <div className="bg-home-gradient min-h-screen text-white">
      <Header />

      <main className="flex flex-col justify-center items-center mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
};
