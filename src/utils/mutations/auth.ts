import { apiCall } from "../customApiCall";
import { API_ENDPOINTS } from "../../../apiConfig";
import Cookies from "js-cookie";

// Admin login (mutation)
export const adminLogin = async (data: {
  email: string;
  password: string;
}): Promise<any> => {
  // POST /login
  return await apiCall(API_ENDPOINTS.ADMIN.Login, "POST", data);
};

// Admin logout (mutation)
export const adminLogout = async (): Promise<any> => {
  const token = Cookies.get("token");
  // POST /logout
  return await apiCall(API_ENDPOINTS.ADMIN.Logout, "POST", {}, token);
};
