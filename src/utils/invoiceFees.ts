export const stripInvoiceFeeTitle = (title: string) =>
  String(title || "")
    .replace(/^\[FEE:[^\]]*\]/i, "")
    .replace(/^\[FEE\]/i, "")
    .trim()
    .toLowerCase();

export const isLegacyDefaultInvoiceFee = (description: string, rate: number) => {
  const name = stripInvoiceFeeTitle(description);
  const amount = Number(rate) || 0;
  if ((name === "installation fees" || name === "installation fee") && amount === 50000) return true;
  if ((name === "delivery fees" || name === "delivery fee") && amount === 25000) return true;
  if ((name === "inspection fees" || name === "inspection fee") && amount === 10000) return true;
  return false;
};

export const isBillableInvoiceFeeRow = (title: string, amount: number) => {
  const rate = parseFloat(String(amount)) || 0;
  return title.trim() !== "" && rate > 0 && !isLegacyDefaultInvoiceFee(title, rate);
};
