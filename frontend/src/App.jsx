import { Routes, Route } from "react-router-dom";
import { Layout } from "./layout";
import ExchangeHero from "./components/ExchangeHero";
import CurrencyTable from "./components/CurrencyTable";
import ExchangeBox from "./components/ExchangeBox";
import Filter from "./components/Filter";
import { ToastContainer } from "react-toastify";
import { useCurrencies } from "./context/CurrencyProvider";
import { ExchangeCalculator } from "./components/Calculator/ExchangeCalculator";

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
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="calculator" element={<ExchangeCalculator />} />
      </Route>
    </Routes>
  );
}
