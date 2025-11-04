import React from "react";

export default function Header() {
  return (
    <header className="bg-transparent shadow-sm">
      <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-aqua-gradient flex items-center justify-center text-dark font-bold text-lg shadow-lg shadow-cyan-500/30">
            R
          </div>
          <div>
            <h1 className="text-lg font-semibold">RECORD</h1>
            <p className="text-xs text-slate-500">Cambios de divisas</p>
          </div>
        </div>
        <nav className="hidden md:flex gap-4 items-center">
          <a className="text-white hover:text-primary" href="#">
            Inicio
          </a>
          <a className="text-white hover:text-primary" href="#">
            Precios
          </a>
          <a className="text-white hover:text-primary" href="#">
            Tasas
          </a>
          <a className="text-white hover:text-primary" href="#">
            Contacto
          </a>
        </nav>
      </div>
    </header>
  );
}
