import React, { useState } from "react";
import Header from "../../component/Header";
import { getStatusBgColor } from "./loanmgt";
import KycProfile from "./kycprofile";
import images from "../../constants/images";

//Code Related to the Integration
import { getAllLoanStatus } from "../../utils/queries/loans";
import { useQuery } from "@tanstack/react-query";
import Cookies from "js-cookie";


interface DropdownProps {
  options: string[];
  selected: string;
  onSelect: (option: string) => void;
}

const CustomDropdown = ({ options, selected, onSelect }: DropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (option: string) => {
    onSelect(option);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left">
      <div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex justify-between w-40 cursor-pointer rounded-md border border-[#00000080] bg-white px-4 py-2 text-sm font-medium text-black shadow-sm hover:bg-gray-50 focus:outline-none"
        >
          {selected}
          <img src={images.arrow} alt="" />
        </button>
      </div>

      {isOpen && (
        <div className="absolute mt-2 w-48 origin-top-right rounded-xl shadow-xl bg-white border border-gray-200 z-50">
          <ul className="py-2">
            {options.map((option: string, index: number) => (
              <li
                key={index}
                onClick={() => handleSelect(option)}
                className="px-4 py-2 text-black text-sm cursor-pointer hover:bg-gray-100"
              >
                {option}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

const Loans_mgt = () => {
  const [selectedFilter, setSelectedFilter] = useState("More Actions");
  const [sendStatusFilter, setSendStatusFilter] = useState("Send Status");
  const [approvalStatusFilter, setApprovalStatusFilter] =
    useState("Approval Status");
  const [showKycModal, setShowKycModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{
    id: number;
    name: string;
    email?: string;
    phone?: string;
    bvn?: string;
    loan_application_id?: number;
  } | null>(null);
  const [showSendToPartnerModal, setShowSendToPartnerModal] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const handleNotificationClick = () => {
    console.log("Notification clicked");
  };

  // Function to view user details
  const viewUserDetails = (userId: number, userName: string, loanApplicationId: number) => {
    // Create user-specific data based on userId
    const userData = getUserDataById(userId, userName, loanApplicationId);
    setSelectedUser(userData);
    setShowKycModal(true);
  };

  // Function to get user-specific data
  const getUserDataById = (userId: number, userName: string, loanApplicationId: number) => {
    // This would typically come from an API or database
    // For now, we'll create mock data based on userId
    const userData = {
      id: userId,
      name: userName,
      email: `${userName.toLowerCase().replace(/\s+/g, ".")}@example.com`,
      phone: `+234 80${userId.toString().padStart(2, "0")} 234 567${userId}`,
      bvn: `123456789${userId.toString().padStart(2, "0")}`,
      loan_application_id: loanApplicationId, // Add the loan_application_id
      // Add more user-specific fields as needed
      address: `${userId} Lagos Street, Victoria Island, Lagos`,
      occupation: getUserOccupation(userId),
      monthlyIncome: getUserMonthlyIncome(userId),
      bankAccount: `${userId.toString().padStart(10, "0")}`,
      bankName: getUserBankName(userId),
    };
    return userData;
  };

  // Helper functions for user-specific data
  const getUserOccupation = (userId: number) => {
    const occupations = [
      "Software Engineer",
      "Business Analyst",
      "Marketing Manager",
      "Sales Executive",
      "Product Manager",
      "Data Scientist",
    ];
    return occupations[(userId - 1) % occupations.length];
  };

  const getUserMonthlyIncome = (userId: number) => {
    const incomes = [
      "₦450,000",
      "₦380,000",
      "₦520,000",
      "₦420,000",
      "₦600,000",
      "₦350,000",
    ];
    return incomes[(userId - 1) % incomes.length];
  };

  const getUserBankName = (userId: number) => {
    const banks = [
      "Access Bank",
      "GTBank",
      "First Bank",
      "Zenith Bank",
      "UBA",
      "Sterling Bank",
    ];
    return banks[(userId - 1) % banks.length];
  };

  // Function to handle send to partner
  const handleSendToPartner = () => {
    setShowKycModal(false);
    setShowSendToPartnerModal(true);
  };

  // Function to save partner selection
  const savePartnerSelection = () => {
    console.log("Partner selected:", selectedPartner);
    setShowSendToPartnerModal(false);
    setSelectedPartner("");
  };

  // API integration for loans
  const token = Cookies.get("token");
  const { data: loanApiData, isLoading: isLoansLoading, isError: isLoansError } = useQuery({
    queryKey: ["all-loan-status"],
    queryFn: () => getAllLoanStatus(token || ""),
    enabled: !!token,
  });

  console.log("Loan API Data:", loanApiData);
  // Parse API response to get stats and loan list
  const stats = loanApiData?.data
    ? [
      {
        label: "Total Loans",
        value: loanApiData.data["total loans"] ?? 0,
        icon: "/assets/images/Users.png",
      },
      {
        label: "Loans Sent",
        value: loanApiData.data["loan send"] ?? 0,
        icon: "/assets/images/Users.png",
      },
      {
        label: "Loan Approved",
        value: loanApiData.data["loan approved"] ?? 0,
        icon: "/assets/images/Users.png",
      },
    ]
    : [
      {
        label: "Total Loans",
        value: 0,
        icon: "/assets/images/Users.png",
      },
      {
        label: "Loans Sent",
        value: 0,
        icon: "/assets/images/Users.png",
      },
      {
        label: "Loan Approved",
        value: 0,
        icon: "/assets/images/Users.png",
      },
    ];

  // Convert API loan objects to array
  const apiLoanList = loanApiData?.data
    ? Object.keys(loanApiData.data)
      .filter((key) => !isNaN(Number(key)))
      .map((key, idx) => {
        const loan = loanApiData.data[key];
        return {
          id: loan?.id || idx, // Use actual loan ID from API (15, 16, etc.), fallback to index
          name: loan?.name || "Unknown",
          amount: loan?.amount || "N/A", // Use 'amount' field from your API response
          date: loan?.date || "N/A",
          sendStatus: loan?.send_status || "Pending", // Use 'send_status' field from your API response
          approval: loan?.approval_status || "Pending", // Use 'approval_status' field from your API response
          loan_application_id: loan?.loan_application_id || 0,
        };
      })
    : [];
  console.log("API Loan List:", apiLoanList);

  // Filter loan data based on selected filters and search term
  const filteredLoanData = apiLoanList.filter((loan) => {
    const sendStatusMatch =
      sendStatusFilter === "Send Status" ||
      loan.sendStatus === sendStatusFilter;
    const approvalStatusMatch =
      approvalStatusFilter === "Approval Status" ||
      loan.approval === approvalStatusFilter;
    const searchMatch =
      !searchTerm ||
      loan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(loan.amount).toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.date.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.sendStatus.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.approval.toLowerCase().includes(searchTerm.toLowerCase());
    return sendStatusMatch && approvalStatusMatch && searchMatch;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredLoanData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentLoans = filteredLoanData.slice(startIndex, endIndex);

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sendStatusFilter, approvalStatusFilter]);
  console.log("The Selected User:", selectedUser?.loan_application_id);

  return (
    <div className="bg-[#F5F7FF] min-h-screen">
      {/* KYC Profile Modal */}
      {selectedUser && (
        <KycProfile
          userId={selectedUser.loan_application_id || 0}
          isOpen={showKycModal}
          onClose={() => setShowKycModal(false)}
          userName={selectedUser.name}
          userEmail={selectedUser.email}
          userPhone={selectedUser.phone}
          userBvn={selectedUser.bvn}
          onSendToPartner={handleSendToPartner}
        />
      )}

      {/* Send to Partner Modal */}
      {showSendToPartnerModal && (
        <div className="fixed inset-0 z-50 flex justify-end items-start p-4 sm:p-6 bg-black/30 backdrop-brightness-50">
          {/* Clickable backdrop */}
          <div
            className="absolute inset-0"
            onClick={() => setShowSendToPartnerModal(false)}
          ></div>

          {/* Modal Box in Top Right */}
          <div className="relative bg-white w-full max-w-md sm:max-w-lg mt-10 rounded-xl shadow-lg z-10 p-6 sm:p-8 max-h-screen overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Send to partner</h2>
              <button
                className="cursor-pointer"
                onClick={() => setShowSendToPartnerModal(false)}
              >
                <img src={images.cross} alt="" />
              </button>
            </div>

            {/* Select Dropdown */}
            <div className="mb-6">
              <label className="block text-base font-medium mb-2">
                Select Partner
              </label>
              <div className="relative">
                <select
                  className="w-full border border-[#CDCDCD] rounded-md p-4 pr-10 appearance-none text-base"
                  value={selectedPartner}
                  onChange={(e) => setSelectedPartner(e.target.value)}
                >
                  <option value="" disabled>
                    Select Partner
                  </option>
                  <option value="Sterling Bank">Sterling Bank</option>
                  <option value="Access Bank">Access Bank</option>
                  <option value="First Bank">First Bank</option>
                  <option value="GTBank">GTBank</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M6 9L12 15L18 9"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <button
              className="w-full bg-[#273E8E] text-white py-4 rounded-full font-semibold text-base hover:bg-[#243c8c] transition-colors cursor-pointer"
              onClick={savePartnerSelection}
            >
              Save
            </button>
          </div>
        </div>
      )}

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
          <h1 className="text-2xl font-bold text-gray-900">Loans Management</h1>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {isLoansLoading ? (
            // Show loading indicators for 3 stat cards
            Array.from({ length: 3 }).map((_, idx) => (
              <div
                key={idx}
                className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 h-[120px]"
                style={{ boxShadow: "5px 5px 10px 0px rgba(109, 108, 108, 0.25)" }}
              >
                <div className="flex items-center gap-5">
                  <div className="w-17 h-17 bg-[#0000FF33] rounded-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#273E8E]"></div>
                  </div>
                  <div>
                    <div className="h-4 bg-gray-200 rounded w-20 mb-2 animate-pulse"></div>
                    <div className="h-8 bg-gray-200 rounded w-12 animate-pulse"></div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            stats.map((stat, idx) => (
              <div
                key={idx}
                className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 h-[120px]"
                style={{ boxShadow: "5px 5px 10px 0px rgba(109, 108, 108, 0.25)" }}
              >
                <div className="flex items-center gap-5">
                  <div className="w-17 h-17 bg-[#0000FF33] rounded-full flex items-center justify-center">
                    <img
                      src={stat.icon}
                      alt={stat.label}
                      className="w-7 h-7 object-contain"
                    />
                  </div>
                  <div>
                    <p className="text-md font-medium text-[#0000FF]">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-bold text-[#0000FF]">{stat.value}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Loans Summary Section */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-5">
            Loans Summary
          </h2>

          {/* Filter Buttons */}
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              {/* More Actions Dropdown */}
              <CustomDropdown
                options={["More Actions", "Edit", "Delete", "Export"]}
                selected={selectedFilter}
                onSelect={setSelectedFilter}
              />

              {/* Send Status Dropdown */}
              <CustomDropdown
                options={["Send Status", "Pending", "Completed"]}
                selected={sendStatusFilter}
                onSelect={setSendStatusFilter}
              />

              {/* Approval Status Dropdown */}
              <CustomDropdown
                options={[
                  "Approval Status",
                  "Pending",
                  "Completed",
                  "Rejected",
                ]}
                selected={approvalStatusFilter}
                onSelect={setApprovalStatusFilter}
              />
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
                  className="h-5 w-5 text-gray-400"
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

        {/* Loans Table */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="overflow-x-auto">
            {isLoansLoading ? (
              <div className="py-16 text-center">
                <div className="inline-flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#273E8E]"></div>
                  <span className="ml-3 text-gray-500 text-lg">Loading loans...</span>
                </div>
              </div>
            ) : isLoansError ? (
              <div className="py-16 text-center text-red-500 text-lg">
                Failed to load loans.
              </div>
            ) : filteredLoanData.length === 0 ? (
              <div className="py-16 text-center text-gray-500 text-lg">
                No loans found.
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-[#EBEBEB]">
                    <th className="px-6 py-4 text-center text-sm text-black">
                      <input type="checkbox" className="rounded" />
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-medium text-black">
                      Name
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-medium text-black">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-medium text-black">
                      Date
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-medium text-black">
                      Send Status
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-medium text-black">
                      Approval
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-medium text-black">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {currentLoans.map((loan, index) => (
                    <tr
                      key={loan.id}
                      className={`${index % 2 === 0 ? "bg-[#F8F8F8]" : "bg-white"
                        } transition-colors border-b border-gray-100 last:border-b-0`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <input type="checkbox" className="rounded " />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-black text-center">
                        {loan.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-black text-center">
                        {loan.amount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-black text-center">
                        {loan.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span
                          className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full"
                          style={getStatusBgColor(loan.sendStatus)}
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full mr-1.5"
                            style={{
                              backgroundColor:
                                (loan.sendStatus || "").toLowerCase() === "completed"
                                  ? "#008000"
                                  : (loan.sendStatus || "").toLowerCase() === "pending"
                                    ? "#FF8C00"
                                    : (loan.sendStatus || "").toLowerCase() === "delivered"
                                      ? "#008000"
                                      : (loan.sendStatus || "").toLowerCase() === "rejected"
                                        ? "#FF0000"
                                        : "#6B7280",
                            }}
                          ></span>
                          {loan.sendStatus || "Pending"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span
                          className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full"
                          style={getStatusBgColor(loan.approval)}
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full mr-1.5"
                            style={{
                              backgroundColor:
                                (loan.approval || "").toLowerCase() === "completed"
                                  ? "#008000"
                                  : (loan.approval || "").toLowerCase() === "pending"
                                    ? "#FF8C00"
                                    : (loan.approval || "").toLowerCase() === "delivered"
                                      ? "#008000"
                                      : (loan.approval || "").toLowerCase() === "rejected"
                                        ? "#FF0000"
                                        : "#6B7280",
                            }}
                          ></span>
                          {loan.approval || "Pending"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                        <button
                          className="text-white px-6 py-2 rounded-full hover:opacity-90 transition-opacity text-sm font-medium cursor-pointer"
                          style={{ backgroundColor: "#273E8E" }}
                          onClick={() => viewUserDetails(loan.id, loan.name, loan.loan_application_id)}
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

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-white">
              <div className="flex items-center text-sm text-gray-700">
                <span>
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredLoanData.length)} of {filteredLoanData.length} results
                </span>
              </div>

              <div className="flex items-center space-x-2">
                {/* Previous Button */}
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`px-3 py-2 text-sm font-medium rounded-md border ${currentPage === 1
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
                        className={`px-3 py-2 text-sm font-medium rounded-md border ${currentPage === pageNumber
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
      </div>
    </div>
  );
};

export default Loans_mgt;
