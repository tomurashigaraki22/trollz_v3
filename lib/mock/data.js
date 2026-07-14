// Placeholder content for Phase 1/2 (static redesign + page shells). Replaced
// with real MySQL-backed queries in the Phase 2 data-layer pass — shape
// mirrors the legacy `product` / `category` tables so swapping the data
// source later is a drop-in change.

export const navLinks = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export const categories = [
  {
    id: 1,
    name: "Fashion",
    slug: "fashion",
    tone: "from-brand-500 to-brand-700",
    description: "Everyday wear and statement pieces for every occasion.",
  },
  {
    id: 2,
    name: "Electronics",
    slug: "electronics",
    tone: "from-ink-800 to-ink-900",
    description: "Phones, audio and gadgets from trusted brands.",
  },
  {
    id: 3,
    name: "Home & Lifestyle",
    slug: "home-lifestyle",
    tone: "from-ink-600 to-ink-800",
    description: "Everything to make your space feel like home.",
  },
  {
    id: 4,
    name: "Beauty",
    slug: "beauty",
    tone: "from-brand-400 to-brand-600",
    description: "Skincare and grooming essentials, curated for you.",
  },
];

export const valueProps = [
  {
    id: 1,
    title: "Authentic Products",
    description: "Every item verified before it reaches you.",
    icon: "ShieldCheck",
  },
  {
    id: 2,
    title: "Fast Delivery",
    description: "Nationwide shipping, tracked door to door.",
    icon: "Truck",
  },
  {
    id: 3,
    title: "Secure Payment",
    description: "Checkout safely with Flutterwave.",
    icon: "Lock",
  },
  {
    id: 4,
    title: "24/7 Support",
    description: "Real humans, ready whenever you need help.",
    icon: "Headset",
  },
];

const baseProduct = (overrides) => ({
  id: 0,
  item: "Product name",
  price: 0,
  discount: 0,
  qty: 10,
  category: "Fashion",
  subcategory: "",
  description:
    "A carefully selected piece from our catalog, chosen for quality and everyday value.",
  sizeOptions: ["Standard"],
  colorOptions: ["Default"],
  rating: 4.5,
  reviewCount: 10,
  img: null,
  ...overrides,
});

export const flashDeals = [
  baseProduct({
    id: 101,
    item: "Wireless Over-Ear Headphones",
    price: 42000,
    discount: 20,
    category: "Electronics",
    subcategory: "Audio",
    description:
      "Immersive over-ear headphones with active noise cancellation and 30-hour battery life. Perfect for commutes, workouts, or long work sessions.",
    colorOptions: ["Black", "Silver", "Navy"],
    rating: 4.6,
    reviewCount: 84,
  }),
  baseProduct({
    id: 102,
    item: "Classic Leather Tote Bag",
    price: 28500,
    discount: 15,
    category: "Fashion",
    subcategory: "Bags",
    description:
      "A timeless leather tote with a spacious interior, interior zip pocket, and reinforced handles built to last.",
    colorOptions: ["Tan", "Black", "Burgundy"],
    rating: 4.7,
    reviewCount: 52,
  }),
  baseProduct({
    id: 103,
    item: "Smart Fitness Watch",
    price: 35000,
    discount: 25,
    category: "Electronics",
    subcategory: "Wearables",
    description:
      "Track heart rate, sleep, and workouts with a bright always-on display and up to 7 days of battery life.",
    colorOptions: ["Black", "Rose Gold"],
    rating: 4.4,
    reviewCount: 63,
  }),
  baseProduct({
    id: 104,
    item: "Ceramic Dinnerware Set (12pc)",
    price: 22000,
    discount: 10,
    category: "Home & Lifestyle",
    subcategory: "Kitchen",
    description:
      "A 12-piece ceramic dinnerware set with plates, bowls, and mugs — dishwasher and microwave safe.",
    colorOptions: ["White", "Sage"],
    rating: 4.8,
    reviewCount: 39,
  }),
];

export const flashSaleEndsAt = new Date(Date.now() + 1000 * 60 * 60 * 18).toISOString();

