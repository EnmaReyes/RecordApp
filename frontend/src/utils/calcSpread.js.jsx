export function calcSpread(sell, buy) {
  if (!buy || !sell || sell === 0) return 0;
  const spread = ((buy - sell) / buy) * 100;
  return spread;
}