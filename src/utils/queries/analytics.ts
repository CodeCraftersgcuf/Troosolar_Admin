import { apiCall } from "../customApiCall";
import { API_ENDPOINTS } from "../../../apiConfig";

// GET /api/admin/analytics
export const getAnalytics = async (
  token: string,
  params?: {
    period?: "all_time" | "daily" | "weekly" | "monthly" | "yearly";
  }
): Promise<any> => {
  let url = API_ENDPOINTS.ADMIN.Analytics;
  if (params?.period) {
    url += `?period=${params.period}`;
  }
  return await apiCall(url, "GET", undefined, token);
};

