declare module 'country-currency' {
  const currencies: Array<{
    country: string;
    currency: string;
  }> & {
    byCountry: () => Map<string, string>;
  };
  export = currencies;
}
