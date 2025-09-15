import { apiCall } from "../customApiCall";
import { API_ENDPOINTS } from "../../../apiConfig";

// GET /api/All Bundles
export const getAllBundles = async (token: string): Promise<unknown> => {
  return await apiCall(
    API_ENDPOINTS.ADMIN.BundleList,
    "GET",
    undefined,
    token
  );
};


// Get Single Bundle
export const getSingleBundle = async (id: string, token: string): Promise<unknown> => {
  return await apiCall(
    API_ENDPOINTS.ADMIN.BundleShow(id),
    "GET",
    undefined,
    token
  );
};