export function transformOrder(order) {
  if (!order) return null;

  return {
    price: Number(order.adv.price),
    min: Number(order.adv.minSingleTransAmount),
    max: Number(order.adv.maxSingleTransAmount),
    methods: order.adv.tradeMethods?.map((m) => m.tradeMethodName) || [],
    advertiser: order.advertiser?.nickName || "Unknown",
  };
}
