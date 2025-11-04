import React from "react";

export default function RateCard({ rate }) {
  return (
    <article className="bg-white p-4 rounded-xl shadow-sm flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">{rate.title}</h3>
          <p className="text-xs text-slate-500">{rate.desc}</p>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold">{rate.price}</div>
          <div
            className={`text-xs ${
              rate.change?.startsWith("-") ? "text-red-500" : "text-green-600"
            }`}
          >
            {rate.change}
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <button className="flex-1 py-2 rounded-md border border-slate-200 text-sm hover:bg-slate-50">
          Ver detalles
        </button>
        <a
          href={`https://api.whatsapp.com/send?phone=&text=${encodeURIComponent(
            `Hola! quisiera cotización ${rate.title} - ${rate.price}`
          )}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-emerald-500 text-white text-sm"
        >
          WhatsApp
        </a>
      </div>
    </article>
  );
}
