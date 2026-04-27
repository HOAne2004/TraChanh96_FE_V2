// 1. Dùng cho trang Danh sách sản phẩm (Menu)
// Ánh xạ từ CustomerProductCardDto trong GetCatalogProductsQueryHandler.cs
export interface CustomerProductCard {
  id: string;
  categoryId: number;
  name: string;
  slug: string;
  imageUrl?: string;
  basePrice: number;
  currency: string;
  totalSold: number;
  averageRating: number;
  ratingCount: number;
  publishedAt: Date;
  createdAt: Date;
  status: string;
}

// 2. Các DTO dùng cho trang Chi tiết sản phẩm
export interface ProductSize {
  size: string; // "S", "M", "L"
  priceModifier: number;
  currency: string;
}

export interface ProductTopping {
  toppingId: number;
  name: string;
  imageUrl?: string;
  priceAmount: number;
  maxQuantity: number;
  currency: string;
}

// Ánh xạ từ ProductDetailDto
export interface ProductDetail {
  id: string; // Guid
  categoryId: number;
  name: string;
  slug: string;
  description?: string;
  ingredients?: string;
  imageUrl?: string;
  productType: string;
  basePriceAmount: number;
  basePriceCurrency: string;
  prepTimeInMinutes: number;
  status: string;
  totalSold: number;
  averageRating: number;
  ratingCount: number;
  allowedIceLevels: string[];
  allowedSugarLevels: string[];
  sizes: ProductSize[];
  toppings: ProductTopping[];
  publishedAt: Date;
}

export type ModalProductOption = Pick<ProductDetail,
  'id' | 'productType' | 'allowedIceLevels' | 'allowedSugarLevels' | 'sizes' | 'toppings'
>;
// Interface cho bộ lọc khi khách hàng tìm kiếm / chọn danh mục
export interface ProductFilterParams {
  searchTerm?: string;
  categoryId?: number;
  storeId?: string;
  pageIndex?: number;
  pageSize?: number;
}

// Định nghĩa Topping đã chọn
export interface SelectedTopping {
  toppingId: number;
  name: string;
  quantity: number;
  priceAmount: number;
}

// Cấu hình khách hàng vừa chọn (Đá, Đường, Size...)
export interface OptionChangePayload {
  size?: string;
  sugar: string | null;
  ice: string | null;
  toppings: SelectedTopping[];
}

// Dữ liệu 1 món hàng ném vào Giỏ hàng
export interface CartItemPayload {
  productId: string;
  productName: string;
  basePrice: number;
  imageUrl?: string;
  options: OptionChangePayload;
  totalItemPrice: number;
  quantity: number;
}
