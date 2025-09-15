import { apiCall } from "../customApiCall";
import { API_ENDPOINTS } from "../../../apiConfig";

// GET /orders
export const getAllOrders = async (token: string): Promise<any> => {
  return await apiCall(API_ENDPOINTS.ADMIN.OrdersList, "GET", undefined, token);
};

// GET /orders/user/{id}
export const getSingleOrderUser = async (
  id: number | string,
  token: string
): Promise<any> => {
  return await apiCall(
    API_ENDPOINTS.ADMIN.OrderShowUser(id),
    "GET",
    undefined,
    token
  );
};

// GET /orders/{id}
export const getSingleOrder = async (
  id: number | string,
  token: string
): Promise<any> => {
  return await apiCall(
    API_ENDPOINTS.ADMIN.OrderShow(id),
    "GET",
    undefined,
    token
  );
};
