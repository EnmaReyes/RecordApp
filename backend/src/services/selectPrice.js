const selectionConfig = {
  SELL: 2,
  BUY: 2,
};

export function selectRobust(filtered, tradeType) {
  if (!filtered?.length) return null;

  const valid = filtered.filter((item) => {
    const price = Number(item.adv?.price);
    const min = Number(item.adv?.minSingleTransAmount);
    const max = Number(item.adv?.maxSingleTransAmount);

    return (
      Number.isFinite(price) &&
      price > 0 &&
      Number.isFinite(min) &&
      Number.isFinite(max) &&
      item.adv?.tradeMethods?.length > 0
    );
  });

  if (!valid.length) return null;

  const index = selectionConfig[tradeType] ?? 0;

  return valid[Math.min(index, valid.length - 1)];
}
