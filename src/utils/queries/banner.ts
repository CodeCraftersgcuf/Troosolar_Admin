import { apiCall } from "../customApiCall";
import { API_ENDPOINTS } from "../../../apiConfig";


// GET /admin/notifications
export const getAllBanners = async (token: string): Promise<any> => {
  return await apiCall(
    API_ENDPOINTS.ADMIN.BannersList,
    "GET",
    undefined,
    token
  );
};
