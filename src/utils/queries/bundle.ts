import { apiCall } from "../customApiCall";
import { API_ENDPOINTS } from "../../../apiConfig";

// GET /api/All Bundles
export const getAllBundles = async (
  token: string,
  params?: {
    bundle_type?: string;
  }
): Promise<unknown> => {
  let url = API_ENDPOINTS.ADMIN.BundleList;
  if (params?.bundle_type) {
    const queryParams = new URLSearchParams();
    queryParams.append("bundle_type", params.bundle_type);
    url += `?${queryParams.toString()}`;
  }
  return await apiCall(url, "GET", undefined, token);
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