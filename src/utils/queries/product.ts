import { apiCall } from "../customApiCall";
import { API_ENDPOINTS } from "../../../apiConfig";

// GET /api/Products
export const getAllProducts = async (token: string): Promise<any> => {
  return await apiCall(
    API_ENDPOINTS.ADMIN.ProductsList,
    "GET",
    undefined,
    token
  );
};


// Get Single Product
export const getSingleProduct = async (id: string, token: string): Promise<any> => {
  return await apiCall(
    API_ENDPOINTS.ADMIN.ProductShow(id),
    "GET",
    undefined,
    token
  );
};