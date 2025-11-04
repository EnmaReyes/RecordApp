import React, { useState } from "react";
import RatesGrid from "./components/RatesGrid";
import Header from "./components/Header";
import WhatsAppButton from "./components/WhatsAppButton";
import ExchangeHero from "./components/ExchangeHero";
import sampleData from "./data/SampleData.jsx";
import CurrencyTable from "./components/CurrencyTable.jsx";
import {
  CurrencyProvider,
  useCurrencies,
} from "./context/CurrencyProvider.jsx";

// 🧠 Este componente sí puede usar el contexto
function AppContent() {
  const [rates, setRates] = useState(sampleData);
  const { fetchData, loading } = useCurrencies();

  return (
    <div className="bg-home-gradient min-h-screen text-white">
      <Header />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <ExchangeHero onRefresh={fetchData} loading={loading} />
        <CurrencyTable />
        <RatesGrid rates={rates} />
      </main>
      <WhatsAppButton />
    </div>
  );
}

// 🚀 App principal: envuelve todo con el Provider
export default function App() {
  return (
    <CurrencyProvider>
      <AppContent />
    </CurrencyProvider>
  );
}
