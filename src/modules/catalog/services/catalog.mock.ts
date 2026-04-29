import type { Category } from "../types/category";
import type { CustomerProductCard, ProductDetail } from "../types/product";

// 1. Mock Danh mục (Category)
export const mockCategories: Category[] = [
  { id: 1, name: "Trà Chanh", slug: "tra-chanh", displayOrder: 1, isActive: true },
  { id: 2, name: "Trà Sữa", slug: "tra-sua", displayOrder: 2, isActive: true },
  { id: 3, name: "Cà Phê", slug: "ca-phe", displayOrder: 3, isActive: true },
  { id: 4, name: "Đồ Ăn Vặt", slug: "do-an-vat", displayOrder: 4, isActive: true },
];

// 2. Mock Danh sách sản phẩm (Dùng cho trang chủ/danh sách)
export const mockProductCards: CustomerProductCard[] = [
  {
    id: "p1-uuid",
    categoryId: 1,
    name: "Trà Chanh Giã Tay",
    slug: "tra-chanh-gia-tay",
    imageUrl: "https://picsum.photos/200/200?random=1",
    basePrice: 25000,
    currency: "VND",
    totalSold: 150,
    averageRating: 4.8,
    ratingCount: 20,
    publishedAt: new Date(),
    createdAt: new Date(),
    status: "Active"
  },
  {
    id: "p2-uuid",
    categoryId: 2,
    name: "Trà Sữa Trân Châu Ô Long",
    slug: "tra-sua-tran-chau-o-long",
    imageUrl: "https://picsum.photos/200/200?random=2",
    basePrice: 35000,
    currency: "VND",
    totalSold: 300,
    averageRating: 4.9,
    ratingCount: 50,
    publishedAt: new Date(),
    createdAt: new Date(),
    status: "Active"
  }
];

// 3. Mock Chi tiết sản phẩm (Dùng khi bấm vào xem món/chọn món)
export const mockProductDetails: Record<string, ProductDetail> = {
  "p1-uuid": {
    id: "p1-uuid",
    categoryId: 1,
    name: "Trà Chanh Giã Tay",
    slug: "tra-chanh-gia-tay",
    description: "Trà chanh tươi thơm nồng được giã tay thủ công, giữ trọn tinh dầu chanh.",
    ingredients: "Chanh tươi, Trà xanh, Đường phèn",
    imageUrl: "https://picsum.photos/400/400?random=1",
    productType: "Drink",
    basePriceAmount: 25000,
    basePriceCurrency: "VND",
    prepTimeInMinutes: 5,
    status: "Active",
    totalSold: 150,
    averageRating: 4.8,
    ratingCount: 20,
    allowedIceLevels: ["0%", "50%", "100%"],
    allowedSugarLevels: ["0%", "30%", "50%", "70%", "100%"],
    sizes: [
      { size: "M", priceModifier: 0, currency: "VND" },
      { size: "L", priceModifier: 5000, currency: "VND" }
    ],
    toppings: [
      { toppingId: 1, name: "Trân Châu Trắng", priceAmount: 5000, maxQuantity: 2, currency: "VND" },
      { toppingId: 2, name: "Thạch Nha Đam", priceAmount: 5000, maxQuantity: 1, currency: "VND" }
    ],
    publishedAt: new Date()
  }
};

// 4. Hàm bổ trợ để apiClient lấy dữ liệu dựa theo URL
export const getMockData = (url: string) => {
  if (url.includes('/catalog/categories')) return mockCategories;
  if (url.includes('/catalog/products') && !url.match(/\/products\/[\w-]+/)) return mockProductCards;

  // Trường hợp lấy chi tiết: /catalog/products/p1-uuid
  const productDetailMatch = url.match(/\/catalog\/products\/([\w-]+)/);
  if (productDetailMatch) {
    const id = productDetailMatch[1];
    return mockProductDetails[id] || null;
  }

  return null;
};
