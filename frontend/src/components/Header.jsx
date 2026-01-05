import React from "react";
import "../App.css";
export default function Header() {
  return (
    <header className="sticky top-0  bg-dark/45 shadow-sm w-full z-10">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3 logo">
          <a href="#inicio">
            <div className="w-10 h-10 rounded-lg bg-aqua-gradient flex items-center justify-center text-dark font-bold text-lg shadow-lg shadow-cyan-500/30 spin-logo">
              R
            </div>
          </a>
          <div>
            <h1 className="text-lg font-semibold">RECORD</h1>
            <p className="text-xs text-slate-500">Cambios de divisas</p>
          </div>
        </div>
        <nav className="hidden md:flex gap-4 items-center ">
          <a
            className="text-white hover:text-primary textanimate"
            href="#inicio"
          >
            Inicio
          </a>
          <a
            className="text-white hover:text-primary textanimate"
            href="#prices"
          >
            Precios
          </a>
          <a
            className="text-white hover:text-primary textanimate"
            href="#tasas"
          >
            Tasas
          </a>
           <a
            className="text-white hover:text-primary textanimate"
            href="/calculator"
          >
            Calculador
          </a>
        </nav>
      </div>
    </header>
  );
}
