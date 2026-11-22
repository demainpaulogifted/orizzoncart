export function formatCurrency(
  amount: number | string | null | undefined,
  currencyCode: string | null | undefined
): string {
  const currency = String(currencyCode || 'NGN').toUpperCase();
  const value = Number(amount || 0);

  try {
    return new Intl.NumberFormat('en', {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(Number.isFinite(value) ? value : 0);
  } catch {
    return `${currency} ${Number.isFinite(value) ? value.toLocaleString('en') : '0'}`;
  }
}
