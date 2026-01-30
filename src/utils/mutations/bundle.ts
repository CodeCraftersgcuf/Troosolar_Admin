import { apiCall } from "../customApiCall";
import { API_ENDPOINTS } from "../../../apiConfig";

export type CustomAppliancePayload = {
  name: string;
  wattage: number;
  quantity?: number;
  estimated_daily_hours_usage?: number;
};

type BundleProductPayload = {
  title?: string;
  bundle_type?: string;
  total_price?: number;
  discount_price?: number;
  discount_end_date?: string;
  featured_image?: File;
  items?: number[]; // array of product IDs
  custom_services?: {
    title: string;
    service_amount: number;
  }[];
  // Extended bundle fields (spreadsheet / solar specs)
  product_model?: string;
  system_capacity_display?: string;
  detailed_description?: string;
  what_is_inside_bundle_text?: string;
  what_bundle_powers_text?: string;
  backup_time_description?: string;
  inver_rating?: string;
  total_output?: string;
  total_load?: string | null;
  custom_appliances?: CustomAppliancePayload[];
};

// Add Bundle (mutation)
export const addBundle = async (
  data: BundleProductPayload,
  token: string
): Promise<unknown> => {
  const formData = new FormData();

  if (data.title) formData.append("title", data.title);
  if (data.bundle_type) formData.append("bundle_type", data.bundle_type);
  if (data.total_price !== undefined) {
    formData.append("total_price", data.total_price.toString());
  }
  if (data.discount_price !== undefined) {
    formData.append("discount_price", data.discount_price.toString());
  }
  if (data.discount_end_date) {
    formData.append("discount_end_date", data.discount_end_date);
  }
  if (data.featured_image) {
    formData.append("featured_image", data.featured_image);
  }

  if (data.items && data.items.length > 0) {
    data.items.forEach((itemId, index) => {
      formData.append(`items[${index}]`, itemId.toString());
    });
  }

  if (data.custom_services && data.custom_services.length > 0) {
    data.custom_services.forEach((service, index) => {
      formData.append(`custom_services[${index}][title]`, service.title);
      formData.append(
        `custom_services[${index}][service_amount]`,
        service.service_amount.toString()
      );
    });
  }

  if (data.product_model) formData.append("product_model", data.product_model);
  if (data.system_capacity_display) formData.append("system_capacity_display", data.system_capacity_display);
  if (data.detailed_description) formData.append("detailed_description", data.detailed_description);
  if (data.what_is_inside_bundle_text) formData.append("what_is_inside_bundle_text", data.what_is_inside_bundle_text);
  if (data.what_bundle_powers_text) formData.append("what_bundle_powers_text", data.what_bundle_powers_text);
  if (data.backup_time_description) formData.append("backup_time_description", data.backup_time_description);
  if (data.inver_rating) formData.append("inver_rating", data.inver_rating);
  if (data.total_output) formData.append("total_output", data.total_output);
  if (data.total_load != null && data.total_load !== "") formData.append("total_load", String(data.total_load));

  if (data.custom_appliances && data.custom_appliances.length > 0) {
    formData.append("custom_appliances", JSON.stringify(data.custom_appliances));
  }

  return await apiCall(
    API_ENDPOINTS.ADMIN.BundleCreate,
    "POST",
    formData,
    token
  );
};

// Update Bundle (mutation)
export const updateBundle = async (
  id: number | string,
  data: BundleProductPayload,
  token: string
): Promise<unknown> => {
  const formData = new FormData();

  if (data.title) formData.append("title", data.title);
  if (data.bundle_type) formData.append("bundle_type", data.bundle_type);
  if (data.total_price !== undefined) {
    formData.append("total_price", data.total_price.toString());
  }
  if (data.discount_price !== undefined) {
    formData.append("discount_price", data.discount_price.toString());
  }
  if (data.discount_end_date) {
    formData.append("discount_end_date", data.discount_end_date);
  }
  if (data.featured_image) {
    formData.append("featured_image", data.featured_image);
  }

  if (data.items && data.items.length > 0) {
    data.items.forEach((itemId, index) => {
      formData.append(`items[${index}]`, itemId.toString());
    });
  }

  if (data.custom_services && data.custom_services.length > 0) {
    data.custom_services.forEach((service, index) => {
      formData.append(`custom_services[${index}][title]`, service.title);
      formData.append(
        `custom_services[${index}][service_amount]`,
        service.service_amount.toString()
      );
    });
  }

  if (data.product_model) formData.append("product_model", data.product_model);
  if (data.system_capacity_display) formData.append("system_capacity_display", data.system_capacity_display);
  if (data.detailed_description) formData.append("detailed_description", data.detailed_description);
  if (data.what_is_inside_bundle_text) formData.append("what_is_inside_bundle_text", data.what_is_inside_bundle_text);
  if (data.what_bundle_powers_text) formData.append("what_bundle_powers_text", data.what_bundle_powers_text);
  if (data.backup_time_description) formData.append("backup_time_description", data.backup_time_description);
  if (data.inver_rating) formData.append("inver_rating", data.inver_rating);
  if (data.total_output) formData.append("total_output", data.total_output);
  if (data.total_load != null && data.total_load !== "") formData.append("total_load", String(data.total_load));

  if (data.custom_appliances && data.custom_appliances.length > 0) {
    formData.append("custom_appliances", JSON.stringify(data.custom_appliances));
  }

  return await apiCall(
    API_ENDPOINTS.ADMIN.BundleUpdate(id),
    "POST",
    formData,
    token
  );
};

// Delete Bundle (mutation)
export const deleteBundle = async (
  id: number | string,
  token: string
): Promise<unknown> => {
  return await apiCall(
    API_ENDPOINTS.ADMIN.DeleteBundle(id),
    "DELETE",
    undefined,
    token
  );
};
