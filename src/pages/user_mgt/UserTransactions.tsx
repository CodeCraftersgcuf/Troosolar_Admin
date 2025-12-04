import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import TransactionSummaryCards from "../../component/TransactionSummaryCards";
import Header from "../../component/Header";
import images from "../../constants/images";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import TransactionDetail from "../transactions/TransactionDetail";

//code related to API call
import { getSingleTransaction } from "../../utils/queries/transactions";
import { useQuery } from "@tanstack/react-query";
import Cookies from "js-cookie";

// User-specific transaction data (unused - kept for reference)
/* const _userTransactionsData = {
  "1": {
    user: {
      name: "Germandon Abudu",
      totalTransactions: 250,
      totalDeposits: 150000,
      totalWithdrawals: 100000,
    },
    transactions: [
      {
        id: 1,
        name: "Germandon Abudu",
        amount: 150000,
        date: "05-07-25/07:22AM",
        type: "Deposit",
        txId: "2383fn2kikdiwi",
        status: "Completed",
      },
      {
        id: 2,
        name: "Germandon Abudu",
        amount: 50000,
        date: "04-07-25/09:15AM",
        type: "Withdrawal - Momo",
        txId: "2383fn2kikdiwi",
        status: "Pending",
      },
      {
        id: 3,
        name: "Germandon Abudu",
        amount: 75000,
        date: "03-07-25/14:30PM",
        type: "Deposit",
        txId: "2383fn2kikdiwi",
        status: "Completed",
      },
    ],
  },
  "2": {
    user: {
      name: "Chiara Lawson",
      totalTransactions: 180,
      totalDeposits: 200000,
      totalWithdrawals: 80000,
    },
    transactions: [
      {
        id: 1,
        name: "Chiara Lawson",
        amount: 100000,
        date: "05-07-25/08:45AM",
        type: "Deposit",
        txId: "2383fn2kikdiwi",
        status: "Completed",
      },
      {
        id: 2,
        name: "Chiara Lawson",
        amount: 30000,
        date: "04-07-25/16:20PM",
        type: "Withdrawal - Opay(payment)",
        txId: "2383fn2kikdiwi",
        status: "Completed",
      },
      {
        id: 3,
        name: "Chiara Lawson",
        amount: 100000,
        date: "03-07-25/11:10AM",
        type: "Deposit",
        txId: "2383fn2kikdiwi",
        status: "Pending",
      },
    ],
  },
  "3": {
    user: {
      name: "Anita Becker",
      totalTransactions: 320,
      totalDeposits: 180000,
      totalWithdrawals: 120000,
    },
    transactions: [
      {
        id: 1,
        name: "Anita Becker",
        amount: 90000,
        date: "05-07-25/12:30PM",
        type: "Withdrawal - Wema(payment)",
        txId: "2383fn2kikdiwi",
        status: "Completed",
      },
      {
        id: 2,
        name: "Anita Becker",
        amount: 180000,
        date: "04-07-25/10:15AM",
        type: "Deposit",
        txId: "2383fn2kikdiwi",
        status: "Completed",
      },
      {
        id: 3,
        name: "Anita Becker",
        amount: 30000,
        date: "03-07-25/15:45PM",
        type: "Withdrawal - Momo",
        txId: "2383fn2kikdiwi",
        status: "Pending",
      },
    ],
  },
  "4": {
    user: {
      name: "Rasheedat Bello",
      totalTransactions: 410,
      totalDeposits: 300000,
      totalWithdrawals: 150000,
    },
    transactions: [
      {
        id: 1,
        name: "Rasheedat Bello",
        amount: 150000,
        date: "05-07-25/09:00AM",
        type: "Deposit",
        txId: "2383fn2kikdiwi",
        status: "Completed",
      },
      {
        id: 2,
        name: "Rasheedat Bello",
        amount: 75000,
        date: "04-07-25/13:25PM",
        type: "Withdrawal - Opay(payment)",
        txId: "2383fn2kikdiwi",
        status: "Pending",
      },
      {
        id: 3,
        name: "Rasheedat Bello",
        amount: 150000,
        date: "03-07-25/08:30AM",
        type: "Deposit",
        txId: "2383fn2kikdiwi",
        status: "Completed",
      },
    ],
  },
  "5": {
    user: {
      name: "Adewale Ade",
      totalTransactions: 275,
      totalDeposits: 220000,
      totalWithdrawals: 90000,
    },
    transactions: [
      {
        id: 1,
        name: "Adewale Ade",
        amount: 120000,
        date: "05-07-25/11:15AM",
        type: "Deposit",
        txId: "2383fn2kikdiwi",
        status: "Completed",
      },
      {
        id: 2,
        name: "Adewale Ade",
        amount: 45000,
        date: "04-07-25/17:40PM",
        type: "Withdrawal - Wema(payment)",
        txId: "2383fn2kikdiwi",
        status: "Completed",
      },
      {
        id: 3,
        name: "Adewale Ade",
        amount: 100000,
        date: "03-07-25/12:20PM",
        type: "Deposit",
        txId: "2383fn2kikdiwi",
        status: "Pending",
      },
    ],
  },
  "6": {
    user: {
      name: "Janet Ariel",
      totalTransactions: 195,
      totalDeposits: 160000,
      totalWithdrawals: 70000,
    },
    transactions: [
      {
        id: 1,
        name: "Janet Ariel",
        amount: 80000,
        date: "05-07-25/14:50PM",
        type: "Deposit",
        txId: "2383fn2kikdiwi",
        status: "Completed",
      },
      {
        id: 2,
        name: "Janet Ariel",
        amount: 35000,
        date: "04-07-25/10:30AM",
        type: "Withdrawal - Momo",
        txId: "2383fn2kikdiwi",
        status: "Pending",
      },
      {
        id: 3,
        name: "Janet Ariel",
        amount: 80000,
        date: "03-07-25/16:15PM",
        type: "Deposit",
        txId: "2383fn2kikdiwi",
        status: "Completed",
      },
    ],
  },
}; */

