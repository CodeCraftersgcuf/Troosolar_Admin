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

// POST /api/admin/cart/create-custom-order
export const createCustomOrder = async (
  payload: {
    user_id: number;
    order_type: "buy_now" | "bnpl";
    items: Array<{
      type: "product" | "bundle" | "custom";
      id?: number;
      name?: string;
      description?: string;
      price?: number;
      quantity?: number;
    }>;
    send_email?: boolean;
    email_message?: string;
  },
  token: string
): Promise<any> => {
  return await apiCall(
    API_ENDPOINTS.ADMIN.CreateCustomOrder,
    "POST",
    payload,
    token
  );
};

// DELETE /api/admin/cart/user/{userId}/item/{itemId}
export const removeCartItem = async (
  userId: number | string,
  itemId: number | string,
  token: string
): Promise<any> => {
  return await apiCall(
    API_ENDPOINTS.ADMIN.RemoveCartItem(userId, itemId),
    "DELETE",
    undefined,
    token
  );
};

// DELETE /api/admin/cart/user/{userId}/clear
export const clearUserCart = async (
  userId: number | string,
  token: string
): Promise<any> => {
  return await apiCall(
    API_ENDPOINTS.ADMIN.ClearUserCart(userId),
    "DELETE",
    undefined,
    token
  );
};

// POST /api/admin/cart/resend-email/{userId}
export const resendCartEmail = async (
  userId: number | string,
  payload: {
    order_type: "buy_now" | "bnpl";
    email_message?: string;
  },
  token: string
): Promise<any> => {
  return await apiCall(
    API_ENDPOINTS.ADMIN.ResendCartEmail(userId),
    "POST",
    payload,
    token
  );
};

// PUT /api/admin/audit/requests/{id}/status
export const updateAuditRequestStatus = async (
  id: number | string,
  payload: {
    status: "approved" | "rejected" | "completed";
    admin_notes?: string;
  },
  token: string
): Promise<any> => {
  return await apiCall(
    API_ENDPOINTS.ADMIN.AuditRequestUpdateStatus(id),
    "PUT",
    payload,
    token
  );
};

