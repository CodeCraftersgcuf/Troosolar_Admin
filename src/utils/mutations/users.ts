import { apiCall } from "../customApiCall";
import { API_ENDPOINTS } from "../../../apiConfig";

// POST /update-user/{id}
export const updateUser = async (
  id: number | string,
  payload: Record<string, any>,
  token: string
): Promise<any> => {
  return await apiCall(API_ENDPOINTS.ADMIN.UserUpdate(id), "POST", payload, token);
};
