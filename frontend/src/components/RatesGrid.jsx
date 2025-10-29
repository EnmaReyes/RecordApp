import React from "react";
import RateCard from "./RateCard";

export default function RatesGrid({ rates = [] }) {
  return (
    <section>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {rates.map((rate) => (
          <RateCard key={rate.id} rate={rate} />
        ))}
      </div>
    </section>
  );
}
