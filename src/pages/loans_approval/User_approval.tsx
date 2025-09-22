import React from "react";
import { users as initialUsers, stats as initialStats } from "../../constants/usermgt";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import UserMgtHeader from "../../components/user_approval/UserMgtHeader";
import UserMgtStats from "../../components/user_approval/UserMgtStats";
import UserMgtTableControls from "../../components/user_approval/UserMgtTableControls";
import UserMgtUsersTable from "../../components/user_approval/UserMgtUsersTable";

// Import Related to the Integration
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { getMonoLoanCalculation } from "../../utils/queries/loans";
import { postMonoLoanCalculationApproval } from "../../utils/mutations/loans";

const User_approval: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);
  const [users] = useState(initialUsers);
  const [showMoreActionsDropdown, setShowMoreActionsDropdown] = useState(false);
  const [showSortByDropdown, setShowSortByDropdown] = useState(false);
  const [selectedSortBy, setSelectedSortBy] = useState("Sort By");
  const [openDropdownIndex, setOpenDropdownIndex] = useState<number | null>(
    null
  );
  const moreActionsRef = useRef<HTMLDivElement>(null!);
  const sortByRef = useRef<HTMLDivElement>(null!);
  const dotsDropdownRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    phone: "",
    bvn: "",
    password: "",
  });
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<{
    id: number;
    user_first_name: string;
    user_sur_name: string;
    user_email: string;
    user_phone: string;
    loan_amount: number;
    repayment_duration: number;
    monthly_payment: string;
    interest_percentage: number;
  } | null>(null);
  const [approvalData, setApprovalData] = useState({
    amount: "",
    duration: "",
  });

  // API integration for mono loan calculations
  const token = Cookies.get("token");
  const { data, isLoading, isError } = useQuery({
    queryKey: ["mono-loan-calculations"],
    queryFn: () => getMonoLoanCalculation(token || ""),
    enabled: !!token,
  });

  console.log("Mono Loan Calculations Data:", data);


  // Approval mutation
  const approvalMutation = useMutation({
    mutationFn: async (payload: { amount: string; duration: string }) => {
      if (!selectedLoan?.id) {
        throw new Error("No loan selected");
      }
      return await postMonoLoanCalculationApproval(selectedLoan.id, payload, token || "");
    },
    onSuccess: () => {
      console.log("Loan approved successfully");
      setShowApprovalModal(false);
      setSelectedLoan(null);
      setApprovalData({ amount: "", duration: "" });
      queryClient.invalidateQueries({ queryKey: ["mono-loan-calculations"] });
    },
    onError: (error) => {
      console.error("Failed to approve loan:", error);
      alert("Failed to approve loan. Please try again.");
    },
  });

  // Map API response to loan calculations table
  const apiUsers = React.useMemo(() => {
    return data?.data?.loan_calculations
      ? data.data.loan_calculations.map((loan: {
        id: number;
        user_first_name: string;
        user_sur_name: string;
        user_email: string;
        user_phone: string;
        loan_amount: number;
        repayment_duration: number;
        monthly_payment: string;
        interest_percentage: number;
        status: string;
        created_at: string;
      }) => ({
        id: String(loan.id),
        name: `${loan.user_first_name} ${loan.user_sur_name}`,
        email: loan.user_email,
        phone: loan.user_phone,
        bvn: "", // Not available in loan calculation data
        date: loan.created_at
          ? new Date(loan.created_at).toLocaleDateString("en-GB")
          : "",
        is_active: loan.status === "pending" ? 1 : 0, // Map status to is_active
        // Store loan data for approval modal
        loanData: {
          id: loan.id,
          user_first_name: loan.user_first_name,
          user_sur_name: loan.user_sur_name,
          user_email: loan.user_email,
          user_phone: loan.user_phone,
          loan_amount: loan.loan_amount,
          repayment_duration: loan.repayment_duration,
          monthly_payment: loan.monthly_payment,
          interest_percentage: loan.interest_percentage,
        }
      }))
      : [];
  }, [data]);

  // Map API response to stats cards
  const stats = data?.data?.summary
    ? [
      {
        label: "Total Calculations",
        value: data.data.summary.total_calculations,
        icon: "/assets/images/Users.png",
      },
      {
        label: "Approved Calculations",
        value: data.data.summary.approved_calculations,
        icon: "/assets/images/Users.png",
      },
      {
        label: "Pending Calculations",
        value: data.data.summary.pending_calculations,
        icon: "/assets/images/Users.png",
      },
    ]
    : initialStats;

  // Handler functions for approval modal
  const handleApproveLoan = (user: { loanData?: any }) => {
    if (user.loanData) {
      setSelectedLoan(user.loanData);
      setApprovalData({
        amount: user.loanData.loan_amount.toString(),
        duration: user.loanData.repayment_duration.toString(),
      });
      setShowApprovalModal(true);
    }
  };

  const handleApprovalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!approvalData.amount || !approvalData.duration) {
      alert("Please fill in all fields");
      return;
    }
    approvalMutation.mutate(approvalData);
  };

  const handleCloseApprovalModal = () => {
    setShowApprovalModal(false);
    setSelectedLoan(null);
    setApprovalData({ amount: "", duration: "" });
  };

  // Filtering and actions
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMoreAction, setSelectedMoreAction] = useState("More Actions");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Use useMemo instead of useEffect + setState to avoid update loops
  const filteredUsers = React.useMemo(() => {
    const baseUsers = apiUsers; // Use only API data, no fallback to dummy data
    let filtered = baseUsers;

    if (selectedMoreAction === "Active") {
      filtered = filtered.filter((u: { is_active: number }) => u.is_active === 1);
    } else if (selectedMoreAction === "Inactive") {
      filtered = filtered.filter((u: { is_active: number }) => u.is_active === 0);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (u: { name: string; email: string; phone: string }) =>
          u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.phone.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [apiUsers, searchTerm, selectedMoreAction]);

  // Pagination logic
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedMoreAction]);

  // Handle search
  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  // Handle More Actions
  const handleAction = (action: string) => {
    setSelectedMoreAction(action);
  };

  // Handle clicks outside dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        moreActionsRef.current &&
        !moreActionsRef.current.contains(event.target as Node)
      ) {
        setShowMoreActionsDropdown(false);
      }
      if (
        sortByRef.current &&
        !sortByRef.current.contains(event.target as Node)
      ) {
        setShowSortByDropdown(false);
      }
      const clickedOutsideAllDropdowns = dotsDropdownRefs.current.every(
        (ref) => !ref || !ref.contains(event.target as Node)
      );
      if (clickedOutsideAllDropdowns) {
        setOpenDropdownIndex(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewUser((prev) => ({
      ...prev,
      [name]: value,
    }));
  };



  // Handle notification click
  const handleNotificationClick = () => {
    console.log("Notification clicked in User Management");
  };

  // Handle user added callback to refresh data
  const handleUserAdded = () => {
    queryClient.invalidateQueries({ queryKey: ["all-users"] });
  };

  return (
    <div className="bg-[#F5F7FF] min-h-screen">
      <UserMgtHeader onNotificationClick={handleNotificationClick} />
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          Loan Approval
        </h1>
        <UserMgtStats stats={stats} isLoading={isLoading} />
        <div className="mb-5">
          <h1 className="font-bold text-2xl">Loan Calculations</h1>
        </div>
        <UserMgtTableControls
          moreActionsRef={moreActionsRef}
          sortByRef={sortByRef}
          showMoreActionsDropdown={showMoreActionsDropdown}
          setShowMoreActionsDropdown={setShowMoreActionsDropdown}
          showSortByDropdown={showSortByDropdown}
          setShowSortByDropdown={setShowSortByDropdown}
          selectedMoreAction={selectedMoreAction}
          setSelectedMoreAction={setSelectedMoreAction}
          selectedSortBy={selectedSortBy}
          setSelectedSortBy={setSelectedSortBy}
          setShowAddModal={setShowAddModal}
          onSearch={handleSearch}
          onAction={handleAction}
          searchTerm={searchTerm}
        />
        {isLoading ? (
          <div className="py-8 text-center">
            <div className="inline-flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#273E8E]"></div>
              <span className="ml-3 text-gray-500">Loading loan calculations...</span>
            </div>
          </div>
        ) : isError ? (
          <div className="py-8 text-center text-red-500">Failed to load loan calculations.</div>
        ) : (
          <>
            <UserMgtUsersTable
              users={currentUsers}
              dotsDropdownRefs={dotsDropdownRefs}
              openDropdownIndex={openDropdownIndex}
              setOpenDropdownIndex={setOpenDropdownIndex}
              navigate={navigate}
              onApproveLoan={handleApproveLoan}
            />

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-white mt-4 rounded-lg shadow-sm">
                <div className="flex items-center text-sm text-gray-700">
                  <span>
                    Showing {startIndex + 1} to {Math.min(endIndex, filteredUsers.length)} of {filteredUsers.length} results
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
          </>
        )}
      </div>
      {/* {showAddModal && (
        <UserMgtAddUserModal
          showAddModal={showAddModal}
          setShowAddModal={setShowAddModal}
          onUserAdded={handleUserAdded}
          newUser={newUser}
          handleInputChange={handleInputChange}
        />
      )} */}

      {/* Approval Modal */}
      {showApprovalModal && selectedLoan && (
        <div className="fixed inset-0 bg-black/40 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Offer Loan</h2>
              <button
                onClick={handleCloseApprovalModal}
                className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {selectedLoan.user_first_name} {selectedLoan.user_sur_name}
              </h3>
              <p className="text-sm text-gray-600 mb-4">{selectedLoan.user_email}</p>

              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <h4 className="font-medium text-gray-900 mb-2">Current Loan Details:</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>Amount: ₦{selectedLoan.loan_amount?.toLocaleString()}</p>
                  <p>Duration: {selectedLoan.repayment_duration} months</p>
                  <p>Monthly Payment: ₦{selectedLoan.monthly_payment}</p>
                  <p>Interest Rate: {selectedLoan.interest_percentage}%</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleApprovalSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Offer Amount
                </label>
                <input
                  type="number"
                  value={approvalData.amount}
                  onChange={(e) => setApprovalData({ ...approvalData, amount: e.target.value })}
                  placeholder="Enter approved amount"
                  className="w-full px-4 py-3 border border-[#CDCDCD] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Offer Duration (months)
                </label>
                <input
                  type="number"
                  value={approvalData.duration}
                  onChange={(e) => setApprovalData({ ...approvalData, duration: e.target.value })}
                  placeholder="Enter approved duration"
                  className="w-full px-4 py-3 border border-[#CDCDCD] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseApprovalModal}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={approvalMutation.isPending}
                  className={`px-6 py-2 rounded-full font-medium transition-colors flex items-center ${approvalMutation.isPending
                      ? 'bg-gray-400 text-white cursor-not-allowed'
                      : 'bg-[#273E8E] text-white hover:bg-[#1f2f7a] cursor-pointer'
                    }`}
                >
                  {approvalMutation.isPending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Offering...
                    </>
                  ) : (
                    'Offer Loan'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};



export default User_approval;
