import { apiCall } from "../customApiCall";
import { API_ENDPOINTS } from "../../../apiConfig";

// POST /api/bundles/{bundleId}/materials
export const addBundleMaterial = async (
  bundleId: number | string,
  payload: {
    material_id: number;
    quantity: number;
  },
  token: string
): Promise<any> => {
  return await apiCall(
    API_ENDPOINTS.ADMIN.BundleMaterialAdd(bundleId),
    "POST",
    payload,
    token
  );
};

// PUT /api/bundles/{bundleId}/materials/{materialId}
export const updateBundleMaterial = async (
  bundleId: number | string,
  materialId: number | string,
  payload: {
    quantity: number;
  },
  token: string
): Promise<any> => {
  return await apiCall(
    API_ENDPOINTS.ADMIN.BundleMaterialUpdate(bundleId, materialId),
    "PUT",
    payload,
    token
  );
};

// DELETE /api/bundles/{bundleId}/materials/{materialId}
export const deleteBundleMaterial = async (
  bundleId: number | string,
  materialId: number | string,
  token: string
): Promise<any> => {
  return await apiCall(
    API_ENDPOINTS.ADMIN.BundleMaterialDelete(bundleId, materialId),
    "DELETE",
    undefined,
    token
  );
};

// POST /api/bundles/{bundleId}/materials/bulk
export const bulkAddBundleMaterials = async (
  bundleId: number | string,
  payload: {
    materials: Array<{
      material_id: number;
      quantity: number;
    }>;
  },
  token: string
): Promise<any> => {
  return await apiCall(
    API_ENDPOINTS.ADMIN.BundleMaterialsBulkAdd(bundleId),
    "POST",
    payload,
    token
  );
};
