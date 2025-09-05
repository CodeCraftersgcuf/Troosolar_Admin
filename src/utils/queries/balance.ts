import { apiCall } from "../customApiCall";
import { API_ENDPOINTS } from "../../../apiConfig";

// GET /link-accounts/{userId}
export const balances = async (token: string): Promise<any> => {
  return await apiCall(
    API_ENDPOINTS.ADMIN.AllBalances,
    "GET",
    undefined,
    token
  );
};
