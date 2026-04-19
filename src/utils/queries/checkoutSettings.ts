import { apiCall } from "../customApiCall";
import { API_ENDPOINTS } from "../../../apiConfig";

export const getCheckoutSettings = async (token: string): Promise<any> => {
  return await apiCall(
    API_ENDPOINTS.ADMIN.CheckoutSettingsGet,
    "GET",
    undefined,
    token
  );
};
