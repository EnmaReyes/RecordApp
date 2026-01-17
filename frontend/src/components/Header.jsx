import React from "react";
import "../App.css";
import { useNavigate, useLocation, Link } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();

  const goToSection = (id) => {
    if (location.pathname !== "/") {
      navigate("/", { state: { scrollTo: id } });
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className="sticky top-0  bg-dark/45 shadow-sm w-full z-10">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3 logo">
          <Link to="/" className="logo">
            <div className="w-10 h-10 rounded-lg bg-aqua-gradient flex items-center justify-center text-dark font-bold text-lg shadow-lg shadow-cyan-500/30 spin-logo">
              R
            </div>
          </Link>
          <div>
            <h1 className="text-lg font-semibold">RECORD</h1>
            <p className="text-xs text-slate-500">Cambios de divisas</p>
          </div>
        </div>
        <nav className="hidden md:flex gap-4 items-center ">
          <button
            className="text-white hover:text-primary textanimate"
            onClick={() => goToSection("inicio")}
          >
            Inicio
          </button>
          <button
            className="text-white hover:text-primary textanimate"
            onClick={() => goToSection("prices")}
          >
            Precios
          </button>
          <button
            className="text-white hover:text-primary textanimate"
            onClick={() => goToSection("tasas")}
          >
            Tasas
          </button>
          <button
            className="text-white hover:text-primary textanimate"
            onClick={() => navigate("calculator")}
          >
            Calculador
          </button>
        </nav>
      </div>
    </header>
  );
}
