export function isValidTaxCode(taxCode: string): boolean {
  const taxCodeRegex = /^\d{10}(-\d{3})?$/;
  return taxCodeRegex.test(taxCode);
}