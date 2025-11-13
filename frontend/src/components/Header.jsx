import React from "react";
import "../App.css";
export default function Header() {
  return (
    <header className="bg-dark/45 shadow-sm fixed w-full z-10">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3 logo">
          <div className="w-10 h-10 rounded-lg bg-aqua-gradient flex items-center justify-center text-dark font-bold text-lg shadow-lg shadow-cyan-500/30">
            <a href="#inicio">R</a>
          </div>
          <div>
            <h1 className="text-lg font-semibold">RECORD</h1>
            <p className="text-xs text-slate-500">Cambios de divisas</p>
          </div>
        </div>
        <nav className="hidden md:flex gap-4 items-center">
          <a className="text-white hover:text-primary" href="#inicio">
            Inicio
          </a>
          <a className="text-white hover:text-primary" href="#prices">
            Precios
          </a>
          <a className="text-white hover:text-primary" href="#tasas">
            Tasas
          </a>
          <a className="text-white hover:text-primary" href="#contacto">
            Contacto
          </a>
        </nav>
      </div>
    </header>
  );
}
