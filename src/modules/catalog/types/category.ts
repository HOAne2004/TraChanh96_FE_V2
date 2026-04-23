export interface Category {
  id: number;
  name: string;
  slug: string;
  parentId?: number | null;
  displayOrder: number;
  isActive: boolean;
}

export interface CreateCategoryPayload {
  name: string;
  parentId?: number | null;
  displayOrder: number;
}

export interface UpdateCategoryPayload {
  id: number;
  name?: string;
  parentId?: number | null;
  displayOrder?: number;
}

export interface ToggleActivePayload {
  id: number;
  isActive: boolean;
}
