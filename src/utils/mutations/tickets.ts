import { apiCall } from "../customApiCall";
import { API_ENDPOINTS } from "../../../apiConfig";

// POST /Ticket Reply/{ticketId}
export const replyToTicket = async (
  ticketId: number | string,
  payload: { message: string },
    token: string,
): Promise<any> => {
  return await apiCall(API_ENDPOINTS.ADMIN.ReplyTicket(ticketId), "POST", payload, token);
}

//POST /admin/tickets/{id}/status
export const updateTicketStatus = async (
  ticketId: number | string,
  payload: { status: string },
  token: string,
): Promise<any> => {
  return await apiCall(API_ENDPOINTS.ADMIN.TicketStatusUpdate(ticketId), "POST", payload, token);
}