export const currencyCode = 'USD';
export const formatMoney = value => new Intl.NumberFormat('en-US', { style: 'currency', currency: currencyCode, maximumFractionDigits: 2 }).format(Number(value || 0));
