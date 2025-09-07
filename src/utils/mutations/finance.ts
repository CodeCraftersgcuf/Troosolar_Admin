import { apiCall } from "../customApiCall";
import { API_ENDPOINTS } from "../../../apiConfig";

// POST / New PartnerFinancing
export const addPartnerFinancing = async (
  payload: { name: string; email: string; status: string, amount?: number | string, no_of_loans?: number | string },
  token: string
): Promise<any> => {
  return await apiCall(API_ENDPOINTS.ADMIN.AddFinancingPartner, "POST", payload, token);
};

// DELETE /delete_partner/{id}
export const deletePartnerFinancing = async (
  id: number | string,
  token: string
): Promise<any> => {
  return await apiCall(API_ENDPOINTS.ADMIN.DeleteFinancingPartner(id), "GET", undefined, token);
};

// POST /update_partner/{id}
export const updatePartnerFinancing = async (
  id: number | string,
  payload: { name: string; email: string; status: string, amount?: number | string, no_of_loans?: number | string },
  token: string
): Promise<any> => {
  return await apiCall(API_ENDPOINTS.ADMIN.UpdateFinancingPartner(id), "POST", payload, token);
};