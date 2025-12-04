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
} from "../../utils/queries/bnpl";
import {
  updateBNPLApplicationStatus,
  updateBNPLGuarantorStatus,
  updateBuyNowOrderStatus,
} from "../../utils/mutations/bnpl";

const BNPLBuyNow: React.FC = () => {
  const [activeTab, setActiveTab] = useState("BNPL Applications");
  const [statusFilter, setStatusFilter] = useState("All");
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
  const [statusForm, setStatusForm] = useState({
    status: "",
    admin_notes: "",
    counter_offer_min_deposit: "",
    counter_offer_min_tenor: "",
  });

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

  const handleViewDetails = async (item: any) => {
    setSelectedItem(item);
    setDetailModalTab("Details");
    setOrderSummary(null);
    setOrderInvoice(null);
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
      const invoice = await getOrderInvoiceDetails(selectedItem.id, token);
      setOrderInvoice(invoice.data);
    } catch (error) {
      console.error("Failed to fetch invoice:", error);
      alert("Failed to load invoice details.");
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
      default:
        return false;
    }
  };

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === "approved" || statusLower === "delivered") {
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
  const items = currentData?.data || [];
  const total = currentData?.total || 0;
  const totalPages = Math.ceil(total / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, searchQuery, activeTab]);

  return (
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
              {["BNPL Applications", "BNPL Guarantors", "Buy Now Orders", "BNPL Orders"].map(
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
              </select>
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

        {/* Table */}
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
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedItem && (
        <div className="fixed inset-0 bg-black/40 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-5xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {activeTab === "BNPL Applications" ? "BNPL Application Details" :
                 activeTab === "BNPL Guarantors" ? "Guarantor Details" :
                 "Order Details"}
              </h2>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedItem(null);
                  setOrderSummary(null);
                  setOrderInvoice(null);
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
                        if (tab === "Invoice" && !orderInvoice) {
                          handleLoadInvoice();
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
              <div className="space-y-4">
                {Object.entries(selectedItem).map(([key, value]: [string, any]) => {
                  if (typeof value === "object" && value !== null && !Array.isArray(value)) {
                    return (
                      <div key={key} className="border-b pb-2">
                        <h3 className="font-semibold text-gray-700 capitalize mb-2">
                          {key.replace(/_/g, " ")}
                        </h3>
                        <div className="pl-4 space-y-1">
                          {Object.entries(value).map(([subKey, subValue]: [string, any]) => (
                            <div key={subKey} className="text-sm text-gray-600">
                              <span className="font-medium capitalize">
                                {subKey.replace(/_/g, " ")}:
                              </span>{" "}
                              {typeof subValue === "object" && subValue !== null
                                ? JSON.stringify(subValue)
                                : String(subValue)}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }
                  if (Array.isArray(value)) {
                    return (
                      <div key={key} className="border-b pb-2">
                        <h3 className="font-semibold text-gray-700 capitalize mb-2">
                          {key.replace(/_/g, " ")} ({value.length})
                        </h3>
                        <div className="pl-4 space-y-2">
                          {value.map((item: any, idx: number) => (
                            <div key={idx} className="text-sm text-gray-600 border-l-2 pl-2">
                              {typeof item === "object" ? (
                                <div className="space-y-1">
                                  {Object.entries(item).map(([k, v]: [string, any]) => (
                                    <div key={k}>
                                      <span className="font-medium capitalize">
                                        {k.replace(/_/g, " ")}:
                                      </span>{" "}
                                      {typeof v === "object" ? JSON.stringify(v) : String(v)}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                String(item)
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }
                  return (
                    <div key={key} className="border-b pb-2">
                      <span className="font-semibold text-gray-700 capitalize">
                        {key.replace(/_/g, " ")}:
                      </span>{" "}
                      <span className="text-gray-600">
                        {key.includes("amount") || key.includes("price") || key.includes("fee")
                          ? formatCurrency(value)
                          : String(value)}
                      </span>
                    </div>
                  );
                })}
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
                  updateBuyNowOrderStatusMutation.isPending
                }
                className={`px-6 py-2 rounded-full font-medium transition-colors flex items-center ${
                  statusForm.status &&
                  !updateApplicationStatusMutation.isPending &&
                  !updateGuarantorStatusMutation.isPending &&
                  !updateBuyNowOrderStatusMutation.isPending
                    ? "bg-[#273E8E] text-white hover:bg-[#1f2f7a]"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                {(updateApplicationStatusMutation.isPending ||
                  updateGuarantorStatusMutation.isPending ||
                  updateBuyNowOrderStatusMutation.isPending) && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                )}
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BNPLBuyNow;

