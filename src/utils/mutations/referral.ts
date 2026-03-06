import { apiCall } from "../customApiCall";
import { API_ENDPOINTS } from "../../../apiConfig";

// PUT /api/admin/referral/settings
export const updateReferralSettings = async (
  payload: {
    commission_percentage?: number;
    minimum_withdrawal?: number;
    outright_discount_percentage?: number;
    referral_reward_type?: "percentage" | "fixed";
    referral_reward_value?: number;
  },
  token: string
): Promise<any> => {
  return await apiCall(
    API_ENDPOINTS.ADMIN.ReferralSettings,
    "PUT",
    payload,
    token
  );
};

