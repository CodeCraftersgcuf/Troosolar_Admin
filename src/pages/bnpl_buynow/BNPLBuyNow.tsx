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
  getBNPLSettings,
  getSiteBanner,
} from "../../utils/queries/bnpl";
import {
  updateBNPLApplication,
  updateBNPLLoanOffer,
  updateBNPLApplicationStatus,
  updateBNPLGuarantorStatus,
  updateBuyNowOrderStatus,
  createCustomOrder,
  removeCartItem,
  clearUserCart,
  resendCartEmail,
  updateAuditRequestStatus,
  uploadBNPLGuarantorForm,
  setBNPLApplicationGuarantor,
  acceptBNPLInstallationDate,
  rejectBNPLInstallationDate,
  updateBNPLSettings,
  uploadSiteBanner,
  deleteSiteBanner,
} from "../../utils/mutations/bnpl";
import { sendToPartnerDetail } from "../../utils/mutations/loans";
import { getAllFinance } from "../../utils/queries/finance";
import { API_DOMAIN } from "../../../apiConfig";

// Base URL for document links (backend stores paths like "loan_applications/xxx.pdf")
const DOCUMENT_BASE_URL = API_DOMAIN.replace(/\/api\/?$/, "") || "https://troosolar.hmstech.org";

const BNPLBuyNow: React.FC = () => {
  const [activeTab, setActiveTab] = useState("BNPL Applications");
  const [statusFilter, setStatusFilter] = useState("All");
  const [auditTypeFilter, setAuditTypeFilter] = useState("All Types"); // For Audit Requests
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
    property_state: "",
    property_address: "",
    contact_name: "",
    contact_phone: "",
  });
  // BNPL Assign beneficiary & adjust offer (like loan flow)
  const [beneficiaryForm, setBeneficiaryForm] = useState({
    beneficiary_email: "",
    beneficiary_name: "",
    beneficiary_phone: "",
    beneficiary_relationship: "",
  });
  const [offerForm, setOfferForm] = useState({
    loan_amount: "",
    down_payment: "",
    repayment_duration: "",
    interest_rate: "",
    management_fee_percentage: "",
    legal_fee_percentage: "",
    insurance_fee_percentage: "",
  });
  const [savingBeneficiary, setSavingBeneficiary] = useState(false);
  const [savingOffer, setSavingOffer] = useState(false);
  const [guarantorForm, setGuarantorForm] = useState({
    full_name: "",
    phone: "",
    email: "",
    relationship: "",
  });
  const [savingGuarantor, setSavingGuarantor] = useState(false);
  const [savingInstallationAccept, setSavingInstallationAccept] = useState(false);
  const [savingInstallationReject, setSavingInstallationReject] = useState(false);
  // Send to Partner (like loan flow - before approving)
  const [showSendToPartnerModal, setShowSendToPartnerModal] = useState(false);
  const [selectedPartnerIdForSend, setSelectedPartnerIdForSend] = useState<number | "">("");
  const [sendingToPartner, setSendingToPartner] = useState(false);
  
  // Custom Orders state
  const [showCreateOrderModal, setShowCreateOrderModal] = useState(false);
  const [showUserCartModal, setShowUserCartModal] = useState(false);
  const [showUserDetailModal, setShowUserDetailModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [createOrderForm, setCreateOrderForm] = useState({
    user_id: "",
    order_type: "buy_now" as "buy_now" | "bnpl",
    items: [] as Array<{ type: "product" | "bundle"; id: number; quantity: number }>,
    send_email: true,
    email_message: "",
  });
  const [selectedProducts, setSelectedProducts] = useState<any[]>([]);
  const [productTypeFilter, setProductTypeFilter] = useState<"all" | "products" | "bundles">("all");
  const [customProducts, setCustomProducts] = useState<Array<{
    name: string;
    description: string;
    price: number;
    quantity: number;
  }>>([]);
  const [showAddCustomProduct, setShowAddCustomProduct] = useState(false);
  const [newCustomProduct, setNewCustomProduct] = useState({
    name: "",
    description: "",
    price: "",
    quantity: "1",
  });

  // Guarantor Form (admin upload)
  const [guarantorFormFile, setGuarantorFormFile] = useState<File | null>(null);
  const [uploadingGuarantorForm, setUploadingGuarantorForm] = useState(false);

  // Home Banner (dashboard promo)
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [removingBanner, setRemovingBanner] = useState(false);

  // Loan Settings (global BNPL config)
  const [loanSettingsForm, setLoanSettingsForm] = useState({
    interest_rate_percentage: "",
    min_down_percentage: "",
    down_payment_options: [] as number[],
    management_fee_percentage: "",
    legal_fee_percentage: "",
    insurance_fee_percentage: "",
    minimum_loan_amount: "",
    loan_durations: [] as number[],
    newDownPaymentOption: "",
    newDuration: "",
  });
  const [savingLoanSettings, setSavingLoanSettings] = useState(false);

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
    if (activeTab === "Audit Requests" && auditTypeFilter !== "All Types") {
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

  // Financing partners (for Send to Partner in BNPL)
  const { data: financePartnersData, isLoading: financePartnersLoading } = useQuery({
    queryKey: ["all-finance-partners"],
    queryFn: () => getAllFinance(token),
    enabled: (showSendToPartnerModal && !!token) || !!token,
  });
  const financePartnersList = Array.isArray(financePartnersData?.data) ? financePartnersData.data : [];

  // BNPL global settings (for Loan Settings tab and for detail modal duration dropdown)
  const { data: bnplSettingsData, isLoading: bnplSettingsLoading } = useQuery({
    queryKey: ["bnpl-settings"],
    queryFn: () => getBNPLSettings(token),
    enabled: (activeTab === "Loan Settings" || !!showDetailModal) && !!token,
  });
  const bnplSettings = bnplSettingsData?.data?.data ?? bnplSettingsData?.data ?? null;
  const allowedDurations: number[] = Array.isArray(bnplSettings?.loan_durations) ? bnplSettings.loan_durations : [3, 6, 9, 12];

  useEffect(() => {
    if (activeTab === "Loan Settings" && bnplSettings) {
      setLoanSettingsForm((f) => ({
        ...f,
        interest_rate_percentage: String(bnplSettings.interest_rate_percentage ?? ""),
        min_down_percentage: String(bnplSettings.min_down_percentage ?? ""),
        down_payment_options: Array.isArray(bnplSettings.down_payment_options) && bnplSettings.down_payment_options.length
          ? [...bnplSettings.down_payment_options].map((v: number | string) => Number(v)).filter((v: number) => !Number.isNaN(v))
          : (bnplSettings.min_down_percentage != null ? [Number(bnplSettings.min_down_percentage)] : []),
        management_fee_percentage: String(bnplSettings.management_fee_percentage ?? ""),
        legal_fee_percentage: String(bnplSettings.legal_fee_percentage ?? ""),
        insurance_fee_percentage: String(bnplSettings.insurance_fee_percentage ?? ""),
        minimum_loan_amount: String(bnplSettings.minimum_loan_amount ?? ""),
        loan_durations: Array.isArray(bnplSettings.loan_durations) ? [...bnplSettings.loan_durations] : [],
      }));
    }
  }, [activeTab, bnplSettings]);

  // Site banner (home promo) - for Banner tab
  const { data: siteBannerData, isLoading: siteBannerLoading, refetch: refetchSiteBanner } = useQuery({
    queryKey: ["site-banner"],
    queryFn: () => getSiteBanner(token),
    enabled: activeTab === "Banner" && !!token,
  });
  const bannerUrl = siteBannerData?.data?.url ?? siteBannerData?.data?.path ?? null;

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
        property_state: "",
        property_address: "",
        contact_name: "",
        contact_phone: "",
      });
      alert("Status updated successfully.");
    },
    onError: (error: any) => {
      const msg = error?.message || error?.response?.data?.message || "Failed to update status.";
      const errors = error?.response?.data?.errors || error?.data?.errors;
      const detail = errors && typeof errors === "object" ? Object.values(errors).flat().join(" ") : "";
      alert(detail ? `${msg}\n${detail}` : msg);
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
        property_state: "",
        property_address: "",
        contact_name: "",
        contact_phone: "",
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
        property_state: "",
        property_address: "",
        contact_name: "",
        contact_phone: "",
      });
    },
  });

  // Custom Orders Mutations
  const createCustomOrderMutation = useMutation({
    mutationFn: async (payload: any) => {
      return await createCustomOrder(payload, token);
    },
    onSuccess: () => {
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
      setCustomProducts([]);
      setShowAddCustomProduct(false);
      setNewCustomProduct({
        name: "",
        description: "",
        price: "",
        quantity: "1",
      });
      
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
    onSuccess: () => {
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
    onSuccess: () => {
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
    mutationFn: async (payload: { id: number; status: string; admin_notes?: string; property_state?: string; property_address?: string; contact_name?: string; contact_phone?: string }) => {
      return await updateAuditRequestStatus(payload.id, {
        status: payload.status as "approved" | "rejected" | "completed",
        admin_notes: payload.admin_notes,
        property_state: payload.property_state,
        property_address: payload.property_address,
        contact_name: payload.contact_name,
        contact_phone: payload.contact_phone,
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
        property_state: "",
        property_address: "",
        contact_name: "",
        contact_phone: "",
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
      if (activeTab === "BNPL Applications" && detailData.data) {
        const d = detailData.data;
        setBeneficiaryForm({
          beneficiary_email: d.beneficiary_email || "",
          beneficiary_name: d.beneficiary_name || "",
          beneficiary_phone: d.beneficiary_phone || "",
          beneficiary_relationship: d.beneficiary_relationship || "",
        });
        const mono = d.mono;
        setOfferForm({
          loan_amount: mono?.loan_amount ?? d.loan_amount ?? "",
          down_payment: mono?.down_payment ?? "",
          repayment_duration: mono?.repayment_duration ?? d.repayment_duration ?? "",
          interest_rate: mono?.interest_rate ?? "",
          management_fee_percentage: mono?.management_fee_percentage ?? "",
          legal_fee_percentage: mono?.legal_fee_percentage ?? "",
          insurance_fee_percentage: mono?.insurance_fee_percentage ?? "",
        });
        setGuarantorForm({
          full_name: d.guarantor?.full_name || "",
          phone: d.guarantor?.phone || "",
          email: d.guarantor?.email || "",
          relationship: d.guarantor?.relationship || "",
        });
      }
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
    const loanAmount = Number(item?.loan_amount ?? item?.mono?.loan_amount ?? 0);
    const existingDeposit = Number(item?.counter_offer_min_deposit ?? 0);
    const existingPercent =
      loanAmount > 0 && existingDeposit > 0
        ? String(Math.round((existingDeposit / loanAmount) * 100))
        : "";
    setStatusForm({
      status: item.status || item.order_status || "",
      admin_notes: "",
      counter_offer_min_deposit: existingPercent,
      counter_offer_min_tenor: item?.counter_offer_min_tenor ?? "",
      property_state: item?.property_state || "",
      property_address: item?.property_address || "",
      contact_name: item?.contact_name || "",
      contact_phone: item?.contact_phone || item?.user?.phone || "",
    });
    setShowStatusModal(true);
  };

  const handleStatusSubmit = () => {
    if (!statusForm.status) {
      alert("Please select a status");
      return;
    }

    // BNPL: When approving, show confirmation that user can then pay down payment and order will be fulfilled
    if (activeTab === "BNPL Applications" && statusForm.status === "approved") {
      const confirmed = window.confirm(
        "You are about to complete this order. Once you approve, the user will be able to pay their down payment and the order will be fulfilled. Continue?"
      );
      if (!confirmed) return;
    }

    const payload: any = {
      status: statusForm.status,
    };

    if (statusForm.admin_notes) {
      payload.admin_notes = statusForm.admin_notes;
    }

    if (statusForm.status === "counter_offer") {
      const percent = statusForm.counter_offer_min_deposit ? Number(statusForm.counter_offer_min_deposit) : 0;
      const tenor = statusForm.counter_offer_min_tenor ? Number(statusForm.counter_offer_min_tenor) : 0;
      if (!percent || percent <= 0 || percent > 100) {
        alert("Please enter a valid Counter Offer Min Deposit percentage (e.g. 30, 40, 50).");
        return;
      }
      if (!tenor || !allowedDurations.includes(tenor)) {
        alert(`Please select a valid Counter Offer Min Tenor (${allowedDurations.join(", ")} months).`);
        return;
      }
      const loanAmount = Number(selectedItem?.loan_amount ?? selectedItem?.mono?.loan_amount ?? 0);
      if (loanAmount <= 0) {
        alert("Cannot set counter offer: loan amount is missing for this application. Try opening the application details first, then use Update Status again.");
        return;
      }
      payload.counter_offer_min_deposit = Math.round((loanAmount * percent) / 100);
      payload.counter_offer_min_tenor = tenor;
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
        property_state: statusForm.property_state || undefined,
        property_address: statusForm.property_address || undefined,
        contact_name: statusForm.contact_name || undefined,
        contact_phone: statusForm.contact_phone || undefined,
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
        return null;
      case "Guarantor Form":
        return null;
      case "Loan Settings":
        return null;
      case "Banner":
        return null;
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
      case "Guarantor Form":
        return false;
      case "Loan Settings":
        return bnplSettingsLoading;
      case "Banner":
        return siteBannerLoading;
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
  // Support both paginated response (data.data, data.total) and direct array
  const items =
    activeTab === "Custom Orders"
      ? []
      : Array.isArray(currentData)
        ? currentData
        : (currentData?.data ?? []);
  const total =
    activeTab !== "Custom Orders"
      ? (typeof (currentData as any)?.pagination?.total === "number"
          ? (currentData as any).pagination.total
          : typeof (currentData as any)?.total === "number"
            ? (currentData as any).total
            : items.length)
      : (auditUsersData?.data?.pagination?.total || 0);
  const totalPages = Math.max(1, Math.ceil(total / itemsPerPage));

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
              {["BNPL Applications", "Guarantor Form", "Loan Settings", "Banner", "Buy Now Orders", "BNPL Orders", "Audit Requests", "Custom Orders"].map(
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

        {/* Filters and Search - hidden on Guarantor Form, Loan Settings, and Banner tabs */}
        {activeTab !== "Guarantor Form" && activeTab !== "Loan Settings" && activeTab !== "Banner" && (
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
        )}

        {/* Loan Settings Tab Content - Global BNPL config */}
        {activeTab === "Loan Settings" ? (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 max-w-3xl">
            <h2 className="text-xl font-bold text-gray-900 mb-2">BNPL Loan Settings</h2>
            <p className="text-sm text-gray-600 mb-6">
              Configure default interest rate, minimum down payment %, fees, minimum loan amount, and allowed loan durations. These apply to new applications unless overridden per application in View Detail.
            </p>
            {bnplSettingsLoading ? (
              <LoadingSpinner message="Loading settings..." />
            ) : (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!token) return;
                  setSavingLoanSettings(true);
                  try {
                    await updateBNPLSettings({
                      interest_rate_percentage: loanSettingsForm.interest_rate_percentage ? Number(loanSettingsForm.interest_rate_percentage) : undefined,
                      min_down_percentage: loanSettingsForm.down_payment_options.length
                        ? Math.min(...loanSettingsForm.down_payment_options)
                        : (loanSettingsForm.min_down_percentage ? Number(loanSettingsForm.min_down_percentage) : undefined),
                      down_payment_options: loanSettingsForm.down_payment_options.length ? loanSettingsForm.down_payment_options : undefined,
                      management_fee_percentage: loanSettingsForm.management_fee_percentage ? Number(loanSettingsForm.management_fee_percentage) : undefined,
                      legal_fee_percentage: loanSettingsForm.legal_fee_percentage ? Number(loanSettingsForm.legal_fee_percentage) : undefined,
                      insurance_fee_percentage: loanSettingsForm.insurance_fee_percentage ? Number(loanSettingsForm.insurance_fee_percentage) : undefined,
                      minimum_loan_amount: loanSettingsForm.minimum_loan_amount ? Number(loanSettingsForm.minimum_loan_amount) : undefined,
                      loan_durations: loanSettingsForm.loan_durations.length ? loanSettingsForm.loan_durations : undefined,
                    }, token);
                    queryClient.invalidateQueries({ queryKey: ["bnpl-settings"] });
                    alert("Loan settings saved successfully.");
                  } catch (err: any) {
                    alert(err?.response?.data?.message || err?.message || "Failed to save settings.");
                  } finally {
                    setSavingLoanSettings(false);
                  }
                }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Interest rate (%)</label>
                    <input type="number" step="0.01" min="0" max="100" className="w-full border border-gray-300 rounded-lg px-3 py-2" value={loanSettingsForm.interest_rate_percentage} onChange={(e) => setLoanSettingsForm((f) => ({ ...f, interest_rate_percentage: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Minimum down options (%)</label>
                    <p className="text-xs text-gray-500 mb-2">Add allowed down-payment percentages. The minimum is picked automatically from your list.</p>
                    <div className="flex flex-wrap gap-2 items-center">
                      {loanSettingsForm.down_payment_options.map((p) => (
                        <span key={p} className="inline-flex items-center px-3 py-1 rounded-full bg-[#273E8E] text-white text-sm">
                          {p}%
                          <button type="button" className="ml-2 hover:opacity-80" onClick={() => setLoanSettingsForm((f) => {
                            const next = f.down_payment_options.filter((v) => v !== p);
                            return { ...f, down_payment_options: next, min_down_percentage: next.length ? String(Math.min(...next)) : "" };
                          })}>×</button>
                        </span>
                      ))}
                      <div className="flex gap-2">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          placeholder="e.g. 30"
                          className="w-24 border border-gray-300 rounded-lg px-2 py-1 text-sm"
                          value={loanSettingsForm.newDownPaymentOption}
                          onChange={(e) => setLoanSettingsForm((f) => ({ ...f, newDownPaymentOption: e.target.value }))}
                        />
                        <button
                          type="button"
                          className="px-3 py-1 bg-gray-200 rounded-lg text-sm hover:bg-gray-300"
                          onClick={() => {
                            const n = Number(loanSettingsForm.newDownPaymentOption);
                            if (Number.isNaN(n) || n < 0 || n > 100) return;
                            setLoanSettingsForm((f) => {
                              if (f.down_payment_options.includes(n)) return { ...f, newDownPaymentOption: "" };
                              const next = [...f.down_payment_options, n].sort((a, b) => a - b);
                              return {
                                ...f,
                                down_payment_options: next,
                                min_down_percentage: String(Math.min(...next)),
                                newDownPaymentOption: "",
                              };
                            });
                          }}
                        >
                          Add
                        </button>
                      </div>
                    </div>
                    {loanSettingsForm.down_payment_options.length > 0 && (
                      <p className="text-xs text-gray-500 mt-2">Minimum down (auto): {Math.min(...loanSettingsForm.down_payment_options)}%</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Management fee (%)</label>
                    <input type="number" step="0.01" min="0" max="100" className="w-full border border-gray-300 rounded-lg px-3 py-2" value={loanSettingsForm.management_fee_percentage} onChange={(e) => setLoanSettingsForm((f) => ({ ...f, management_fee_percentage: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Legal fee (%)</label>
                    <input type="number" step="0.01" min="0" max="100" className="w-full border border-gray-300 rounded-lg px-3 py-2" value={loanSettingsForm.legal_fee_percentage} onChange={(e) => setLoanSettingsForm((f) => ({ ...f, legal_fee_percentage: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Insurance fee (%)</label>
                    <input type="number" step="0.01" min="0" max="100" className="w-full border border-gray-300 rounded-lg px-3 py-2" value={loanSettingsForm.insurance_fee_percentage} onChange={(e) => setLoanSettingsForm((f) => ({ ...f, insurance_fee_percentage: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Minimum loan amount (₦)</label>
                    <input type="number" min="0" step="1000" className="w-full border border-gray-300 rounded-lg px-3 py-2" value={loanSettingsForm.minimum_loan_amount} onChange={(e) => setLoanSettingsForm((f) => ({ ...f, minimum_loan_amount: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Loan durations (months)</label>
                  <p className="text-xs text-gray-500 mb-2">Add allowed tenors e.g. 3, 6, 9, 12. Admin can add more (e.g. 18, 24).</p>
                  <div className="flex flex-wrap gap-2 items-center">
                    {loanSettingsForm.loan_durations.map((m) => (
                      <span key={m} className="inline-flex items-center px-3 py-1 rounded-full bg-[#273E8E] text-white text-sm">
                        {m} months
                        <button type="button" className="ml-2 hover:opacity-80" onClick={() => setLoanSettingsForm((f) => ({ ...f, loan_durations: f.loan_durations.filter((d) => d !== m) }))}>×</button>
                      </span>
                    ))}
                    <div className="flex gap-2">
                      <input type="number" min="1" max="120" placeholder="e.g. 18" className="w-20 border border-gray-300 rounded-lg px-2 py-1 text-sm" value={loanSettingsForm.newDuration} onChange={(e) => setLoanSettingsForm((f) => ({ ...f, newDuration: e.target.value }))} />
                      <button type="button" className="px-3 py-1 bg-gray-200 rounded-lg text-sm hover:bg-gray-300" onClick={() => { const n = parseInt(loanSettingsForm.newDuration, 10); if (!isNaN(n) && n >= 1 && n <= 120 && !loanSettingsForm.loan_durations.includes(n)) { setLoanSettingsForm((f) => ({ ...f, loan_durations: [...f.loan_durations, n].sort((a, b) => a - b), newDuration: "" })); } }}>Add</button>
                    </div>
                  </div>
                </div>
                <button type="submit" disabled={savingLoanSettings} className="bg-[#273E8E] hover:bg-[#1e3270] disabled:opacity-50 text-white px-6 py-3 rounded-lg font-medium">
                  {savingLoanSettings ? "Saving..." : "Save Loan Settings"}
                </button>
              </form>
            )}
          </div>
        ) : activeTab === "Guarantor Form" ? (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 max-w-2xl">
            <h2 className="text-xl font-bold text-gray-900 mb-2">BNPL Guarantor Form</h2>
            <p className="text-sm text-gray-600 mb-6">
              Upload the guarantor form PDF that approved loan users will download. Use your own template with your terms, conditions, and fields. This file replaces the default form—users see only the option to download this form in their dashboard.
            </p>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!guarantorFormFile || !token) return;
                setUploadingGuarantorForm(true);
                try {
                  const res = await uploadBNPLGuarantorForm(guarantorFormFile, token);
                  if (res?.status === "success") {
                    alert(res?.message || "Guarantor form updated successfully.");
                    setGuarantorFormFile(null);
                  } else {
                    alert(res?.message || "Upload failed.");
                  }
                } catch (err: any) {
                  const msg = err?.response?.data?.message || err?.message || "Failed to upload guarantor form.";
                  const errors = err?.response?.data?.errors;
                  alert(errors ? Object.values(errors).flat().join("\n") : msg);
                } finally {
                  setUploadingGuarantorForm(false);
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select PDF file (max 10MB)</label>
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={(e) => setGuarantorFormFile(e.target.files?.[0] || null)}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[#273E8E] file:text-white hover:file:bg-[#1e3270]"
                />
                {guarantorFormFile && (
                  <p className="mt-2 text-sm text-gray-600">Selected: {guarantorFormFile.name}</p>
                )}
              </div>
              <button
                type="submit"
                disabled={!guarantorFormFile || uploadingGuarantorForm}
                className="bg-[#273E8E] hover:bg-[#1e3270] disabled:opacity-50 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                {uploadingGuarantorForm ? "Uploading..." : "Upload Guarantor Form"}
              </button>
            </form>
          </div>
        ) : activeTab === "Banner" ? (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 max-w-2xl">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Home Promotion Banner</h2>
            <p className="text-sm text-gray-600 mb-6">
              This banner is shown on the user dashboard home. Upload an image to set or replace it; remove it to hide the banner.
            </p>
            {siteBannerLoading ? (
              <LoadingSpinner message="Loading banner..." />
            ) : (
              <>
                {bannerUrl && (
                  <div className="mb-6">
                    <p className="text-sm font-medium text-gray-700 mb-2">Current banner</p>
                    <img
                      src={bannerUrl}
                      alt="Current promotion banner"
                      className="max-w-full h-auto max-h-[243px] rounded-lg object-cover border border-gray-200"
                    />
                  </div>
                )}
                {!bannerUrl && (
                  <p className="text-sm text-gray-500 mb-6">No banner set. Upload an image below to show a promotion on the dashboard.</p>
                )}
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!bannerFile || !token) return;
                    setUploadingBanner(true);
                    try {
                      const res = await uploadSiteBanner(bannerFile, token);
                      if (res?.status === "success") {
                        alert(res?.message || "Banner updated successfully.");
                        setBannerFile(null);
                        refetchSiteBanner();
                      } else {
                        alert(res?.message || "Upload failed.");
                      }
                    } catch (err: any) {
                      const msg = err?.response?.data?.message || err?.message || "Failed to upload banner.";
                      const errors = err?.response?.data?.errors;
                      alert(errors ? Object.values(errors).flat().join("\n") : msg);
                    } finally {
                      setUploadingBanner(false);
                    }
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select image (JPEG, PNG, GIF, WebP – max 5MB)</label>
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                      onChange={(e) => setBannerFile(e.target.files?.[0] || null)}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[#273E8E] file:text-white hover:file:bg-[#1e3270]"
                    />
                    {bannerFile && (
                      <p className="mt-2 text-sm text-gray-600">Selected: {bannerFile.name}</p>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={!bannerFile || uploadingBanner}
                      className="bg-[#273E8E] hover:bg-[#1e3270] disabled:opacity-50 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                      {uploadingBanner ? "Uploading..." : "Upload / Replace Banner"}
                    </button>
                    {bannerUrl && (
                      <button
                        type="button"
                        disabled={removingBanner}
                        onClick={async () => {
                          if (!token || !confirm("Remove the home banner? It will no longer show on the dashboard.")) return;
                          setRemovingBanner(true);
                          try {
                            const res = await deleteSiteBanner(token);
                            if (res?.status === "success") {
                              alert(res?.message || "Banner removed.");
                              refetchSiteBanner();
                            } else {
                              alert(res?.message || "Failed to remove banner.");
                            }
                          } catch (err: any) {
                            alert(err?.response?.data?.message || err?.message || "Failed to remove banner.");
                          } finally {
                            setRemovingBanner(false);
                          }
                        }}
                        className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                      >
                        {removingBanner ? "Removing..." : "Remove Banner"}
                      </button>
                    )}
                  </div>
                </form>
              </>
            )}
          </div>
        ) : activeTab === "Custom Orders" ? (
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
                                refetchUserCart();
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
                                    refetchUserCart();
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
                                {item.created_at ? formatDate(item.created_at) : "—"}
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
                                  ? (item.user.name || `${(item.user as any).first_name ?? ""} ${(item.user as any).sur_name ?? ""}`.trim() || "N/A")
                                  : "N/A"}
                                <br />
                                <span className="text-xs text-gray-500">
                                  {item.user?.email ?? ""}
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
                              <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                                {item.property_address ? (
                                  <span title={item.property_address}>{item.property_address}</span>
                                ) : (
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

                    {/* Assign / Update Beneficiary (like loan flow) */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-[#273E8E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Assign / Update Beneficiary
                      </h3>
                      <p className="text-sm text-gray-500 mb-4">Assign email and contact for this application (e.g. for sending offer).</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Beneficiary Email</label>
                          <input
                            type="email"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                            placeholder="email@example.com"
                            value={beneficiaryForm.beneficiary_email}
                            onChange={(e) => setBeneficiaryForm((f) => ({ ...f, beneficiary_email: e.target.value }))}
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Beneficiary Name</label>
                          <input
                            type="text"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                            placeholder="Full name"
                            value={beneficiaryForm.beneficiary_name}
                            onChange={(e) => setBeneficiaryForm((f) => ({ ...f, beneficiary_name: e.target.value }))}
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Beneficiary Phone</label>
                          <input
                            type="text"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                            placeholder="Phone"
                            value={beneficiaryForm.beneficiary_phone}
                            onChange={(e) => setBeneficiaryForm((f) => ({ ...f, beneficiary_phone: e.target.value }))}
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        disabled={savingBeneficiary}
                        onClick={async () => {
                          if (!selectedItem?.id) return;
                          setSavingBeneficiary(true);
                          try {
                            await updateBNPLApplication(selectedItem.id, {
                              beneficiary_email: beneficiaryForm.beneficiary_email || undefined,
                              beneficiary_name: beneficiaryForm.beneficiary_name || undefined,
                              beneficiary_phone: beneficiaryForm.beneficiary_phone || undefined,
                            }, token);
                            queryClient.invalidateQueries({ queryKey: ["bnpl-applications"] });
                            const fresh = await getBNPLApplication(selectedItem.id, token);
                            setSelectedItem(fresh.data);
                            alert("Beneficiary updated successfully.");
                          } catch (err: any) {
                            alert(err?.message || "Failed to update beneficiary");
                          } finally {
                            setSavingBeneficiary(false);
                          }
                        }}
                        className="bg-[#273E8E] hover:bg-[#1e3270] text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                      >
                        {savingBeneficiary ? "Saving..." : "Save Beneficiary"}
                      </button>
                    </div>

                    {/* Adjust Loan Offer (change amount, down payment, tenor) – all amounts in Naira (₦) */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-[#273E8E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Adjust Loan Offer (₦)
                      </h3>
                      <p className="text-sm text-gray-500 mb-4">Change loan amount, initial deposit, or repayment duration before approving or sending counter offer. All amounts are in Nigerian Naira (₦).</p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Loan Amount (₦)</label>
                          <input
                            type="number"
                            min="0"
                            step="1000"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                            placeholder="e.g. 5000000"
                            value={offerForm.loan_amount}
                            onChange={(e) => setOfferForm((f) => ({ ...f, loan_amount: e.target.value }))}
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Down Payment (₦)</label>
                          <input
                            type="number"
                            min="0"
                            step="1000"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                            placeholder="e.g. 1500000"
                            value={offerForm.down_payment}
                            onChange={(e) => setOfferForm((f) => ({ ...f, down_payment: e.target.value }))}
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Repayment Duration (months)</label>
                          <select
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                            value={offerForm.repayment_duration}
                            onChange={(e) => setOfferForm((f) => ({ ...f, repayment_duration: e.target.value }))}
                          >
                            <option value="">Select</option>
                            {allowedDurations.map((m) => (
                              <option key={m} value={m}>{m} months</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Interest rate (%)</label>
                          <input type="number" step="0.01" min="0" max="100" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Default from settings" value={offerForm.interest_rate} onChange={(e) => setOfferForm((f) => ({ ...f, interest_rate: e.target.value }))} />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Management fee (%)</label>
                          <input type="number" step="0.01" min="0" max="100" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Default" value={offerForm.management_fee_percentage} onChange={(e) => setOfferForm((f) => ({ ...f, management_fee_percentage: e.target.value }))} />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Legal fee (%)</label>
                          <input type="number" step="0.01" min="0" max="100" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Default" value={offerForm.legal_fee_percentage} onChange={(e) => setOfferForm((f) => ({ ...f, legal_fee_percentage: e.target.value }))} />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Insurance fee (%)</label>
                          <input type="number" step="0.01" min="0" max="100" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Default" value={offerForm.insurance_fee_percentage} onChange={(e) => setOfferForm((f) => ({ ...f, insurance_fee_percentage: e.target.value }))} />
                        </div>
                      </div>
                      <button
                        type="button"
                        disabled={savingOffer}
                        onClick={async () => {
                          if (!selectedItem?.id) return;
                          setSavingOffer(true);
                          try {
                            await updateBNPLLoanOffer(selectedItem.id, {
                              loan_amount: offerForm.loan_amount ? Number(offerForm.loan_amount) : undefined,
                              down_payment: offerForm.down_payment ? Number(offerForm.down_payment) : undefined,
                              repayment_duration: offerForm.repayment_duration ? Number(offerForm.repayment_duration) : undefined,
                              interest_rate: offerForm.interest_rate ? Number(offerForm.interest_rate) : undefined,
                              management_fee_percentage: offerForm.management_fee_percentage ? Number(offerForm.management_fee_percentage) : undefined,
                              legal_fee_percentage: offerForm.legal_fee_percentage ? Number(offerForm.legal_fee_percentage) : undefined,
                              insurance_fee_percentage: offerForm.insurance_fee_percentage ? Number(offerForm.insurance_fee_percentage) : undefined,
                            }, token);
                            queryClient.invalidateQueries({ queryKey: ["bnpl-applications"] });
                            const fresh = await getBNPLApplication(selectedItem.id, token);
                            const mono = fresh.data?.mono;
                            setSelectedItem(fresh.data);
                            setOfferForm({
                              loan_amount: mono?.loan_amount ?? fresh.data?.loan_amount ?? "",
                              down_payment: mono?.down_payment ?? "",
                              repayment_duration: mono?.repayment_duration ?? fresh.data?.repayment_duration ?? "",
                              interest_rate: mono?.interest_rate ?? "",
                              management_fee_percentage: mono?.management_fee_percentage ?? "",
                              legal_fee_percentage: mono?.legal_fee_percentage ?? "",
                              insurance_fee_percentage: mono?.insurance_fee_percentage ?? "",
                            });
                            alert("Loan offer updated successfully.");
                          } catch (err: any) {
                            alert(err?.response?.data?.message || err?.message || "Failed to update loan offer");
                          } finally {
                            setSavingOffer(false);
                          }
                        }}
                        className="bg-[#273E8E] hover:bg-[#1e3270] text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                      >
                        {savingOffer ? "Saving..." : "Save Loan Offer"}
                      </button>
                    </div>

                    {/* Guarantor – admin adds guarantor data; user only downloads/uploads form */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-[#273E8E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Guarantor
                      </h3>
                      <p className="text-sm text-gray-500 mb-4">Add guarantor details for this application. The user will only see the option to download the guarantor form and upload the signed copy—they cannot add guarantor details.</p>
                      {/* Customer's signed guarantor form – section when uploaded */}
                      {selectedItem?.guarantor?.signed_form_path && (
                        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                          <h4 className="text-sm font-semibold text-green-800 mb-2">Customer&apos;s signed guarantor form</h4>
                          <p className="text-xs text-green-700 mb-3">The customer has uploaded the signed guarantor form. You can view or download it below.</p>
                          <a
                            href={selectedItem.guarantor.signed_form_path.startsWith("http") ? selectedItem.guarantor.signed_form_path : `${DOCUMENT_BASE_URL}/${selectedItem.guarantor.signed_form_path}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-sm font-medium text-[#273E8E] hover:underline"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                            View / Download signed guarantor form
                          </a>
                        </div>
                      )}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Full name</label>
                          <input
                            type="text"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                            placeholder="Guarantor full name"
                            value={guarantorForm.full_name}
                            onChange={(e) => setGuarantorForm((f) => ({ ...f, full_name: e.target.value }))}
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Phone</label>
                          <input
                            type="text"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                            placeholder="Phone"
                            value={guarantorForm.phone}
                            onChange={(e) => setGuarantorForm((f) => ({ ...f, phone: e.target.value }))}
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Email (optional)</label>
                          <input
                            type="email"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                            placeholder="email@example.com"
                            value={guarantorForm.email}
                            onChange={(e) => setGuarantorForm((f) => ({ ...f, email: e.target.value }))}
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Relationship (optional)</label>
                          <input
                            type="text"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                            placeholder="e.g. Spouse, Colleague"
                            value={guarantorForm.relationship}
                            onChange={(e) => setGuarantorForm((f) => ({ ...f, relationship: e.target.value }))}
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        disabled={savingGuarantor || !guarantorForm.full_name.trim() || !guarantorForm.phone.trim()}
                        onClick={async () => {
                          if (!selectedItem?.id) return;
                          setSavingGuarantor(true);
                          try {
                            await setBNPLApplicationGuarantor(selectedItem.id, {
                              full_name: guarantorForm.full_name.trim(),
                              phone: guarantorForm.phone.trim(),
                              email: guarantorForm.email?.trim() || undefined,
                              relationship: guarantorForm.relationship?.trim() || undefined,
                            }, token);
                            queryClient.invalidateQueries({ queryKey: ["bnpl-applications"] });
                            const fresh = await getBNPLApplication(selectedItem.id, token);
                            setSelectedItem(fresh.data);
                            setGuarantorForm({
                              full_name: fresh.data?.guarantor?.full_name || "",
                              phone: fresh.data?.guarantor?.phone || "",
                              email: fresh.data?.guarantor?.email || "",
                              relationship: fresh.data?.guarantor?.relationship || "",
                            });
                            alert("Guarantor saved. User can download the form and upload the signed copy.");
                          } catch (err: any) {
                            alert(err?.message || "Failed to save guarantor");
                          } finally {
                            setSavingGuarantor(false);
                          }
                        }}
                        className="bg-[#273E8E] hover:bg-[#1e3270] text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                      >
                        {savingGuarantor ? "Saving..." : "Save Guarantor"}
                      </button>
                    </div>

                    {/* Installation Date – accept or reject customer's requested date */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-[#273E8E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Installation Date
                      </h3>
                      <p className="text-sm text-gray-500 mb-4">Customer can book an installation date after down payment. Accept or reject the requested date here. If rejected, they will be notified and can book another date.</p>
                      {selectedItem?.installation_requested_date ? (
                        <div className="space-y-3">
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">Requested date:</span> {selectedItem.installation_requested_date}
                          </p>
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">Status:</span>{" "}
                            <span className={selectedItem.installation_booking_status === "accepted" ? "text-green-600" : selectedItem.installation_booking_status === "rejected" ? "text-red-600" : "text-amber-600"}>
                              {selectedItem.installation_booking_status || "pending"}
                            </span>
                          </p>
                          {selectedItem.installation_booking_status === "pending" && (
                            <div className="flex gap-2">
                              <button
                                type="button"
                                disabled={savingInstallationAccept || savingInstallationReject}
                                onClick={async () => {
                                  if (!selectedItem?.id || !token) return;
                                  setSavingInstallationAccept(true);
                                  try {
                                    await acceptBNPLInstallationDate(selectedItem.id, token);
                                    queryClient.invalidateQueries({ queryKey: ["bnpl-applications"] });
                                    const fresh = await getBNPLApplication(selectedItem.id, token);
                                    setSelectedItem(fresh.data);
                                    alert("Installation date accepted.");
                                  } catch (err: any) {
                                    alert(err?.response?.data?.message || err?.message || "Failed to accept");
                                  } finally {
                                    setSavingInstallationAccept(false);
                                  }
                                }}
                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                              >
                                {savingInstallationAccept ? "Accepting..." : "Accept"}
                              </button>
                              <button
                                type="button"
                                disabled={savingInstallationAccept || savingInstallationReject}
                                onClick={async () => {
                                  if (!selectedItem?.id || !token) return;
                                  setSavingInstallationReject(true);
                                  try {
                                    await rejectBNPLInstallationDate(selectedItem.id, token);
                                    queryClient.invalidateQueries({ queryKey: ["bnpl-applications"] });
                                    const fresh = await getBNPLApplication(selectedItem.id, token);
                                    setSelectedItem(fresh.data);
                                    alert("Installation date rejected. Customer has been notified to book another date.");
                                  } catch (err: any) {
                                    alert(err?.response?.data?.message || err?.message || "Failed to reject");
                                  } finally {
                                    setSavingInstallationReject(false);
                                  }
                                }}
                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                              >
                                {savingInstallationReject ? "Rejecting..." : "Reject"}
                              </button>
                            </div>
                          )}
                          {Array.isArray(selectedItem.installation_rejected_dates) && selectedItem.installation_rejected_dates.length > 0 && (
                            <p className="text-xs text-gray-500">Rejected dates (customer cannot re-select): {selectedItem.installation_rejected_dates.join(", ")}</p>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">No installation date requested yet. Customer will see &quot;Book Installation Date&quot; after down payment.</p>
                      )}
                    </div>

                    {/* Send to Partner (before approving - like loan flow) */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-[#273E8E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Send to Partner
                      </h3>
                      <p className="text-sm text-gray-500 mb-4">You can send application details to a financing partner before approving. The user will receive notification once you approve.</p>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedPartnerIdForSend("");
                          setShowSendToPartnerModal(true);
                        }}
                        className="bg-[#273E8E] hover:bg-[#1e3270] text-white px-4 py-2 rounded-lg text-sm font-medium inline-flex items-center"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Send details to partner (Email)
                      </button>
                    </div>

                    {/* Loan Details */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-[#273E8E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
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
                                <a
                                  href={`${DOCUMENT_BASE_URL}/${selectedItem.upload_document}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm font-medium text-[#273E8E] hover:underline flex items-center"
                                >
                                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                  </svg>
                                  View Document
                                </a>
                              )
                            )}
                          </div>
                        )}
                        {selectedItem.bank_statement_path && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Bank Statement</p>
                            <a
                              href={selectedItem.bank_statement_path.startsWith("http") ? selectedItem.bank_statement_path : `${DOCUMENT_BASE_URL}/${selectedItem.bank_statement_path}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm font-medium text-[#273E8E] hover:underline flex items-center"
                            >
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                              View Bank Statement
                            </a>
                          </div>
                        )}
                        {selectedItem.live_photo_path && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Live Photo</p>
                            <a
                              href={selectedItem.live_photo_path.startsWith("http") ? selectedItem.live_photo_path : `${DOCUMENT_BASE_URL}/${selectedItem.live_photo_path}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm font-medium text-[#273E8E] hover:underline flex items-center"
                            >
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                              View Live Photo
                            </a>
                          </div>
                        )}
                        {(!selectedItem.title_document && !selectedItem.upload_document && !selectedItem.bank_statement_path && !selectedItem.live_photo_path) && (
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
                            "upload_document", "bank_statement_path", "live_photo_path",
                            "created_at", "updated_at", "guarantors", "loan_configuration"
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
                ) : activeTab === "Audit Requests" ? (
                  <>
                    {/* Audit Request Overview */}
                    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-6 border border-purple-100">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900">Audit Request Overview</h3>
                        <span
                          className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-full"
                          style={getStatusColor(selectedItem.status)}
                        >
                          {selectedItem.status || "N/A"}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Request ID</p>
                          <p className="text-sm font-semibold text-gray-900">#{selectedItem.id || "N/A"}</p>
                        </div>
                        {selectedItem.audit_type && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Audit Type</p>
                            <p className="text-sm font-semibold text-gray-900 capitalize">
                              {selectedItem.audit_type.replace("-", "/")}
                            </p>
                          </div>
                        )}
                        {selectedItem.customer_type && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Customer Type</p>
                            <p className="text-sm font-semibold text-gray-900 capitalize">
                              {selectedItem.customer_type}
                            </p>
                          </div>
                        )}
                        {selectedItem.created_at && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Request Date</p>
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

                    {/* Property Details */}
                    {(selectedItem.property_address || selectedItem.property_state || selectedItem.contact_name || selectedItem.contact_phone || selectedItem.property_floors || selectedItem.property_rooms !== undefined || selectedItem.is_gated_estate !== undefined) && (
                      <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                          <svg className="w-5 h-5 mr-2 text-[#273E8E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                          </svg>
                          Property Details
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {selectedItem.contact_name && (
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Contact Name</p>
                              <p className="text-sm font-medium text-gray-900">
                                {selectedItem.contact_name}
                              </p>
                            </div>
                          )}
                          {selectedItem.contact_phone && (
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Contact Phone</p>
                              <p className="text-sm font-medium text-gray-900">
                                {selectedItem.contact_phone}
                              </p>
                            </div>
                          )}
                          {selectedItem.property_address && (
                            <div className="md:col-span-2">
                              <p className="text-xs text-gray-500 mb-1">Property Address</p>
                              <p className="text-sm font-medium text-gray-900">
                                {selectedItem.property_address}
                              </p>
                            </div>
                          )}
                          {selectedItem.property_state && (
                            <div>
                              <p className="text-xs text-gray-500 mb-1">State</p>
                              <p className="text-sm font-medium text-gray-900">
                                {selectedItem.property_state}
                              </p>
                            </div>
                          )}
                          {selectedItem.property_floors !== undefined && selectedItem.property_floors !== null && (
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Number of Floors</p>
                              <p className="text-sm font-medium text-gray-900">
                                {selectedItem.property_floors}
                              </p>
                            </div>
                          )}
                          {selectedItem.property_rooms !== undefined && selectedItem.property_rooms !== null && (
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Number of Rooms</p>
                              <p className="text-sm font-medium text-gray-900">
                                {selectedItem.property_rooms}
                              </p>
                            </div>
                          )}
                          {selectedItem.is_gated_estate !== undefined && selectedItem.is_gated_estate !== null && (
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Gated Estate</p>
                              <p className="text-sm font-medium text-gray-900">
                                {selectedItem.is_gated_estate ? "Yes" : "No"}
                              </p>
                            </div>
                          )}
                          {selectedItem.has_property_details !== undefined && (
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Property Details Status</p>
                              <span className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full ${
                                selectedItem.has_property_details 
                                  ? "bg-green-100 text-green-800 border border-green-300" 
                                  : "bg-yellow-100 text-yellow-800 border border-yellow-300"
                              }`}>
                                {selectedItem.has_property_details ? "✓ Details Shared" : "⚠️ Needs Details"}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Order Information (if linked) */}
                    {selectedItem.order_id && (
                      <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                          <svg className="w-5 h-5 mr-2 text-[#273E8E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          Linked Order
                        </h3>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Order ID</p>
                          <p className="text-sm font-medium text-gray-900">#{selectedItem.order_id}</p>
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
                            "id", "status", "audit_type", "customer_type", "user", "property_address",
                            "property_state", "property_floors", "property_rooms", "is_gated_estate",
                            "contact_name", "contact_phone", "has_property_details", "order_id", "created_at", "updated_at"
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
                                {String(value)}
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
                    property_state: "",
                    property_address: "",
                    contact_name: "",
                    contact_phone: "",
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

              {statusForm.status === "approved" && activeTab === "BNPL Applications" && (
                <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 text-sm text-blue-800">
                  Once you approve, the user will be able to pay their down payment and the order will be fulfilled.
                </div>
              )}

              {statusForm.status === "counter_offer" && activeTab === "BNPL Applications" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Counter Offer Min Deposit (%)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step={5}
                      className="w-full border border-[#CDCDCD] rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      value={statusForm.counter_offer_min_deposit}
                      onChange={(e) =>
                        setStatusForm({
                          ...statusForm,
                          counter_offer_min_deposit: e.target.value,
                        })
                      }
                      placeholder="e.g. 40"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Percentage of loan amount. The equivalent amount in ₦ will be calculated when you save.
                      {selectedItem?.loan_amount && statusForm.counter_offer_min_deposit && Number(statusForm.counter_offer_min_deposit) > 0 && (
                        <span className="block mt-1 font-medium text-gray-700">
                          ≈ {formatCurrency(Math.round((Number(selectedItem.loan_amount) * Number(statusForm.counter_offer_min_deposit)) / 100))} minimum deposit
                        </span>
                      )}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Counter Offer Min Tenor (months)
                    </label>
                    <select
                      className="w-full border border-[#CDCDCD] rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      value={statusForm.counter_offer_min_tenor}
                      onChange={(e) =>
                        setStatusForm({
                          ...statusForm,
                          counter_offer_min_tenor: e.target.value,
                        })
                      }
                    >
                      <option value="">Select tenor</option>
                      {allowedDurations.map((m) => (
                        <option key={m} value={m}>{m} months</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {activeTab === "Audit Requests" && (
                <div className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
                  <p className="text-sm font-medium text-gray-800">Commercial/Home Audit Details</p>
                  <input
                    type="text"
                    className="w-full border border-[#CDCDCD] rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    value={statusForm.contact_name}
                    onChange={(e) =>
                      setStatusForm({ ...statusForm, contact_name: e.target.value })
                    }
                    placeholder="Contact name (optional)"
                  />
                  <input
                    type="text"
                    className="w-full border border-[#CDCDCD] rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    value={statusForm.contact_phone}
                    onChange={(e) =>
                      setStatusForm({ ...statusForm, contact_phone: e.target.value })
                    }
                    placeholder="Contact phone (optional)"
                  />
                  <input
                    type="text"
                    className="w-full border border-[#CDCDCD] rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    value={statusForm.property_state}
                    onChange={(e) =>
                      setStatusForm({ ...statusForm, property_state: e.target.value })
                    }
                    placeholder="Location state (optional)"
                  />
                  <textarea
                    className="w-full border border-[#CDCDCD] rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    rows={2}
                    value={statusForm.property_address}
                    onChange={(e) =>
                      setStatusForm({ ...statusForm, property_address: e.target.value })
                    }
                    placeholder="Location/address (optional)"
                  />
                </div>
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
                    property_state: "",
                    property_address: "",
                    contact_name: "",
                    contact_phone: "",
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

      {/* Send to Partner Modal (BNPL - before approving) */}
      {showSendToPartnerModal && (selectedItem?.user_id != null || selectedItem?.user?.id != null) && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Send to Partner</h2>
              <button
                onClick={() => {
                  setShowSendToPartnerModal(false);
                  setSelectedPartnerIdForSend("");
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Send this BNPL application details to a financing partner before approving. The partner will receive an email.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Partner</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-[#273E8E] focus:border-transparent outline-none"
                value={selectedPartnerIdForSend}
                onChange={(e) => setSelectedPartnerIdForSend(e.target.value ? Number(e.target.value) : "")}
              >
                <option value="">Select partner</option>
                {financePartnersLoading ? (
                  <option disabled>Loading partners...</option>
                ) : (
                  financePartnersList.map((partner: any) => (
                    <option key={partner.id} value={partner.id}>
                      {partner["Partner name"] ?? partner.name ?? `Partner #${partner.id}`}
                      {partner.Status ? ` (${partner.Status})` : ""}
                    </option>
                  ))
                )}
              </select>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowSendToPartnerModal(false);
                  setSelectedPartnerIdForSend("");
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={!selectedPartnerIdForSend || sendingToPartner}
                onClick={async () => {
                  const userId = selectedItem?.user_id ?? selectedItem?.user?.id;
                  if (!userId || !selectedPartnerIdForSend) return;
                  setSendingToPartner(true);
                  try {
                    await sendToPartnerDetail(userId, { partner_id: Number(selectedPartnerIdForSend) }, token);
                    setShowSendToPartnerModal(false);
                    setSelectedPartnerIdForSend("");
                    alert("Email sent to partner successfully.");
                  } catch (err: any) {
                    alert(err?.response?.data?.message || err?.message || "Failed to send to partner.");
                  } finally {
                    setSendingToPartner(false);
                  }
                }}
                className="px-6 py-2 rounded-lg font-medium bg-[#273E8E] text-white hover:bg-[#1e3270] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sendingToPartner ? "Sending..." : "Send Email"}
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
                  setCustomProducts([]);
                  setShowAddCustomProduct(false);
                  setNewCustomProduct({
                    name: "",
                    description: "",
                    price: "",
                    quantity: "1",
                  });
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
                  {auditUsersData?.data?.data?.map((user: any) => (
                      <option key={user.id} value={user.id}>
                        {user.name} - {user.email}
                      </option>
                    ))}
                  {(!auditUsersData?.data?.data || auditUsersData.data.data.length === 0) && (
                    <option value="" disabled>
                      No users with audit requests available
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

              {/* Custom Products/Services Section */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Custom Products/Services
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      These will be automatically included in the email message sent to the user
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddCustomProduct(true)}
                    className="text-sm text-[#273E8E] hover:text-[#1e3270] font-medium flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Custom Product/Service
                  </button>
                </div>
                
                {/* Add Custom Product Form */}
                {showAddCustomProduct && (
                  <div className="border border-gray-200 rounded-lg p-4 mb-4 bg-gray-50">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Add Custom Product/Service</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Name *
                        </label>
                        <input
                          type="text"
                          value={newCustomProduct.name}
                          onChange={(e) => setNewCustomProduct({ ...newCustomProduct, name: e.target.value })}
                          className="w-full border border-[#CDCDCD] rounded-lg px-3 py-2 text-sm bg-white"
                          placeholder="Enter product/service name"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Description *
                        </label>
                        <textarea
                          value={newCustomProduct.description}
                          onChange={(e) => setNewCustomProduct({ ...newCustomProduct, description: e.target.value })}
                          className="w-full border border-[#CDCDCD] rounded-lg px-3 py-2 text-sm bg-white"
                          rows={2}
                          placeholder="Enter description"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Price (₦) *
                          </label>
                          <input
                            type="number"
                            value={newCustomProduct.price}
                            onChange={(e) => setNewCustomProduct({ ...newCustomProduct, price: e.target.value })}
                            className="w-full border border-[#CDCDCD] rounded-lg px-3 py-2 text-sm bg-white"
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Quantity *
                          </label>
                          <input
                            type="number"
                            value={newCustomProduct.quantity}
                            onChange={(e) => setNewCustomProduct({ ...newCustomProduct, quantity: e.target.value })}
                            className="w-full border border-[#CDCDCD] rounded-lg px-3 py-2 text-sm bg-white"
                            placeholder="1"
                            min="1"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <button
                          type="button"
                          onClick={() => {
                            setShowAddCustomProduct(false);
                            setNewCustomProduct({
                              name: "",
                              description: "",
                              price: "",
                              quantity: "1",
                            });
                          }}
                          className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (!newCustomProduct.name.trim()) {
                              alert("Please enter a name");
                              return;
                            }
                            if (!newCustomProduct.description.trim()) {
                              alert("Please enter a description");
                              return;
                            }
                            if (!newCustomProduct.price || parseFloat(newCustomProduct.price) <= 0) {
                              alert("Please enter a valid price");
                              return;
                            }
                            if (!newCustomProduct.quantity || parseInt(newCustomProduct.quantity) < 1) {
                              alert("Please enter a valid quantity");
                              return;
                            }
                            
                            // Format custom product for email message
                            const customProduct = {
                              name: newCustomProduct.name.trim(),
                              description: newCustomProduct.description.trim(),
                              price: parseFloat(newCustomProduct.price),
                              quantity: parseInt(newCustomProduct.quantity),
                            };
                            
                            // Add to custom products list for display
                            setCustomProducts([...customProducts, customProduct]);
                            
                            // Automatically format and append to email message
                            const total = customProduct.price * customProduct.quantity;
                            const customProductText = `\n\n--- Custom Product/Service ---\n${customProduct.name}\nDescription: ${customProduct.description}\nPrice: ${formatCurrency(customProduct.price)} x ${customProduct.quantity} = ${formatCurrency(total)}`;
                            
                            const currentEmailMessage = createOrderForm.email_message || "";
                            setCreateOrderForm({
                              ...createOrderForm,
                              email_message: currentEmailMessage + customProductText,
                            });
                            
                            setNewCustomProduct({
                              name: "",
                              description: "",
                              price: "",
                              quantity: "1",
                            });
                            setShowAddCustomProduct(false);
                          }}
                          className="px-4 py-2 text-sm bg-[#273E8E] text-white rounded-lg hover:bg-[#1e3270]"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* List of Custom Products */}
                {customProducts.length > 0 && (
                  <div className="border border-gray-200 rounded-lg p-4 mb-4 bg-white">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium text-gray-700">Custom Products/Services (Will be included in email):</h4>
                      <span className="text-xs text-gray-500 bg-blue-50 px-2 py-1 rounded">
                        {customProducts.length} item{customProducts.length > 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {customProducts.map((custom, index) => (
                        <div
                          key={index}
                          className="flex items-start justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                        >
                          <div className="flex-1">
                            <p className="font-medium text-sm text-gray-900">{custom.name}</p>
                            <p className="text-xs text-gray-600 mt-1">{custom.description}</p>
                            <div className="flex items-center gap-4 mt-2">
                              <span className="text-sm font-semibold text-[#273E8E]">
                                {formatCurrency(custom.price)}
                              </span>
                              <span className="text-xs text-gray-500">Qty: {custom.quantity}</span>
                              <span className="text-xs text-gray-500">
                                Total: {formatCurrency(custom.price * custom.quantity)}
                              </span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              // Remove from custom products list
                              const updatedCustomProducts = customProducts.filter((_, i) => i !== index);
                              setCustomProducts(updatedCustomProducts);
                              
                              // Rebuild email message without the removed custom product
                              let emailMessage = createOrderForm.email_message || "";
                              
                              // Remove the custom product section from email message
                              const customProduct = customProducts[index];
                              const total = customProduct.price * customProduct.quantity;
                              const customProductText = `\n\n--- Custom Product/Service ---\n${customProduct.name}\nDescription: ${customProduct.description}\nPrice: ${formatCurrency(customProduct.price)} x ${customProduct.quantity} = ${formatCurrency(total)}`;
                              
                              // Remove this specific custom product text from email message
                              emailMessage = emailMessage.replace(customProductText, '');
                              
                              // Rebuild email message with remaining custom products
                              if (updatedCustomProducts.length > 0) {
                                const remainingCustomProductsText = updatedCustomProducts.map((custom) => {
                                  const customTotal = custom.price * custom.quantity;
                                  return `\n\n--- Custom Product/Service ---\n${custom.name}\nDescription: ${custom.description}\nPrice: ${formatCurrency(custom.price)} x ${custom.quantity} = ${formatCurrency(customTotal)}`;
                                }).join('');
                                
                                // Get the base message (before any custom products)
                                const baseMessage = emailMessage.split('--- Custom Product/Service ---')[0].trim();
                                emailMessage = baseMessage + remainingCustomProductsText;
                              } else {
                                // No custom products left, remove all custom product sections
                                emailMessage = emailMessage.split('--- Custom Product/Service ---')[0].trim();
                              }
                              
                              setCreateOrderForm({
                                ...createOrderForm,
                                email_message: emailMessage,
                              });
                            }}
                            className="ml-3 text-red-500 hover:text-red-700"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Products/Bundles Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Products/Bundles
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
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <label className="flex items-center space-x-2 mb-4">
                  <input
                    type="checkbox"
                    checked={createOrderForm.send_email}
                    onChange={(e) =>
                      setCreateOrderForm({
                        ...createOrderForm,
                        send_email: e.target.checked,
                      })
                    }
                    className="rounded w-4 h-4 text-[#273E8E] focus:ring-[#273E8E] border-gray-300"
                  />
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-[#273E8E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm font-medium text-gray-700">
                      Send email link to user
                    </span>
                  </div>
                </label>

                {createOrderForm.send_email && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Email Message (Optional)
                      </label>
                      <span className="text-xs text-gray-500">
                        {createOrderForm.email_message.length}/1000
                      </span>
                    </div>
                    <textarea
                      value={createOrderForm.email_message}
                      onChange={(e) =>
                        setCreateOrderForm({
                          ...createOrderForm,
                          email_message: e.target.value,
                        })
                      }
                      className="w-full border border-[#CDCDCD] rounded-lg px-4 py-3 text-sm bg-white focus:ring-2 focus:ring-[#273E8E] focus:border-transparent outline-none transition-all resize-none"
                      rows={4}
                      placeholder="Enter a custom message to include in the email sent to the user. This message will be sent along with the order link..."
                      maxLength={1000}
                    />
                    <p className="mt-2 text-xs text-gray-500">
                      This message will be included in the email notification sent to the user when the order is created.
                    </p>
                  </div>
                )}
              </div>

              {/* Selected Items Summary */}
              {selectedProducts.length > 0 && (
                <div className="border-t pt-4">
                  <h3 className="font-medium mb-2">Selected Order Items:</h3>
                  <ul className="space-y-1">
                    {selectedProducts.map((item, idx) => (
                      <li key={idx} className="text-sm text-gray-600">
                        {item.type === "product" ? "Product" : "Bundle"} ID {item.id} - Qty: {item.quantity}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Custom Products Summary (Email Only) */}
              {customProducts.length > 0 && (
                <div className="border-t pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <h3 className="font-medium text-blue-600">Custom Products/Services (Included in Email):</h3>
                  </div>
                  <ul className="space-y-1">
                    {customProducts.map((custom, idx) => (
                      <li key={`custom-${idx}`} className="text-sm text-gray-600">
                        {custom.name} - {formatCurrency(custom.price)} x {custom.quantity} = {formatCurrency(custom.price * custom.quantity)}
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
                    setCustomProducts([]);
                    setShowAddCustomProduct(false);
                    setNewCustomProduct({
                      name: "",
                      description: "",
                      price: "",
                      quantity: "1",
                    });
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
                    if (selectedProducts.length === 0 && customProducts.length === 0) {
                      alert("Please select at least one product, bundle, or add a custom product/service");
                      return;
                    }
                    
                    // Custom products are already included in email_message automatically when added
                    // Only send regular products/bundles as items, custom products are in the email message
                    createCustomOrderMutation.mutate({
                      ...createOrderForm,
                      user_id: parseInt(createOrderForm.user_id),
                      items: selectedProducts, // Only send regular products/bundles, not custom products
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
                      {selectedUser.audit_requests.map((request: any) => (
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
                {(userCartResponse as any)?.data ? (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Custom Order Request Details</h3>
                    
                    {/* Cart Items */}
                    {(userCartResponse as any).data.cart_items?.length > 0 ? (
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
                              {(userCartResponse as any).data.cart_items.map((item: any) => (
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
                            {formatCurrency((userCartResponse as any).data.total_amount || 0)}
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="flex space-x-3 pt-4 border-t">
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
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 border border-gray-200 rounded-lg">
                    <p className="mb-4">No cart data available for this user.</p>
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
            ) : (userCartResponse as any)?.data ? (
              <div className="space-y-4">
                {/* User Info */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold">
                    {(userCartResponse as any).data.user?.name || "User"}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {(userCartResponse as any).data.user?.email}
                  </p>
                </div>

                {/* Cart Items */}
                {(userCartResponse as any).data.cart_items?.length > 0 ? (
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
                          {(userCartResponse as any).data.cart_items.map((item: any) => (
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
                        {formatCurrency((userCartResponse as any).data.total_amount || 0)}
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

