import { apiCall } from "../customApiCall";
import { API_ENDPOINTS } from "../../../apiConfig";

// GET /api/material-categories
export const getAllMaterialCategories = async (token: string): Promise<unknown> => {
  return await apiCall(
    API_ENDPOINTS.ADMIN.MaterialCategoriesList,
    "GET",
    undefined,
    token
  );
};

// GET /api/material-categories/{id}
export const getMaterialCategory = async (
  id: number | string,
  token: string
): Promise<unknown> => {
  return await apiCall(
    API_ENDPOINTS.ADMIN.MaterialCategoryShow(id),
    "GET",
    undefined,
    token
  );
};

// GET /api/materials
export const getAllMaterials = async (
  token: string,
  params?: {
    category_id?: number | string;
    is_active?: boolean;
    search?: string;
  }
): Promise<unknown> => {
  let url = API_ENDPOINTS.ADMIN.MaterialsList;
  if (params) {
    const queryParams = new URLSearchParams();
    if (params.category_id) queryParams.append("category_id", params.category_id.toString());
    if (params.is_active !== undefined) queryParams.append("is_active", params.is_active.toString());
    if (params.search) queryParams.append("search", params.search);
    if (queryParams.toString()) {
      url += `?${queryParams.toString()}`;
    }
  }
  return await apiCall(url, "GET", undefined, token);
};

// GET /api/materials/category/{categoryId}
export const getMaterialsByCategory = async (
  categoryId: number | string,
  token: string
): Promise<unknown> => {
  return await apiCall(
    API_ENDPOINTS.ADMIN.MaterialsByCategory(categoryId),
    "GET",
    undefined,
    token
  );
};

// GET /api/materials/{id}
export const getMaterial = async (
  id: number | string,
  token: string
): Promise<unknown> => {
  return await apiCall(
    API_ENDPOINTS.ADMIN.MaterialShow(id),
    "GET",
    undefined,
    token
  );
};

// GET /api/seed/all
export const runAllSeeders = async (token: string): Promise<unknown> => {
  return await apiCall(
    API_ENDPOINTS.ADMIN.SeedAll,
    "GET",
    undefined,
    token
  );
};
