export function normalizeCustomerCountry(value?: string): string {
  const country = (value ?? '').trim().toLocaleUpperCase('it');
  return ['IT', 'ITA', 'ITALY'].includes(country) ? 'ITALIA' : country;
}

// Preserve validation of legacy Italian address fields without inventing a country.
export function usesItalianAddressRules(value?: string): boolean {
  const country = normalizeCustomerCountry(value);
  return !country || country === 'ITALIA';
}
