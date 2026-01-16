import { apiCall } from "../customApiCall";
import { API_ENDPOINTS } from "../../../apiConfig";

// Material Category Mutations

// POST /api/material-categories
export const createMaterialCategory = async (
  payload: {
    name: string;
    code?: string;
    description?: string;
    sort_order?: number;
    is_active?: boolean;
  },
  token: string
): Promise<any> => {
  return await apiCall(
    API_ENDPOINTS.ADMIN.MaterialCategoryCreate,
    "POST",
    payload,
    token
  );
};

// PUT /api/material-categories/{id}
export const updateMaterialCategory = async (
  id: number | string,
  payload: {
    name?: string;
    code?: string;
    description?: string;
    sort_order?: number;
    is_active?: boolean;
  },
  token: string
): Promise<any> => {
  return await apiCall(
    API_ENDPOINTS.ADMIN.MaterialCategoryUpdate(id),
    "PUT",
    payload,
    token
  );
};

// DELETE /api/material-categories/{id}
export const deleteMaterialCategory = async (
  id: number | string,
  token: string
): Promise<any> => {
  return await apiCall(
    API_ENDPOINTS.ADMIN.MaterialCategoryDelete(id),
    "DELETE",
    undefined,
    token
  );
};

// Material Mutations

// POST /api/materials
export const createMaterial = async (
  payload: {
    material_category_id: number;
    name: string;
    unit: string;
    warranty?: number;
    rate?: number;
    selling_rate?: number;
    profit?: number;
    sort_order?: number;
    is_active?: boolean;
  },
  token: string
): Promise<any> => {
  return await apiCall(
    API_ENDPOINTS.ADMIN.MaterialCreate,
    "POST",
    payload,
    token
  );
};

// PUT /api/materials/{id}
export const updateMaterial = async (
  id: number | string,
  payload: {
    material_category_id?: number;
    name?: string;
    unit?: string;
    warranty?: number;
    rate?: number;
    selling_rate?: number;
    profit?: number;
    sort_order?: number;
    is_active?: boolean;
  },
  token: string
): Promise<any> => {
  return await apiCall(
    API_ENDPOINTS.ADMIN.MaterialUpdate(id),
    "PUT",
    payload,
    token
  );
};

// DELETE /api/materials/{id}
export const deleteMaterial = async (
  id: number | string,
  token: string
): Promise<any> => {
  return await apiCall(
    API_ENDPOINTS.ADMIN.MaterialDelete(id),
    "DELETE",
    undefined,
    token
  );
};

// POST /api/seed/run
export const runSeeder = async (
  seederName: string,
  token: string
): Promise<any> => {
  return await apiCall(
    API_ENDPOINTS.ADMIN.SeedRun,
    "POST",
    { seeder: seederName },
    token
  );
};
