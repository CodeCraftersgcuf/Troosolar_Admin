import { useParams, useNavigate } from "react-router-dom";
import React, { useState, useRef } from "react";
import Header from "../../component/Header";
import OrderDetailModal from "../shop_mgt/OrderDetailModal";
import LoadingSpinner from "../../components/common/LoadingSpinner";

interface ApiOrder {
  id: number;
  order_number?: string;
  order_status?: string;
  total_price?: string;
  created_at?: string;
  items?: Array<{
    item?: {
      title?: string;
    };
  }>;
}

interface OrderForModal {
  id: number;
  order_number?: string;
  order_status?: string;
  total_price?: string;
  created_at?: string;
  items?: Array<{
    item?: {
      title?: string;
    };
  }>;
  delivery_address?: {
    address?: string;
    phone_number?: string;
  };
  user_info?: {
    name?: string;
    phone?: string;
  };
}

//Code Related to the Integration
import { useQuery } from "@tanstack/react-query";
import { getSingleOrderUser } from "../../utils/queries/orders";
import Cookies from "js-cookie";

const UserOrders = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Orders");
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState<OrderForModal | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const statusDropdownRef = useRef<HTMLDivElement>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const token = Cookies.get("token");
  const tabs = ["Activity", "Loans", "Transactions", "Orders"];

  // API call for user orders
  const {
    data: apiData,
    isLoading: isApiLoading,
    isError: isApiError,
  } = useQuery({
    queryKey: ["single-order-user", id],
    queryFn: () => getSingleOrderUser(id || "", token || ""),
    enabled: !!id && !!token,
  });

  // Map API response
  const apiSummary = apiData?.summary || {};
  const apiOrders = apiData?.orders || [];


  // Handle tab navigation
  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    switch (tab) {
      case "Activity":
        navigate(`/user-activity/${id}`);
        break;
      case "Loans":
        navigate(`/user-activity/${id}/loans`);
        break;
      case "Transactions":
        navigate(`/user-activity/${id}/transactions`);
        break;
      case "Orders":
        break;
      default:
        break;
    }
  };

  const handleNotificationClick = () => {
    console.log("Notification clicked");
  };

  // Filters
  const filteredOrders = apiOrders.filter((order: ApiOrder) => {
    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const orderNumber = (order.order_number || "").toLowerCase();
      const totalPrice = (order.total_price || "").toLowerCase();
      const createdAt = (order.created_at || "").toLowerCase();
      const status = (order.order_status || "").toLowerCase();
      if (!orderNumber.includes(term) && !totalPrice.includes(term) && !createdAt.includes(term) && !status.includes(term)) {
        return false;
      }
    }
    if (selectedFilter === "All") return true;
    if (selectedFilter === "Status") return order.order_status === "pending";
    if (selectedFilter === "Ordered") return order.order_status === "ordered";
    if (selectedFilter === "Pending") return order.order_status === "pending";
    if (selectedFilter === "Delivered") return order.order_status === "delivered";
    return true;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentOrders = filteredOrders.slice(startIndex, endIndex);

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [selectedFilter, searchTerm]);

  return (
    <div className="bg-[#F5F7FF] min-h-screen">
      <Header
        adminName="Hi, Admin"
        adminImage="/assets/layout/admin.png"
        onNotificationClick={handleNotificationClick}
      />
      <div className="p-6">
        {/* User Header */}
        <div className="mb-5">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Orders
          </h1>
          <div className="flex space-x-8 border-b border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabClick(tab)}
                className={`py-2 px-1 border-b-2 font-medium cursor-pointer text-md ${activeTab === tab
                    ? "text-black border-b-4 border-[#273E8E]"
                    : "text-[#00000080] border-transparent "
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
        {/* Summary Cards */}
        {isApiLoading ? (
          <LoadingSpinner message="Loading orders summary..." />
        ) : isApiError ? (
          <div className="py-8 text-center text-red-500">Failed to load orders summary.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100" style={{ boxShadow: "5px 5px 10px 0px rgba(109, 108, 108, 0.25)" }}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <img src="/assets/images/Users.png" alt="Total Orders" className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: "#0000FF" }}>Total Orders</p>
                  <p className="text-2xl font-bold" style={{ color: "#0000FF" }}>{apiSummary?.total_orders || 0}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100" style={{ boxShadow: "5px 5px 10px 0px rgba(109, 108, 108, 0.25)" }}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <img src="/assets/images/Users.png" alt="Pending Orders" className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: "#0000FF" }}>Pending Orders</p>
                  <p className="text-2xl font-bold" style={{ color: "#0000FF" }}>{apiSummary?.pending_orders || 0}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100" style={{ boxShadow: "5px 5px 10px 0px rgba(109, 108, 108, 0.25)" }}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <img src="/assets/images/Users.png" alt="Successful Orders" className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: "#0000FF" }}>Successful Orders</p>
                  <p className="text-2xl font-bold" style={{ color: "#0000FF" }}>{apiSummary?.completed_orders || 0}</p>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Orders Header Section - Separated */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Orders</h2>
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="flex bg-white border border-[#CDCDCD] rounded-full p-2">
                {['All', 'Loans', 'Direct'].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setSelectedFilter(filter)}
                    className={`px-5 py-2.5 rounded-full text-sm font-medium transition-colors cursor-pointer  ${selectedFilter === filter
                        ? 'bg-[#273E8E] text-white'
                        : 'text-[#000000B2] '
                      }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
              <div className="relative" ref={statusDropdownRef}>
                <div className="inline-block">
                  <button
                    className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-black bg-white border border-[#DEDEDE] rounded-lg focus:outline-none"
                    onClick={() => {
                      document.getElementById('statusDropdown')?.classList.toggle('hidden');
                    }}
                    style={{ boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05)' }}
                  >
                    <span>Status</span>
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div
                    id="statusDropdown"
                    className="absolute z-10 hidden w-[180px] mt-1 bg-white rounded-lg shadow-lg overflow-hidden"
                    style={{ boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)' }}
                  >
                    <div className="py-2">
                      <button
                        onClick={() => {
                          setSelectedFilter('Ordered');
                          document.getElementById('statusDropdown')?.classList.add('hidden');
                        }}
                        className="block w-full px-6 py-3 text-left text-base font-normal hover:bg-gray-50"
                      >
                        Order Placed
                      </button>
                      <button
                        onClick={() => {
                          setSelectedFilter('Pending');
                          document.getElementById('statusDropdown')?.classList.add('hidden');
                        }}
                        className="block w-full px-6 py-3 text-left text-base font-normal hover:bg-gray-50"
                      >
                        Pending
                      </button>
                      <button
                        onClick={() => {
                          setSelectedFilter('Delivered');
                          document.getElementById('statusDropdown')?.classList.add('hidden');
                        }}
                        className="block w-full px-6 py-3 text-left text-base font-normal hover:bg-gray-50"
                      >
                        Delivered
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="Search"
                className="pl-12 pr-6 py-3.5 border border-[#00000080] rounded-lg text-[15px] w-[320px] focus:outline-none bg-white shadow-[0_2px_6px_rgba(0,0,0,0.05)] placeholder-gray-400"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        {/* Orders Table */}
        {isApiLoading ? (
          <LoadingSpinner message="Loading orders..." />
        ) : isApiError ? (
          <div className="py-8 text-center text-red-500">Failed to load orders.</div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="py-16 text-center">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
              <p className="text-gray-500 mb-6">
                {apiOrders.length === 0
                  ? "This user hasn't placed any orders yet."
                  : "No orders match your current filters."}
              </p>
              {apiOrders.length === 0 && (
                <button
                  onClick={() => navigate("/user-mgt")}
                  className="px-6 py-2 bg-[#273E8E] text-white rounded-full hover:bg-blue-700 transition-colors"
                >
                  Back to User Management
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-[#EBEBEB]">
                    <th className="px-6 py-4 text-center text-sm font-medium text-black">
                      <input type="checkbox" className="rounded" />
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-medium text-black">Order ID</th>
                    <th className="px-6 py-4 text-center text-sm font-medium text-black">Product Name</th>
                    <th className="px-6 py-4 text-center text-sm font-medium text-black">Amount</th>
                    <th className="px-6 py-4 text-center text-sm font-medium text-black">Date</th>
                    <th className="px-6 py-4 text-center text-sm font-medium text-black">Status</th>
                    <th className="px-6 py-4 text-center text-sm font-medium text-black">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {currentOrders.map((order: ApiOrder, index: number) => (
                    <tr
                      key={order.id}
                      className={`${index % 2 === 0 ? "bg-[#F8F8F8]" : "bg-white"} transition-colors border-b border-gray-100 last:border-b-0`}
                    >
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        <input type="checkbox" className="rounded" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-black text-center">
                        {order.order_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-black text-center">
                        {order.items && order.items.length > 0 ? order.items[0].item?.title : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-black text-center">
                        ₦{order.total_price ? Number(order.total_price).toLocaleString() : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-black text-center">
                        {order.created_at}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span
                          className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full"
                          style={
                            order.order_status === "ordered"
                              ? { backgroundColor: "#E9F0FF", color: "#273E8E" }
                              : order.order_status === "pending"
                                ? { backgroundColor: "#FFF3E0", color: "#FF8C00" }
                                : order.order_status === "delivered"
                                  ? { backgroundColor: "#EEFBEE", color: "#008000" }
                                  : order.order_status === "rejected"
                                    ? { backgroundColor: "#FFEAEA", color: "#FF0000" }
                                    : { backgroundColor: "#F3F4F6", color: "#6B7280" }
                          }
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full mr-1.5"
                            style={{
                              backgroundColor:
                                order.order_status === "ordered"
                                  ? "#273E8E"
                                  : order.order_status === "pending"
                                    ? "#FF8C00"
                                    : order.order_status === "delivered"
                                      ? "#008000"
                                      : order.order_status === "rejected"
                                        ? "#FF0000"
                                        : "#6B7280",
                            }}
                          ></span>
                          {order.order_status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                        <button
                          className="text-white px-6 py-2 rounded-full cursor-pointer hover:opacity-90 transition-opacity text-sm font-medium"
                          style={{ backgroundColor: "#273E8E" }}
                          onClick={() => {
                            // Convert ApiOrder to the format expected by OrderDetailModal
                            const orderForModal = {
                              id: order.id,
                              order_number: order.order_number,
                              order_status: order.order_status,
                              total_price: order.total_price,
                              created_at: order.created_at,
                              items: order.items,
                              delivery_address: {
                                address: "N/A",
                                phone_number: "N/A"
                              },
                              user_info: {
                                name: "User",
                                phone: "N/A"
                              }
                            };
                            setSelectedOrder(orderForModal);
                          }}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-white mt-4 rounded-lg shadow-sm">
            <div className="flex items-center text-sm text-gray-700">
              <span>
                Showing {startIndex + 1} to {Math.min(endIndex, filteredOrders.length)} of {filteredOrders.length} results
              </span>
            </div>

            <div className="flex items-center space-x-2">
              {/* Previous Button */}
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={`px-3 py-2 text-sm font-medium rounded-md border ${currentPage === 1
                  ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 cursor-pointer'
                  }`}
              >
                Previous
              </button>

              {/* Page Numbers */}
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
                    className={`px-3 py-2 text-sm font-medium rounded-md border ${currentPage === pageNumber
                      ? 'bg-[#273E8E] text-white border-[#273E8E]'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                  >
                    {pageNumber}
                  </button>
                );
              })}

              {/* Next Button */}
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className={`px-3 py-2 text-sm font-medium rounded-md border ${currentPage === totalPages
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
      {/* Order Details Modal */}
      <OrderDetailModal
        isOpen={!!selectedOrder}
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </div>
  );
};

export default UserOrders;
