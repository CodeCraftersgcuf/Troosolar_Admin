import { apiCall } from "../customApiCall";
import { API_ENDPOINTS } from "../../../apiConfig";

// GET /api/bundles/{bundleId}/materials
export const getBundleMaterials = async (
  bundleId: number | string,
  token: string
): Promise<unknown> => {
  return await apiCall(
    API_ENDPOINTS.ADMIN.BundleMaterialsList(bundleId),
    "GET",
    undefined,
    token
  );
};
