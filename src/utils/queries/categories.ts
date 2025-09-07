import { apiCall } from "../customApiCall";
import { API_ENDPOINTS } from "../../../apiConfig";


// GET /api/Categories
export const getAllCategories = async (token: string): Promise<any> => {
  return await apiCall(
    API_ENDPOINTS.ADMIN.CategoriesList,
    "GET",
    undefined,
    token
  );
};
