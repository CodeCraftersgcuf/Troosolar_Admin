import { apiCall } from "../customApiCall";
import { API_ENDPOINTS } from "../../../apiConfig";

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

  return await apiCall(
    API_ENDPOINTS.ADMIN.BundleUpdate(id),
    "PUT",
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
