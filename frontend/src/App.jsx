import React, { useState } from "react";
import ExchangeHero from "./components/ExchangeHero.jsx";
import CurrencyTable from "./components/CurrencyTable.jsx";
import ExchangeBox from "./components/ExchangeBox.jsx";
import {
  CurrencyProvider,
  useCurrencies,
} from "./context/CurrencyProvider.jsx";
import Filter from "./components/Filter.jsx";
import { ToastContainer } from "react-toastify";
import { Routes, Route } from "react-router-dom";
import { ExchangeCalculator } from "./components/ExchangeCalculator.jsx";
import { Layout } from "./layout.jsx";

const Home = () => {
  const { fetchData, loading, updateOneFiatApi } = useCurrencies();

  return (
    <>
      <ExchangeHero onRefresh={fetchData} loading={loading} />
      <CurrencyTable onRefreshOneFiat={updateOneFiatApi} />

      <div className="sticky top-8 z-50">
        <Filter />
      </div>

      <ExchangeBox />
      <ToastContainer />
    </>
  );
};

export default function App() {
  return (
    <CurrencyProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/calculator" element={<ExchangeCalculator />} />
        </Route>
      </Routes>
    </CurrencyProvider>
  );
}
