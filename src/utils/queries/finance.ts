import { apiCall } from "../customApiCall";
import { API_ENDPOINTS } from "../../../apiConfig";


// GET /api/all-Finance
export const getAllFinance = async (token: string): Promise<any> => {
  return await apiCall(
    API_ENDPOINTS.ADMIN.FinancingPartnersList,
    "GET",
    undefined,
    token
  );
};
