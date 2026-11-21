import countryCurrencies from 'country-currency';

export type CountryOption = {
  code: string;
  name: string;
  currency: string;
};

const countryNames = new Intl.DisplayNames(['en'], { type: 'region' });

export const COUNTRIES: CountryOption[] = countryCurrencies
  .map(({ country, currency }) => ({
    code: country,
    name: countryNames.of(country) || country,
    currency,
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

function safeCurrencyName(code: string): string {
  try {
    return new Intl.DisplayNames(['en'], { type: 'currency' }).of(code) || code;
  } catch {
    return code;
  }
}

function safeCurrencySymbol(code: string): string {
  try {
    return new Intl.NumberFormat('en', {
      style: 'currency',
      currency: code,
    })
      .formatToParts(0)
      .find((part) => part.type === 'currency')?.value || code;
  } catch {
    return code;
  }
}

export const CURRENCIES = Array.from(
  new Set(countryCurrencies.map((item) => item.currency))
)
  .sort()
  .map((code) => ({
    code,
    name: safeCurrencyName(code),
    symbol: safeCurrencySymbol(code),
  }));

export function isValidCountryCurrency(
  countryCode: string,
  currencyCode: string
): boolean {
  return countryCurrencies.some(
    (item) => item.country === countryCode && item.currency === currencyCode
  );
}

export function getCurrencySymbol(currencyCode: string): string {
  return (
    CURRENCIES.find((currency) => currency.code === currencyCode)?.symbol ||
    currencyCode
  );
}
