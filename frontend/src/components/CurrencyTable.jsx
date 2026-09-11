import React from "react";
import { useCurrencies } from "../context/CurrencyProvider";
import ReactCountryFlag from "react-country-flag";
import "../index.css";
import PriceFilters from "./PriceFilters";

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

/* ============================================================
   FORMATEAR NÚMEROS
============================================================ */

const formatNumber = (value) => {
  const num = Number(value);

  if (!Number.isFinite(num)) {
    return "--";
  }

  return new Intl.NumberFormat("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
};

/* ============================================================
   FILA DE MONEDA
============================================================ */

const CurrencyRow = React.memo(function CurrencyRow({
  cur,
  fiatName,
  fiatFlag,
  isLoading,
  onRefresh,
  isHistory,
}) {
  const buy = formatNumber(cur.buyPrice);
  const sell = formatNumber(cur.sellPrice);

  const spread =
    typeof cur.spread === "number" && Number.isFinite(cur.spread)
      ? `${cur.spread.toFixed(2)}%`
      : "--";

  return (
    <tr
      className="
        group
        bg-white/[0.035]
        hover:bg-white/[0.075]
        transition-all
        duration-200
      "
    >
      {/* ======================================================
          MONEDA
      ====================================================== */}

      <td
        className="
          py-3.5
          px-4
          rounded-l-xl
        "
      >
        <div className="flex items-center">
          <button
            type="button"
            onClick={() => onRefresh(cur.fiat)}
            disabled={isLoading || isHistory}
            aria-label={`Actualizar ${cur.fiat}`}
            title={
              isHistory
                ? "Disponible solo para precios actuales"
                : `Actualizar ${cur.fiat}`
            }
            className="
              relative
              group
              flex
              items-center
              justify-center
              w-10
              h-10
              rounded-xl
              bg-white/[0.035]
              hover:bg-accent/10
              border
              border-transparent
              hover:border-accent/25
              transition-all
              duration-300
              mr-3
              disabled:opacity-60
              disabled:cursor-not-allowed
            "
          >
            {isLoading ? (
              <div
                className="
                  w-5
                  h-5
                  border-2
                  border-accent
                  border-t-transparent
                  rounded-full
                  animate-spin
                "
                role="status"
                aria-label={`Actualizando ${cur.fiat}`}
              />
            ) : (
              <ReactCountryFlag
                countryCode={fiatFlag ?? ""}
                svg
                style={{
                  fontSize: "1.7em",
                }}
                className="
                  transition-transform
                  duration-200
                  group-hover:scale-110
                "
              />
            )}
          </button>

          <div>
            <div
              className="
                font-semibold
                text-white
                tracking-wide
              "
            >
              {cur.fiat}
            </div>

            <div
              className="
                text-xs
                sm:text-sm
                text-white/45
                mt-0.5
              "
            >
              {fiatName ?? cur.fiat}
            </div>
          </div>
        </div>
      </td>

      {/* ======================================================
          COMPRA
      ====================================================== */}

      <td
        className="
          py-3.5
          px-4
          font-mono
          text-sm
          sm:text-base
          text-white/90
        "
      >
        {buy}
      </td>

      {/* ======================================================
          VENTA
      ====================================================== */}

      <td
        className="
          py-3.5
          px-4
          font-mono
          text-sm
          sm:text-base
          text-white/90
        "
      >
        {sell}
      </td>

      {/* ======================================================
          SPREAD
      ====================================================== */}

      <td
        className="
          py-3.5
          px-4
          rounded-r-xl
          font-semibold
          text-accent
          text-sm
          sm:text-base
        "
      >
        {spread}
      </td>
    </tr>
  );
});

/* ============================================================
   TABLA PRINCIPAL
============================================================ */

const CurrencyTable = ({ onRefreshOneFiat }) => {
  const { currencies, historyPrices, loading, historyLoading } =
    useCurrencies();

  const [selectedSnapshot, setSelectedSnapshot] = React.useState(null);

  const [loadingFiat, setLoadingFiat] = React.useState(null);

  const safeCurrencies = Array.isArray(currencies) ? currencies : [];

  const safeHistoryPrices = Array.isArray(historyPrices) ? historyPrices : [];

  /*
   * Estamos viendo historial únicamente cuando:
   *
   * 1. Existe un snapshot seleccionado.
   * 2. Ese snapshot contiene precios.
   */
  const isHistory = Boolean(selectedSnapshot) && safeHistoryPrices.length > 0;

  /*
   * Datos que se muestran en la tabla.
   */
  const displayedCurrencies = isHistory ? safeHistoryPrices : safeCurrencies;

  /* ==========================================================
     ACTUALIZAR UNA MONEDA
  ========================================================== */

  const handleRefresh = React.useCallback(
    async (fiat) => {
      /*
       * No permitimos actualizar monedas
       * cuando estamos viendo historial.
       */
      if (isHistory) {
        return;
      }

      if (typeof onRefreshOneFiat !== "function") {
        console.warn("⚠️ onRefreshOneFiat no está definido.");

        return;
      }

      setLoadingFiat(fiat);

      try {
        await onRefreshOneFiat(fiat);
      } catch (error) {
        console.error("❌ Error actualizando fiat:", fiat, error);
      } finally {
        setLoadingFiat(null);
      }
    },
    [onRefreshOneFiat, isHistory],
  );

  /* ==========================================================
     LOADING INICIAL
  ========================================================== */

  if (loading && safeCurrencies.length === 0) {
    return (
      <div
        className="
          min-h-screen
          w-full
          flex
          items-center
          justify-center
          bg-transparent
          text-white
        "
      >
        <div className="text-center">
          <div
            className="
              w-8
              h-8
              mx-auto
              mb-3
              border-2
              border-accent
              border-t-transparent
              rounded-full
              animate-spin
            "
          />

          <p
            className="
              text-sm
              text-white/60
            "
          >
            Cargando precios...
          </p>
        </div>
      </div>
    );
  }

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <div
      id="prices"
      className="
        card-wrapper
        min-h-screen
        w-[98%]
        md:w-[92%]
        lg:w-[90%]
        mx-auto
        flex
        items-center
        justify-center
        text-white
        my-10
      "
    >
      {/*
       * IMPORTANTE:
       *
       * Se mantienen card-wrapper y card-content.
       * La animación del borde existente en index.css
       * continúa funcionando.
       */}
      <div
        className="
          w-[94%]
          md:w-[100%]
          p-4
          sm:p-5
          md:p-6
          card-content
        "
      >
        {/* ====================================================
            HEADER
        ==================================================== */}

        <div
          className="
            flex
            flex-col
            gap-5
            mb-6
          "
        >
          {/* TÍTULO */}

          <div
            className="
              flex
              items-center
              justify-between
              gap-3
            "
          >
            <div
              className="
                flex
                items-center
                gap-3
              "
            >
              {/* INDICADOR */}

              <div
                className="
                  w-1
                  h-8
                  rounded-full
                  bg-aqua-gradient
                  shrink-0
                "
              />

              <div>
                <h2
                  className="
                    text-2xl
                    sm:text-3xl
                    font-bold
                    tracking-tight
                  "
                >
                  PRECIOS
                </h2>

                <p
                  className="
                    text-xs
                    sm:text-sm
                    text-white/40
                    mt-0.5
                  "
                >
                  Tasas de cambio disponibles
                </p>
              </div>
            </div>

            {/* ESTADO HISTORIAL */}

            {isHistory && (
              <span
                className="
                  hidden
                  sm:inline-flex
                  items-center
                  gap-1.5
                  px-3
                  py-1.5
                  rounded-full
                  bg-accent/10
                  border
                  border-accent/20
                  text-accent
                  text-xs
                  font-medium
                "
              >
                <span
                  className="
                    w-1.5
                    h-1.5
                    rounded-full
                    bg-accent
                  "
                />
                Historial
              </span>
            )}

            {/* LOADING HISTORIAL */}

            {historyLoading && (
              <span
                className="
                  flex
                  items-center
                  gap-2
                  text-xs
                  sm:text-sm
                  text-accent
                  animate-pulse
                  whitespace-nowrap
                "
              >
                <span
                  className="
                    w-2
                    h-2
                    rounded-full
                    bg-accent
                  "
                />
                Cargando actualización...
              </span>
            )}
          </div>

          {/* ==================================================
              FILTROS
          ================================================== */}

          <div
            className="
              rounded-xl
              bg-white/[0.025]
              border
              border-white/[0.07]
              p-2.5
              sm:p-3
            "
          >
            <PriceFilters
              selectedSnapshot={selectedSnapshot}
              onSnapshotChange={setSelectedSnapshot}
            />
          </div>
        </div>

        {/* ====================================================
            SIN DATOS
        ==================================================== */}

        {displayedCurrencies.length === 0 ? (
          <div
            className="
              flex
              flex-col
              items-center
              justify-center
              py-16
              px-4
              text-center
              rounded-xl
              bg-white/[0.025]
              border
              border-white/[0.06]
            "
          >
            <div
              className="
                w-12
                h-12
                rounded-xl
                flex
                items-center
                justify-center
                bg-accent/10
                border
                border-accent/20
                mb-4
              "
            >
              <span className="text-xl" aria-hidden="true">
                💱
              </span>
            </div>

            <h3
              className="
                text-lg
                font-semibold
                mb-1
              "
            >
              No hay precios disponibles
            </h3>

            <p
              className="
                text-sm
                text-white/40
                max-w-md
              "
            >
              No se encontraron datos para mostrar con los filtros
              seleccionados.
            </p>
          </div>
        ) : (
          /* ==================================================
             TABLA
          ================================================== */

          <div
            className="
              overflow-x-auto
              rounded-xl
            "
          >
            <table
              className="
                w-full
                min-w-[650px]
                text-left
                border-separate
                border-spacing-y-1.5
              "
            >
              {/* HEADER TABLA */}

              <thead>
                <tr
                  className="
                    text-[11px]
                    sm:text-xs
                    uppercase
                    tracking-wider
                    text-white/40
                  "
                >
                  <th
                    className="
                      py-2
                      px-4
                      font-medium
                    "
                  >
                    Moneda
                  </th>

                  <th
                    className="
                      py-2
                      px-4
                      font-medium
                    "
                  >
                    Compra
                  </th>

                  <th
                    className="
                      py-2
                      px-4
                      font-medium
                    "
                  >
                    Venta
                  </th>

                  <th
                    className="
                      py-2
                      px-4
                      font-medium
                    "
                  >
                    Spread
                  </th>
                </tr>
              </thead>

              {/* BODY */}

              <tbody>
                {displayedCurrencies.map((cur) => (
                  <CurrencyRow
                    key={cur.id ?? cur.fiat}
                    cur={cur}
                    fiatName={FIAT_NAMES[cur.fiat]}
                    fiatFlag={FIAT_FLAGS[cur.fiat]}
                    isLoading={!isHistory && loadingFiat === cur.fiat}
                    isHistory={isHistory}
                    onRefresh={handleRefresh}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CurrencyTable;
