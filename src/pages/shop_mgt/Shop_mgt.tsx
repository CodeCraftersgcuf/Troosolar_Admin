import React, { useState } from "react";
import Header from "../../component/Header";
import { getOrderStatusColor } from "./shpmgt";
import type { ShopOrderData } from "./shpmgt";
import OrderDetailModal from "./OrderDetailModal";
import Product from "./Product";
import ProductBuilder from "./ProductBuilder";
import AddProduct from "./AddProduct";
import CustomDropdown from "./CustomDropdown";
import images from "../../constants/images";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import StatsLoadingSkeleton from "../../components/common/StatsLoadingSkeleton";

//Code Related to the Integration
import { getAllOrders } from "../../utils/queries/orders";
import { useQuery } from "@tanstack/react-query";
import Cookies from "js-cookie";

// API Response interfaces
interface OrderItem {
  itemable_type: string;
  itemable_id: number;
  quantity: number;
  unit_price: string;
  subtotal: string;
  item: {
    id: number;
    title: string;
    featured_image: string;
  };
}

interface DeliveryAddress {
  id: number;
  user_id: number;
  phone_number: string;
  title: string;
  address: string;
  state: string;
  created_at: string;
  updated_at: string;
}

interface ApiOrder {
  id: number;
  order_number: string;
  order_status: string;
  payment_status: string;
  payment_method: string;
  note: string | null;
  total_price: string;
  product_id: number;
  bundle_id: number | null;
  created_at: string;
  delivery_address: DeliveryAddress;
  items: OrderItem[];
  include_user_info: boolean;
}




