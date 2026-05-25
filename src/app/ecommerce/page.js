import { EcommercePage } from "@/modules/ecommerce/components/ecommerce-page";

export const metadata = {
  title: "Ecommerce Frontend Prototype",
  description: "SEO-friendly ecommerce storefront with role-based product management, cart, wishlist, coupons, and checkout simulation.",
  keywords: ["ecommerce", "storefront", "product catalog", "cart", "wishlist", "coupon", "checkout", "SEO"],
};

export default function Page() {
  return <EcommercePage />;
}