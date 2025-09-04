import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import Header from "../../component/Header";
import { users } from "../../constants/usermgt";
import OrderDetailModal from "../shop_mgt/OrderDetailModal";
import type { ShopOrderData } from "../shop_mgt/shpmgt";

// User-specific order data
const userOrdersData = {
  "1": {
    user: {
      name: "Germandon Abudu",
      totalOrders: 4,
      pendingOrders: 1,
      successfulOrders: 2,
    },
    orders: [
      {
        id: 1,
        orderId: "12ed1mrme4n4bkf",
        product: "Newmana Solar Inverter",
        amount: 4000000,
        date: "05-07-25/07:22AM",
        status: "Ordered",
        deliveryAddress: "No 1 Janos street, Wuse Lagos",
        estimatedDelivery: "July 7, 2024",
      },
      {
        id: 2,
        orderId: "12ed1mrme4n4bkf",
        product: "Solar Panel Kit",
        amount: 2500000,
        date: "04-07-25/09:15AM",
        status: "Delivered",
        deliveryAddress: "No 1 Janos street, Wuse Lagos",
        estimatedDelivery: "July 7, 2024",
      },
      {
        id: 3,
        orderId: "12ed1mrme4n4bkf",
        product: "Battery Pack",
        amount: 1800000,
        date: "03-07-25/14:30PM",
        status: "Pending",
        deliveryAddress: "No 1 Janos street, Wuse Lagos",
        estimatedDelivery: "July 7, 2024",
      },
    ],
  },
  "2": {
    user: {
      name: "Chiara Lawson",
      totalOrders: 3,
      pendingOrders: 0,
      successfulOrders: 3,
    },
    orders: [
      {
        id: 1,
        orderId: "12ed1mrme4n4bkf",
        product: "Solar Charge Controller",
        amount: 800000,
        date: "05-07-25/08:45AM",
        status: "Delivered",
        deliveryAddress: "No 5 Victoria Street, Ikoyi Lagos",
        estimatedDelivery: "July 8, 2024",
      },
      {
        id: 2,
        orderId: "12ed1mrme4n4bkf",
        product: "Newmana Solar Inverter",
        amount: 4000000,
        date: "04-07-25/16:20PM",
        status: "Delivered",
        deliveryAddress: "No 5 Victoria Street, Ikoyi Lagos",
        estimatedDelivery: "July 8, 2024",
      },
      {
        id: 3,
        orderId: "12ed1mrme4n4bkf",
        product: "Solar Panel Kit",
        amount: 2500000,
        date: "03-07-25/11:10AM",
        status: "Delivered",
        deliveryAddress: "No 5 Victoria Street, Ikoyi Lagos",
        estimatedDelivery: "July 8, 2024",
      },
    ],
  },
  "3": {
    user: {
      name: "Anita Becker",
      totalOrders: 5,
      pendingOrders: 2,
      successfulOrders: 2,
    },
    orders: [
      {
        id: 1,
        orderId: "12ed1mrme4n4bkf",
        product: "Battery Pack",
        amount: 1800000,
        date: "05-07-25/12:30PM",
        status: "Pending",
        deliveryAddress: "No 10 Allen Avenue, Ikeja Lagos",
        estimatedDelivery: "July 9, 2024",
      },
      {
        id: 2,
        orderId: "12ed1mrme4n4bkf",
        product: "Newmana Solar Inverter",
        amount: 4000000,
        date: "04-07-25/10:15AM",
        status: "Delivered",
        deliveryAddress: "No 10 Allen Avenue, Ikeja Lagos",
        estimatedDelivery: "July 9, 2024",
      },
      {
        id: 3,
        orderId: "12ed1mrme4n4bkf",
        product: "Solar Charge Controller",
        amount: 800000,
        date: "03-07-25/15:45PM",
        status: "Pending",
        deliveryAddress: "No 10 Allen Avenue, Ikeja Lagos",
        estimatedDelivery: "July 9, 2024",
      },
    ],
  },
  "4": {
    user: {
      name: "Rasheedat Bello",
      totalOrders: 6,
      pendingOrders: 1,
      successfulOrders: 4,
    },
    orders: [
      {
        id: 1,
        orderId: "12ed1mrme4n4bkf",
        product: "Newmana Solar Inverter",
        amount: 4000000,
        date: "05-07-25/09:00AM",
        status: "Delivered",
        deliveryAddress: "No 15 Broad Street, Apapa Lagos",
        estimatedDelivery: "July 10, 2024",
      },
      {
        id: 2,
        orderId: "12ed1mrme4n4bkf",
        product: "Solar Panel Kit",
        amount: 2500000,
        date: "04-07-25/13:25PM",
        status: "Ordered",
        deliveryAddress: "No 15 Broad Street, Apapa Lagos",
        estimatedDelivery: "July 10, 2024",
      },
      {
        id: 3,
        orderId: "12ed1mrme4n4bkf",
        product: "Battery Pack",
        amount: 1800000,
        date: "03-07-25/08:30AM",
        status: "Delivered",
        deliveryAddress: "No 15 Broad Street, Apapa Lagos",
        estimatedDelivery: "July 10, 2024",
      },
    ],
  },
  "5": {
    user: {
      name: "Adewale Ade",
      totalOrders: 2,
      pendingOrders: 1,
      successfulOrders: 1,
    },
    orders: [
      {
        id: 1,
        orderId: "12ed1mrme4n4bkf",
        product: "Solar Charge Controller",
        amount: 800000,
        date: "05-07-25/11:15AM",
        status: "Delivered",
        deliveryAddress: "No 20 Opebi Road, Ikeja Lagos",
        estimatedDelivery: "July 11, 2024",
      },
      {
        id: 2,
        orderId: "12ed1mrme4n4bkf",
        product: "Newmana Solar Inverter",
        amount: 4000000,
        date: "04-07-25/17:40PM",
        status: "Pending",
        deliveryAddress: "No 20 Opebi Road, Ikeja Lagos",
        estimatedDelivery: "July 11, 2024",
      },
    ],
  },
  "6": {
    user: {
      name: "Janet Ariel",
      totalOrders: 3,
      pendingOrders: 1,
      successfulOrders: 1,
    },
    orders: [
      {
        id: 1,
        orderId: "12ed1mrme4n4bkf",
        product: "Battery Pack",
        amount: 1800000,
        date: "05-07-25/14:50PM",
        status: "Ordered",
        deliveryAddress: "No 25 Ademola Street, Ikoyi Lagos",
        estimatedDelivery: "July 12, 2024",
      },
      {
        id: 2,
        orderId: "12ed1mrme4n4bkf",
        product: "Solar Panel Kit",
        amount: 2500000,
        date: "04-07-25/10:30AM",
        status: "Delivered",
        deliveryAddress: "No 25 Ademola Street, Ikoyi Lagos",
        estimatedDelivery: "July 12, 2024",
      },
      {
        id: 3,
        orderId: "12ed1mrme4n4bkf",
        product: "Solar Charge Controller",
        amount: 800000,
        date: "03-07-25/16:15PM",
        status: "Pending",
        deliveryAddress: "No 25 Ademola Street, Ikoyi Lagos",
        estimatedDelivery: "July 12, 2024",
      },
    ],
  },
};

