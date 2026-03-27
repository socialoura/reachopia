/**
 * Currency formatting utilities using Intl.NumberFormat
 * Handles proper symbol placement, decimal separators, and locale-specific formatting
 */

export function formatCurrency(amount: number, currencyCode: string = 'USD'): string {
  // Ensure amount is a valid number
  const validAmount = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
  
  // Create formatter with proper locale for each currency
  const locale = getLocaleForCurrency(currencyCode);
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: getMinimumFractionDigits(currencyCode),
    maximumFractionDigits: getMaximumFractionDigits(currencyCode),
  }).format(validAmount);
}

/**
 * Get the appropriate locale for a currency to ensure correct symbol placement
 */
function getLocaleForCurrency(currencyCode: string): string {
  const localeMap: Record<string, string> = {
    'USD': 'en-US',
    'EUR': 'de-DE', // German locale uses comma as decimal separator and places € after amount
    'GBP': 'en-GB',
    'CAD': 'en-CA',
    'AUD': 'en-AU',
    'CHF': 'de-CH',
    'JPY': 'ja-JP',
    'CNY': 'zh-CN',
    'SEK': 'sv-SE',
    'NOK': 'nb-NO',
    'DKK': 'da-DK',
    'PLN': 'pl-PL',
    'CZK': 'cs-CZ',
    'HUF': 'hu-HU',
    'RON': 'ro-RO',
    'BGN': 'bg-BG',
    'HRK': 'hr-HR',
    'RUB': 'ru-RU',
    'TRY': 'tr-TR',
    'ILS': 'he-IL',
    'THB': 'th-TH',
    'SGD': 'en-SG',
    'HKD': 'en-HK',
    'NZD': 'en-NZ',
    'ZAR': 'en-ZA',
    'MXN': 'es-MX',
    'BRL': 'pt-BR',
    'ARS': 'es-AR',
    'CLP': 'es-CL',
    'COP': 'es-CO',
    'PEN': 'es-PE',
    'UYU': 'es-UY',
    'KRW': 'ko-KR',
    'INR': 'en-IN',
    'MYR': 'en-MY',
    'PHP': 'en-PH',
    'IDR': 'en-ID',
    'VND': 'vi-VN',
  };
  
  return localeMap[currencyCode] || 'en-US';
}

/**
 * Get minimum fraction digits for a currency
 */
function getMinimumFractionDigits(currencyCode: string): number {
  // These currencies typically don't show decimal places
  const zeroDecimalCurrencies = ['JPY', 'KRW', 'VND', 'CLP', 'COP', 'UYU', 'PYG', 'HUF', 'ISK'];
  return zeroDecimalCurrencies.includes(currencyCode) ? 0 : 2;
}

/**
 * Get maximum fraction digits for a currency
 */
function getMaximumFractionDigits(currencyCode: string): number {
  // These currencies typically don't show decimal places
  const zeroDecimalCurrencies = ['JPY', 'KRW', 'VND', 'CLP', 'COP', 'UYU', 'PYG', 'HUF', 'ISK'];
  return zeroDecimalCurrencies.includes(currencyCode) ? 0 : 2;
}

/**
 * Convert amount in cents/stripe units to decimal amount for display
 */
export function centsToAmount(cents: number, currencyCode: string = 'USD'): number {
  const divisor = getMinimumFractionDigits(currencyCode) === 0 ? 1 : 100;
  return cents / divisor;
}

/**
 * Convert decimal amount to cents/stripe units
 */
export function amountToCents(amount: number, currencyCode: string = 'USD'): number {
  const multiplier = getMinimumFractionDigits(currencyCode) === 0 ? 1 : 100;
  return Math.round(amount * multiplier);
}

/**
 * Get currency symbol for display (fallback)
 */
export function getCurrencySymbol(currencyCode: string): string {
  try {
    return (0).toLocaleString(getLocaleForCurrency(currencyCode), {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).replace(/[0-9\s]/g, '');
  } catch {
    return currencyCode;
  }
}
