const API_DOMAIN = "https://troosolar.hmstech.org/api";

const API_ENDPOINTS = {
  ADMIN: {
    // --- Auth ---
    Login: API_DOMAIN + "/login", // POST
    Logout: API_DOMAIN + "/logout", // POST

    // --- Dashboard ---
    Dashboard: API_DOMAIN + "/admin/dashboard", // GET

    // --- Users (admin view) ---
    UsersList: API_DOMAIN + "/all-users", // GET
    UserUpdate: (id: number | string) => `${API_DOMAIN}/update-user/${id}`, // POST
    UserShow: (id: number | string) => `${API_DOMAIN}/single-user/${id}`, // GET

    //Update User
    UpdateUser: API_DOMAIN + "/update-user", // POST

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

    OrderShowUser: (id: number | string) => `${API_DOMAIN}/orders/user/${id}`, // GET

    // --- Products (admin/shop) ---
    ProductsList: API_DOMAIN + "/products", // GET
    ProductCreate: API_DOMAIN + "/products", // POST
    ProductShow: (id: number | string) => `${API_DOMAIN}/products/${id}`, // GET
    ProductUpdate: (id: number | string) => `${API_DOMAIN}/products/${id}`, // POST
    ProductDelete: (id: number | string) => `${API_DOMAIN}/products/${id}`, // DELETE

    // --- Bundles (admin/shop) ---
    BundleCreate: API_DOMAIN + "/bundles", // POST
    BundleList: API_DOMAIN + "/bundles", // GET
    BundleShow: (id: number | string) => `${API_DOMAIN}/bundles/${id}`, // GET
    BundleUpdate: (id: number | string) => `${API_DOMAIN}/bundles/${id}`, // POST
    DeleteBundle: (id: number | string) => `${API_DOMAIN}/bundles/${id}`, // DELETE
    // (If you later expose list/show, add them here to match backend routes)

    // --- Transactions (admin) ---
    TransactionsList: API_DOMAIN + "/transactions", // GET
    TransactionShow: (id: number | string) =>
      `${API_DOMAIN}/transactions/user/${id}`, // GET

    AllTransaction: API_DOMAIN + "/admin/users", // GET

    // --- Balances (admin) ---
    AllBalances: API_DOMAIN + "/all-balances", // GET

    // --- Tickets ---
    AllTickets: API_DOMAIN + "/admin/tickets", // GET
    TicketShow: (id: number | string) => `${API_DOMAIN}/admin/tickets/${id}`, // GET
    ReplyTicket: (id: number | string) =>
      `${API_DOMAIN}/admin/tickets/${id}/reply`, // POST

    // --- Admin notifications ---
    AdminNotificationsCreate: API_DOMAIN + "/admin/notifications", // POST

    // === Notifications
    NotificationsList: API_DOMAIN + "/admin/notifications", // GET
    AddNotification: API_DOMAIN + "/admin/notifications", // POST
    DeleteNotification: (id: number | string) =>
      `${API_DOMAIN}/admin/notifications/${id}`, // DELETE
    UpdateNotification: (id: number | string) =>
      `${API_DOMAIN}/admin/notifications/${id}`, // POST

    // === Banner
    BannersList: API_DOMAIN + "/admin/banners", // GET
    AddBanner: API_DOMAIN + "/admin/banners", // POST
    DeleteBanner: (id: number | string) => `${API_DOMAIN}/admin/banners/${id}`, // DELETE
    UpdateBanner: (id: number | string) => `${API_DOMAIN}/admin/banners/${id}`, // POST

    // === Financing Partners
    FinancingPartnersList: API_DOMAIN + "/admin/all-partners", // GET
    AddFinancingPartner: API_DOMAIN + "/admin/add-partner", // POST
    DeleteFinancingPartner: (id: number | string) =>
      `${API_DOMAIN}/admin/delete_partner/${id}`, // DELETE
    UpdateFinancingPartner: (id: number | string) =>
      `${API_DOMAIN}/admin/update-partner/${id}`, // POST

    // === Settings -- Categoriesq
    CategoriesList: API_DOMAIN + "/categories", // GET
    AddCategory: API_DOMAIN + "/categories", // POST
    DeleteCategory: (id: number | string) => `${API_DOMAIN}/categories/${id}`, // DELETE
    UpdateCategory: (id: number | string) => `${API_DOMAIN}/categories/${id}`, // POST

    // === Settings -- Brands
    BrandsList: API_DOMAIN + "/brands", // GET
    AddBrand: API_DOMAIN + "/brands", // POST
    DeleteBrand: (id: number | string) => `${API_DOMAIN}/brands/${id}`, // DELETE
    UpdateBrand: (id: number | string) => `${API_DOMAIN}/brands/${id}`, // POST
    BrandById: (id: number | string) => `${API_DOMAIN}/brands/${id}`, // GET
    BrandByCategory: (category: string) =>
      `${API_DOMAIN}/categories/${category}/brands`, // GET
    GetSingleBrandByCategory: (category: string, brandId: number | string) =>
      `${API_DOMAIN}/categories/${category}/brands/${brandId}`, // GET

    //Add User
    AddUser: API_DOMAIN + "/add-user", // POST

    //Kyc-Detail
    Get_User_Kyc_Detail: (id: number | string) =>
      `${API_DOMAIN}/loan-kyc-details/${id}`, // GET

    //Ticket Status Update
    TicketStatusUpdate: (id: number | string) =>
      `${API_DOMAIN}/admin/tickets/${id}/status`, // POST
    //Edit User
    EditUser: (id: number | string) =>
      `${API_DOMAIN}/admin/user/edit-user/${id}`, // POST

    //Post Send the Partner Detail
    SendToPartnerDetail: (id: number | string) =>
      `${API_DOMAIN}/admin/send-to-partner/${id}`, // POST

    //Mono - Loan - Calculation
    MonoLoanCalculation: API_DOMAIN + "/mono-loan-calculations", // GET
    MonoLoanCalculationApproval: (id: number | string) =>
      `${API_DOMAIN}/mono-loan/${id}`, // POST

    //Loan Grant
    LoanGrant: (id: number | string) =>
      `${API_DOMAIN}/loan-application-grant/${id}`, // POST

    //Repayment History
    RepaymentHistory: (id: number | string) =>
      `${API_DOMAIN}/admin/installments/with-history/${id}`, // GET

    UpdateOrderStatus: (id: number | string) =>
      `${API_DOMAIN}/admin/order-update-status/${id}`, // POST
  },
};

export { API_DOMAIN, API_ENDPOINTS };
