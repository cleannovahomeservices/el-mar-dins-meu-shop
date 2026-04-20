/**
 * Stripe Products Configuration
 * Define all products and prices for the shop
 */

export const STRIPE_PRODUCTS = {
  TSHIRT_ADULT: {
    name: "Samarreta Adults",
    description: "Samarreta 'El Mar dins Meu' per a adults",
    price: 1800, // 18€ in cents
    currency: "eur",
  },
  TSHIRT_KIDS: {
    name: "Samarreta Infants",
    description: "Samarreta 'El Mar dins Meu' per a infants",
    price: 1500, // 15€ in cents
    currency: "eur",
  },
};

export type ProductKey = keyof typeof STRIPE_PRODUCTS;

export function getProductPrice(productKey: ProductKey): number {
  return STRIPE_PRODUCTS[productKey].price;
}

export function getProductName(productKey: ProductKey): string {
  return STRIPE_PRODUCTS[productKey].name;
}
