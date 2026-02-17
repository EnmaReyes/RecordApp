import React, { useEffect, useState } from "react";
import ReactCountryFlag from "react-country-flag";

const Filter = () => {
  const fiatFlags = {
    VES: "VE",
    COP: "CO",
    CLP: "CL",
    MXN: "MX",
    PEN: "PE",
    ARS: "AR",
    USD: "US",
    UYU: "UY",
    BRL: "BR",
    EUR: "EU",
  };

  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const stickyPoint = 1500;
      setIsSticky(window.scrollY > stickyPoint);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={`
        flex gap-3
        transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)]
        
        /* ==== MOBILE ==== */
        ${
          isSticky
            ? `
              fixed left-3 top-0 flex-col
              opacity-100 translate-x-0
              h-full justify-center 
            `
            : `
              flex-row
              opacity-0 -translate-x-6
              absolute
            `
        }
        
        /* ==== DESKTOP ==== */
        md:static
        md:flex md:flex-row
        md:opacity-100
        md:translate-x-0
      `}
      style={{ zIndex: 999 }}
    >
      {Object.entries(fiatFlags).map(([fiat, countryCode]) => (
        <a
          key={fiat}
          href={`#${fiat}`}
          className="cursor-pointer transition-transform duration-300 textanimate"
        >
          <ReactCountryFlag
            countryCode={countryCode}
            svg
            className="text-4xl"
          />
        </a>
      ))}
    </div>
  );
};

export default Filter;