export const trendingProducts = [
  baseProduct({
    id: 201,
    item: "Oversized Cotton Hoodie",
    price: 18500,
    category: "Fashion",
    subcategory: "Outerwear",
    description:
      "A relaxed-fit hoodie in heavyweight cotton fleece, brushed inside for extra warmth.",
    sizeOptions: ["S", "M", "L", "XL"],
    colorOptions: ["Charcoal", "Cream", "Olive"],
    rating: 4.5,
    reviewCount: 41,
  }),
  baseProduct({
    id: 202,
    item: "Bluetooth Portable Speaker",
    price: 26000,
    category: "Electronics",
    subcategory: "Audio",
    description:
      "Compact and waterproof, this speaker delivers rich bass with up to 12 hours of playtime.",
    colorOptions: ["Black", "Blue"],
    rating: 4.3,
    reviewCount: 27,
  }),
  baseProduct({
    id: 203,
    item: "Scented Soy Candle Trio",
    price: 9500,
    category: "Home & Lifestyle",
    subcategory: "Decor",
    description:
      "Three hand-poured soy candles — vanilla amber, sea salt, and fresh linen — each burning for 40+ hours.",
    rating: 4.9,
    reviewCount: 18,
  }),
  baseProduct({
    id: 204,
    item: "Matte Lipstick Set",
    price: 12000,
    category: "Beauty",
    subcategory: "Makeup",
    description:
      "A set of 4 long-wear matte lipsticks in versatile everyday shades, formulated to avoid drying out lips.",
    colorOptions: ["Nude Set", "Bold Set"],
    rating: 4.6,
    reviewCount: 33,
  }),
  baseProduct({
    id: 205,
    item: "Minimalist Analog Watch",
    price: 31000,
    category: "Fashion",
    subcategory: "Accessories",
    description:
      "A slim-profile analog watch with a genuine leather strap and sapphire-coated crystal face.",
    colorOptions: ["Tan Strap", "Black Strap"],
    rating: 4.7,
    reviewCount: 46,
  }),
  baseProduct({
    id: 206,
    item: "Noise Cancelling Earbuds",
    price: 39500,
    category: "Electronics",
    subcategory: "Audio",
    description:
      "True wireless earbuds with hybrid active noise cancellation and a compact charging case.",
    colorOptions: ["White", "Black"],
    rating: 4.5,
    reviewCount: 58,
  }),
  baseProduct({
    id: 207,
    item: "Linen Throw Pillow Cover",
    price: 7000,
    category: "Home & Lifestyle",
    subcategory: "Decor",
    description:
      "Pre-washed linen pillow covers with a hidden zip closure, sold as a set of two.",
    colorOptions: ["Natural", "Charcoal", "Terracotta"],
    rating: 4.4,
    reviewCount: 21,
  }),
  baseProduct({
    id: 208,
    item: "Hydrating Facial Serum",
    price: 15500,
    category: "Beauty",
    subcategory: "Skincare",
    description:
      "A lightweight hyaluronic acid serum that hydrates and plumps skin without leaving residue.",
    rating: 4.8,
    reviewCount: 72,
  }),
];

export const moreProducts = [
  baseProduct({
    id: 301,
    item: "Slim Fit Denim Jeans",
    price: 21000,
    category: "Fashion",
    subcategory: "Bottoms",
    description: "Stretch denim with a tailored slim fit, built for everyday comfort.",
    sizeOptions: ["30", "32", "34", "36"],
    colorOptions: ["Indigo", "Black"],
    rating: 4.3,
    reviewCount: 29,
  }),
  baseProduct({
    id: 302,
    item: "4K Action Camera",
    price: 54000,
    discount: 12,
    category: "Electronics",
    subcategory: "Cameras",
    description: "Waterproof 4K action camera with image stabilization and a wide-angle lens.",
    rating: 4.2,
    reviewCount: 15,
  }),
  baseProduct({
    id: 303,
    item: "Stainless Steel Cookware Set",
    price: 47000,
    category: "Home & Lifestyle",
    subcategory: "Kitchen",
    description: "A 6-piece tri-ply stainless steel cookware set that heats evenly and lasts for years.",
    rating: 4.7,
    reviewCount: 34,
  }),
  baseProduct({
    id: 304,
    item: "Vitamin C Brightening Cream",
    price: 13500,
    category: "Beauty",
    subcategory: "Skincare",
    description: "A daily brightening cream with Vitamin C and niacinamide to even out skin tone.",
    rating: 4.6,
    reviewCount: 48,
  }),
  baseProduct({
    id: 305,
    item: "Canvas Sneakers",
    price: 16500,
    discount: 18,
    category: "Fashion",
    subcategory: "Footwear",
    description: "Everyday low-top canvas sneakers with a cushioned insole and rubber sole.",
    sizeOptions: ["40", "41", "42", "43", "44"],
    colorOptions: ["White", "Black", "Red"],
    rating: 4.4,
    reviewCount: 61,
  }),
  baseProduct({
    id: 306,
    item: "USB-C Fast Charger (65W)",
    price: 11500,
    category: "Electronics",
    subcategory: "Accessories",
    description: "A compact 65W GaN charger with two USB-C ports, fast enough for laptops and phones alike.",
    rating: 4.5,
    reviewCount: 22,
  }),
  baseProduct({
    id: 307,
    item: "Woven Storage Baskets (Set of 3)",
    price: 14000,
    category: "Home & Lifestyle",
    subcategory: "Storage",
    description: "Handwoven seagrass baskets in three sizes, perfect for shelving or closet organization.",
    rating: 4.6,
    reviewCount: 19,
  }),
  baseProduct({
    id: 308,
    item: "Rose Gold Hair Straightener",
    price: 19500,
    category: "Beauty",
    subcategory: "Hair Tools",
    description: "Ceramic-coated plates heat up in 30 seconds with adjustable temperature settings.",
    rating: 4.3,
    reviewCount: 26,
  }),
];

export const allProducts = [...flashDeals, ...trendingProducts, ...moreProducts];

export function getProductById(id) {
  return allProducts.find((product) => String(product.id) === String(id)) ?? null;
}

export function getRelatedProducts(product, limit = 4) {
  if (!product) return [];
  return allProducts
    .filter((item) => item.id !== product.id && item.category === product.category)
    .slice(0, limit);
}

export function formatNaira(amount) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
}
