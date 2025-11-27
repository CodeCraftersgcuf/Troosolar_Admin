import { apiCall } from "../customApiCall";
import { API_ENDPOINTS } from "../../../apiConfig";

// PUT /api/admin/bnpl/applications/{id}/status
export const updateBNPLApplicationStatus = async (
  id: number | string,
  payload: {
    status: string;
    admin_notes?: string;
    counter_offer_min_deposit?: number;
    counter_offer_min_tenor?: number;
  },
  token: string
): Promise<{ status: string; data: unknown; message: string }> => {
  return await apiCall(
    API_ENDPOINTS.ADMIN.BNPLApplicationUpdateStatus(id),
    "PUT",
    payload,
    token
  );
};

// PUT /api/admin/bnpl/guarantors/{id}/status
export const updateBNPLGuarantorStatus = async (
  id: number | string,
  payload: {
    status: string;
    admin_notes?: string;
  },
  token: string
): Promise<{ status: string; data: unknown; message: string }> => {
  return await apiCall(
    API_ENDPOINTS.ADMIN.BNPLGuarantorUpdateStatus(id),
    "PUT",
    payload,
    token
  );
};

// PUT /api/admin/orders/buy-now/{id}/status
export const updateBuyNowOrderStatus = async (
  id: number | string,
  payload: {
    order_status: string;
    admin_notes?: string;
  },
  token: string
): Promise<{ status: string; data: unknown; message: string }> => {
  return await apiCall(
    API_ENDPOINTS.ADMIN.BuyNowOrderUpdateStatus(id),
    "PUT",
    payload,
    token
  );
};

