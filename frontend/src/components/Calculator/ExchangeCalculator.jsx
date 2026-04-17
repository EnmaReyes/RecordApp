import { useEffect } from "react";
import { Calculator } from "./Calculator";
import { useLocation } from "react-router-dom";
import { useCurrencies } from "../../context/CurrencyProvider";

export const ExchangeCalculator = () => {
  const { state } = useLocation();
  const { loading } = useCurrencies();

  if (loading) return null;

  // 1️⃣ FROM y TO (state tiene prioridad)
  const from = state?.from ?? "COP";
  const to = state?.to ?? "VES";
  const rate = state?.rate;

  useEffect(() => {
    const section = document.getElementById("calculator");
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  return (
    <section
      id="calculator"
      className="w-full mx-auto px-2 md:px-4 py-8 md:py-12 mb-6 md:mb-12"
    >
      <div className="flex justify-center">
        <Calculator from={from} to={to} rate={rate} />
      </div>
    </section>
  );
};
