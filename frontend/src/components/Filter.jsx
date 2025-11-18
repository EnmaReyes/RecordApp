import React from "react";
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

  return (
    <div className="flex items-center gap-5 flex-wrap p-5">
      {Object.entries(fiatFlags).map(([fiat, countryCode]) => (
        <a
          key={fiat}
          href={`#${fiat}`}
          className="cursor-pointer transition-transform hover:scale-110 textanimate"
        >
          <ReactCountryFlag
            countryCode={countryCode}
            svg
            style={{ fontSize: "3rem" }}
          />
        </a>
      ))}
    </div>
  );
};

export default Filter;
