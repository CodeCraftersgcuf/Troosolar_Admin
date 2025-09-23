import { apiCall } from "../customApiCall";
import { API_ENDPOINTS } from "../../../apiConfig";

// Helper to create FormData from payload
const buildCategoryFormData = (payload: { title: string; icon: File | Blob }) => {
  const formData = new FormData();
  formData.append('title', payload.title);
  formData.append('icon', payload.icon);
  return formData;
};

// POST / New Category
export const addCategory = async (
  payload: { title: string; icon: File | Blob },
  token: string
): Promise<any> => {
  const formData = buildCategoryFormData(payload);
  return await apiCall(API_ENDPOINTS.ADMIN.AddCategory, "POST", formData, token);
};

// POST /update_category/{id}
export const updateCategory = async (
  id: number | string,
  payload: { title: string; icon: File | Blob },
  token: string
): Promise<any> => {
  const formData = buildCategoryFormData(payload);
  return await apiCall(API_ENDPOINTS.ADMIN.UpdateCategory(id), "POST", formData, token);
};

// DELETE remains unchanged
export const deleteCategory = async (
  id: number | string,
  token: string
): Promise<any> => {
  return await apiCall(API_ENDPOINTS.ADMIN.DeleteCategory(id), "DELETE", undefined, token);
};
