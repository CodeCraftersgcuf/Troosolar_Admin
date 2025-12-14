import React, { useState, useEffect } from "react";
import Header from "../../component/Header";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Cookies from "js-cookie";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import StatsLoadingSkeleton from "../../components/common/StatsLoadingSkeleton";
import images from "../../constants/images";
import {
  getBNPLApplications,
  getBNPLGuarantors,
  getBuyNowOrders,
  getBNPLOrders,
  getBNPLApplication,
  getBuyNowOrder,
  getBNPLOrder,
  getOrderSummary,
  getOrderInvoiceDetails,
  getCartProducts,
  getUserCart,
  getAuditRequests,
  getAuditRequest,
  getUsersWithAuditRequests,
} from "../../utils/queries/bnpl";
import {
  updateBNPLApplicationStatus,
  updateBNPLGuarantorStatus,
  updateBuyNowOrderStatus,
  createCustomOrder,
  removeCartItem,
  clearUserCart,
  resendCartEmail,
  updateAuditRequestStatus,
} from "../../utils/mutations/bnpl";
import { getAllUsers } from "../../utils/queries/users";

const BNPLBuyNow: React.FC = () => {
  const [activeTab, setActiveTab] = useState("BNPL Applications");
  const [statusFilter, setStatusFilter] = useState("All");
  const [auditTypeFilter, setAuditTypeFilter] = useState("All"); // For Audit Requests
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [detailModalTab, setDetailModalTab] = useState("Details");
  const [orderSummary, setOrderSummary] = useState<any>(null);
  const [orderInvoice, setOrderInvoice] = useState<any>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [loadingInvoice, setLoadingInvoice] = useState(false);
  const [invoiceNotFound, setInvoiceNotFound] = useState(false);
  const [statusForm, setStatusForm] = useState({
    status: "",
    admin_notes: "",
    counter_offer_min_deposit: "",
    counter_offer_min_tenor: "",
  });
  
  // Custom Orders state
  const [showCreateOrderModal, setShowCreateOrderModal] = useState(false);
  const [showUserCartModal, setShowUserCartModal] = useState(false);
  const [showUserDetailModal, setShowUserDetailModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userCartData, setUserCartData] = useState<any>(null);
  const [createOrderForm, setCreateOrderForm] = useState({
    user_id: "",
    order_type: "buy_now" as "buy_now" | "bnpl",
    items: [] as Array<{ type: "product" | "bundle"; id: number; quantity: number }>,
    send_email: true,
    email_message: "",
  });
  const [selectedProducts, setSelectedProducts] = useState<any[]>([]);
  const [productTypeFilter, setProductTypeFilter] = useState<"all" | "products" | "bundles">("all");

  const token = Cookies.get("token") || "";
  const queryClient = useQueryClient();

  // Build query params
  const buildQueryParams = () => {
    const params: any = {
      per_page: itemsPerPage,
      page: currentPage,
    };
    if (statusFilter !== "All") {
      params.status = statusFilter.toLowerCase();
    }
    if (activeTab === "Audit Requests" && auditTypeFilter !== "All") {
      params.audit_type = auditTypeFilter.toLowerCase();
    }
    if (searchQuery) {
      params.search = searchQuery;
    }
    return params;
  };

  // BNPL Applications Query
  const {
    data: bnplApplicationsData,
    isLoading: bnplApplicationsLoading,
  } = useQuery({
    queryKey: ["bnpl-applications", statusFilter, searchQuery, currentPage],
    queryFn: () => getBNPLApplications(token, buildQueryParams()),
    enabled: activeTab === "BNPL Applications" && !!token,
  });

  // BNPL Guarantors Query
  const {
    data: bnplGuarantorsData,
    isLoading: bnplGuarantorsLoading,
  } = useQuery({
    queryKey: ["bnpl-guarantors", statusFilter, currentPage],
    queryFn: () => getBNPLGuarantors(token, buildQueryParams()),
    enabled: activeTab === "BNPL Guarantors" && !!token,
  });

  // Buy Now Orders Query
  const {
    data: buyNowOrdersData,
    isLoading: buyNowOrdersLoading,
  } = useQuery({
    queryKey: ["buy-now-orders", statusFilter, searchQuery, currentPage],
    queryFn: () => getBuyNowOrders(token, buildQueryParams()),
    enabled: activeTab === "Buy Now Orders" && !!token,
  });

  // BNPL Orders Query
  const {
    data: bnplOrdersData,
    isLoading: bnplOrdersLoading,
  } = useQuery({
    queryKey: ["bnpl-orders", statusFilter, searchQuery, currentPage],
    queryFn: () => getBNPLOrders(token, buildQueryParams()),
    enabled: activeTab === "BNPL Orders" && !!token,
  });

  // Audit Requests Query
  const {
    data: auditRequestsData,
    isLoading: auditRequestsLoading,
  } = useQuery({
    queryKey: ["audit-requests", statusFilter, auditTypeFilter, searchQuery, currentPage],
    queryFn: () => getAuditRequests(token, buildQueryParams()),
    enabled: activeTab === "Audit Requests" && !!token,
  });

  // Users with Audit Requests Query (for Custom Orders)
  const {
    data: auditUsersData,
    isLoading: auditUsersLoading,
  } = useQuery({
    queryKey: ["audit-users-with-requests", searchQuery, auditTypeFilter, statusFilter, currentPage],
    queryFn: () => getUsersWithAuditRequests(token, {
      search: searchQuery || undefined,
      audit_type: auditTypeFilter !== "All Types" ? auditTypeFilter.toLowerCase().replace(" ", "-") : undefined,
      has_pending: statusFilter === "Has Pending" ? true : undefined,
      sort_by: "last_audit_request_date",
      sort_order: "desc",
      per_page: itemsPerPage,
      page: currentPage,
    }),
    enabled: activeTab === "Custom Orders" && !!token,
  });

  // Cart Products Query
  const {
    data: cartProductsData,
    isLoading: cartProductsLoading,
  } = useQuery({
    queryKey: ["cart-products", productTypeFilter],
    queryFn: () => getCartProducts(token, { type: productTypeFilter }),
    enabled: (activeTab === "Custom Orders" && showCreateOrderModal) && !!token,
  });

  // User Cart Query
  const {
    data: userCartResponse,
    isLoading: userCartLoading,
    refetch: refetchUserCart,
  } = useQuery({
    queryKey: ["user-cart", selectedUserId],
    queryFn: () => getUserCart(selectedUserId!, token),
    enabled: activeTab === "Custom Orders" && !!selectedUserId && !!token,
    onSuccess: (data) => {
      if (data?.data) {
        setUserCartData(data.data);
      }
    },
    onError: () => {
      setUserCartData(null);
    },
  });


  // Status Update Mutations
  const updateApplicationStatusMutation = useMutation({
    mutationFn: async (payload: any) => {
      return await updateBNPLApplicationStatus(selectedItem.id, payload, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bnpl-applications"] });
      setShowStatusModal(false);
      setSelectedItem(null);
      setStatusForm({
        status: "",
        admin_notes: "",
        counter_offer_min_deposit: "",
        counter_offer_min_tenor: "",
      });
    },
  });

  const updateGuarantorStatusMutation = useMutation({
    mutationFn: async (payload: any) => {
      return await updateBNPLGuarantorStatus(selectedItem.id, payload, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bnpl-guarantors"] });
      setShowStatusModal(false);
      setSelectedItem(null);
      setStatusForm({
        status: "",
        admin_notes: "",
        counter_offer_min_deposit: "",
        counter_offer_min_tenor: "",
      });
    },
  });

  const updateBuyNowOrderStatusMutation = useMutation({
    mutationFn: async (payload: any) => {
      return await updateBuyNowOrderStatus(selectedItem.id, payload, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["buy-now-orders"] });
      setShowStatusModal(false);
      setSelectedItem(null);
      setStatusForm({
        status: "",
        admin_notes: "",
        counter_offer_min_deposit: "",
        counter_offer_min_tenor: "",
      });
    },
  });

  // Custom Orders Mutations
  const createCustomOrderMutation = useMutation({
    mutationFn: async (payload: any) => {
      return await createCustomOrder(payload, token);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["user-cart"] });
      setShowCreateOrderModal(false);
      setCreateOrderForm({
        user_id: "",
        order_type: "buy_now",
        items: [],
        send_email: true,
        email_message: "",
      });
      setSelectedProducts([]);
      
      // Invalidate audit users query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["audit-users-with-requests"] });
      
      alert("Custom order created successfully!");
    },
    onError: (error: any) => {
      alert(error?.message || "Failed to create custom order");
    },
  });

  const removeCartItemMutation = useMutation({
    mutationFn: async ({ userId, itemId }: { userId: number; itemId: number }) => {
      return await removeCartItem(userId, itemId, token);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["user-cart"] });
      refetchUserCart();
      // Invalidate audit users query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["audit-users-with-requests"] });
      alert("Item removed from cart successfully");
    },
  });

  const clearUserCartMutation = useMutation({
    mutationFn: async (userId: number) => {
      return await clearUserCart(userId, token);
    },
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: ["user-cart"] });
      refetchUserCart();
      // Invalidate audit users query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["audit-users-with-requests"] });
      alert("Cart cleared successfully");
    },
  });

  const resendCartEmailMutation = useMutation({
    mutationFn: async ({ userId, payload }: { userId: number; payload: any }) => {
      return await resendCartEmail(userId, payload, token);
    },
    onSuccess: () => {
      alert("Cart link email sent successfully");
    },
  });

  // Audit Request Status Update Mutation
  const updateAuditRequestStatusMutation = useMutation({
    mutationFn: async (payload: { id: number; status: string; admin_notes?: string }) => {
      return await updateAuditRequestStatus(payload.id, {
        status: payload.status as "approved" | "rejected" | "completed",
        admin_notes: payload.admin_notes,
      }, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["audit-requests"] });
      setShowStatusModal(false);
      setStatusForm({
        status: "",
        admin_notes: "",
        counter_offer_min_deposit: "",
        counter_offer_min_tenor: "",
      });
      alert("Audit request status updated successfully!");
    },
    onError: (error: any) => {
      alert(error?.message || "Failed to update audit request status");
    },
  });

  const handleViewDetails = async (item: any) => {
    setSelectedItem(item);
    setDetailModalTab("Details");
    setOrderSummary(null);
    setOrderInvoice(null);
    setInvoiceNotFound(false);
    try {
      let detailData;
      if (activeTab === "BNPL Applications") {
        detailData = await getBNPLApplication(item.id, token);
      } else if (activeTab === "Buy Now Orders") {
        detailData = await getBuyNowOrder(item.id, token);
        // Fetch order summary and invoice for orders
        if (detailData.data?.id) {
          try {
            setLoadingSummary(true);
            const summary = await getOrderSummary(detailData.data.id, token);
            setOrderSummary(summary.data);
          } catch (err) {
            console.error("Failed to fetch order summary:", err);
          } finally {
            setLoadingSummary(false);
          }
        }
      } else if (activeTab === "BNPL Orders") {
        detailData = await getBNPLOrder(item.id, token);
        // Fetch order summary and invoice for orders
        if (detailData.data?.id) {
          try {
            setLoadingSummary(true);
            const summary = await getOrderSummary(detailData.data.id, token);
            setOrderSummary(summary.data);
          } catch (err) {
            console.error("Failed to fetch order summary:", err);
          } finally {
            setLoadingSummary(false);
          }
        }
      } else if (activeTab === "Audit Requests") {
        detailData = await getAuditRequest(item.id, token);
      } else {
        detailData = { data: item };
      }
      setSelectedItem(detailData.data);
      setShowDetailModal(true);
    } catch (error) {
      console.error("Failed to fetch details:", error);
      alert("Failed to load details. Please try again.");
    }
  };

  const handleLoadInvoice = async () => {
    if (!selectedItem?.id || loadingInvoice) return;
    try {
      setLoadingInvoice(true);
      setInvoiceNotFound(false);
      const invoice = await getOrderInvoiceDetails(selectedItem.id, token);
      setOrderInvoice(invoice.data);
    } catch (error: any) {
      console.error("Failed to fetch invoice:", error);
      // Check if it's a 404 error
      if (error?.response?.status === 404 || error?.status === 404) {
        setInvoiceNotFound(true);
        setOrderInvoice(null);
      } else {
        // Only show alert for non-404 errors
        alert("Failed to load invoice details.");
      }
    } finally {
      setLoadingInvoice(false);
    }
  };

  const handleUpdateStatus = (item: any) => {
    setSelectedItem(item);
    setStatusForm({
      status: item.status || item.order_status || "",
      admin_notes: "",
      counter_offer_min_deposit: "",
      counter_offer_min_tenor: "",
    });
    setShowStatusModal(true);
  };

  const handleStatusSubmit = () => {
    if (!statusForm.status) {
      alert("Please select a status");
      return;
    }

    const payload: any = {
      status: statusForm.status,
    };

    if (statusForm.admin_notes) {
      payload.admin_notes = statusForm.admin_notes;
    }

    if (statusForm.status === "counter_offer") {
      if (statusForm.counter_offer_min_deposit) {
        payload.counter_offer_min_deposit = Number(statusForm.counter_offer_min_deposit);
      }
      if (statusForm.counter_offer_min_tenor) {
        payload.counter_offer_min_tenor = Number(statusForm.counter_offer_min_tenor);
      }
    }

    if (activeTab === "BNPL Applications") {
      updateApplicationStatusMutation.mutate(payload);
    } else if (activeTab === "BNPL Guarantors") {
      updateGuarantorStatusMutation.mutate(payload);
    } else if (activeTab === "Buy Now Orders") {
      updateBuyNowOrderStatusMutation.mutate({
        order_status: statusForm.status,
        admin_notes: statusForm.admin_notes,
      });
    } else if (activeTab === "Audit Requests") {
      updateAuditRequestStatusMutation.mutate({
        id: selectedItem.id,
        status: statusForm.status,
        admin_notes: statusForm.admin_notes,
      });
    }
  };

  const getCurrentData = () => {
    switch (activeTab) {
      case "BNPL Applications":
        return bnplApplicationsData?.data;
      case "BNPL Guarantors":
        return bnplGuarantorsData?.data;
      case "Buy Now Orders":
        return buyNowOrdersData?.data;
      case "BNPL Orders":
        return bnplOrdersData?.data;
      case "Audit Requests":
        return auditRequestsData?.data;
      case "Custom Orders":
        return null; // Custom Orders doesn't use paginated data
      default:
        return null;
    }
  };

  const isLoading = () => {
    switch (activeTab) {
      case "BNPL Applications":
        return bnplApplicationsLoading;
      case "BNPL Guarantors":
        return bnplGuarantorsLoading;
      case "Buy Now Orders":
        return buyNowOrdersLoading;
      case "BNPL Orders":
        return bnplOrdersLoading;
      case "Audit Requests":
        return auditRequestsLoading;
      case "Custom Orders":
        return auditUsersLoading;
      default:
        return false;
    }
  };

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === "approved" || statusLower === "delivered" || statusLower === "completed") {
      return { backgroundColor: "#10B981", color: "white" };
    }
    if (statusLower === "pending" || statusLower === "processing") {
      return { backgroundColor: "#F59E0B", color: "white" };
    }
    if (statusLower === "rejected" || statusLower === "cancelled") {
      return { backgroundColor: "#EF4444", color: "white" };
    }
    if (statusLower === "counter_offer" || statusLower === "shipped") {
      return { backgroundColor: "#3B82F6", color: "white" };
    }
    return { backgroundColor: "#6B7280", color: "white" };
  };

  const formatCurrency = (amount: number | string) => {
    return `₦${Number(amount).toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const currentData = getCurrentData();
  const items = activeTab !== "Custom Orders" ? (currentData?.data || []) : [];
  const total = activeTab !== "Custom Orders" ? (currentData?.total || 0) : 0;
  const totalPages = Math.ceil(total / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, auditTypeFilter, searchQuery, activeTab]);

  return (
    <>
      <div className="bg-[#F5F7FF] min-h-screen">
        <Header
          adminName="Hi, Admin"
          adminImage="/assets/layout/admin.png"
          onNotificationClick={() => {}}
        />

        <div className="p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">BNPL & Buy Now Management</h1>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {["BNPL Applications", "BNPL Guarantors", "Buy Now Orders", "BNPL Orders", "Audit Requests", "Custom Orders"].map(
                (tab) => (
                  <button
                    key={tab}
                    className={`py-2 px-1 border-b-4 font-medium text-md cursor-pointer ${
                      activeTab === tab
                        ? "border-[#273E8E] text-black"
                        : "border-transparent text-[#00000080]"
                    }`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab}
                  </button>
                )
              )}
            </nav>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {isLoading() ? (
            <StatsLoadingSkeleton count={3} />
          ) : (
            <>
              <div
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-[120px]"
                style={{
                  boxShadow: "5px 5px 10px 0px rgba(109, 108, 108, 0.25)",
                }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-19 h-19 bg-[#0000FF33] rounded-full flex items-center justify-center">
                    <img
                      src={images.users}
                      alt=""
                      className="w-9 h-9 object-contain"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-600">Total</p>
                    <p className="text-2xl font-bold text-blue-600">{total}</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Filters and Search */}
        <div className="mb-6 bg-white rounded-lg p-4 shadow-sm">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <select
                className="border border-[#CDCDCD] rounded-lg px-4 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All Status</option>
                {activeTab === "BNPL Applications" && (
                  <>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="counter_offer">Counter Offer</option>
                  </>
                )}
                {activeTab === "BNPL Guarantors" && (
                  <>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </>
                )}
                {(activeTab === "Buy Now Orders" || activeTab === "BNPL Orders") && (
                  <>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </>
                )}
                {activeTab === "Audit Requests" && (
                  <>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="completed">Completed</option>
                  </>
                )}
              </select>
              {(activeTab === "Audit Requests" || activeTab === "Custom Orders") && (
                <select
                  className="border border-[#CDCDCD] rounded-lg px-4 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  value={auditTypeFilter}
                  onChange={(e) => setAuditTypeFilter(e.target.value)}
                >
                  <option value="All Types">All Types</option>
                  <option value="home-office">Home/Office</option>
                  <option value="commercial">Commercial</option>
                </select>
              )}
              {activeTab === "Custom Orders" && (
                <select
                  className="border border-[#CDCDCD] rounded-lg px-4 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="All">All Users</option>
                  <option value="Has Pending">Has Pending Requests</option>
                </select>
              )}
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-6 py-3.5 border border-[#00000080] rounded-lg text-[15px] w-[320px] focus:outline-none bg-white shadow-[0_2px_6px_rgba(0,0,0,0.05)] placeholder-gray-400"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-4 w-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Custom Orders Tab Content */}
        {activeTab === "Custom Orders" ? (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">Custom Orders Management</h2>
                {auditUsersData?.data?.data?.length > 0 && (
                  <button
                    onClick={() => setShowCreateOrderModal(true)}
                    className="bg-[#273E8E] hover:bg-[#1e3270] text-white px-6 py-3 rounded-full text-sm font-medium transition-colors cursor-pointer"
                  >
                    Create Custom Order
                  </button>
                )}
              </div>
            </div>

            {/* Users Table */}
            {auditUsersLoading ? (
              <LoadingSpinner message="Loading users with audit requests..." />
            ) : auditUsersData?.data?.data?.length === 0 ? (
              <div className="p-12 text-center">
                <div className="max-w-md mx-auto">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  <h3 className="mt-4 text-lg font-medium text-gray-900">No users found</h3>
                  <p className="mt-2 text-sm text-gray-500">
                    There are no users with audit requests at the moment. Users who request audit services will appear here.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[#EBEBEB] border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-medium text-black">
                          Name
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-black">
                          Email
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-black">
                          Phone
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-black">
                          Audit Requests
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-black">
                          Status Summary
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-black">
                          Property Details
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-black">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white">
                      {(
                        auditUsersData?.data?.data?.map((user: any, index: number) => {
                          const hasPropertyDetails = user.audit_requests?.some(
                            (req: any) => req.has_property_details
                          );
                          const needsPropertyDetails = user.audit_requests?.some(
                            (req: any) => req.audit_type === "commercial" && !req.has_property_details && req.status === "pending"
                          );
                          
                          return (
                            <tr
                              key={user.id}
                              className={`${
                                index % 2 === 0 ? "bg-[#F8F8F8]" : "bg-white"
                              } transition-colors border-b border-gray-100 last:border-b-0 hover:bg-gray-50 cursor-pointer`}
                              onClick={async () => {
                                setSelectedUser(user);
                                setSelectedUserId(user.id);
                                setShowUserDetailModal(true);
                                // Refetch cart data for the selected user
                                try {
                                  const cartResponse = await getUserCart(user.id, token);
                                  if (cartResponse?.data) {
                                    setUserCartData(cartResponse.data);
                                  }
                                } catch (error) {
                                  console.error("Failed to fetch cart:", error);
                                  setUserCartData(null);
                                }
                              }}
                            >
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {user.name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                {user.email}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                {user.phone}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                <div className="flex flex-col">
                                  <span className="font-medium">{user.audit_request_count || 0} total</span>
                                  {user.pending_count > 0 && (
                                    <span className="text-xs text-orange-600">
                                      {user.pending_count} pending
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <div className="flex flex-col gap-1">
                                  {user.approved_count > 0 && (
                                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                      {user.approved_count} Approved
                                    </span>
                                  )}
                                  {user.rejected_count > 0 && (
                                    <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                                      {user.rejected_count} Rejected
                                    </span>
                                  )}
                                  {user.completed_count > 0 && (
                                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                      {user.completed_count} Completed
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                {needsPropertyDetails ? (
                                  <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded">
                                    ⚠️ Needs Details
                                  </span>
                                ) : hasPropertyDetails ? (
                                  <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                                    ✓ Details Shared
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                                    No Details
                                  </span>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button
                                  className="bg-[#273E8E] hover:bg-[#1e3270] text-white px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer"
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    setSelectedUser(user);
                                    setSelectedUserId(user.id);
                                    setShowUserDetailModal(true);
                                    // Refetch cart data for the selected user
                                    try {
                                      const cartResponse = await getUserCart(user.id, token);
                                      if (cartResponse?.data) {
                                        setUserCartData(cartResponse.data);
                                      }
                                    } catch (error) {
                                      console.error("Failed to fetch cart:", error);
                                      setUserCartData(null);
                                    }
                                  }}
                                >
                                  View Details
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {auditUsersData?.data?.pagination && auditUsersData.data.pagination.last_page > 1 && (
                  <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-white">
                    <div className="flex items-center text-sm text-gray-700">
                      <span>
                        Showing {auditUsersData.data.pagination.from} to{" "}
                        {auditUsersData.data.pagination.to} of {auditUsersData.data.pagination.total} results
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className={`px-3 py-2 text-sm font-medium rounded-md border ${
                          currentPage === 1
                            ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 cursor-pointer"
                        }`}
                      >
                        Previous
                      </button>
                      <div className="flex items-center space-x-1">
                        {Array.from(
                          { length: auditUsersData.data.pagination.last_page },
                          (_, i) => i + 1
                        )
                          .slice(
                            Math.max(0, currentPage - 2),
                            Math.min(auditUsersData.data.pagination.last_page, currentPage + 3)
                          )
                          .map((pageNumber) => (
                            <button
                              key={pageNumber}
                              onClick={() => setCurrentPage(pageNumber)}
                              className={`px-3 py-2 text-sm font-medium rounded-md border ${
                                currentPage === pageNumber
                                  ? "bg-[#273E8E] text-white border-[#273E8E]"
                                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                              }`}
                            >
                              {pageNumber}
                            </button>
                          ))}
                      </div>
                      <button
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(prev + 1, auditUsersData.data.pagination.last_page)
                          )
                        }
                        disabled={currentPage === auditUsersData.data.pagination.last_page}
                        className={`px-3 py-2 text-sm font-medium rounded-md border ${
                          currentPage === auditUsersData.data.pagination.last_page
                            ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 cursor-pointer"
                        }`}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            {isLoading() ? (
              <LoadingSpinner message="Loading..." />
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-[#EBEBEB]">
                      {activeTab === "BNPL Applications" && (
                        <>
                          <th className="px-6 py-4 text-left text-sm font-medium text-black">
                            ID
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-medium text-black">
                            Customer
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-medium text-black">
                            Loan Amount
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-medium text-black">
                            Duration
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-medium text-black">
                            Status
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-medium text-black">
                            Date
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-medium text-black">
                            Actions
                          </th>
                        </>
                      )}
                      {activeTab === "BNPL Guarantors" && (
                        <>
                          <th className="px-6 py-4 text-left text-sm font-medium text-black">
                            ID
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-medium text-black">
                            Name
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-medium text-black">
                            Phone
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-medium text-black">
                            Email
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-medium text-black">
                            Status
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-medium text-black">
                            Date
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-medium text-black">
                            Actions
                          </th>
                        </>
                      )}
                      {(activeTab === "Buy Now Orders" || activeTab === "BNPL Orders") && (
                        <>
                          <th className="px-6 py-4 text-left text-sm font-medium text-black">
                            ID
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-medium text-black">
                            Customer
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-medium text-black">
                            Total Price
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-medium text-black">
                            Status
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-medium text-black">
                            Date
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-medium text-black">
                            Actions
                          </th>
                        </>
                      )}
                      {activeTab === "Audit Requests" && (
                        <>
                          <th className="px-6 py-4 text-left text-sm font-medium text-black">
                            ID
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-medium text-black">
                            Customer
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-medium text-black">
                            Type
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-medium text-black">
                            Property Address
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-medium text-black">
                            Status
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-medium text-black">
                            Date
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-medium text-black">
                            Actions
                          </th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {items.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-6 py-8 text-center text-gray-500"
                        >
                          No data found
                        </td>
                      </tr>
                    ) : (
                      items.map((item: any, index: number) => (
                        <tr
                          key={item.id}
                          className={`${
                            index % 2 === 0 ? "bg-[#F8F8F8]" : "bg-white"
                          } transition-colors border-b border-gray-100 last:border-b-0`}
                        >
                          {activeTab === "BNPL Applications" && (
                            <>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {item.id}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {item.user
                                  ? `${item.user.first_name} ${item.user.sur_name}`
                                  : "N/A"}
                                <br />
                                <span className="text-xs text-gray-500">
                                  {item.user?.email || ""}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                                {formatCurrency(item.loan_amount)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                {item.repayment_duration} months
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full"
                                  style={getStatusColor(item.status)}
                                >
                                  {item.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                {formatDate(item.created_at)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex items-center space-x-2">
                                  <button
                                    className="bg-[#273E8E] hover:bg-[#1e3270] text-white px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer"
                                    onClick={() => handleViewDetails(item)}
                                  >
                                    View
                                  </button>
                                  <button
                                    className="bg-[#10B981] hover:bg-[#059669] text-white px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer"
                                    onClick={() => handleUpdateStatus(item)}
                                  >
                                    Update
                                  </button>
                                </div>
                              </td>
                            </>
                          )}
                          {activeTab === "BNPL Guarantors" && (
                            <>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {item.id}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {item.full_name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                {item.phone}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                {item.email}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full"
                                  style={getStatusColor(item.status)}
                                >
                                  {item.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                {formatDate(item.created_at)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button
                                  className="bg-[#10B981] hover:bg-[#059669] text-white px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer"
                                  onClick={() => handleUpdateStatus(item)}
                                >
                                  Update
                                </button>
                              </td>
                            </>
                          )}
                          {(activeTab === "Buy Now Orders" || activeTab === "BNPL Orders") && (
                            <>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {item.id}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {item.user
                                  ? `${item.user.first_name} ${item.user.sur_name}`
                                  : "N/A"}
                                <br />
                                <span className="text-xs text-gray-500">
                                  {item.user?.email || ""}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                                {formatCurrency(item.total_price)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full"
                                  style={getStatusColor(item.order_status)}
                                >
                                  {item.order_status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                {formatDate(item.created_at)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex items-center space-x-2">
                                  <button
                                    className="bg-[#273E8E] hover:bg-[#1e3270] text-white px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer"
                                    onClick={() => handleViewDetails(item)}
                                  >
                                    View
                                  </button>
                                  <button
                                    className="bg-[#10B981] hover:bg-[#059669] text-white px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer"
                                    onClick={() => handleUpdateStatus(item)}
                                  >
                                    Update
                                  </button>
                                </div>
                              </td>
                            </>
                          )}
                          {activeTab === "Audit Requests" && (
                            <>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {item.id}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {item.user
                                  ? `${item.user.first_name} ${item.user.sur_name}`
                                  : "N/A"}
                                <br />
                                <span className="text-xs text-gray-500">
                                  {item.user?.email || ""}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                <span className="capitalize">
                                  {item.audit_type?.replace("-", "/") || "N/A"}
                                </span>
                                {item.audit_type === "commercial" && !item.property_address && (
                                  <span className="ml-2 text-xs text-orange-600 font-semibold">
                                    (Needs Details)
                                  </span>
                                )}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600">
                                {item.property_address || (
                                  <span className="text-gray-400 italic">Not provided</span>
                                )}
                                {item.property_state && (
                                  <span className="text-xs text-gray-500 ml-1">
                                    ({item.property_state})
                                  </span>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full"
                                  style={getStatusColor(item.status)}
                                >
                                  {item.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                {formatDate(item.created_at)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex items-center space-x-2">
                                  <button
                                    className="bg-[#273E8E] hover:bg-[#1e3270] text-white px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer"
                                    onClick={() => handleViewDetails(item)}
                                  >
                                    View
                                  </button>
                                  <button
                                    className="bg-[#10B981] hover:bg-[#059669] text-white px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer"
                                    onClick={() => handleUpdateStatus(item)}
                                  >
                                    Update
                                  </button>
                                </div>
                              </td>
                            </>
                          )}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-white">
                  <div className="flex items-center text-sm text-gray-700">
                    <span>
                      Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                      {Math.min(currentPage * itemsPerPage, total)} of {total} results
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className={`px-3 py-2 text-sm font-medium rounded-md border ${
                        currentPage === 1
                          ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 cursor-pointer"
                      }`}
                    >
                      Previous
                    </button>
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNumber;
                        if (totalPages <= 5) {
                          pageNumber = i + 1;
                        } else if (currentPage <= 3) {
                          pageNumber = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNumber = totalPages - 4 + i;
                        } else {
                          pageNumber = currentPage - 2 + i;
                        }
                        return (
                          <button
                            key={pageNumber}
                            onClick={() => setCurrentPage(pageNumber)}
                            className={`px-3 py-2 text-sm font-medium rounded-md border ${
                              currentPage === pageNumber
                                ? "bg-[#273E8E] text-white border-[#273E8E]"
                                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                            }`}
                          >
                            {pageNumber}
                          </button>
                        );
                      })}
                    </div>
                    <button
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className={`px-3 py-2 text-sm font-medium rounded-md border ${
                        currentPage === totalPages
                          ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 cursor-pointer"
                      }`}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
          </div>
        )}
        </div>

      {/* Detail Modal */}
      {showDetailModal && selectedItem && (
        <div className="fixed inset-0 bg-black/40 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-5xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {activeTab === "BNPL Applications" ? "BNPL Application Details" :
                 activeTab === "BNPL Guarantors" ? "Guarantor Details" :
                 activeTab === "Audit Requests" ? "Audit Request Details" :
                 "Order Details"}
              </h2>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedItem(null);
                  setOrderSummary(null);
                  setOrderInvoice(null);
                  setInvoiceNotFound(false);
                  setDetailModalTab("Details");
                }}
                className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Tabs for Orders */}
            {(activeTab === "Buy Now Orders" || activeTab === "BNPL Orders") && (
              <div className="border-b border-gray-200 mb-4">
                <nav className="-mb-px flex space-x-8">
                  {["Details", "Summary", "Invoice"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => {
                        setDetailModalTab(tab);
                        if (tab === "Invoice" && !orderInvoice && !invoiceNotFound) {
                          handleLoadInvoice();
                        }
                        if (tab !== "Invoice") {
                          setInvoiceNotFound(false);
                        }
                      }}
                      className={`py-2 px-1 border-b-2 font-medium text-sm ${
                        detailModalTab === tab
                          ? "border-[#273E8E] text-[#273E8E]"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </nav>
              </div>
            )}

            {/* Tab Content */}
            {detailModalTab === "Details" && (
              <div className="space-y-6">
                {(activeTab === "Buy Now Orders" || activeTab === "BNPL Orders") ? (
                  <>
                    {/* Order Overview */}
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 border border-green-100">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900">Order Overview</h3>
                        <div className="flex items-center gap-2">
                          {selectedItem.payment_status && (
                            <span
                              className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full"
                              style={getStatusColor(selectedItem.payment_status)}
                            >
                              Payment: {selectedItem.payment_status}
                            </span>
                          )}
                          {selectedItem.order_status && (
                            <span
                              className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full"
                              style={getStatusColor(selectedItem.order_status)}
                            >
                              {selectedItem.order_status}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Order ID</p>
                          <p className="text-sm font-semibold text-gray-900">#{selectedItem.id || "N/A"}</p>
                        </div>
                        {selectedItem.total_price && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Total Price</p>
                            <p className="text-sm font-semibold text-[#273E8E]">
                              {formatCurrency(selectedItem.total_price)}
                            </p>
                          </div>
                        )}
                        {selectedItem.payment_method && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Payment Method</p>
                            <p className="text-sm font-semibold text-gray-900 capitalize">
                              {selectedItem.payment_method}
                            </p>
                          </div>
                        )}
                        {selectedItem.created_at && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Order Date</p>
                            <p className="text-sm font-semibold text-gray-900">
                              {formatDate(selectedItem.created_at)}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Customer Information */}
                    {selectedItem.user && (
                      <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                          <svg className="w-5 h-5 mr-2 text-[#273E8E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          Customer Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Full Name</p>
                            <p className="text-sm font-medium text-gray-900">
                              {selectedItem.user.first_name} {selectedItem.user.sur_name}
                            </p>
                          </div>
                          {selectedItem.user.email && (
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Email</p>
                              <p className="text-sm font-medium text-gray-900">{selectedItem.user.email}</p>
                            </div>
                          )}
                          {selectedItem.user.phone && (
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Phone</p>
                              <p className="text-sm font-medium text-gray-900">{selectedItem.user.phone}</p>
                            </div>
                          )}
                          {selectedItem.user.id && (
                            <div>
                              <p className="text-xs text-gray-500 mb-1">User ID</p>
                              <p className="text-sm font-medium text-gray-900">#{selectedItem.user.id}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Order Details */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-[#273E8E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        Order Details
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedItem.total_price && (
                          <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-xs text-gray-500 mb-1">Total Price</p>
                            <p className="text-lg font-bold text-[#273E8E]">
                              {formatCurrency(selectedItem.total_price)}
                            </p>
                          </div>
                        )}
                        {selectedItem.payment_method && (
                          <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-xs text-gray-500 mb-1">Payment Method</p>
                            <p className="text-lg font-bold text-gray-900 capitalize">
                              {selectedItem.payment_method}
                            </p>
                          </div>
                        )}
                        {selectedItem.payment_status && (
                          <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-xs text-gray-500 mb-1">Payment Status</p>
                            <p className="text-lg font-bold text-gray-900 capitalize">
                              {selectedItem.payment_status}
                            </p>
                          </div>
                        )}
                        {selectedItem.order_status && (
                          <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-xs text-gray-500 mb-1">Order Status</p>
                            <p className="text-lg font-bold text-gray-900 capitalize">
                              {selectedItem.order_status}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Order Items */}
                    {selectedItem.items && Array.isArray(selectedItem.items) && selectedItem.items.length > 0 && (
                      <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                          <svg className="w-5 h-5 mr-2 text-[#273E8E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                          Order Items ({selectedItem.items.length})
                        </h3>
                        <div className="space-y-3">
                          {selectedItem.items.map((item: any, idx: number) => (
                            <div key={idx} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <h4 className="font-medium text-gray-900">
                                    {item.name || item.title || `Item ${idx + 1}`}
                                  </h4>
                                  {item.description && (
                                    <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                                  )}
                                  <div className="flex items-center gap-4 mt-2">
                                    {item.quantity && (
                                      <span className="text-xs text-gray-500">
                                        Quantity: <span className="font-medium text-gray-900">{item.quantity}</span>
                                      </span>
                                    )}
                                    {item.type && (
                                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                                        {item.type}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                {(item.price || item.unit_price) && (
                                  <div className="text-right">
                                    <p className="text-sm font-semibold text-[#273E8E]">
                                      {formatCurrency(item.price || item.unit_price)}
                                    </p>
                                    {item.quantity && (item.price || item.unit_price) && (
                                      <p className="text-xs text-gray-500 mt-1">
                                        Subtotal: {formatCurrency((item.price || item.unit_price) * item.quantity)}
                                      </p>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Additional Information */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
                      <div className="space-y-3">
                        {Object.entries(selectedItem).map(([key, value]: [string, any]) => {
                          // Skip already displayed fields
                          const skipKeys = [
                            "id", "user", "items", "total_price", "payment_method", "payment_status",
                            "order_status", "created_at", "updated_at", "user_id"
                          ];
                          if (skipKeys.includes(key) || !value || value === null || value === "null") {
                            return null;
                          }
                          if (typeof value === "object" || Array.isArray(value)) {
                            return null;
                          }
                          return (
                            <div key={key} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                              <span className="text-sm font-medium text-gray-700 capitalize">
                                {key.replace(/_/g, " ")}:
                              </span>
                              <span className="text-sm text-gray-900">
                                {key.includes("amount") || key.includes("price") || key.includes("fee")
                                  ? formatCurrency(value)
                                  : key.includes("date") || key.includes("_at")
                                  ? formatDate(value)
                                  : String(value)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                ) : activeTab === "BNPL Applications" ? (
                  <>
                    {/* Application Overview */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-100">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900">Application Overview</h3>
                        <span
                          className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-full"
                          style={getStatusColor(selectedItem.status)}
                        >
                          {selectedItem.status || "N/A"}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Application ID</p>
                          <p className="text-sm font-semibold text-gray-900">#{selectedItem.id || "N/A"}</p>
                        </div>
                        {selectedItem.loan_amount && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Loan Amount</p>
                            <p className="text-sm font-semibold text-[#273E8E]">
                              {formatCurrency(selectedItem.loan_amount)}
                            </p>
                          </div>
                        )}
                        {selectedItem.repayment_duration && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Repayment Duration</p>
                            <p className="text-sm font-semibold text-gray-900">
                              {selectedItem.repayment_duration} months
                            </p>
                          </div>
                        )}
                        {selectedItem.created_at && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Application Date</p>
                            <p className="text-sm font-semibold text-gray-900">
                              {formatDate(selectedItem.created_at)}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* User Information */}
                    {selectedItem.user && (
                      <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                          <svg className="w-5 h-5 mr-2 text-[#273E8E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          Customer Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Full Name</p>
                            <p className="text-sm font-medium text-gray-900">
                              {selectedItem.user.first_name} {selectedItem.user.sur_name}
                            </p>
                          </div>
                          {selectedItem.user.email && (
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Email</p>
                              <p className="text-sm font-medium text-gray-900">{selectedItem.user.email}</p>
                            </div>
                          )}
                          {selectedItem.user.phone && (
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Phone</p>
                              <p className="text-sm font-medium text-gray-900">{selectedItem.user.phone}</p>
                            </div>
                          )}
                          {selectedItem.user.id && (
                            <div>
                              <p className="text-xs text-gray-500 mb-1">User ID</p>
                              <p className="text-sm font-medium text-gray-900">#{selectedItem.user.id}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Loan Details */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-[#273E8E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Loan Details
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedItem.loan_amount && (
                          <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-xs text-gray-500 mb-1">Loan Amount</p>
                            <p className="text-lg font-bold text-[#273E8E]">
                              {formatCurrency(selectedItem.loan_amount)}
                            </p>
                          </div>
                        )}
                        {selectedItem.repayment_duration && (
                          <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-xs text-gray-500 mb-1">Repayment Duration</p>
                            <p className="text-lg font-bold text-gray-900">
                              {selectedItem.repayment_duration} months
                            </p>
                          </div>
                        )}
                        {selectedItem.monthly_payment && (
                          <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-xs text-gray-500 mb-1">Monthly Payment</p>
                            <p className="text-lg font-bold text-gray-900">
                              {formatCurrency(selectedItem.monthly_payment)}
                            </p>
                          </div>
                        )}
                        {selectedItem.interest_rate && (
                          <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-xs text-gray-500 mb-1">Interest Rate</p>
                            <p className="text-lg font-bold text-gray-900">
                              {selectedItem.interest_rate}%
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Beneficiary Information */}
                    {(selectedItem.beneficiary_name || selectedItem.beneficiary_email || selectedItem.beneficiary_phone || selectedItem.beneficiary_relationship) && (
                      <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                          <svg className="w-5 h-5 mr-2 text-[#273E8E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          Beneficiary Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {selectedItem.beneficiary_name && (
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Beneficiary Name</p>
                              <p className="text-sm font-medium text-gray-900">
                                {selectedItem.beneficiary_name}
                              </p>
                            </div>
                          )}
                          {selectedItem.beneficiary_email && (
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Beneficiary Email</p>
                              <p className="text-sm font-medium text-gray-900">
                                {selectedItem.beneficiary_email}
                              </p>
                            </div>
                          )}
                          {selectedItem.beneficiary_phone && (
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Beneficiary Phone</p>
                              <p className="text-sm font-medium text-gray-900">
                                {selectedItem.beneficiary_phone}
                              </p>
                            </div>
                          )}
                          {selectedItem.beneficiary_relationship && (
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Relationship</p>
                              <p className="text-sm font-medium text-gray-900">
                                {selectedItem.beneficiary_relationship}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Documents */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-[#273E8E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Documents
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedItem.title_document && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Title Document</p>
                            <p className="text-sm font-medium text-gray-900">
                              {selectedItem.title_document}
                            </p>
                          </div>
                        )}
                        {selectedItem.upload_document && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Uploaded Document</p>
                            {typeof selectedItem.upload_document === "string" && (
                              selectedItem.upload_document.startsWith("http") ? (
                                <a
                                  href={selectedItem.upload_document}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm font-medium text-[#273E8E] hover:underline flex items-center"
                                >
                                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                  </svg>
                                  View Document
                                </a>
                              ) : (
                                <p className="text-sm font-medium text-gray-900">
                                  {selectedItem.upload_document}
                                </p>
                              )
                            )}
                          </div>
                        )}
                        {(!selectedItem.title_document && !selectedItem.upload_document) && (
                          <p className="text-sm text-gray-500 italic">No documents uploaded</p>
                        )}
                      </div>
                    </div>

                    {/* Additional Information */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
                      <div className="space-y-3">
                        {Object.entries(selectedItem).map(([key, value]: [string, any]) => {
                          // Skip already displayed fields
                          const skipKeys = [
                            "id", "status", "loan_amount", "repayment_duration", "monthly_payment",
                            "interest_rate", "user", "beneficiary_name", "beneficiary_email",
                            "beneficiary_phone", "beneficiary_relationship", "title_document",
                            "upload_document", "created_at", "updated_at", "guarantors", "loan_configuration"
                          ];
                          if (skipKeys.includes(key) || !value || value === null || value === "null") {
                            return null;
                          }
                          if (typeof value === "object" || Array.isArray(value)) {
                            return null;
                          }
                          return (
                            <div key={key} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                              <span className="text-sm font-medium text-gray-700 capitalize">
                                {key.replace(/_/g, " ")}:
                              </span>
                              <span className="text-sm text-gray-900">
                                {key.includes("amount") || key.includes("price") || key.includes("fee")
                                  ? formatCurrency(value)
                                  : String(value)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                ) : (
                  // Generic display for other tabs
                  <div className="space-y-4">
                    {Object.entries(selectedItem).map(([key, value]: [string, any]) => {
                      if (typeof value === "object" && value !== null && !Array.isArray(value)) {
                        return (
                          <div key={key} className="bg-white rounded-lg border border-gray-200 p-4">
                            <h3 className="font-semibold text-gray-700 capitalize mb-3">
                              {key.replace(/_/g, " ")}
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {Object.entries(value).map(([subKey, subValue]: [string, any]) => (
                                <div key={subKey}>
                                  <p className="text-xs text-gray-500 mb-1 capitalize">
                                    {subKey.replace(/_/g, " ")}
                                  </p>
                                  <p className="text-sm font-medium text-gray-900">
                                    {typeof subValue === "object" && subValue !== null
                                      ? JSON.stringify(subValue)
                                      : subValue === null || subValue === "null"
                                      ? "N/A"
                                      : String(subValue)}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      }
                      if (Array.isArray(value)) {
                        return (
                          <div key={key} className="bg-white rounded-lg border border-gray-200 p-4">
                            <h3 className="font-semibold text-gray-700 capitalize mb-3">
                              {key.replace(/_/g, " ")} ({value.length})
                            </h3>
                            <div className="space-y-2">
                              {value.map((item: any, idx: number) => (
                                <div key={idx} className="bg-gray-50 rounded p-3 border border-gray-200">
                                  {typeof item === "object" ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                      {Object.entries(item).map(([k, v]: [string, any]) => (
                                        <div key={k}>
                                          <p className="text-xs text-gray-500 mb-1 capitalize">
                                            {k.replace(/_/g, " ")}
                                          </p>
                                          <p className="text-sm font-medium text-gray-900">
                                            {typeof v === "object" ? JSON.stringify(v) : v === null || v === "null" ? "N/A" : String(v)}
                                          </p>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <p className="text-sm text-gray-900">{String(item)}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      }
                      if (value === null || value === "null" || value === "") {
                        return null;
                      }
                      return (
                        <div key={key} className="bg-white rounded-lg border border-gray-200 p-4">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-700 capitalize">
                              {key.replace(/_/g, " ")}:
                            </span>
                            <span className="text-sm text-gray-900">
                              {key.includes("amount") || key.includes("price") || key.includes("fee")
                                ? formatCurrency(value)
                                : String(value)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {detailModalTab === "Summary" && (
              <div className="space-y-4">
                {loadingSummary ? (
                  <LoadingSpinner message="Loading order summary..." />
                ) : orderSummary ? (
                  <>
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <h3 className="font-semibold text-gray-900 mb-3">Order Information</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Order Number:</span>
                          <span className="ml-2 font-medium">{orderSummary.order_number || selectedItem.id}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Total Price:</span>
                          <span className="ml-2 font-medium text-[#273E8E]">
                            {formatCurrency(orderSummary.total_price || selectedItem.total_price)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {orderSummary.items && orderSummary.items.length > 0 && (
                      <div className="mb-4">
                        <h3 className="font-semibold text-gray-900 mb-3">Order Items</h3>
                        <div className="space-y-3">
                          {orderSummary.items.map((item: any, idx: number) => (
                            <div key={idx} className="border border-gray-200 rounded-lg p-4">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <h4 className="font-medium text-gray-900">{item.name}</h4>
                                  {item.description && (
                                    <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                                  )}
                                </div>
                                <div className="text-right">
                                  <div className="font-semibold text-[#273E8E]">
                                    {formatCurrency(item.price)}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    Qty: {item.quantity}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {orderSummary.appliances && (
                      <div className="mb-4">
                        <h3 className="font-semibold text-gray-900 mb-2">Appliances</h3>
                        <p className="text-gray-600">{orderSummary.appliances}</p>
                      </div>
                    )}

                    {orderSummary.backup_time && (
                      <div className="mb-4">
                        <h3 className="font-semibold text-gray-900 mb-2">Backup Time</h3>
                        <p className="text-gray-600">{orderSummary.backup_time}</p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    No summary data available
                  </div>
                )}
              </div>
            )}

            {detailModalTab === "Invoice" && (
              <div className="space-y-4">
                {loadingInvoice ? (
                  <LoadingSpinner message="Loading invoice details..." />
                ) : orderInvoice ? (
                  <>
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <h3 className="font-semibold text-gray-900 mb-3">Invoice Information</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Order Number:</span>
                          <span className="ml-2 font-medium">{orderInvoice.order_number || selectedItem.id}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Total:</span>
                          <span className="ml-2 font-medium text-[#273E8E]">
                            {formatCurrency(orderInvoice.invoice?.total || orderInvoice.total || selectedItem.total_price)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {orderInvoice.invoice && (
                      <div className="space-y-4">
                        {/* Product Breakdown */}
                        {(orderInvoice.invoice.solar_inverter || orderInvoice.invoice.solar_panels || orderInvoice.invoice.batteries) && (
                          <div className="mb-4">
                            <h3 className="font-semibold text-gray-900 mb-3">Product Breakdown</h3>
                            <div className="space-y-3">
                              {orderInvoice.invoice.solar_inverter && (
                                <div className="border border-gray-200 rounded-lg p-4">
                                  <div className="flex justify-between items-center">
                                    <div>
                                      <h4 className="font-medium text-gray-900">
                                        {orderInvoice.invoice.solar_inverter.description || "Solar Inverter"}
                                      </h4>
                                      <p className="text-sm text-gray-600 mt-1">
                                        Quantity: {orderInvoice.invoice.solar_inverter.quantity}
                                      </p>
                                    </div>
                                    <div className="font-semibold text-[#273E8E]">
                                      {formatCurrency(orderInvoice.invoice.solar_inverter.price)}
                                    </div>
                                  </div>
                                </div>
                              )}
                              {orderInvoice.invoice.solar_panels && (
                                <div className="border border-gray-200 rounded-lg p-4">
                                  <div className="flex justify-between items-center">
                                    <div>
                                      <h4 className="font-medium text-gray-900">
                                        {orderInvoice.invoice.solar_panels.description || "Solar Panels"}
                                      </h4>
                                      <p className="text-sm text-gray-600 mt-1">
                                        Quantity: {orderInvoice.invoice.solar_panels.quantity}
                                      </p>
                                    </div>
                                    <div className="font-semibold text-[#273E8E]">
                                      {formatCurrency(orderInvoice.invoice.solar_panels.price)}
                                    </div>
                                  </div>
                                </div>
                              )}
                              {orderInvoice.invoice.batteries && (
                                <div className="border border-gray-200 rounded-lg p-4">
                                  <div className="flex justify-between items-center">
                                    <div>
                                      <h4 className="font-medium text-gray-900">
                                        {orderInvoice.invoice.batteries.description || "Batteries"}
                                      </h4>
                                      <p className="text-sm text-gray-600 mt-1">
                                        Quantity: {orderInvoice.invoice.batteries.quantity}
                                      </p>
                                    </div>
                                    <div className="font-semibold text-[#273E8E]">
                                      {formatCurrency(orderInvoice.invoice.batteries.price)}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Fees Breakdown */}
                        <div className="mb-4">
                          <h3 className="font-semibold text-gray-900 mb-3">Fees Breakdown</h3>
                          <div className="space-y-2 border border-gray-200 rounded-lg p-4">
                            {orderInvoice.invoice.material_cost && (
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Material Cost:</span>
                                <span className="font-medium">{formatCurrency(orderInvoice.invoice.material_cost)}</span>
                              </div>
                            )}
                            {orderInvoice.invoice.installation_fee && (
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Installation Fee:</span>
                                <span className="font-medium">{formatCurrency(orderInvoice.invoice.installation_fee)}</span>
                              </div>
                            )}
                            {orderInvoice.invoice.delivery_fee && (
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Delivery Fee:</span>
                                <span className="font-medium">{formatCurrency(orderInvoice.invoice.delivery_fee)}</span>
                              </div>
                            )}
                            {orderInvoice.invoice.inspection_fee && (
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Inspection Fee:</span>
                                <span className="font-medium">{formatCurrency(orderInvoice.invoice.inspection_fee)}</span>
                              </div>
                            )}
                            {orderInvoice.invoice.insurance_fee && (
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Insurance Fee:</span>
                                <span className="font-medium">{formatCurrency(orderInvoice.invoice.insurance_fee)}</span>
                              </div>
                            )}
                            {orderInvoice.invoice.subtotal && (
                              <div className="flex justify-between text-sm border-t border-gray-200 pt-2 mt-2">
                                <span className="text-gray-600 font-medium">Subtotal:</span>
                                <span className="font-semibold">{formatCurrency(orderInvoice.invoice.subtotal)}</span>
                              </div>
                            )}
                            {orderInvoice.invoice.total && (
                              <div className="flex justify-between text-sm border-t-2 border-[#273E8E] pt-2 mt-2">
                                <span className="text-gray-900 font-bold">Total:</span>
                                <span className="font-bold text-[#273E8E] text-lg">
                                  {formatCurrency(orderInvoice.invoice.total)}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                ) : invoiceNotFound ? (
                  <div className="text-center text-gray-500 py-8">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400 mb-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <p className="text-lg font-medium text-gray-900 mb-2">Invoice does not exist</p>
                    <p className="text-sm text-gray-500">
                      This order does not have an invoice available.
                    </p>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <p className="mb-4">Invoice details not loaded</p>
                    <button
                      onClick={handleLoadInvoice}
                      className="bg-[#273E8E] text-white px-4 py-2 rounded-lg hover:bg-[#1e3270] transition-colors"
                    >
                      Load Invoice
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {showStatusModal && selectedItem && (
        <div className="fixed inset-0 bg-black/40 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Update Status</h2>
              <button
                onClick={() => {
                  setShowStatusModal(false);
                  setSelectedItem(null);
                  setStatusForm({
                    status: "",
                    admin_notes: "",
                    counter_offer_min_deposit: "",
                    counter_offer_min_tenor: "",
                  });
                }}
                className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  className="w-full border border-[#CDCDCD] rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  value={statusForm.status}
                  onChange={(e) =>
                    setStatusForm({ ...statusForm, status: e.target.value })
                  }
                >
                  <option value="">Select Status</option>
                  {activeTab === "BNPL Applications" && (
                    <>
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                      <option value="counter_offer">Counter Offer</option>
                    </>
                  )}
                  {activeTab === "BNPL Guarantors" && (
                    <>
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </>
                  )}
                  {(activeTab === "Buy Now Orders" || activeTab === "BNPL Orders") && (
                    <>
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </>
                  )}
                  {activeTab === "Audit Requests" && (
                    <>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                      <option value="completed">Completed</option>
                    </>
                  )}
                </select>
              </div>

              {statusForm.status === "counter_offer" && activeTab === "BNPL Applications" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Counter Offer Min Deposit
                    </label>
                    <input
                      type="number"
                      className="w-full border border-[#CDCDCD] rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      value={statusForm.counter_offer_min_deposit}
                      onChange={(e) =>
                        setStatusForm({
                          ...statusForm,
                          counter_offer_min_deposit: e.target.value,
                        })
                      }
                      placeholder="Enter minimum deposit"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Counter Offer Min Tenor
                    </label>
                    <input
                      type="number"
                      className="w-full border border-[#CDCDCD] rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      value={statusForm.counter_offer_min_tenor}
                      onChange={(e) =>
                        setStatusForm({
                          ...statusForm,
                          counter_offer_min_tenor: e.target.value,
                        })
                      }
                      placeholder="Enter minimum tenor (months)"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Notes (Optional)
                </label>
                <textarea
                  className="w-full border border-[#CDCDCD] rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  rows={3}
                  value={statusForm.admin_notes}
                  onChange={(e) =>
                    setStatusForm({ ...statusForm, admin_notes: e.target.value })
                  }
                  placeholder="Enter admin notes..."
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowStatusModal(false);
                  setSelectedItem(null);
                  setStatusForm({
                    status: "",
                    admin_notes: "",
                    counter_offer_min_deposit: "",
                    counter_offer_min_tenor: "",
                  });
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleStatusSubmit}
                disabled={
                  !statusForm.status ||
                  updateApplicationStatusMutation.isPending ||
                  updateGuarantorStatusMutation.isPending ||
                  updateBuyNowOrderStatusMutation.isPending ||
                  updateAuditRequestStatusMutation.isPending
                }
                className={`px-6 py-2 rounded-full font-medium transition-colors flex items-center ${
                  statusForm.status &&
                  !updateApplicationStatusMutation.isPending &&
                  !updateGuarantorStatusMutation.isPending &&
                  !updateBuyNowOrderStatusMutation.isPending &&
                  !updateAuditRequestStatusMutation.isPending
                    ? "bg-[#273E8E] text-white hover:bg-[#1f2f7a]"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                {(updateApplicationStatusMutation.isPending ||
                  updateGuarantorStatusMutation.isPending ||
                  updateBuyNowOrderStatusMutation.isPending ||
                  updateAuditRequestStatusMutation.isPending) && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                )}
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Custom Order Modal */}
      {showCreateOrderModal && (
        <div className="fixed inset-0 bg-black/40 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Create Custom Order</h2>
              <button
                onClick={() => {
                  setShowCreateOrderModal(false);
                  setCreateOrderForm({
                    user_id: "",
                    order_type: "buy_now",
                    items: [],
                    send_email: true,
                    email_message: "",
                  });
                  setSelectedProducts([]);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <img src={images.cross} className="w-6 h-6" alt="Close" />
              </button>
            </div>

            <div className="space-y-4">
              {/* User Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select User *
                </label>
                <select
                  value={createOrderForm.user_id}
                  onChange={(e) =>
                    setCreateOrderForm({ ...createOrderForm, user_id: e.target.value })
                  }
                  className="w-full border border-[#CDCDCD] rounded-lg px-3 py-2 text-sm bg-white"
                  required
                >
                  <option value="">Select a user</option>
                  {auditUsersData?.data?.data
                    ?.filter((user: any) => user.audit_requests?.some((req: any) => req.has_property_details))
                    ?.map((user: any) => (
                      <option key={user.id} value={user.id}>
                        {user.name} - {user.email}
                      </option>
                    ))}
                  {(!auditUsersData?.data?.data ||
                    auditUsersData.data.data.filter((user: any) =>
                      user.audit_requests?.some((req: any) => req.has_property_details)
                    ).length === 0) && (
                    <option value="" disabled>
                      No users with shared property details available
                    </option>
                  )}
                </select>
              </div>

              {/* Order Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Order Type *
                </label>
                <select
                  value={createOrderForm.order_type}
                  onChange={(e) =>
                    setCreateOrderForm({
                      ...createOrderForm,
                      order_type: e.target.value as "buy_now" | "bnpl",
                    })
                  }
                  className="w-full border border-[#CDCDCD] rounded-lg px-3 py-2 text-sm bg-white"
                  required
                >
                  <option value="buy_now">Buy Now</option>
                  <option value="bnpl">BNPL</option>
                </select>
              </div>

              {/* Product Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter Products/Bundles
                </label>
                <div className="flex space-x-2">
                  {(["all", "products", "bundles"] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setProductTypeFilter(type)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium ${
                        productTypeFilter === type
                          ? "bg-[#273E8E] text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Products/Bundles Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Products/Bundles *
                </label>
                {cartProductsLoading ? (
                  <LoadingSpinner message="Loading products..." />
                ) : (
                  <div className="border border-gray-200 rounded-lg p-4 max-h-64 overflow-y-auto">
                    <div className="space-y-2">
                      {cartProductsData?.data?.products?.map((product: any) => (
                        <div
                          key={`product-${product.id}`}
                          className="flex items-center justify-between p-2 border rounded hover:bg-gray-50"
                        >
                          <div className="flex-1">
                            <p className="font-medium">{product.title}</p>
                            <p className="text-sm text-gray-600">
                              {formatCurrency(product.discount_price || product.price)}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="number"
                              min="1"
                              defaultValue="1"
                              className="w-16 px-2 py-1 border rounded text-sm"
                              onChange={(e) => {
                                const quantity = parseInt(e.target.value) || 1;
                                const existing = selectedProducts.find(
                                  (p) => p.id === product.id && p.type === "product"
                                );
                                if (existing) {
                                  setSelectedProducts(
                                    selectedProducts.map((p) =>
                                      p.id === product.id && p.type === "product"
                                        ? { ...p, quantity }
                                        : p
                                    )
                                  );
                                } else {
                                  setSelectedProducts([
                                    ...selectedProducts,
                                    { type: "product", id: product.id, quantity },
                                  ]);
                                }
                              }}
                            />
                            <button
                              onClick={() => {
                                const existing = selectedProducts.find(
                                  (p) => p.id === product.id && p.type === "product"
                                );
                                if (existing) {
                                  setSelectedProducts(
                                    selectedProducts.filter(
                                      (p) => !(p.id === product.id && p.type === "product")
                                    )
                                  );
                                } else {
                                  setSelectedProducts([
                                    ...selectedProducts,
                                    { type: "product", id: product.id, quantity: 1 },
                                  ]);
                                }
                              }}
                              className={`px-3 py-1 rounded text-sm ${
                                selectedProducts.some(
                                  (p) => p.id === product.id && p.type === "product"
                                )
                                  ? "bg-red-500 text-white"
                                  : "bg-[#273E8E] text-white"
                              }`}
                            >
                              {selectedProducts.some(
                                (p) => p.id === product.id && p.type === "product"
                              )
                                ? "Remove"
                                : "Add"}
                            </button>
                          </div>
                        </div>
                      ))}
                      {cartProductsData?.data?.bundles?.map((bundle: any) => (
                        <div
                          key={`bundle-${bundle.id}`}
                          className="flex items-center justify-between p-2 border rounded hover:bg-gray-50"
                        >
                          <div className="flex-1">
                            <p className="font-medium">{bundle.title}</p>
                            <p className="text-sm text-gray-600">
                              {formatCurrency(bundle.discount_price || bundle.price)}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="number"
                              min="1"
                              defaultValue="1"
                              className="w-16 px-2 py-1 border rounded text-sm"
                              onChange={(e) => {
                                const quantity = parseInt(e.target.value) || 1;
                                const existing = selectedProducts.find(
                                  (p) => p.id === bundle.id && p.type === "bundle"
                                );
                                if (existing) {
                                  setSelectedProducts(
                                    selectedProducts.map((p) =>
                                      p.id === bundle.id && p.type === "bundle"
                                        ? { ...p, quantity }
                                        : p
                                    )
                                  );
                                } else {
                                  setSelectedProducts([
                                    ...selectedProducts,
                                    { type: "bundle", id: bundle.id, quantity },
                                  ]);
                                }
                              }}
                            />
                            <button
                              onClick={() => {
                                const existing = selectedProducts.find(
                                  (p) => p.id === bundle.id && p.type === "bundle"
                                );
                                if (existing) {
                                  setSelectedProducts(
                                    selectedProducts.filter(
                                      (p) => !(p.id === bundle.id && p.type === "bundle")
                                    )
                                  );
                                } else {
                                  setSelectedProducts([
                                    ...selectedProducts,
                                    { type: "bundle", id: bundle.id, quantity: 1 },
                                  ]);
                                }
                              }}
                              className={`px-3 py-1 rounded text-sm ${
                                selectedProducts.some(
                                  (p) => p.id === bundle.id && p.type === "bundle"
                                )
                                  ? "bg-red-500 text-white"
                                  : "bg-[#273E8E] text-white"
                              }`}
                            >
                              {selectedProducts.some(
                                (p) => p.id === bundle.id && p.type === "bundle"
                              )
                                ? "Remove"
                                : "Add"}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Email Options */}
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={createOrderForm.send_email}
                    onChange={(e) =>
                      setCreateOrderForm({
                        ...createOrderForm,
                        send_email: e.target.checked,
                      })
                    }
                    className="rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Send email link to user
                  </span>
                </label>
              </div>

              {createOrderForm.send_email && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Message (Optional)
                  </label>
                  <textarea
                    value={createOrderForm.email_message}
                    onChange={(e) =>
                      setCreateOrderForm({
                        ...createOrderForm,
                        email_message: e.target.value,
                      })
                    }
                    className="w-full border border-[#CDCDCD] rounded-lg px-3 py-2 text-sm"
                    rows={3}
                    placeholder="Custom message for the user..."
                    maxLength={1000}
                  />
                </div>
              )}

              {/* Selected Items Summary */}
              {selectedProducts.length > 0 && (
                <div className="border-t pt-4">
                  <h3 className="font-medium mb-2">Selected Items:</h3>
                  <ul className="space-y-1">
                    {selectedProducts.map((item, idx) => (
                      <li key={idx} className="text-sm text-gray-600">
                        {item.type === "product" ? "Product" : "Bundle"} ID {item.id} - Qty: {item.quantity}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  onClick={() => {
                    setShowCreateOrderModal(false);
                    setCreateOrderForm({
                      user_id: "",
                      order_type: "buy_now",
                      items: [],
                      send_email: true,
                      email_message: "",
                    });
                    setSelectedProducts([]);
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (!createOrderForm.user_id) {
                      alert("Please select a user");
                      return;
                    }
                    if (selectedProducts.length === 0) {
                      alert("Please select at least one product or bundle");
                      return;
                    }
                    createCustomOrderMutation.mutate({
                      ...createOrderForm,
                      user_id: parseInt(createOrderForm.user_id),
                      items: selectedProducts,
                    });
                  }}
                  disabled={createCustomOrderMutation.isPending}
                  className="px-6 py-2 bg-[#273E8E] text-white rounded-lg text-sm font-medium hover:bg-[#1e3270] disabled:opacity-50"
                >
                  {createCustomOrderMutation.isPending ? "Creating..." : "Create Order"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Detail Modal - Shows Custom Order Request Details */}
      {showUserDetailModal && selectedUser && (
        <div className="fixed inset-0 bg-black/40 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-5xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Custom Order Request Details</h2>
              <button
                onClick={() => {
                  setShowUserDetailModal(false);
                  setSelectedUser(null);
                  setSelectedUserId(null);
                  setUserCartData(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <img src={images.cross} className="w-6 h-6" alt="Close" />
              </button>
            </div>

            {userCartLoading ? (
              <LoadingSpinner message="Loading request details..." />
            ) : (
              <>
                {/* User Information */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">User Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Name:</span>
                      <span className="ml-2 font-medium text-gray-900">
                        {selectedUser.name || `${selectedUser.first_name} ${selectedUser.sur_name}`}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Email:</span>
                      <span className="ml-2 font-medium text-gray-900">{selectedUser.email}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Phone:</span>
                      <span className="ml-2 font-medium text-gray-900">{selectedUser.phone}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">User ID:</span>
                      <span className="ml-2 font-medium text-gray-900">{selectedUser.id}</span>
                    </div>
                  </div>
                </div>

                {/* Audit Request Information */}
                {selectedUser.audit_requests && selectedUser.audit_requests.length > 0 && (
                  <div className="bg-blue-50 rounded-lg p-4 mb-6">
                    <h3 className="font-semibold text-gray-900 mb-3">Audit Request Information</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                      <div>
                        <span className="text-gray-600">Total Requests:</span>
                        <span className="ml-2 font-medium text-gray-900">
                          {selectedUser.audit_request_count || 0}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Pending:</span>
                        <span className="ml-2 font-medium text-orange-600">
                          {selectedUser.pending_count || 0}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Approved:</span>
                        <span className="ml-2 font-medium text-green-600">
                          {selectedUser.approved_count || 0}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Last Request:</span>
                        <span className="ml-2 font-medium text-gray-900">
                          {selectedUser.last_audit_request_date
                            ? formatDate(selectedUser.last_audit_request_date)
                            : "N/A"}
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 space-y-2">
                      <h4 className="font-medium text-gray-700 text-sm">Audit Requests:</h4>
                      {selectedUser.audit_requests.map((request: any, idx: number) => (
                        <div
                          key={request.id}
                          className="bg-white rounded p-3 border border-gray-200 text-xs"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <span className="font-medium">
                                {request.audit_type === "commercial" ? "Commercial" : "Home/Office"}
                              </span>
                              <span
                                className={`ml-2 px-2 py-1 rounded text-xs ${
                                  request.status === "approved"
                                    ? "bg-green-100 text-green-800"
                                    : request.status === "pending"
                                    ? "bg-orange-100 text-orange-800"
                                    : request.status === "rejected"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-blue-100 text-blue-800"
                                }`}
                              >
                                {request.status}
                              </span>
                            </div>
                            {request.has_property_details ? (
                              <span className="text-green-600 font-medium">✓ Details Shared</span>
                            ) : (
                              <span className="text-yellow-600 font-medium">⚠️ Needs Details</span>
                            )}
                          </div>
                          {request.has_property_details && request.property_address && (
                            <div className="text-gray-600 mt-2 bg-green-50 p-2 rounded">
                              <div className="font-medium text-green-800 mb-1">Shared Property Details:</div>
                              <div>
                                <span className="font-medium">Address:</span> {request.property_address}
                              </div>
                              {request.property_state && (
                                <div>
                                  <span className="font-medium">State:</span> {request.property_state}
                                </div>
                              )}
                              {request.property_floors && (
                                <div>
                                  <span className="font-medium">Floors:</span> {request.property_floors}
                                </div>
                              )}
                              {request.property_rooms && (
                                <div>
                                  <span className="font-medium">Rooms:</span> {request.property_rooms}
                                </div>
                              )}
                              {request.is_gated_estate !== undefined && (
                                <div>
                                  <span className="font-medium">Gated Estate:</span>{" "}
                                  {request.is_gated_estate ? "Yes" : "No"}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Cart/Request Details */}
                {userCartResponse?.data ? (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Custom Order Request Details</h3>
                    
                    {/* Cart Items */}
                    {userCartResponse.data.cart_items?.length > 0 ? (
                      <>
                        <div className="border rounded-lg overflow-hidden">
                          <table className="w-full">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                                  Item
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                                  Type
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                                  Quantity
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                                  Unit Price
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                                  Subtotal
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                                  Action
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {userCartResponse.data.cart_items.map((item: any) => (
                                <tr key={item.id}>
                                  <td className="px-4 py-3 text-sm">
                                    {item.itemable?.title || `Item ${item.id}`}
                                  </td>
                                  <td className="px-4 py-3 text-sm">
                                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                                      {item.itemable_type?.includes("Product") ? "Product" : "Bundle"}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 text-sm">{item.quantity}</td>
                                  <td className="px-4 py-3 text-sm">
                                    {formatCurrency(item.unit_price)}
                                  </td>
                                  <td className="px-4 py-3 text-sm font-medium">
                                    {formatCurrency(item.subtotal)}
                                  </td>
                                  <td className="px-4 py-3">
                                    <button
                                      onClick={() => {
                                        if (
                                          confirm(
                                            "Are you sure you want to remove this item?"
                                          )
                                        ) {
                                          removeCartItemMutation.mutate({
                                            userId: selectedUserId!,
                                            itemId: item.id,
                                          });
                                        }
                                      }}
                                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                                    >
                                      Remove
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Cart Total */}
                        <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                          <span className="text-lg font-semibold">Total Amount:</span>
                          <span className="text-lg font-bold text-[#273E8E]">
                            {formatCurrency(userCartResponse.data.total_amount || 0)}
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="flex space-x-3 pt-4 border-t">
                          {selectedUser.audit_requests?.some((req: any) => req.has_property_details) && (
                            <button
                              onClick={() => {
                                setShowUserDetailModal(false);
                                setCreateOrderForm({
                                  user_id: selectedUser.id.toString(),
                                  order_type: "buy_now",
                                  items: [],
                                  send_email: true,
                                  email_message: "",
                                });
                                setSelectedProducts([]);
                                setShowCreateOrderModal(true);
                              }}
                              className="px-6 py-2 bg-[#273E8E] text-white rounded-lg text-sm font-medium hover:bg-[#1e3270]"
                            >
                              Add Items to Cart
                            </button>
                          )}
                          <button
                            onClick={() => {
                              if (
                                confirm(
                                  "Are you sure you want to clear the entire cart?"
                                )
                              ) {
                                clearUserCartMutation.mutate(selectedUserId!);
                              }
                            }}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600"
                          >
                            Clear Cart
                          </button>
                          <button
                            onClick={() => {
                              const orderType = prompt(
                                "Enter order type (buy_now or bnpl):",
                                "buy_now"
                              );
                              if (orderType && (orderType === "buy_now" || orderType === "bnpl")) {
                                resendCartEmailMutation.mutate({
                                  userId: selectedUserId!,
                                  payload: { order_type: orderType as "buy_now" | "bnpl" },
                                });
                              }
                            }}
                            className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600"
                          >
                            Resend Cart Link
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-8 text-gray-500 border border-gray-200 rounded-lg">
                        <p className="mb-4">This user's cart is currently empty.</p>
                        {selectedUser.audit_requests?.some((req: any) => req.has_property_details) ? (
                          <button
                            onClick={() => {
                              setShowUserDetailModal(false);
                              setCreateOrderForm({
                                user_id: selectedUser.id.toString(),
                                order_type: "buy_now",
                                items: [],
                                send_email: true,
                                email_message: "",
                              });
                              setSelectedProducts([]);
                              setShowCreateOrderModal(true);
                            }}
                            className="px-6 py-2 bg-[#273E8E] text-white rounded-lg text-sm font-medium hover:bg-[#1e3270]"
                          >
                            Add Items to Cart
                          </button>
                        ) : (
                          <p className="text-sm text-gray-600">
                            User needs to share property details before items can be added to cart.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 border border-gray-200 rounded-lg">
                    <p className="mb-4">No cart data available for this user.</p>
                    {selectedUser.audit_requests?.some((req: any) => req.has_property_details) ? (
                      <button
                        onClick={() => {
                          setShowUserDetailModal(false);
                          setCreateOrderForm({
                            user_id: selectedUser.id.toString(),
                            order_type: "buy_now",
                            items: [],
                            send_email: true,
                            email_message: "",
                          });
                          setSelectedProducts([]);
                          setShowCreateOrderModal(true);
                        }}
                        className="px-6 py-2 bg-[#273E8E] text-white rounded-lg text-sm font-medium hover:bg-[#1e3270]"
                      >
                        Add Items to Cart
                      </button>
                    ) : (
                      <p className="text-sm text-gray-600">
                        User needs to share property details before items can be added to cart.
                      </p>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* User Cart Modal (Legacy - keeping for backward compatibility) */}
      {showUserCartModal && selectedUserId && (
        <div className="fixed inset-0 bg-black/40 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">User Cart</h2>
              <button
                onClick={() => {
                  setShowUserCartModal(false);
                  setSelectedUserId(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <img src={images.cross} className="w-6 h-6" alt="Close" />
              </button>
            </div>

            {userCartLoading ? (
              <LoadingSpinner message="Loading cart..." />
            ) : userCartResponse?.data ? (
              <div className="space-y-4">
                {/* User Info */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold">
                    {userCartResponse.data.user?.name || "User"}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {userCartResponse.data.user?.email}
                  </p>
                </div>

                {/* Cart Items */}
                {userCartResponse.data.cart_items?.length > 0 ? (
                  <>
                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                              Item
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                              Quantity
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                              Unit Price
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                              Subtotal
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                              Action
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {userCartResponse.data.cart_items.map((item: any) => (
                            <tr key={item.id}>
                              <td className="px-4 py-3 text-sm">
                                {item.itemable?.title || `Item ${item.id}`}
                              </td>
                              <td className="px-4 py-3 text-sm">{item.quantity}</td>
                              <td className="px-4 py-3 text-sm">
                                {formatCurrency(item.unit_price)}
                              </td>
                              <td className="px-4 py-3 text-sm font-medium">
                                {formatCurrency(item.subtotal)}
                              </td>
                              <td className="px-4 py-3">
                                <button
                                  onClick={() => {
                                    if (
                                      confirm(
                                        "Are you sure you want to remove this item?"
                                      )
                                    ) {
                                      removeCartItemMutation.mutate({
                                        userId: selectedUserId,
                                        itemId: item.id,
                                      });
                                    }
                                  }}
                                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                                >
                                  Remove
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Cart Total */}
                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                      <span className="text-lg font-semibold">Total:</span>
                      <span className="text-lg font-bold text-[#273E8E]">
                        {formatCurrency(userCartResponse.data.total_amount || 0)}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-3">
                      <button
                        onClick={() => {
                          if (
                            confirm(
                              "Are you sure you want to clear the entire cart?"
                            )
                          ) {
                            clearUserCartMutation.mutate(selectedUserId);
                          }
                        }}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600"
                      >
                        Clear Cart
                      </button>
                      <button
                        onClick={() => {
                          const orderType = prompt(
                            "Enter order type (buy_now or bnpl):",
                            "buy_now"
                          );
                          if (orderType && (orderType === "buy_now" || orderType === "bnpl")) {
                            resendCartEmailMutation.mutate({
                              userId: selectedUserId,
                              payload: { order_type: orderType },
                            });
                          }
                        }}
                        className="px-4 py-2 bg-[#273E8E] text-white rounded-lg text-sm font-medium hover:bg-[#1e3270]"
                      >
                        Resend Cart Link
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Cart is empty
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Failed to load cart
              </div>
            )}
          </div>
        </div>
      )}
      </div>
    </>
  );
};

export default BNPLBuyNow;

