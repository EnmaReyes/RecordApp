import React from "react";
import { FaClock } from "react-icons/fa";
import { useCurrencies } from "../context/CurrencyProvider";
import ReactCountryFlag from "react-country-flag";
import "../index.css";
import { formatUpdateTime } from "./DayAndTime";

/* Constantes exportables para reutilizar o testear */
export const FIAT_NAMES = {
  USD: "Zelle Dollar",
  EUR: "Euro",
  CLP: "Pesos chilenos",
  COP: "Pesos colombianos",
  ARS: "Pesos argentinos",
  VES: "Bolívares venezolanos",
  MXN: "Pesos mexicanos",
  UYU: "Pesos uruguayos",
  BRL: "Reales brasileños",
  PEN: "Soles peruanos",
  PAN: "Panama USD",
  ECU: "Ecuador USD",
};

export const FIAT_FLAGS = {
  USD: "US",
  EUR: "EU",
  CLP: "CL",
  COP: "CO",
  ARS: "AR",
  VES: "VE",
  MXN: "MX",
  UYU: "UY",
  BRL: "BR",
  PEN: "PE",
  PAN: "PA",
  ECU: "EC",
};

/* Helper para formatear números de forma segura */
const formatNumber = (value) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return "--";
  return new Intl.NumberFormat("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
};

/* Fila de tabla separada para evitar repetir JSX */
const CurrencyRow = React.memo(function CurrencyRow({
  cur,
  fiatName,
  fiatFlag,
  isLoading,
  onRefresh,
}) {
  const idKey = cur.id ?? cur.fiat;
  const buy = formatNumber(cur.buyPrice);
  const sell = formatNumber(cur.sellPrice);
  const spread =
    typeof cur.spread === "number" && Number.isFinite(cur.spread)
      ? `${cur.spread.toFixed(2)}%`
      : "--";

  return (
    <tr
      key={idKey}
      className="bg-white/5 hover:bg-white/10 transition rounded-lg"
    >
      <td className="py-3 px-4">
        <div className="flex items-center">
          <button
            onClick={() => onRefresh(cur.fiat)}
            className="relative group flex items-center justify-center w-10 h-10 rounded-xl hover:bg-white/20 transition-all duration-300 mr-3"
            aria-label={`Refrescar ${cur.fiat}`}
            disabled={isLoading}
            title={`Refrescar ${cur.fiat}`}
          >
            {isLoading ? (
              <div
                className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"
                role="status"
                aria-hidden="true"
              />
            ) : (
              <ReactCountryFlag
                countryCode={fiatFlag ?? ""}
                svg
                style={{ fontSize: "1.8em" }}
                className="transition-transform duration-200 group-hover:scale-110"
              />
            )}
          </button>

          <div>
            <div className="font-bold">{cur.fiat}</div>
            <div className="text-gray-300 text-sm">{fiatName ?? cur.fiat}</div>
          </div>
        </div>
      </td>

      <td className="py-3 px-4 font-mono">{buy}</td>
      <td className="py-3 px-4 font-mono">{sell}</td>
      <td className="py-3 px-4 font-semibold text-cyan-400">{spread}</td>
    </tr>
  );
});

const CurrencyTable = ({ onRefreshOneFiat }) => {
  const { currencies, loading } = useCurrencies();
  const [loadingFiat, setLoadingFiat] = React.useState(null);

  const safeCurrencies = Array.isArray(currencies) ? currencies : [];

  const handleRefresh = React.useCallback(
    async (fiat) => {
      setLoadingFiat(fiat);
      try {
        await onRefreshOneFiat(fiat);
      } catch (err) {
        console.error("Error refreshing fiat", fiat, err);
      } finally {
        setLoadingFiat(null);
      }
    },
    [onRefreshOneFiat],
  );

  const latestUpdate = React.useMemo(() => {
    if (!safeCurrencies.length) return null;
    const withDates = safeCurrencies.filter((c) => c?.updatedAt);
    if (!withDates.length) return null;
    return withDates.sort(
      (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt),
    )[0];
  }, [safeCurrencies]);

  const updateLabel = latestUpdate
    ? formatUpdateTime(latestUpdate.updatedAt)
    : "--";

  if (loading || safeCurrencies.length === 0) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-transparent text-white">
        <p className="text-lg animate-pulse">Cargando datos...</p>
      </div>
    );
  }

  return (
    <div
      id="prices"
      className="card-wrapper min-h-screen w-[98%] md:w-[90%] flex items-center justify-center text-white my-10"
    >
      <div className="w-[90%] md:w-[100%] p-4 md:p-6 card-content">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">PRECIOS</h2>
          <div className="flex flex-col items-center justify-center text-sm text-gray-300">
            <span className="text-end text-white/60">Última actualización</span>
            <div className="flex flex-row items-center">
              <FaClock className="mr-2" />
              <p className="font-bold text-white">{updateLabel}</p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left border-separate border-spacing-y-2">
            <thead>
              <tr className="text-cyan-400 text-sm uppercase tracking-wide">
                <th className="py-2 px-4">Moneda</th>
                <th className="py-2 px-4">Compra</th>
                <th className="py-2 px-4">Venta</th>
                <th className="py-2 px-4">Spread</th>
              </tr>
            </thead>

            <tbody>
              {safeCurrencies.map((cur) => (
                <CurrencyRow
                  key={cur.id ?? cur.fiat}
                  cur={cur}
                  fiatName={FIAT_NAMES[cur.fiat]}
                  fiatFlag={FIAT_FLAGS[cur.fiat]}
                  isLoading={loadingFiat === cur.fiat}
                  onRefresh={handleRefresh}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CurrencyTable;
