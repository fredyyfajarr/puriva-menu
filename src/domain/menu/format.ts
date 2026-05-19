export function formatIdr(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatShortIdr(value: number) {
  if (value >= 1000 && value % 1000 === 0) {
    return `IDR ${value / 1000}K`;
  }

  return formatIdr(value);
}
