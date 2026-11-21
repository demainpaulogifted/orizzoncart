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

export const CURRENCIES = Array.from(
  new Set(countryCurrencies.map((item) => item.currency))
)
  .sort()
  .map((code) => ({
    code,
    name: new Intl.DisplayNames(['en'], { type: 'currency' }).of(code) || code,
    symbol:
      new Intl.NumberFormat('en', {
        style: 'currency',
        currency: code,
      })
        .formatToParts(0)
        .find((part) => part.type === 'currency')?.value || code,
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
