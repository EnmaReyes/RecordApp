import React, { useState } from "react";
import Header from "./components/Header";
import ExchangeHero from "./components/ExchangeHero";
import CurrencyTable from "./components/CurrencyTable.jsx";
import ExchangeBox from "./components/ExchangeBox.jsx";
import {
  CurrencyProvider,
  useCurrencies,
} from "./context/CurrencyProvider.jsx";
import Filter from "./components/Filter.jsx";

function AppContent() {
  const { fetchData, loading, updateOneFiatApi } = useCurrencies();

  return (
    <div className="bg-home-gradient min-h-screen text-white">
      <Header />
      <main className="flex flex-col justify-center items-center mx-auto px-4 py-8 ">
        <ExchangeHero onRefresh={fetchData} loading={loading} />
        <CurrencyTable onRefreshOneFiat={updateOneFiatApi} />
        <div className="sticky top-8 z-50">
          <Filter />
        </div>

        <ExchangeBox />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <CurrencyProvider>
      <AppContent />
    </CurrencyProvider>
  );
}
