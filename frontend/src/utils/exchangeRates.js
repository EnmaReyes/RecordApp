export function calculateGeneral(sellPrice, buyPriceBase, margin = 0.1) {
  if (!sellPrice || !buyPriceBase) return null;
  const result = sellPrice / buyPriceBase;
  return result * (1 - margin);
}

export function calculateCOPtoVES(buyPrice, sellPriceBase, margin = 0.1) {
  if (!buyPrice || !sellPriceBase) return null;
  const result = buyPrice / sellPriceBase;
  return result * (1 + margin);
}

export function formatRate(rate, decimals = 4) {
  if (rate === null || isNaN(rate)) return "-";
  return rate.toFixed(decimals);
}
