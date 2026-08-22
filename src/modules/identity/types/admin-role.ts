export interface RoleAdminDto {
  id: string;
  name: string;
  normalizedName: string;
  description?: string | null;
  permissionCount: number;
  createdAt: string;
}

export interface CreateRolePayload {
  name: string;
  description?: string | null;
  permissionCodes?: string[];
}

export interface UpdateRolePayload {
  name: string;
  description?: string | null;
}

// Map với PermissionGroupDto (Dùng để vẽ Ma trận Checkbox)
export interface PermissionDto {
  code: string;
  name: string;
  description: string;
}

export interface PermissionGroupDto {
  moduleName: string;
  permissions: PermissionDto[];
}
