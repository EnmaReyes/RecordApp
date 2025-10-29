import React from "react";

export default function ExchangeHero({ onRefresh, loading }) {
  return (
    <section className="bg-white rounded-2xl p-6 mb-6 shadow">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Cotizaciones en tiempo real</h2>
          <p className="text-sm text-slate-500">
            Actualiza manualmente o automatiza con tu API
          </p>
        </div>

        <div className="flex gap-3 items-center">
          <button
            onClick={onRefresh}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white hover:opacity-95 shadow"
            disabled={loading}
          >
            {loading ? "Actualizando..." : "Refrescar tasas"}
          </button>
          <div className="text-sm text-slate-600">
            Última actualización: ahora
          </div>
        </div>
      </div>
    </section>
  );
}
