import { useState } from "react";
import Header from "../../component/Header";
import { shopOrderData } from "./shpmgt";
import images from "../../constants/images";
import type { ShopOrderData } from "./shpmgt";
import TicketDetailModal from "./TicketDetailModal";

//Code Related to the Integration
import { getAllTickets } from "../../utils/queries/tickets";
import { useQuery } from "@tanstack/react-query";
import Cookies from "js-cookie";

const Tickets = () => {
  const [activeFilterTab, setActiveFilterTab] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<ShopOrderData | null>(
    null
  );

  // Integration: fetch tickets from API
  const token = Cookies.get("token");
  const { data: apiTickets, isLoading, isError } = useQuery({
    queryKey: ["all-tickets"],
    queryFn: () => getAllTickets(token || ""),
    enabled: !!token,
  });

  // Extract summary and tickets from API response
  const summary = apiTickets?.data?.summary || {
    total_tickets: shopOrderData.length,
    pending_tickets: shopOrderData.filter((t) => t.status === "Pending")
      .length,
    answered_tickets: shopOrderData.filter((t) => t.status === "Answered")
      .length,
  };

  // Map API response to table data
  const apiTicketData: ShopOrderData[] =
    apiTickets?.data?.tickets?.map((t: any) => ({
      id: String(t.ticket_id),
      name: t.user_name,
      productName: t.subject,
      amount: "", // Not available in API, keep empty
      date: t.date?.split(" ")[0] || "",
      time: t.date?.split(" ")[1] || "",
      status: t.status.charAt(0).toUpperCase() + t.status.slice(1), // "answered" -> "Answered"
    })) || [];

  // Use API data if available, fallback to mock data
  const ticketData = apiTicketData.length > 0 ? apiTicketData : shopOrderData;

  // Filter data based on status, filter tab, and search term
  const filteredOrderData = ticketData.filter((order: ShopOrderData) => {
    const statusMatch =
      activeFilterTab === "All" ||
      order.status.toLowerCase() === activeFilterTab.toLowerCase();
    const searchMatch =
      !searchTerm ||
      order.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.amount.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.date.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.status.toLowerCase().includes(searchTerm.toLowerCase());
    return statusMatch && searchMatch;
  });

  const handleNotificationClick = () => {
    console.log("Notification clicked");
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(ticketData.map((order) => order.id));
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
          <h1 className="text-2xl font-bold text-gray-900">Tickets</h1>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
                  Total Tickets
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {isLoading ? "--" : summary.total_tickets}
                </p>
              </div>
            </div>
          </div>
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
                <p className="text-sm font-medium text-blue-600">Pending</p>
                <p className="text-2xl font-bold text-blue-600">
                  {isLoading ? "--" : summary.pending_tickets}
                </p>
              </div>
            </div>
          </div>
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
                <p className="text-sm font-medium text-blue-600">Answered</p>
                <p className="text-2xl font-bold text-blue-600">
                  {isLoading ? "--" : summary.answered_tickets}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tickets Summary Section */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Tickets Summary
          </h2>
          <div className="flex justify-between items-center mb-4">
            {/* Filter Tabs */}
            <div className="flex bg-white rounded-full border border-[#CDCDCD] p-2 shadow-sm">
              <button
                className={`px-4 py-2 rounded-full text-sm font-medium cursor-pointer ${
                  activeFilterTab === "All"
                    ? "bg-[#273E8E] text-white"
                    : "text-[#000000B2]"
                }`}
                onClick={() => setActiveFilterTab("All")}
              >
                All
              </button>
              <button
                className={`px-4 py-2 rounded-full text-sm font-medium cursor-pointer ${
                  activeFilterTab === "Pending"
                    ? "bg-[#273E8E] text-white"
                    : "text-[#000000B2]"
                }`}
                onClick={() => setActiveFilterTab("Pending")}
              >
                Pending
              </button>
              <button
                className={`px-4 py-2 rounded-full text-sm font-medium cursor-pointer ${
                  activeFilterTab === "Answered"
                    ? "bg-[#273E8E] text-white"
                    : "text-[#000000B2]"
                }`}
                onClick={() => setActiveFilterTab("Answered")}
              >
                Answered
              </button>
              <button
                className={`px-4 py-2 rounded-full text-sm font-medium cursor-pointer ${
                  activeFilterTab === "Closed"
                    ? "bg-[#273E8E] text-white"
                    : "text-[#000000B2]"
                }`}
                onClick={() => setActiveFilterTab("Closed")}
              >
                Closed
              </button>
            </div>
            {/* Search Box */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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

        {/* Tickets Table */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div>
            {isLoading ? (
              <div className="py-16 text-center text-gray-500 text-lg">
                Loading tickets...
              </div>
            ) : isError ? (
              <div className="py-16 text-center text-red-500 text-lg">
                Failed to load tickets.
              </div>
            ) : filteredOrderData.length === 0 ? (
              <div className="py-16 text-center text-gray-500 text-lg">
                No tickets found.
              </div>
            ) : (
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
                      Ticket Id
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-medium text-black">
                      Subject
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
                  {filteredOrderData.map((order: ShopOrderData, index: number) => (
                    <tr
                      key={order.id}
                      className={`${
                        index % 2 === 0 ? "bg-[#F8F8F8]" : "bg-white"
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
                        {order.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                        {order.productName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-center">
                        {order.date}
                        {order.time ? `/${order.time}` : ""}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span
                          className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full min-w-[90px] border"
                          style={{
                            backgroundColor:
                              order.status.toLowerCase() === "answered"
                                ? "#E6F7FF"
                                : order.status.toLowerCase() === "pending"
                                ? "#FFF4E6"
                                : order.status.toLowerCase() === "closed"
                                ? "#FFE6E6"
                                : "#F5F5F5",
                            color:
                              order.status.toLowerCase() === "answered"
                                ? "#008000"
                                : order.status.toLowerCase() === "pending"
                                ? "#FF8C00"
                                : order.status.toLowerCase() === "closed"
                                ? "#FF0000"
                                : "#6B7280",
                            borderColor:
                              order.status.toLowerCase() === "answered"
                                ? "#008000"
                                : order.status.toLowerCase() === "pending"
                                ? "#FF8C00"
                                : order.status.toLowerCase() === "closed"
                                ? "#FF0000"
                                : "#6B7280",
                            borderWidth: "1px",
                            borderStyle: "solid",
                          }}
                        >
                          <span
                            className="w-3 h-3 rounded-full mr-2"
                            style={{
                              backgroundColor:
                                order.status.toLowerCase() === "answered"
                                  ? "#008000"
                                  : order.status.toLowerCase() === "pending"
                                  ? "#FF8C00"
                                  : order.status.toLowerCase() === "closed"
                                  ? "#FF0000"
                                  : "#6B7280",
                              display: "inline-block",
                            }}
                          ></span>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                        <button
                          className="bg-[#273E8E] hover:bg-[#1e3270] text-white px-6 py-3 rounded-full text-sm font-medium transition-colors cursor-pointer"
                          onClick={() => {
                            // Find the ticket from API data if available, else fallback to mock
                            let ticketToShow = order;
                            if (apiTickets?.data?.tickets) {
                              const apiTicket = apiTickets.data.tickets.find(
                                (t: any) => String(t.ticket_id) === order.id
                              );
                              if (apiTicket) {
                                ticketToShow = {
                                  ...order,
                                  id: String(apiTicket.ticket_id),
                                  name: apiTicket.user_name,
                                  productName: apiTicket.subject,
                                  amount: "", // Not available in API
                                  date: apiTicket.date?.split(" ")[0] || "",
                                  time: apiTicket.date?.split(" ")[1] || "",
                                  status: apiTicket.status.charAt(0).toUpperCase() + apiTicket.status.slice(1),
                                  ticket_id: apiTicket.ticket_id // Pass ticket_id explicitly
                                } as ShopOrderData & { ticket_id?: number };
                              }
                            }
                            setSelectedTicket(ticketToShow);
                            setShowTicketModal(true);
                          }}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
      {/* Ticket Detail Modal */}
      <TicketDetailModal
        isOpen={showTicketModal}
        onClose={() => setShowTicketModal(false)}
        ticket={selectedTicket}
      />
    </div>
  );
};

export default Tickets;
