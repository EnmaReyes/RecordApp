export function formatRate(rate) {
  if (rate === null || rate === undefined) return "-";
  const num = Number(rate);
  if (isNaN(num)) return "-";

  if (num < 0.009) {
    return Number(num.toPrecision(3)).toString();
  }
  if (num < 0.9) {
    return num.toFixed(3);
  }

  return num.toFixed(2);
}

export function calculateGeneralRaw(sellPrice, buyPriceBase, margin = 0.1) {
  if (!sellPrice || !buyPriceBase) return null;
  const result = sellPrice / buyPriceBase;
  const adjusted = result * (1 - margin);
  return adjusted;
}

export function calculateGeneral(sellPrice, buyPriceBase, margin = 0.1) {
  const result = calculateGeneralRaw(sellPrice, buyPriceBase, margin);
  return result !== null ? formatRate(result) : null;
}

export function calculateCOPtoFiatRaw(buyPrice, sellPriceBase, margin = 0.1) {
  if (!buyPrice || !sellPriceBase) return null;
  const result = buyPrice / sellPriceBase;
  const adjusted = result * (1 + margin);
  return adjusted;
}

export function calculateCOPtoFiat(buyPrice, sellPriceBase, margin = 0.1) {
  const result = calculateCOPtoFiatRaw(buyPrice, sellPriceBase, margin);
  return result !== null ? formatRate(result) : null;
}

export function calculateRate({ from, to, sellPrice, buyPriceBase, margin }) {
  const pair = `${from}-${to}`;

  // Mapa de reglas
  const rules = {
    "COP-VES": calculateCOPtoVES,
  };

  const formula = rules[pair] || calculateGeneral;

  return formula(sellPrice, buyPriceBase, margin);
}
