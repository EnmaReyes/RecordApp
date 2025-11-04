import React from "react";
import { FaSyncAlt } from "react-icons/fa";

export default function ExchangeHero({ onRefresh, loading }) {
  return (
    <section className="p-6 mb-6">
      <div className="flex flex-col md:items-center gap-4">
        {/* Título */}
        <div className="flex flex-col justify-center items-center text-center gap-2 mb-4">
          <h1 className="text-6xl font-bold">Cambio de Divisas</h1>
          <h1 className="text-6xl font-bold text-primary">Hazlo Fácil</h1>
          <p className="text-sm text-white/80 max-w-md">
            Obtén tipos de cambio en tiempo real con márgenes de beneficio
            personalizables. Ideal para casas de cambio e instituciones
            financieras.
          </p>
        </div>

        {/* Botones */}
        <div className="flex gap-3 items-center font-bold">
          <button
            onClick={onRefresh}
            disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-4 rounded-2xl bg-aqua-gradient text-white text-lg hover:opacity-95 shadow disabled:opacity-70 transition"
          >
            {loading ? (
              <>
                <FaSyncAlt className="animate-spin" />
                Actualizando...
              </>
            ) : (
              <>
                <FaSyncAlt />
                Actualizar Tasas
              </>
            )}
          </button>

          <button
            className="inline-flex items-center gap-2 px-5 py-4 rounded-2xl bg-transparent border-2 border-primary text-primary text-lg hover:opacity-95 shadow"
            disabled={loading}
          >
            Cotizar Ahora
          </button>
        </div>
      </div>
    </section>
  );
}
