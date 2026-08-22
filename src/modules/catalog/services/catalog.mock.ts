import type { Category } from "../types/category";
import type { CustomerProductCard, ProductDetail } from "../types/product";
import type { StoreCustomerList, StoreCustomerDetail } from "../../stores/types/store";

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
  },
  "tra-chanh-gia-tay": {
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
  },
  "tra-sua-tran-chau-o-long": {
    id: "p2-uuid",
    categoryId: 2,
    name: "Trà Sữa Trân Châu Ô Long",
    slug: "tra-sua-tran-chau-o-long",
    description: "Trà sữa vị ô long đậm đà kèm trân châu giòn dai đặc trưng.",
    ingredients: "Trà ô long, sữa bột, trân châu đen",
    imageUrl: "https://picsum.photos/400/400?random=2",
    productType: "Drink",
    basePriceAmount: 35000,
    basePriceCurrency: "VND",
    prepTimeInMinutes: 5,
    status: "Active",
    totalSold: 300,
    averageRating: 4.9,
    ratingCount: 50,
    allowedIceLevels: ["0%", "50%", "100%"],
    allowedSugarLevels: ["0%", "50%", "100%"],
    sizes: [
      { size: "M", priceModifier: 0, currency: "VND" },
      { size: "L", priceModifier: 6000, currency: "VND" }
    ],
    toppings: [
      { toppingId: 1, name: "Trân Châu Trắng", priceAmount: 5000, maxQuantity: 2, currency: "VND" }
    ],
    publishedAt: new Date()
  }
};

// 4. Mock Cửa hàng (Store)
export const mockStores: StoreCustomerList[] = [
  {
    publicId: "s1-uuid",
    slug: "tra-chanh-96-cau-giay",
    name: "Trà Chanh 96 - Cầu Giấy",
    fullAddress: "96 Cầu Giấy, Quan Hoa, Cầu Giấy, Hà Nội",
    imageUrl: "https://picsum.photos/400/300?random=10",
    distanceKm: null,
    isOpenNow: true,
    closingTimeToday: "23:00",
    openDate: null
  },
  {
    publicId: "s2-uuid",
    slug: "tra-chanh-96-tran-dai-nghia",
    name: "Trà Chanh 96 - Trần Đại Nghĩa",
    fullAddress: "96 Trần Đại Nghĩa, Bách Khoa, Hai Bà Trưng, Hà Nội",
    imageUrl: "https://picsum.photos/400/300?random=11",
    distanceKm: null,
    isOpenNow: true,
    closingTimeToday: "22:30",
    openDate: null
  }
];

