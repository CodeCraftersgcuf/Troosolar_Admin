import { apiCall } from "../customApiCall";
import { API_ENDPOINTS } from "../../../apiConfig";


// GET /api/Brands
export const getAllBrands = async (token: string): Promise<any> => {
  return await apiCall(
    API_ENDPOINTS.ADMIN.BrandsList,
    "GET",
    undefined,
    token
  );
};

// GET /api/Brands by category
export const getBrandsByCategory = async (category: string, token: string, brandId: number | string): Promise<any> => {
  return await apiCall(
    API_ENDPOINTS.ADMIN.GetSingleBrandByCategory(category, brandId),
    "GET",
    undefined,
    token
  );
};

// GET /api/Brand by ID
export const getBrandById = async (id: number | string, token: string): Promise<any> => {
  return await apiCall(
    API_ENDPOINTS.ADMIN.BrandById(id),
    "GET",
    undefined,
    token
  );
};
// GET /api/Brands by category
export const getBrandsForCategory = async (category: string, token: string): Promise<any> => {
  return await apiCall(
    API_ENDPOINTS.ADMIN.BrandByCategory(category),
    "GET",
    undefined,
    token
  );
};
