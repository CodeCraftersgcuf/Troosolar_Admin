import { apiCall } from "../customApiCall";
import { API_ENDPOINTS } from "../../../apiConfig";

// GET /link-accounts/{userId}
export const linkAccounts = async (
  userId: number | string,
  token: string
): Promise<any> => {
  return await apiCall(API_ENDPOINTS.ADMIN.LinkAccounts(userId), "GET", undefined, token);
};
