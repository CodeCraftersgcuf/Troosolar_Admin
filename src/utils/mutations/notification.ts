import { apiCall } from "../customApiCall";
import { API_ENDPOINTS } from "../../../apiConfig";

// POST / New notification
export const addNotification = async (
  payload: { message: string;},
  token: string
): Promise<any> => {
  return await apiCall(API_ENDPOINTS.ADMIN.AddNotification, "POST", payload, token);
};

// DELETE /notifications/{id}
export const deleteNotification = async (
  id: number | string,
  token: string
): Promise<any> => {
  return await apiCall(API_ENDPOINTS.ADMIN.DeleteNotification(id), "DELETE", undefined, token);
};

// POST /admin/notifications/{id}
export const updateNotification = async (
  id: number | string,
  payload: { title: string; message: string; type: string },
  token: string
): Promise<any> => {
  return await apiCall(API_ENDPOINTS.ADMIN.UpdateNotification(id), "PUT", payload, token);
};