// Function to convert UserOrder data to ShopOrderData format
const convertToShopOrderData = (order: any, userName: string): ShopOrderData => {
  return {
    id: order.orderId,
    name: userName,
    productName: order.product,
    amount: `₦${order.amount.toLocaleString()}`,
    date: order.date.split('/')[0], // Extract date part
    time: order.date.split('/')[1] || "00:00AM", // Extract time part
    status: order.status as "Pending" | "Ordered" | "Delivered"
  };
};

const UserOrders = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Orders");
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<ShopOrderData | null>(null);
  const statusDropdownRef = useRef<HTMLDivElement>(null);

  const tabs = ["Activity", "Loans", "Transactions", "Orders"];

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        statusDropdownRef.current &&
        !statusDropdownRef.current.contains(event.target as Node)
      ) {
        document.getElementById("statusDropdown")?.classList.add("hidden");
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Get user-specific data
  const userData = userOrdersData[id as keyof typeof userOrdersData];
  const user = users.find((u) => u.id === id);

  // Fallback if user not found
  if (!userData || !user) {
    return (
      <div className="bg-[#F8FAFC] min-h-screen p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">User not found</h1>
          <button
            onClick={() => navigate("/user-mgt")}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to User Management
          </button>
        </div>
      </div>
    );
  }

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
        // Already on orders page, just update active tab
        break;
      default:
        break;
    }
  };

  const handleNotificationClick = () => {
    console.log("Notification clicked");
  };

  const handleViewDetails = (order: any) => {
    const mappedOrder = convertToShopOrderData(order, userData.user.name);
    setSelectedOrder(mappedOrder);
    setShowOrderModal(true);
  };

  const closeModal = () => {
    setShowOrderModal(false);
    setSelectedOrder(null);
  };

  const filteredOrders = userData.orders.filter((order: any) => {
    if (selectedFilter === "All") return true;
    if (selectedFilter === "Status") return order.status === "Pending";
    return true;
  });

  return (
    <div className="bg-[#F5F7FF] min-h-screen">
      {/* Header Component */}
      <Header
        adminName="Hi, Admin"
        // adminRole="Administrator"
        adminImage="/assets/layout/admin.png"
        // showNotification={true}
        // notificationCount={0}
        onNotificationClick={handleNotificationClick}
        // showAdminRole={false}
      />

      {/* Main Content */}
      <div className="p-6">
        {/* User Header */}
        <div className="mb-5">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {userData.user.name}
          </h1>

          {/* Navigation Tabs */}
          <div className="flex space-x-8 border-b border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabClick(tab)}
                className={`py-2 px-1 border-b-2 font-medium cursor-pointer text-md ${
                  activeTab === tab
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div
            className="bg-white rounded-lg p-6 shadow-sm border border-gray-100"
            style={{ boxShadow: "5px 5px 10px 0px rgba(109, 108, 108, 0.25)" }}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <img
                  src="/assets/images/Users.png"
                  alt="Total Orders"
                  className="w-6 h-6"
                />
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: "#0000FF" }}>
                  Total Orders
                </p>
                <p className="text-2xl font-bold" style={{ color: "#0000FF" }}>
                  {userData.user.totalOrders}
                </p>
              </div>
            </div>
          </div>

          <div
            className="bg-white rounded-lg p-6 shadow-sm border border-gray-100"
            style={{ boxShadow: "5px 5px 10px 0px rgba(109, 108, 108, 0.25)" }}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <img
                  src="/assets/images/Users.png"
                  alt="Pending Orders"
                  className="w-6 h-6"
                />
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: "#0000FF" }}>
                  Pending Orders
                </p>
                <p className="text-2xl font-bold" style={{ color: "#0000FF" }}>
                  {userData.user.pendingOrders}
                </p>
              </div>
            </div>
          </div>

          <div
            className="bg-white rounded-lg p-6 shadow-sm border border-gray-100"
            style={{ boxShadow: "5px 5px 10px 0px rgba(109, 108, 108, 0.25)" }}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <img
                  src="/assets/images/Users.png"
                  alt="Successful Orders"
                  className="w-6 h-6"
                />
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: "#0000FF" }}>
                  Successful Orders
                </p>
                <p className="text-2xl font-bold" style={{ color: "#0000FF" }}>
                  {userData.user.successfulOrders}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Orders Header Section - Separated */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Orders</h2>

          {/* Filter Buttons - Separated Section */}
          <div className="flex justify-between items-center">
            {/* Left side - Filter buttons grouped together */}
            <div className="flex items-center space-x-4">
              <div className="flex bg-white border border-[#CDCDCD] rounded-full p-2">
                {["All", "Loans", "Direct"].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setSelectedFilter(filter)}
                    className={`px-5 py-2.5 rounded-full text-sm font-medium transition-colors cursor-pointer  ${
                      selectedFilter === filter
                        ? "bg-[#273E8E] text-white"
                        : "text-[#000000B2] "
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>

              {/* Status dropdown - matching the image exactly */}
              <div className="relative" ref={statusDropdownRef}>
                <div className="inline-block">
                  <button
                    className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-black bg-white border border-[#DEDEDE] rounded-lg focus:outline-none"
                    onClick={() => {
                      document
                        .getElementById("statusDropdown")
                        ?.classList.toggle("hidden");
                    }}
                    style={{ boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.05)" }}
                  >
                    <span>Status</span>
                    <svg
                      className="w-4 h-4 ml-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                  <div
                    id="statusDropdown"
                    className="absolute z-10 hidden w-[180px] mt-1 bg-white rounded-lg shadow-lg overflow-hidden"
                    style={{ boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)" }}
                  >
                    <div className="py-2">
                      <button
                        onClick={() => {
                          setSelectedFilter("Ordered");
                          document
                            .getElementById("statusDropdown")
                            ?.classList.add("hidden");
                        }}
                        className="block w-full px-6 py-3 text-left text-base font-normal hover:bg-gray-50"
                      >
                        Order Placed
                      </button>
                      <button
                        onClick={() => {
                          setSelectedFilter("Pending");
                          document
                            .getElementById("statusDropdown")
                            ?.classList.add("hidden");
                        }}
                        className="block w-full px-6 py-3 text-left text-base font-normal hover:bg-gray-50"
                      >
                        Pending
                      </button>
                      <button
                        onClick={() => {
                          setSelectedFilter("Delivered");
                          document
                            .getElementById("statusDropdown")
                            ?.classList.add("hidden");
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

            {/* Right side - Search Box */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search"
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

        {/* Orders Table - Completely Separated Section */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-[#EBEBEB]">
                  <th className="px-6 py-4 text-center text-sm font-medium text-black">
                    <input type="checkbox" className="rounded" />
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-black">
                    Order ID
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-black">
                    Product
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
                {filteredOrders.map((order, index) => (
                  <tr
                    key={order.id}
                    className={`${
                      index % 2 === 0 ? "bg-[#F8F8F8]" : "bg-white"
                    } transition-colors border-b border-gray-100 last:border-b-0`}
                  >
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      <input type="checkbox" className="rounded" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black text-center">
                      {order.orderId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black text-center">
                      {order.product}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black text-center">
                      ₦{order.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm  text-black text-center">
                      {order.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span
                        className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full"
                        style={
                          order.status.toLowerCase() === "order placed" ||
                          order.status.toLowerCase() === "ordered"
                            ? { backgroundColor: "#E9F0FF", color: "#273E8E" }
                            : order.status.toLowerCase() === "pending"
                            ? { backgroundColor: "#FFF3E0", color: "#FF8C00" }
                            : order.status.toLowerCase() === "delivered"
                            ? { backgroundColor: "#EEFBEE", color: "#008000" }
                            : order.status.toLowerCase() === "rejected"
                            ? { backgroundColor: "#FFEAEA", color: "#FF0000" }
                            : { backgroundColor: "#F3F4F6", color: "#6B7280" }
                        }
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full mr-1.5"
                          style={{
                            backgroundColor:
                              order.status.toLowerCase() === "order placed" ||
                              order.status.toLowerCase() === "ordered"
                                ? "#273E8E"
                                : order.status.toLowerCase() === "pending"
                                ? "#FF8C00"
                                : order.status.toLowerCase() === "delivered"
                                ? "#008000"
                                : order.status.toLowerCase() === "rejected"
                                ? "#FF0000"
                                : "#6B7280",
                          }}
                        ></span>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                      <button
                        className="text-white px-6 py-2 rounded-full cursor-pointer hover:opacity-90 transition-opacity text-sm font-medium"
                        style={{ backgroundColor: "#273E8E" }}
                        onClick={() => handleViewDetails(order)}
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
      </div>

      {/* Order Details Modal */}
      <OrderDetailModal
        isOpen={showOrderModal}
        order={selectedOrder}
        onClose={closeModal}
      />
    </div>
  );
};

export default UserOrders;