const Shop_mgt = () => {
  const [activeTab, setActiveTab] = useState("Shop Orders");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [statusFilter, setStatusFilter] = useState("Status");
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<ApiOrder | null>(null);
  const [isProductBuilderOpen, setIsProductBuilderOpen] = useState(false);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [activeFilterTab, setActiveFilterTab] = useState("All");
  const [selectedMoreActions, setSelectedMoreActions] =
    useState("More Actions");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Get token from cookies
  const token = Cookies.get("token");

  // Fetch orders from API
  const {
    data: ordersData,
    isLoading: ordersLoading,
    isError: ordersError,
  } = useQuery({
    queryKey: ["all-orders"],
    queryFn: () => getAllOrders(token || ""),
    enabled: !!token,
  });

  // Debug: Log the API response to see the structure
  console.log("API Response:", ordersData);
  console.log("Orders Data:", ordersData?.orders);

  // Map API response to ShopOrderData format
  const mappedOrders: ShopOrderData[] = ordersData?.orders?.map((order: ApiOrder) => {
    const firstItem = order.items?.[0];
    const productName = firstItem?.item?.title || "Unknown Product";
    const customerName = order.delivery_address?.title || "Unknown Customer";
    const orderDate = new Date(order.created_at);
    const formattedDate = orderDate.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    });
    const formattedTime = orderDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    return {
      id: order.id.toString(),
      name: customerName,
      productName: productName,
      amount: `₦${Number(order.total_price).toLocaleString()}`,
      date: formattedDate,
      time: formattedTime,
      status: order.order_status === "pending" ? "Pending" :
        order.order_status === "completed" ? "Delivered" : "Ordered"
    };
  }) || [];

  // Get summary data from API
  const summary = ordersData?.summary;

  // Debug: Log mapped orders
  console.log("Mapped Orders:", mappedOrders);

  const handleNotificationClick = () => {
    console.log("Notification clicked");
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(mappedOrders.map((order) => order.id));
    }
    setSelectAll(!selectAll);
  };

  const handleSelectUser = (userId: string) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter((id) => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  const handleViewDetails = (order: ShopOrderData) => {
    // Find the original order data from API response
    const originalOrder = ordersData?.orders?.find((apiOrder: ApiOrder) =>
      apiOrder.id.toString() === order.id
    );
    setSelectedOrder(originalOrder || null);
    setShowOrderModal(true);
  };

  const closeModal = () => {
    setShowOrderModal(false);
    setSelectedOrder(null);
  };

  // Filter data based on status and search query
  const filteredOrderData = mappedOrders.filter((order: ShopOrderData) => {
    const statusMatch =
      statusFilter === "Status" || order.status === statusFilter;

    // Search functionality - search across name, product name, and order ID
    const searchMatch = searchQuery === "" ||
      order.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.amount.toLowerCase().includes(searchQuery.toLowerCase());

    return statusMatch && searchMatch;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredOrderData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentOrders = filteredOrderData.slice(startIndex, endIndex);

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, activeFilterTab]);

  // Debug: Log filtered data
  console.log("Filtered Order Data:", filteredOrderData);
  console.log("Status Filter:", statusFilter);
  console.log("Search Query:", searchQuery);

  return (
    <div className="bg-[#F5F7FF] min-h-screen">
      {/* Header Component */}
      <Header
        adminName="Hi, Admin"
        adminImage="/assets/layout/admin.png"
        onNotificationClick={handleNotificationClick}
      />

      {/* Main Content */}
      <div className="p-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Shop Management</h1>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <div className="flex justify-between items-center">
              <nav className="-mb-px flex space-x-8">
                <button
                  className={`py-2 px-1 border-b-4 font-medium text-md cursor-pointer ${activeTab === "Shop Orders"
                    ? "border-[#273E8E] text-black"
                    : "border-transparent text-[#00000080]"
                    }`}
                  onClick={() => setActiveTab("Shop Orders")}
                >
                  Shop Orders
                </button>
                <button
                  className={`py-2 px-1 border-b-4 font-medium text-md cursor-pointer ${activeTab === "Products"
                    ? "border-[#273E8E] text-black"
                    : "border-transparent text-[#00000080]"
                    }`}
                  onClick={() => setActiveTab("Products")}
                >
                  Products
                </button>
              </nav>

              {/* Action Buttons - Only show on Products tab */}
              {activeTab === "Products" && (
                <div className="flex items-center space-x-3 mt-[-25px]">
                  <button
                    onClick={() => setIsAddProductOpen(true)}
                    className="bg-[#273E8E]  hover:bg-[#273E8E] text-white px-8 py-3.5 rounded-full text-sm font-medium transition-colors shadow-sm cursor-pointer"
                  >
                    Upload Product
                  </button>
                  <button
                    onClick={() => setIsProductBuilderOpen(true)}
                    className="bg-[#E8A91D] hover:bg-[#E8A91D] text-white px-8 py-3.5 rounded-full text-sm font-medium transition-colors shadow-sm cursor-pointer"
                  >
                    Create Bundle
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Cards - Only show for Shop Orders tab */}
        {activeTab === "Shop Orders" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {ordersLoading ? (
              <StatsLoadingSkeleton count={3} />
            ) : (
              <>
                {/* Total Orders Card */}
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
                      <p className="text-sm font-medium text-blue-600">
                        Total Orders
                      </p>
                      <p className="text-2xl font-bold text-blue-600">
                        {summary?.total_orders || 0}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Pending Orders Card */}
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
                      <p className="text-sm font-medium text-blue-600">
                        Pending Orders
                      </p>
                      <p className="text-2xl font-bold text-blue-600">
                        {summary?.pending_orders || 0}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Completed Orders Card */}
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
                      <p className="text-sm font-medium text-blue-600">
                        Completed Orders
                      </p>
                      <p className="text-2xl font-bold text-blue-600">
                        {summary?.completed_orders || 0}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Order Summary Section - Only show for Shop Orders tab */}
        {activeTab === "Shop Orders" && (
          <>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Order Summary
              </h2>

              {/* Filter Tabs and Controls */}
              <div className="flex justify-between items-center mb-4">
                {/* Filter Tabs */}
                <div className="flex items-center space-x-4">
                  <div className="flex bg-white rounded-full border border-[#CDCDCD] p-2 shadow-sm">
                    <button
                      className={`px-4 py-2 rounded-full text-sm font-medium cursor-pointer ${activeFilterTab === "All"
                        ? "bg-[#273E8E] text-white"
                        : "text-[#000000B2]"
                        }`}
                      onClick={() => setActiveFilterTab("All")}
                    >
                      All
                    </button>
                    <button
                      className={`px-4 py-2 rounded-full text-sm font-medium cursor-pointer ${activeFilterTab === "Loans"
                        ? "bg-[#273E8E] text-white"
                        : "text-[#000000B2]"
                        }`}
                      onClick={() => setActiveFilterTab("Loans")}
                    >
                      Loans
                    </button>
                    <button
                      className={`px-4 py-2 rounded-full text-sm font-medium cursor-pointer ${activeFilterTab === "Direct"
                        ? "bg-[#273E8E] text-white"
                        : "text-[#000000B2]"
                        }`}
                      onClick={() => setActiveFilterTab("Direct")}
                    >
                      Direct
                    </button>
                  </div>

                  {/* More Actions Dropdown */}
                  <CustomDropdown
                    options={["More Actions", "Export Data", "Bulk Action"]}
                    selected={selectedMoreActions}
                    onSelect={setSelectedMoreActions}
                  />

                  {/* Status Filter */}
                  <CustomDropdown
                    options={["Status", "Ordered", "Pending", "Delivered"]}
                    selected={statusFilter}
                    onSelect={setStatusFilter}
                  />
                </div>

                {/* Search Box */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search orders..."
                    value={searchQuery}
                    onChange={handleSearchChange}
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

            {/* Orders Table */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              {ordersLoading ? (
                <LoadingSpinner message="Loading orders..." />
              ) : ordersError ? (
                <div className="p-8 text-center">
                  <div className="text-red-500">Failed to load orders. Please try again.</div>
                </div>
              ) : (
                <div>
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 bg-[#EBEBEB]">
                        <th className="px-6 py-4 text-center text-sm font-medium text-black">
                          <input
                            type="checkbox"
                            className="rounded"
                            checked={selectAll}
                            onChange={handleSelectAll}
                          />
                        </th>
                        <th className="px-6 py-4 text-center text-sm font-medium text-black">
                          Name
                        </th>
                        <th className="px-6 py-4 text-center text-sm font-medium text-black">
                          Product name
                        </th>
                        <th className="px-6 py-4 text-center text-sm font-medium text-black">
                          Amount
                        </th>
                        <th className="px-6 py-4 text-center text-sm font-medium text-black">
                          Date
                        </th>
                        <th className="px-6 py-4 text-center text-sm font-medium text-black">
                          Status
                        </th>
                        <th className="px-6 py-4 text-center text-sm font-medium text-black">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white">
                      {filteredOrderData.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                            {mappedOrders.length === 0
                              ? "No orders found"
                              : searchQuery
                                ? `No orders found matching "${searchQuery}"`
                                : "No orders match the current filter"
                            }
                          </td>
                        </tr>
                      ) : (
                        currentOrders.map(
                          (order: ShopOrderData, index: number) => (
                            <tr
                              key={order.id}
                              className={`${index % 2 === 0 ? "bg-[#F8F8F8]" : "bg-white"
                                } transition-colors border-b border-gray-100 last:border-b-0`}
                            >
                              <td className="px-6 py-4 whitespace-nowrap text-center">
                                <input
                                  type="checkbox"
                                  className="rounded"
                                  checked={selectedUsers.includes(order.id)}
                                  onChange={() => handleSelectUser(order.id)}
                                />
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-center">
                                {order.name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                                {order.productName}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 text-center">
                                {order.amount}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-center">
                                {order.date}/{order.time}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-center">
                                <span
                                  className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full"
                                  style={getOrderStatusColor(order.status)}
                                >
                                  <span
                                    className="w-1.5 h-1.5 rounded-full mr-1.5"
                                    style={{
                                      backgroundColor:
                                        order.status.toLowerCase() === "delivered"
                                          ? "#008000"
                                          : order.status.toLowerCase() === "pending"
                                            ? "#FF8C00"
                                            : order.status.toLowerCase() === "ordered"
                                              ? "#5A67D8"
                                              : "#6B7280",
                                    }}
                                  ></span>
                                  {order.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                                <button
                                  className="bg-[#273E8E] hover:bg-[#1e3270] text-white px-6 py-3 rounded-full text-sm font-medium transition-colors cursor-pointer"
                                  onClick={() => handleViewDetails(order)}
                                >
                                  View Details
                                </button>
                              </td>
                            </tr>
                          )
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              )}
              
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-white">
                  <div className="flex items-center text-sm text-gray-700">
                    <span>
                      Showing {startIndex + 1} to {Math.min(endIndex, filteredOrderData.length)} of {filteredOrderData.length} results
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {/* Previous Button */}
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className={`px-3 py-2 text-sm font-medium rounded-md border ${
                        currentPage === 1
                          ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 cursor-pointer'
                      }`}
                    >
                      Previous
                    </button>
                    
                    {/* Page Numbers */}
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
                                ? 'bg-[#273E8E] text-white border-[#273E8E]'
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {pageNumber}
                          </button>
                        );
                      })}
                    </div>
                    
                    {/* Next Button */}
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className={`px-3 py-2 text-sm font-medium rounded-md border ${
                        currentPage === totalPages
                          ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 cursor-pointer'
                      }`}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Products Tab Content */}
        {activeTab === "Products" && <Product />}
      </div>

      {/* Order Detail Modal */}
      <OrderDetailModal
        isOpen={showOrderModal}
        order={selectedOrder}
        onClose={closeModal}
      />

      {/* Product Builder Modal */}
      <ProductBuilder
        isOpen={isProductBuilderOpen}
        onClose={() => setIsProductBuilderOpen(false)}
      />

      {/* Add Product Modal */}
      <AddProduct
        isOpen={isAddProductOpen}
        onClose={() => setIsAddProductOpen(false)}
      />
    </div>
  );
};

export default Shop_mgt;
