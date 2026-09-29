export const formatCurrency = (value: number | undefined | null) => {
  if (value === undefined || value === null) return '';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

export const formatShortCurrency = (value: number) => {
  return Intl.NumberFormat('en-US', {
    notation: 'compact',
    currency: 'USD',
    maximumSignificantDigits: 3,
    maximumFractionDigits: 1,
  }).format(value);
};
