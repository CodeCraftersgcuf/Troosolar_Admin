import { apiCall } from "../customApiCall";
import { API_ENDPOINTS } from "../../../apiConfig";

// GET /link-accounts/{userId}
export const getAllTickets = async (
  token: string
): Promise<any> => {
  return await apiCall(API_ENDPOINTS.ADMIN.AllTickets, "GET", undefined, token);
};

// GET /single-loan-detail/{id}
export const getSingleTicketDetail = async (
  id: number | string,
  token: string
): Promise<any> => {
  return await apiCall(API_ENDPOINTS.ADMIN.TicketShow(id), "GET", undefined, token);
};

