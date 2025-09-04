import { apiCall } from "../customApiCall";
import { API_ENDPOINTS } from "../../../apiConfig";

// GET /all-users
export const getAllUsers = async (token: string): Promise<any> => {
  return await apiCall(API_ENDPOINTS.ADMIN.UsersList, "GET", undefined, token);
};

// GET /single-user/{id}
export const getSingleUser = async (
  id: number | string,
  token: string
): Promise<any> => {
  return await apiCall(API_ENDPOINTS.ADMIN.UserShow(id), "GET", undefined, token);
};
