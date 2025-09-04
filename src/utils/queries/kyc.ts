import { apiCall } from "../customApiCall";
import { API_ENDPOINTS } from "../../../apiConfig";

// GET /single-document/{id}
export const getSingleDocument = async (
  id: number | string,
  token: string
): Promise<any> => {
  return await apiCall(API_ENDPOINTS.ADMIN.SingleDocument(id), "GET", undefined, token);
};

// GET /single-beneficiary/{id}
export const getSingleBeneficiary = async (
  id: number | string,
  token: string
): Promise<any> => {
  return await apiCall(API_ENDPOINTS.ADMIN.SingleBeneficiary(id), "GET", undefined, token);
};
