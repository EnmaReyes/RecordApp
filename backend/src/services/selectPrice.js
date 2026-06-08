export function selectRobust(filtered) {
  if (!filtered?.length) return null;

  const valid = filtered.filter(
    (f) =>
      f.adv?.price &&
      f.adv.tradeMethods?.length > 0 &&
      Number(f.adv.minSingleTransAmount) > 0,
  );

  if (!valid.length) return null;

  const sorted = valid.sort(
    (a, b) => Number(a.adv.price) - Number(b.adv.price),
  );

  // 🔥 eliminar extremos (outliers)
  const trimmed = sorted.length > 4 ? sorted.slice(1, -1) : sorted;

  return trimmed[Math.floor(trimmed.length / 2)];
}
