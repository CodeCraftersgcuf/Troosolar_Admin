import { apiCall } from "../customApiCall";
import { API_ENDPOINTS } from "../../../apiConfig";

// GET /api/admin/referral/settings
export const getReferralSettings = async (
  token: string
): Promise<any> => {
  return await apiCall(
    API_ENDPOINTS.ADMIN.ReferralSettings,
    "GET",
    undefined,
    token
  );
};

// GET /api/admin/referral/list
export const getReferralList = async (
  token: string,
  params?: {
    search?: string;
    sort_by?: "name" | "referral_count" | "total_earned" | "created_at";
    sort_order?: "asc" | "desc";
    per_page?: number;
    page?: number;
  }
): Promise<any> => {
  let url = API_ENDPOINTS.ADMIN.ReferralList;
  if (params) {
    const queryParams = new URLSearchParams();
    if (params.search) queryParams.append("search", params.search);
    if (params.sort_by) queryParams.append("sort_by", params.sort_by);
    if (params.sort_order) queryParams.append("sort_order", params.sort_order);
    if (params.per_page) queryParams.append("per_page", params.per_page.toString());
    if (params.page) queryParams.append("page", params.page.toString());
    const queryString = queryParams.toString();
    if (queryString) url += `?${queryString}`;
  }
  return await apiCall(url, "GET", undefined, token);
};

// GET /api/admin/referral/user/{userId}
export const getUserReferralDetails = async (
  userId: number | string,
  token: string
): Promise<any> => {
  return await apiCall(
    API_ENDPOINTS.ADMIN.ReferralUserDetails(userId),
    "GET",
    undefined,
    token
  );
};

