import React from "react";
import { useCurrencies } from "../context/CurrencyProvider";

const PriceFilters = ({ selectedSnapshot, onSnapshotChange }) => {
  const {
    fetchSnapshots,
    fetchHistoryByDate,
    fetchHistorySnapshot,
    historyLoading,
    setHistoryPrices,
  } = useCurrencies();

  const [activeFilter, setActiveFilter] = React.useState("today");

  const [visibleSnapshots, setVisibleSnapshots] = React.useState([]);

  const initializedRef = React.useRef(false);

  /* ============================================================
     HELPERS
  ============================================================ */

  const getLocalDate = (date) => {
    const d = new Date(date);

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const getToday = () => {
    return getLocalDate(new Date());
  };

  const getYesterday = () => {
    const date = new Date();

    date.setDate(date.getDate() - 1);

    return getLocalDate(date);
  };

  const sortSnapshots = (data) => {
    if (!Array.isArray(data)) return [];

    return [...data].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    );
  };

  const formatSnapshotDate = (date) => {
    if (!date) return "--";

    return new Intl.DateTimeFormat("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(new Date(date));
  };

  /* ============================================================
     CARGAR SNAPSHOTS DE HOY AL INICIAR
  ============================================================ */

  React.useEffect(() => {
    if (initializedRef.current) return;

    initializedRef.current = true;

    const initializeHistory = async () => {
      try {
        setActiveFilter("today");

        const today = getToday();

        const data = await fetchHistoryByDate(today);

        const sorted = sortSnapshots(data);

        setVisibleSnapshots(sorted);

        /*
         * Seleccionamos automáticamente
         * el snapshot más reciente del día.
         */
        if (sorted.length > 0) {
          const latestSnapshot = sorted[0];

          const prices = await fetchHistorySnapshot(latestSnapshot.snapshotId);

          if (Array.isArray(prices) && prices.length > 0) {
            onSnapshotChange(latestSnapshot.snapshotId);
          }
        }
      } catch (error) {
        console.error("❌ Error inicializando historial:", error);

        setVisibleSnapshots([]);
      }
    };

    initializeHistory();
  }, []);

  /* ============================================================
     APLICAR FILTRO
  ============================================================ */

  const applyFilter = async (filter) => {
    setActiveFilter(filter);

    /*
     * Al cambiar de filtro volvemos inmediatamente
     * a los precios actuales.
     */
    onSnapshotChange(null);
    setHistoryPrices([]);

    try {
      if (filter === "today") {
        const today = getToday();

        const data = await fetchHistoryByDate(today);

        setVisibleSnapshots(sortSnapshots(data));

        return;
      }

      if (filter === "yesterday") {
        const yesterday = getYesterday();

        const data = await fetchHistoryByDate(yesterday);

        setVisibleSnapshots(sortSnapshots(data));

        return;
      }

      if (filter === "7days") {
        const data = await fetchSnapshots();

        if (!Array.isArray(data)) {
          setVisibleSnapshots([]);
          return;
        }

        const now = new Date();

        const sevenDaysAgo = new Date();

        sevenDaysAgo.setDate(now.getDate() - 7);

        const filtered = data.filter((snapshot) => {
          const snapshotDate = new Date(snapshot.createdAt);

          return snapshotDate >= sevenDaysAgo && snapshotDate <= now;
        });

        setVisibleSnapshots(sortSnapshots(filtered));

        return;
      }

      if (filter === "custom") {
        setVisibleSnapshots([]);
      }
    } catch (error) {
      console.error("❌ Error aplicando filtro:", error);

      setVisibleSnapshots([]);
    }
  };

  /* ============================================================
     SELECCIONAR FECHA PERSONALIZADA
  ============================================================ */

  const handleCustomDate = async (event) => {
    const date = event.target.value;

    if (!date) return;

    setActiveFilter("custom");

    onSnapshotChange(null);
    setHistoryPrices([]);

    try {
      const data = await fetchHistoryByDate(date);

      setVisibleSnapshots(sortSnapshots(data));
    } catch (error) {
      console.error("❌ Error buscando fecha:", error);

      setVisibleSnapshots([]);
    }
  };

  /* ============================================================
     SELECCIONAR SNAPSHOT
  ============================================================ */

  const handleSnapshotChange = async (event) => {
    const snapshotId = event.target.value;

    if (!snapshotId) {
      onSnapshotChange(null);
      setHistoryPrices([]);

      return;
    }

    try {
      const prices = await fetchHistorySnapshot(snapshotId);

      if (Array.isArray(prices) && prices.length > 0) {
        onSnapshotChange(snapshotId);
      }
    } catch (error) {
      console.error("❌ Error cargando snapshot:", error);
    }
  };

  /* ============================================================
     ESTILOS
  ============================================================ */

  const filterButtonBase = `
    inline-flex
    items-center
    justify-center
    gap-1.5
    px-3
    sm:px-3.5
    py-2
    rounded-xl
    text-xs
    sm:text-sm
    font-medium
    whitespace-nowrap
    border
    transition-all
    duration-200
    ease-app
    select-none

    focus:outline-none
    focus-visible:ring-2
    focus-visible:ring-accent
    focus-visible:ring-offset-2
    focus-visible:ring-offset-dark
  `;

  const filterButtonActive = `
    bg-aqua-gradient
    text-dark
    border-transparent
    shadow-[0_4px_16px_rgba(0,208,255,0.18)]

    focus-visible:ring-dark
  `;

  const filterButtonInactive = `
    bg-white/[0.025]
    text-white/80
    border-white/[0.10]

    hover:bg-white/[0.06]
    hover:text-white
    hover:border-accent/30
  `;

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <div
      className="
        w-full
        flex
        flex-col
        xl:flex-row
        xl:items-center
        xl:justify-between
        gap-3
      "
    >
      {/* ========================================================
          FILTROS
      ======================================================== */}

      <div
        className="
          w-full
          xl:w-auto
          flex
          flex-wrap
          items-center
          justify-center
          xl:justify-start
          gap-1.5
        "
        role="group"
        aria-label="Filtros de historial de precios"
      >
        {/* HOY */}

        <button
          type="button"
          onClick={() => applyFilter("today")}
          aria-pressed={activeFilter === "today"}
          aria-label="Mostrar actualizaciones de hoy"
          className={`
            ${filterButtonBase}
            ${
              activeFilter === "today"
                ? filterButtonActive
                : filterButtonInactive
            }
          `}
        >
          <span aria-hidden="true" className="text-sm">
            ⏱
          </span>

          <span>Hoy</span>

          {activeFilter === "today" && (
            <span
              className="
                sr-only
              "
            >
              seleccionado
            </span>
          )}
        </button>

        {/* AYER */}

        <button
          type="button"
          onClick={() => applyFilter("yesterday")}
          aria-pressed={activeFilter === "yesterday"}
          aria-label="Mostrar actualizaciones de ayer"
          className={`
            ${filterButtonBase}
            ${
              activeFilter === "yesterday"
                ? filterButtonActive
                : filterButtonInactive
            }
          `}
        >
          <span aria-hidden="true" className="text-sm">
            ↩
          </span>

          <span>Ayer</span>

          {activeFilter === "yesterday" && (
            <span className="sr-only">seleccionado</span>
          )}
        </button>

        {/* 7 DÍAS */}

        <button
          type="button"
          onClick={() => applyFilter("7days")}
          aria-pressed={activeFilter === "7days"}
          aria-label="Mostrar actualizaciones de los últimos 7 días"
          className={`
            ${filterButtonBase}
            ${
              activeFilter === "7days"
                ? filterButtonActive
                : filterButtonInactive
            }
          `}
        >
          <span aria-hidden="true" className="text-sm">
            ◷
          </span>

          <span>7 días</span>

          {activeFilter === "7days" && (
            <span className="sr-only">seleccionado</span>
          )}
        </button>

        {/* PERSONALIZADO */}

        <label
          className={`
            ${filterButtonBase}
            relative
            cursor-pointer

            ${
              activeFilter === "custom"
                ? filterButtonActive
                : filterButtonInactive
            }
          `}
        >
          <span aria-hidden="true" className="text-sm">
            📅
          </span>

          <span>Personalizado</span>

          <input
            type="date"
            onChange={handleCustomDate}
            aria-label="Seleccionar una fecha personalizada para consultar precios históricos"
            className="
              absolute
              inset-0
              w-full
              h-full
              opacity-0
              cursor-pointer
              rounded-xl

              focus:outline-none
              focus-visible:ring-2
              focus-visible:ring-accent
            "
          />
        </label>
      </div>

      {/* ========================================================
          ACTUALIZACIÓN
      ======================================================== */}

      <div
        className="
          w-full
          xl:w-auto
          flex
          flex-wrap
          items-center
          justify-center
          xl:justify-end
          gap-2
        "
      >
        {/* LABEL */}

        <label
          htmlFor="snapshot-selector"
          className="
            flex
            items-center
            gap-1.5
            text-xs
            sm:text-sm
            text-white/60
            whitespace-nowrap
            cursor-pointer
          "
        >
          <span
            aria-hidden="true"
            className="
              flex
              items-center
              justify-center
              w-6
              h-6
              rounded-lg
              bg-accent/10
              text-accent
            "
          >
            ◷
          </span>

          <span>Actualización</span>
        </label>

        {/* SELECT */}

        <div className="relative">
          <select
            id="snapshot-selector"
            name="snapshot"
            value={selectedSnapshot || ""}
            onChange={handleSnapshotChange}
            disabled={visibleSnapshots.length === 0 || historyLoading}
            aria-label="Seleccionar actualización histórica"
            aria-busy={historyLoading}
            className="
              appearance-none
              w-full
              min-w-[190px]
              sm:min-w-[215px]

              pl-3
              pr-9
              py-2

              rounded-xl

              border
              border-white/[0.10]

              bg-dark

              text-white
              text-xs
              sm:text-sm
              font-medium

              cursor-pointer
              outline-none

              transition-all
              duration-200
              ease-app

              hover:border-accent/30

              focus:border-accent
              focus:ring-2
              focus:ring-accent/20

              disabled:opacity-40
              disabled:cursor-not-allowed
            "
          >
            <option value="" className="bg-dark text-white">
              Seleccionar actualización
            </option>

            {visibleSnapshots.map((snapshot) => (
              <option
                key={snapshot.snapshotId}
                value={snapshot.snapshotId}
                className="bg-dark text-white"
              >
                {formatSnapshotDate(snapshot.createdAt)}
              </option>
            ))}
          </select>

          {/* CHEVRON */}

          <span
            aria-hidden="true"
            className="
              pointer-events-none
              absolute
              right-3
              top-1/2
              -translate-y-1/2
              text-accent
              text-[10px]
            "
          >
            ▼
          </span>
        </div>

        {/* LOADING */}

        {historyLoading && (
          <div
            className="
              flex
              items-center
              gap-2
              px-2
              text-[11px]
              sm:text-xs
              text-accent
              whitespace-nowrap
            "
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            <span
              aria-hidden="true"
              className="
                w-2
                h-2
                rounded-full
                bg-accent
                animate-pulse
              "
            />

            <span>Cargando actualización...</span>
          </div>
        )}

        {/* ESTADO ACCESIBLE */}

        {!historyLoading && visibleSnapshots.length === 0 && (
          <span className="sr-only" role="status" aria-live="polite">
            No hay actualizaciones disponibles para el período seleccionado.
          </span>
        )}
      </div>
    </div>
  );
};

export default PriceFilters;
