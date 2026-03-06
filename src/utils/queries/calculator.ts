import { apiCall } from "../customApiCall";
import { API_ENDPOINTS } from "../../../apiConfig";

export const getCalculatorSettings = async (token: string): Promise<any> => {
  return await apiCall(
    API_ENDPOINTS.ADMIN.CalculatorSettingsGet,
    "GET",
    undefined,
    token
  );
};

