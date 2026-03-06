import { apiCall } from "../customApiCall";
import { API_ENDPOINTS } from "../../../apiConfig";

export const updateCalculatorSettings = async (
  payload: {
    inverter_ranges?: Array<{
      min_kw: number;
      max_kw: number;
      target_kva: number;
      label: string;
    }>;
    solar_savings_profiles?: Array<{
      key: string;
      label: string;
      hourly_fuel_l: number;
      default_monthly_service: number;
      default_monthly_phcn: number;
      default_cost_of_generator: number;
      cost_of_solar_system: number;
      fuel_cost_per_litre?: number;
    }>;
    solar_maintenance_5_years?: number;
    bundle_types?: string[];
  },
  token: string
): Promise<any> => {
  return await apiCall(
    API_ENDPOINTS.ADMIN.CalculatorSettingsUpdate,
    "PUT",
    payload,
    token
  );
};

