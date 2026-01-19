export function calculateGeneral(sellPrice, buyPriceBase, margin = 0.1) {
  if (!sellPrice || !buyPriceBase) return null;
  const result = sellPrice / buyPriceBase;
  return result * (1 - margin);
}

export function calculateCOPtoFiat(buyPrice, sellPriceBase, margin = 0.1) {
  if (!buyPrice || !sellPriceBase) return null;
  const result = buyPrice / sellPriceBase;
  return result * (1 + margin);
}

export function formatRate(rate, decimals = 4) {
  if (rate === null || isNaN(rate)) return "-";
  return rate.toFixed(decimals);
}

export function calculateRate({ from, to, sellPrice, buyPriceBase, margin }) {
  const pair = `${from}-${to}`;

  // Mapa de reglas
  const rules = {
    "COP-VES": calculateCOPtoVES,
  };

  // Si no hay regla especial, usa la general
  const formula = rules[pair] || calculateGeneral;

  return formula(sellPrice, buyPriceBase, margin);
}
