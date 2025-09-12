import { apiCall } from "../customApiCall";
import { API_ENDPOINTS } from "../../../apiConfig";

// GET /all-Transactions
export const getAllTransactions = async (token: string): Promise<any> => {
  return await apiCall(API_ENDPOINTS.ADMIN.TransactionsList, "GET", undefined, token);
};

//GET /Single Transaction
export const getSingleTransaction = async (id: number | string, token: string): Promise<any> => {
  return await apiCall(API_ENDPOINTS.ADMIN.TransactionShow(id), "GET", undefined, token);
};

//GET /All Transactions
export const getAllUserTransactions = async (token: string): Promise<any> => {
  return await apiCall(API_ENDPOINTS.ADMIN.AllTransaction, "GET", undefined, token);
}