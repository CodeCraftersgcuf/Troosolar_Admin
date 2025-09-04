const API_DOMAIN = "http://localhost:8000/api";

const API_ENDPOINTS = {
  ADMIN: {
    // --- Auth ---
    Login: API_DOMAIN + "/login", // POST

    // --- Dashboard ---
    Dashboard: API_DOMAIN + "/admin/dashboard", // GET

    // --- Users (admin view) ---
    UsersList: API_DOMAIN + "/all-users", // GET
    UserUpdate: (id: number | string) => `${API_DOMAIN}/update-user/${id}`, // POST
    UserShow: (id: number | string) => `${API_DOMAIN}/single-user/${id}`, // GET

    // --- Loans (admin tools) ---
    AllLoanStatus: API_DOMAIN + "/all-loan-status", // GET
    FullLoanDetail: (loanId: number | string) =>
      `${API_DOMAIN}/full-loan-detail/${loanId}`, // GET
    SingleLoanDetail: (id: number | string) =>
      `${API_DOMAIN}/single-loan-detail/${id}`, // GET
    AllLoanDistributed: API_DOMAIN + "/all-loan-distributed", // GET
    LoanDistribute: (calcId: number | string) =>
      `${API_DOMAIN}/loan-distributed/${calcId}`, // POST

    // --- KYC / Partner handoff ---
    SingleDocument: (id: number | string) =>
      `${API_DOMAIN}/single-document/${id}`, // GET
    SingleBeneficiary: (id: number | string) =>
      `${API_DOMAIN}/single-beneficiary/${id}`, // GET
    SendToPartner: (loanId: number | string) =>
      `${API_DOMAIN}/send-to-partner/${loanId}`, // POST
    LinkAccounts: (userId: number | string) =>
      `${API_DOMAIN}/link-accounts/${userId}`, // GET

    // --- Orders (admin/shop) ---
    OrdersList: API_DOMAIN + "/orders", // GET
    OrderShow: (id: number | string) => `${API_DOMAIN}/orders/${id}`, // GET

    // --- Products (admin/shop) ---
    ProductsList: API_DOMAIN + "/products", // GET
    ProductCreate: API_DOMAIN + "/products", // POST
    ProductShow: (id: number | string) => `${API_DOMAIN}/products/${id}`, // GET

    // --- Bundles (admin/shop) ---
    BundlesCreate: API_DOMAIN + "/bundles", // POST
    // (If you later expose list/show, add them here to match backend routes)

    // --- Transactions (admin) ---
    TransactionsList: API_DOMAIN + "/transactions", // GET
    TransactionShow: (id: number | string) =>
      `${API_DOMAIN}/transactions/${id}`, // GET

    // --- Balances (admin) ---
    AllBalances: API_DOMAIN + "/all-balances", // GET

    // --- Admin notifications ---
    AdminNotificationsCreate: API_DOMAIN + "/admin/notifications", // POST
  },
};

export { API_DOMAIN, API_ENDPOINTS };
