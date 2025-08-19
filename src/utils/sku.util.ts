export function generateSKU(shopName: string, productName: string, variantName: string): string {
  const normalize = (str: string) => str
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .substring(0, 3);

  const shopCode = normalize(shopName);
  const productCode = normalize(productName);
  const variantCode = normalize(variantName);
  const timestamp = Date.now().toString().slice(-6);

  return `${shopCode}-${productCode}-${variantCode}-${timestamp}`.toUpperCase();
}