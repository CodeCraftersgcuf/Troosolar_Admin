import { apiCall } from "../customApiCall";
import { API_ENDPOINTS } from "../../../apiConfig";

// GET /admin/dashboard
export const getAdminDashboard = async (token: string): Promise<any> => {
  return await apiCall(API_ENDPOINTS.ADMIN.Dashboard, "GET", undefined, token);
};
