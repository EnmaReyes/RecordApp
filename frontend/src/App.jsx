import React, { useState, useEffect } from "react";
import RatesGrid from "./components/RatesGrid";
import Header from "./components/Header";
import WhatsAppButton from "./components/WhatsAppButton";
import ExchangeHero from "./components/ExchangeHero";
import sampleData from "./data/SampleData.jsx";

export default function App() {
  const [rates, setRates] = useState(sampleData);
  const [loading, setLoading] = useState(false);

  // ejemplo: función para refrescar (podés sustituir por llamada real a tu API)
  async function refreshRates() {
    setLoading(true);
    try {
      // Si querés usar API, cambia aquí la llamada (fetch/axios) y formatea al mismo shape.
      // Simulo un refresh:
      await new Promise((r) => setTimeout(r, 700));
      setRates((prev) =>
        prev.map((r) => ({
          ...r,
          price: (
            parseFloat(r.price) *
            (1 + (Math.random() - 0.5) / 50)
          ).toFixed(2),
        }))
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // si quisiéramos traer data al montar, hacerlo aquí
  }, []);

  return (
    <div className="bg-gradient-to-r from-[#060224] via-[#0B0B73] to-[#03498F] min-h-screen text-white">
      <Header />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <ExchangeHero onRefresh={refreshRates} loading={loading} />
        <RatesGrid rates={rates} />
      </main>

      <WhatsAppButton />
    </div>
  );
}
