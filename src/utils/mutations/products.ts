import { apiCall } from "../customApiCall";
import { API_ENDPOINTS } from "../../../apiConfig";

//Add Product (mutation)
export const addProduct = async (
  data: {
    title: string;
    category_id: number;
    price: number;
    brand_id?: number;
    discount_price?: number;
    discount_end_date?: string;
    stock?: string;
    installation_price?: number;
    top_deal?: boolean;
    installation_compulsory?: boolean;
    featured_image?: File;
    images?: File[];
    product_details?: string[];
  },
  token: string
): Promise<unknown> => {
  const formData = new FormData();

  // Required fields
  formData.append("title", data.title);
  formData.append("category_id", data.category_id.toString());
  formData.append("price", data.price.toString());

  // Optional fields
  if (data.brand_id !== undefined)
    formData.append("brand_id", data.brand_id.toString());
  if (data.discount_price !== undefined)
    formData.append("discount_price", data.discount_price.toString());
  if (data.discount_end_date)
    formData.append("discount_end_date", data.discount_end_date);
  if (data.stock) formData.append("stock", data.stock);
  if (data.installation_price !== undefined)
    formData.append("installation_price", data.installation_price.toString());
  if (data.top_deal !== undefined)
    formData.append("top_deal", data.top_deal ? "1" : "0");
  if (data.installation_compulsory !== undefined)
    formData.append(
      "installation_compulsory",
      data.installation_compulsory ? "1" : "0"
    );

  if (data.featured_image) {
    formData.append("featured_image", data.featured_image);
  }

  if (data.images && data.images.length > 0) {
    data.images.forEach((image, index) => {
      formData.append(`images[${index}]`, image);
    });
  }

  if (data.product_details && data.product_details.length > 0) {
    data.product_details.forEach((detail, index) => {
      formData.append(`product_details[${index}]`, detail);
    });
  }

  return await apiCall(
    API_ENDPOINTS.ADMIN.ProductCreate,
    "POST",
    formData,
    token
  );
};
// Update Product (mutation)
export const updateProduct = async (
  id: number | string,
  payload: {
    brand_id?: number;
    discount_price?: number;
    discount_end_date?: string;
    stock?: string;
    installation_price?: number;
    top_deal?: boolean;
    installation_compulsory?: boolean;
    featured_image?: File;
    images?: File[];
    product_details?: string[];
  },
  token: string
): Promise<unknown> => {
  const formData = new FormData();

  if (payload.brand_id !== undefined) {
    formData.append("brand_id", payload.brand_id.toString());
  }

  if (payload.discount_price !== undefined) {
    formData.append("discount_price", payload.discount_price.toString());
  }

  if (payload.discount_end_date) {
    formData.append("discount_end_date", payload.discount_end_date);
  }

  if (payload.stock) {
    formData.append("stock", payload.stock);
  }

  if (payload.installation_price !== undefined) {
    formData.append(
      "installation_price",
      payload.installation_price.toString()
    );
  }

  if (payload.top_deal !== undefined) {
    formData.append("top_deal", payload.top_deal ? "1" : "0");
  }

  if (payload.installation_compulsory !== undefined) {
    formData.append(
      "installation_compulsory",
      payload.installation_compulsory ? "1" : "0"
    );
  }

  if (payload.featured_image) {
    formData.append("featured_image", payload.featured_image);
  }

  if (payload.images && payload.images.length > 0) {
    payload.images.forEach((image, index) => {
      formData.append(`images[${index}]`, image);
    });
  }

  if (payload.product_details && payload.product_details.length > 0) {
    payload.product_details.forEach((detail, index) => {
      formData.append(`product_details[${index}]`, detail);
    });
  }

  return await apiCall(
    API_ENDPOINTS.ADMIN.ProductUpdate(id),
    "POST",
    formData,
    token
  );
};

//Delete Product (mutation)
export const deleteProduct = async (
  id: number | string,
  token: string
): Promise<unknown> => {
  return await apiCall(
    API_ENDPOINTS.ADMIN.ProductDelete(id),
    "DELETE",
    undefined,
    token
  );
};
