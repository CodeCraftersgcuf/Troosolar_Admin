import { apiCall } from "../customApiCall";
import { API_ENDPOINTS } from "../../../apiConfig";

//Update the Order Status
export const updateOrderStatus = async (
  id: number | string,
  payload: { order_status: string },
  token: string
): Promise<{ status: string; data: unknown; message: string }> => {
  return await apiCall(
    API_ENDPOINTS.ADMIN.UpdateOrderStatus(id),
    "POST",
    payload,
    token
  );
};
