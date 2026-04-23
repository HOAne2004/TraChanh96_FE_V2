export interface Topping {
  id: number;
  name: string;
  price: number;
  imageUrl?: string;
  isActive: boolean;
  displayOrder?: number;
  tenantId?: string;
}