import { apiCall } from "../customApiCall";
import { API_ENDPOINTS } from "../../../apiConfig";

// GET /user-kyc-detail/{id}
export const getUserKycDetail = async (
  id: number | string,
  token: string
): Promise<any> => {
  return await apiCall(
    API_ENDPOINTS.ADMIN.Get_User_Kyc_Detail(id),
    "GET",
    undefined,
    token
  );
};
