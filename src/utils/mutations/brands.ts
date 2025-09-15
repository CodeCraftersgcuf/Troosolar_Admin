import { apiCall } from "../customApiCall";
import { API_ENDPOINTS } from "../../../apiConfig";

// Helper to create FormData from payload
const buildCategoryFormData = (payload: {
  title: string;
  category_id: string | number;
}) => {
  const formData = new FormData();
  formData.append("title", payload.title);
  formData.append("category_id", payload.category_id.toString());
  return formData;
};

// POST / New Brand
export const addBrand = async (
  payload: { title: string; category_id: string | number },
  token: string
): Promise<unknown> => {
  const formData = buildCategoryFormData(payload);
  return await apiCall(API_ENDPOINTS.ADMIN.AddBrand, "POST", formData, token);
};

// POST /update_brand/{id}
export const updateBrand = async (
  id: number | string,
  payload: { title: string; category_id: string | number },
  token: string
): Promise<unknown> => {
  console.log("updateBrand called with:", {
    id,
    payload,
    token: token ? "present" : "missing",
  });
  const formData = buildCategoryFormData(payload);

  // Debug: Log FormData contents
  console.log("FormData contents:");
  for (const [key, value] of formData.entries()) {
    console.log(`${key}:`, value);
  }

  return await apiCall(
    API_ENDPOINTS.ADMIN.UpdateBrand(id),
    "PUT",
    formData,
    token
  );
};

// DELETE remains unchanged
export const deleteBrand = async (
  id: number | string,
  token: string
): Promise<unknown> => {
  return await apiCall(
    API_ENDPOINTS.ADMIN.DeleteBrand(id),
    "DELETE",
    undefined,
    token
  );
};
