import { apiCall } from "../customApiCall";
import { API_ENDPOINTS } from "../../../apiConfig";

// POST /Add User
export const addUser = async (
  payload: {
    first_name?: string;
    email?: string;
    phone?: string;
    bvn?: string;
  },
  token: string
): Promise<any> => {
  return await apiCall(API_ENDPOINTS.ADMIN.AddUser, "POST", payload, token);
};
