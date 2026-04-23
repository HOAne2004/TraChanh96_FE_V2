// 1. Dùng cho trang Danh sách sản phẩm (Menu)
// Ánh xạ từ CustomerProductCardDto trong GetCatalogProductsQueryHandler.cs
export interface CustomerProductCard {
  id: string; // Guid
  name: string;
  slug: string;
  imageUrl?: string;
  basePrice: number;
  currency: string;
  totalSold: number;
  totalRating: number;
}

// 2. Các DTO dùng cho trang Chi tiết sản phẩm
export interface ProductSize {
  size: string; // "S", "M", "L"
  priceAmount: number;
  currency: string;
}

export interface ProductTopping {
  toppingId: number;
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
  allowedIceLevels: string[];
  allowedSugarLevels: string[];
  sizes: ProductSize[];
  toppings: ProductTopping[];
}

// Interface cho bộ lọc khi khách hàng tìm kiếm / chọn danh mục
export interface ProductFilterParams {
  searchTerm?: string;
  categoryId?: number;
  pageIndex?: number;
  pageSize?: number;
}

// Kiểu phân trang (PagedResult)
export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageIndex: number;
  pageSize: number;
  totalPages: number;
}
