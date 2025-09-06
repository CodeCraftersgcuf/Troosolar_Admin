import { apiCall } from "../customApiCall";
import { API_ENDPOINTS } from "../../../apiConfig";

// POST / New Banner
export const addBanner = async (
  FormData: { image: File; },
  token: string
): Promise<any> => {
  return await apiCall(API_ENDPOINTS.ADMIN.AddBanner, "POST", FormData, token);
};

// DELETE /admin/banners/{id}
export const deleteBanner = async (
  id: number | string,
  token: string
): Promise<any> => {
  return await apiCall(API_ENDPOINTS.ADMIN.DeleteBanner(id), "DELETE", undefined, token);
};

// POST /admin/banners/{id}
export const updateBanner = async (
  id: number | string,
  FormData: { image: File; },
  token: string
): Promise<any> => {
  return await apiCall(API_ENDPOINTS.ADMIN.UpdateBanner(id), "PUT", FormData, token);
};