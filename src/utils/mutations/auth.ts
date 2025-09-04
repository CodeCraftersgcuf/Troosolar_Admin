import { apiCall } from "../customApiCall";
import { API_ENDPOINTS } from "../../../apiConfig";

// Admin login (mutation)
export const adminLogin = async (data: {
  email: string;
  password: string;
}): Promise<any> => {
  // POST /login
  return await apiCall(API_ENDPOINTS.ADMIN.Login, "POST", data);
};
