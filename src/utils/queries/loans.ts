import { apiCall } from "../customApiCall";
import { API_ENDPOINTS } from "../../../apiConfig";

// GET /all-loan-status
export const getAllLoanStatus = async (token: string): Promise<any> => {
  return await apiCall(API_ENDPOINTS.ADMIN.AllLoanStatus, "GET", undefined, token);
};

// GET /full-loan-detail/{id}
export const getFullLoanDetail = async (
  id: number | string,
  token: string
): Promise<any> => {
  return await apiCall(API_ENDPOINTS.ADMIN.FullLoanDetail(id), "GET", undefined, token);
};

// GET /single-loan-detail/{id}
export const getSingleLoanDetail = async (
  id: number | string,
  token: string
): Promise<any> => {
  return await apiCall(API_ENDPOINTS.ADMIN.SingleLoanDetail(id), "GET", undefined, token);
};