const UserTransactions = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Transactions");
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [showTransactionDetail, setShowTransactionDetail] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const token = Cookies.get("token");

  // API call for user transactions
  const {
    data: apiData,
    isLoading: isApiLoading,
    isError: isApiError,
  } = useQuery({
    queryKey: ["single-transaction", id],
    queryFn: () => getSingleTransaction(id || "", token || ""),
    enabled: !!id && !!token,
  });

  // Map API response
  const apiUserInfo = apiData?.user_info || {};
  const apiSummary = apiData?.summary || {};
  const apiTransactions = apiData?.transactions || [];

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Element;

      // Check if click is on dropdown button or inside dropdown menu
      const isDropdownButton = target.closest('[data-dropdown-button]');
      const isDropdownMenu = target.closest('[data-dropdown-menu]');

      if (openDropdownId && !isDropdownButton && !isDropdownMenu) {
        setOpenDropdownId(null);
      }

      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef, openDropdownId]);

  // Use API data if available
  const displayUser = apiUserInfo.name ? apiUserInfo : null;
  const displaySummary = apiSummary.total_transactions !== undefined ? apiSummary : null;
  const displayTransactions = apiTransactions;

  // Fallback if user not found
  if (isApiLoading) {
    return (
      <div className="bg-[#F5F7FF] min-h-screen p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner message="Loading user..." />
        </div>
      </div>
    );
  }
  if (!apiUserInfo.name) {
    return (
      <div className="bg-[#F5F7FF] min-h-screen p-8">
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
        // Already on transactions page, just update active tab
        break;
      case "Orders":
        navigate(`/user-activity/${id}/orders`);
        break;
      default:
        break;
    }
  };


  // Filters
  const filteredTransactions = displayTransactions.filter((transaction: any) => {
    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const name = transaction.name?.toLowerCase() || "";
      const txId = (transaction.tx_id || transaction.txId || "").toLowerCase();
      const title = transaction.title?.toLowerCase() || "";
      if (!name.includes(term) && !txId.includes(term) && !title.includes(term)) {
        return false;
      }
    }
    // Tab filters
    if (selectedFilter === "All") return true;
    if (selectedFilter === "Deposit") return transaction.type === "deposit" || transaction.type === "Deposit";
    if (selectedFilter === "Withdrawals") return transaction.type?.toLowerCase().includes("withdrawal");
    if (selectedFilter === "Status") return transaction.status === "Pending" || transaction.status === "pending";
    if (selectedFilter === "Completed") return transaction.status === "Completed" || transaction.status === "paid";
    if (selectedFilter === "Pending") return transaction.status === "Pending" || transaction.status === "pending";
    if (selectedFilter === "Failed") return transaction.status === "Failed" || transaction.status === "failed";
    return true;
  });

  const handleDropdownToggle = (transactionId: string) => {
    setOpenDropdownId(openDropdownId === transactionId ? null : transactionId);
  };

  const handleDropdownAction = (action: string, transaction: any) => {
    if (action === 'View Transaction details') {
      setSelectedTransaction(transaction);
      setShowTransactionDetail(true);
    }
    setOpenDropdownId(null);
  };

  const handleCloseTransactionDetail = () => {
    setShowTransactionDetail(false);
    setSelectedTransaction(null);
  };

  return (
    <div className="bg-[#F5F7FF] min-h-screen">
      {/* Header Component */}
      <Header
        adminName="Hi, Admin"
        adminImage="/assets/layout/admin.png"
        onNotificationClick={() => { }}
      />
      {/* Main Content */}
      <div className="p-6">
        {/* Header */}
        <div className="">
          <h1 className="text-2xl font-bold mb-3">
            {displayUser?.name}
          </h1>
        </div>
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 mb-6">
          {["Activity", "Loans", "Transactions", "Orders"].map((tab) => (
            <button
              key={tab}
              className={`px-4 py-3 text-md font-medium border-b-2 transition-colors cursor-pointer ${activeTab === tab
                  ? "text-black border-b-4 border-[#273E8E]"
                  : "text-[#00000080] border-transparent "
                }`}
              onClick={() => handleTabClick(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
        {/* Summary Cards */}
        {isApiLoading ? (
          <LoadingSpinner message="Loading summary..." />
        ) : isApiError ? (
          <div className="py-8 text-center text-red-500">Failed to load summary.</div>
        ) : (
          <TransactionSummaryCards
            totalTransactions={displaySummary?.total_transactions || 0}
            totalDeposits={displaySummary?.total_deposits || 0}
            totalWithdrawals={displaySummary?.total_withdrawals || 0}
          />
        )}
        {/* Transactions Section */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Transactions</h2>
          {/* Filters Bar - Separate from table */}
          <div className="flex items-center justify-between">
            <div className="flex space-x-4">
              <div className="border border-[#CDCDCD] bg-white p-2 rounded-full flex items-center">
                <button
                  className={`px-5 py-2.5 rounded-full text-sm transition cursor-pointer ${selectedFilter === "All"
                      ? "bg-[#273E8E] text-white"
                      : "bg-white text-[#000000B2]"
                    }`}
                  onClick={() => setSelectedFilter("All")}
                >
                  All
                </button>
                <button
                  className={`px-4 py-2 rounded-full text-sm transition cursor-pointer ${selectedFilter === "Deposit"
                      ? "bg-[#273E8E] text-white"
                      : "bg-white text-[#000000B2]"
                    }`}
                  onClick={() => setSelectedFilter("Deposit")}
                >
                  Deposit
                </button>
                <button
                  className={`px-4 py-2 rounded-full text-sm transition cursor-pointer ${selectedFilter === "Withdrawals"
                      ? "bg-[#273E8E] text-white"
                      : "bg-white text-[#000000B2]"
                    }`}
                  onClick={() => setSelectedFilter("Withdrawals")}
                >
                  Withdrawals
                </button>
              </div>
              <div className="relative inline-block ml-2 mt-1">
                <div className="flex items-center gap-2">
                  <div className="relative" ref={dropdownRef}>
                    <button
                      className="px-6 py-3 border border-[#00000030] rounded-lg text-sm bg-white cursor-pointer pr-10 min-w-[140px] focus:outline-none focus:ring-1 focus:ring-blue-500 flex items-center justify-between"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    >
                      <span className="text-[#333]">
                        {selectedFilter === "Status"
                          ? "Status"
                          : selectedFilter}
                      </span>
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 14 14"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="text-gray-500 absolute right-3"
                      >
                        <path
                          d="M3.5 5.25L7 8.75L10.5 5.25"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                    {isDropdownOpen && (
                      <div className="absolute left-0 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-md z-10">
                        <div
                          className="py-3 px-4 hover:bg-gray-100 cursor-pointer text-[#333] border-b border-gray-100"
                          onClick={() => {
                            setSelectedFilter("All");
                            setIsDropdownOpen(false);
                          }}
                        >
                          Status
                        </div>
                        <div
                          className="py-3 px-4 hover:bg-gray-100 cursor-pointer text-[#333] border-b border-gray-100"
                          onClick={() => {
                            setSelectedFilter("Completed");
                            setIsDropdownOpen(false);
                          }}
                        >
                          Successful
                        </div>
                        <div
                          className="py-3 px-4 hover:bg-gray-100 cursor-pointer text-[#333] border-b border-gray-100"
                          onClick={() => {
                            setSelectedFilter("Pending");
                            setIsDropdownOpen(false);
                          }}
                        >
                          Pending
                        </div>
                        <div
                          className="py-3 px-4 hover:bg-gray-100 cursor-pointer text-[#333]"
                          onClick={() => {
                            setSelectedFilter("Failed");
                            setIsDropdownOpen(false);
                          }}
                        >
                          Failed
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="relative flex items-center w-full">
                <svg
                  className="absolute left-4 h-[18px] w-[18px] text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.7}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="text"
                  placeholder="Search"
                  className="pl-12 pr-6 py-3.5 border border-[#00000080] rounded-lg text-[15px] w-[320px] focus:outline-none bg-white shadow-[0_2px_6px_rgba(0,0,0,0.05)] placeholder-gray-400"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Table Container - Separate white background */}
          {isApiLoading ? (
            <LoadingSpinner message="Loading transactions..." />
          ) : isApiError ? (
            <div className="py-8 text-center text-red-500">Failed to load transactions.</div>
          ) : filteredTransactions.length === 0 ? (
            <div className="py-8 text-center text-gray-500">No transactions found.</div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-[#EBEBEB]">
                    <th className="px-6 py-4 text-center text-xs uppercase tracking-wider">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 w-4 h-4"
                      />
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-black uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-black uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-black uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-black uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-black uppercase tracking-wider">
                      Tx ID
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-black uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-black uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((transaction: any, index: number) => (
                    <tr
                      key={transaction.id}
                      className={`${index % 2 === 0 ? "bg-[#F8F8F8]" : "bg-white"} transition-colors border-b border-gray-100 last:border-b-0`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 w-4 h-4 "
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-black text-center">
                        {transaction.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-black text-center font-medium">
                        ₦{transaction.price ? Number(transaction.price).toLocaleString() : transaction.amount?.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-black text-center">
                        {transaction.date}
                        {transaction.time ? `/${transaction.time}` : ""}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-black text-center">
                        {transaction.payment_method ? (
                          <div>
                            <div className="font-medium">
                              {transaction.payment_method}
                            </div>
                            <div className="text-xs text-gray-500">
                              {transaction.title || transaction.type}
                            </div>
                          </div>
                        ) : (
                          <div className="font-medium">{transaction.type}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-black text-center">
                        {transaction.tx_id || transaction.txId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span
                          className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full ${transaction.status === "Completed" || transaction.status === "paid"
                              ? "border border-[#008000]"
                              : transaction.status === "Pending" || transaction.status === "pending"
                                ? "border border-[#FFA500]"
                                : transaction.status === "Rejected" || transaction.status === "failed"
                                  ? "border border-[#FF0000]"
                                  : "border border-[#6B7280]"
                            }`}
                          style={
                            transaction.status === "Completed" || transaction.status === "paid"
                              ? { backgroundColor: "#00800033", color: "#008000" }
                              : transaction.status === "Pending" || transaction.status === "pending"
                                ? { backgroundColor: "#FFA50033", color: "#FF8C00" }
                                : transaction.status === "Rejected" || transaction.status === "failed"
                                  ? { backgroundColor: "#FF000033", color: "#FF0000" }
                                  : { backgroundColor: "#6B728033", color: "#6B7280" }
                          }
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full mr-1.5"
                            style={{
                              backgroundColor:
                                transaction.status === "Completed" || transaction.status === "paid"
                                  ? "#008000"
                                  : transaction.status === "Pending" || transaction.status === "pending"
                                    ? "#FF8C00"
                                    : transaction.status === "Rejected" || transaction.status === "failed"
                                      ? "#FF0000"
                                      : "#6B7280",
                            }}
                          ></span>
                          {transaction.status === "paid" ? "Completed" : transaction.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center space-x-2 relative">
                          <button
                            className="relative p-2 text-gray-600 hover:text-gray-900"
                            data-dropdown-button
                            onClick={() => handleDropdownToggle(String(transaction.id))}
                          >
                            <img src={images.dots} alt="" />
                          </button>

                          {/* Dropdown Menu */}
                          {openDropdownId === String(transaction.id) && (
                            <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50" data-dropdown-menu>
                              <div className="py-2">
                                <button
                                  className="w-full px-4 py-2 text-left text-sm text-gray-700 cursor-pointer hover:bg-gray-50 transition-colors"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleDropdownAction('View Transaction details', transaction);
                                  }}
                                >
                                  View Transaction details
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Transaction Detail Modal */}
      {showTransactionDetail && selectedTransaction && (
        <TransactionDetail
          isOpen={showTransactionDetail}
          transaction={selectedTransaction}
          onClose={handleCloseTransactionDetail}
        />
      )}
    </div>
  );
};

export default UserTransactions;
