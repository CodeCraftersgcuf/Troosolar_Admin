import { apiCall } from "../customApiCall";
import { API_ENDPOINTS } from "../../../apiConfig";


// GET /admin/notifications
export const getAllNotification = async (token: string): Promise<any> => {
  return await apiCall(
    API_ENDPOINTS.ADMIN.NotificationsList,
    "GET",
    undefined,
    token
  );
};
