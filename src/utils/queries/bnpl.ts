import { apiCall } from "../customApiCall";
import { API_ENDPOINTS } from "../../../apiConfig";

// GET /api/admin/bnpl/applications
export const getBNPLApplications = async (
  token: string,
  params?: {
    status?: string;
    customer_type?: string;
    search?: string;
    per_page?: number;
    page?: number;
  }
): Promise<any> => {
  let url = API_ENDPOINTS.ADMIN.BNPLApplicationsList;
  if (params) {
    const queryParams = new URLSearchParams();
    if (params.status) queryParams.append("status", params.status);
    if (params.customer_type) queryParams.append("customer_type", params.customer_type);
    if (params.search) queryParams.append("search", params.search);
    if (params.per_page) queryParams.append("per_page", params.per_page.toString());
    if (params.page) queryParams.append("page", params.page.toString());
    const queryString = queryParams.toString();
    if (queryString) url += `?${queryString}`;
  }
  return await apiCall(url, "GET", undefined, token);
};

// GET /api/admin/bnpl/applications/{id}
export const getBNPLApplication = async (
  id: number | string,
  token: string
): Promise<any> => {
  return await apiCall(
    API_ENDPOINTS.ADMIN.BNPLApplicationShow(id),
    "GET",
    undefined,
    token
  );
};

// GET /api/admin/bnpl/guarantors
export const getBNPLGuarantors = async (
  token: string,
  params?: {
    status?: string;
    per_page?: number;
    page?: number;
  }
): Promise<any> => {
  let url = API_ENDPOINTS.ADMIN.BNPLGuarantorsList;
  if (params) {
    const queryParams = new URLSearchParams();
    if (params.status) queryParams.append("status", params.status);
    if (params.per_page) queryParams.append("per_page", params.per_page.toString());
    if (params.page) queryParams.append("page", params.page.toString());
    const queryString = queryParams.toString();
    if (queryString) url += `?${queryString}`;
  }
  return await apiCall(url, "GET", undefined, token);
};

// GET /api/admin/orders/buy-now
export const getBuyNowOrders = async (
  token: string,
  params?: {
    status?: string;
    search?: string;
    per_page?: number;
    page?: number;
  }
): Promise<any> => {
  let url = API_ENDPOINTS.ADMIN.BuyNowOrdersList;
  if (params) {
    const queryParams = new URLSearchParams();
    if (params.status) queryParams.append("status", params.status);
    if (params.search) queryParams.append("search", params.search);
    if (params.per_page) queryParams.append("per_page", params.per_page.toString());
    if (params.page) queryParams.append("page", params.page.toString());
    const queryString = queryParams.toString();
    if (queryString) url += `?${queryString}`;
  }
  return await apiCall(url, "GET", undefined, token);
};

// GET /api/admin/orders/buy-now/{id}
export const getBuyNowOrder = async (
  id: number | string,
  token: string
): Promise<any> => {
  return await apiCall(
    API_ENDPOINTS.ADMIN.BuyNowOrderShow(id),
    "GET",
    undefined,
    token
  );
};

// GET /api/admin/orders/bnpl
export const getBNPLOrders = async (
  token: string,
  params?: {
    status?: string;
    search?: string;
    per_page?: number;
    page?: number;
  }
): Promise<any> => {
  let url = API_ENDPOINTS.ADMIN.BNPLOrdersList;
  if (params) {
    const queryParams = new URLSearchParams();
    if (params.status) queryParams.append("status", params.status);
    if (params.search) queryParams.append("search", params.search);
    if (params.per_page) queryParams.append("per_page", params.per_page.toString());
    if (params.page) queryParams.append("page", params.page.toString());
    const queryString = queryParams.toString();
    if (queryString) url += `?${queryString}`;
  }
  return await apiCall(url, "GET", undefined, token);
};

// GET /api/admin/orders/bnpl/{id}
export const getBNPLOrder = async (
  id: number | string,
  token: string
): Promise<any> => {
  return await apiCall(
    API_ENDPOINTS.ADMIN.BNPLOrderShow(id),
    "GET",
    undefined,
    token
  );
};

// GET /api/orders/{id}/summary
export const getOrderSummary = async (
  id: number | string,
  token: string
): Promise<any> => {
  return await apiCall(
    API_ENDPOINTS.ADMIN.OrderSummary(id),
    "GET",
    undefined,
    token
  );
};

// GET /api/orders/{id}/invoice-details
export const getOrderInvoiceDetails = async (
  id: number | string,
  token: string
): Promise<any> => {
  return await apiCall(
    API_ENDPOINTS.ADMIN.OrderInvoiceDetails(id),
    "GET",
    undefined,
    token
  );
};

