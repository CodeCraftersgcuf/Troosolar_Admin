import { apiCall } from "../customApiCall";
import { API_ENDPOINTS } from "../../../apiConfig";

// POST /send-to-partner/{loanId}
export const sendLoanToPartner = async (
  loanId: number | string,
  payload: { partner_id: number },
  token: string
): Promise<any> => {
  return await apiCall(API_ENDPOINTS.ADMIN.SendToPartner(loanId), "POST", payload, token);
};