// 5. Mock Chi tiết Cửa hàng
export const mockStoreDetails: Record<string, StoreCustomerDetail> = {
  "tra-chanh-96-cau-giay": {
    publicId: "s1-uuid",
    name: "Trà Chanh 96 - Cầu Giấy",
    slug: "tra-chanh-96-cau-giay",
    fullAddress: "96 Cầu Giấy, Quan Hoa, Cầu Giấy, Hà Nội",
    phoneNumber: "0969969696",
    wifiPassword: "trachanh96cauhgiay",
    description: "Cửa hàng Trà Chanh 96 cơ sở Cầu Giấy rộng rãi, thoáng mát, chỗ đỗ xe thoải mái.",
    imageUrl: "https://picsum.photos/400/300?random=10",
    isOpenNow: true,
    openTimeToday: "08:00",
    closingTimeToday: "23:00",
    openDate: null,
    weeklySchedule: [
      { dayOfWeek: "Monday", openTime: "08:00", closeTime: "23:00", isClosed: false },
      { dayOfWeek: "Tuesday", openTime: "08:00", closeTime: "23:00", isClosed: false },
      { dayOfWeek: "Wednesday", openTime: "08:00", closeTime: "23:00", isClosed: false },
      { dayOfWeek: "Thursday", openTime: "08:00", closeTime: "23:00", isClosed: false },
      { dayOfWeek: "Friday", openTime: "08:00", closeTime: "23:00", isClosed: false },
      { dayOfWeek: "Saturday", openTime: "08:00", closeTime: "23:00", isClosed: false },
      { dayOfWeek: "Sunday", openTime: "08:00", closeTime: "23:00", isClosed: false }
    ],
    areas: [
      {
        areaId: 1,
        name: "Tầng 1 (Trong nhà)",
        tables: [
          { tableId: 101, name: "Bàn 101", seatCapacity: 4, isActive: true },
          { tableId: 102, name: "Bàn 102", seatCapacity: 2, isActive: true }
        ]
      },
      {
        areaId: 2,
        name: "Vỉa hè (Ngoài trời)",
        tables: [
          { tableId: 201, name: "Bàn 201", seatCapacity: 4, isActive: true }
        ]
      }
    ]
  },
  "tra-chanh-96-tran-dai-nghia": {
    publicId: "s2-uuid",
    name: "Trà Chanh 96 - Trần Đại Nghĩa",
    slug: "tra-chanh-96-tran-dai-nghia",
    fullAddress: "96 Trần Đại Nghĩa, Bách Khoa, Hai Bà Trưng, Hà Nội",
    phoneNumber: "0988969696",
    wifiPassword: "trachanh96trandainghia",
    description: "Cơ sở phục vụ sinh viên Bách - Kinh - Xây với nhiều ưu đãi và không gian trẻ trung.",
    imageUrl: "https://picsum.photos/400/300?random=11",
    isOpenNow: true,
    openTimeToday: "07:30",
    closingTimeToday: "22:30",
    openDate: null,
    weeklySchedule: [
      { dayOfWeek: "Monday", openTime: "07:30", closeTime: "22:30", isClosed: false },
      { dayOfWeek: "Tuesday", openTime: "07:30", closeTime: "22:30", isClosed: false },
      { dayOfWeek: "Wednesday", openTime: "07:30", closeTime: "22:30", isClosed: false },
      { dayOfWeek: "Thursday", openTime: "07:30", closeTime: "22:30", isClosed: false },
      { dayOfWeek: "Friday", openTime: "07:30", closeTime: "22:30", isClosed: false },
      { dayOfWeek: "Saturday", openTime: "07:30", closeTime: "22:30", isClosed: false },
      { dayOfWeek: "Sunday", openTime: "07:30", closeTime: "22:30", isClosed: false }
    ],
    areas: [
      {
        areaId: 1,
        name: "Khu vực trong nhà",
        tables: [
          { tableId: 11, name: "Bàn 11", seatCapacity: 4, isActive: true },
          { tableId: 12, name: "Bàn 12", seatCapacity: 6, isActive: true }
        ]
      }
    ]
  }
};

// 6. Hàm bổ trợ để apiClient lấy dữ liệu dựa theo URL khi không có API
export const getMockData = (url: string) => {
  // 1. Categories
  if (url.includes('/catalog/categories')) {
    return mockCategories;
  }

  // 2. Product Detail (Check /products/:slug first)
  const productDetailMatch = url.match(/\/catalog\/products\/([\w-]+)/);
  if (productDetailMatch && productDetailMatch[1]) {
    const id = productDetailMatch[1];
    return mockProductDetails[id] || null;
  }

  // 3. Product list (PagedResult format)
  if (url.includes('/catalog/products')) {
    return {
      items: mockProductCards,
      totalCount: mockProductCards.length,
      pageIndex: 1,
      pageSize: 100,
      totalPages: 1
    };
  }

  // 4. Table QR info
  if (url.includes('/stores/table-qr/')) {
    return {
      storeId: "s1-uuid",
      storeName: "Trà Chanh 96 - Cầu Giấy",
      storeSlug: "tra-chanh-96-cau-giay",
      areaId: 1,
      areaName: "Tầng 1 (Trong nhà)",
      tableId: 101,
      tableName: "Bàn 101"
    };
  }

  // 5. Store Detail (Check /stores/:slug first)
  const storeDetailMatch = url.match(/\/stores\/([\w-]+)/);
  if (storeDetailMatch && storeDetailMatch[1]) {
    const slug = storeDetailMatch[1];
    return mockStoreDetails[slug] || null;
  }

  // 6. Store list (PagedResult format)
  if (url.includes('/stores')) {
    return {
      items: mockStores,
      totalCount: mockStores.length,
      pageIndex: 1,
      pageSize: 50,
      totalPages: 1
    };
  }

  return null;
};
