import { useState } from "react";
import Header from "../../component/Header";
import {
  disbursementData,
  getDisbursementStatusColor,
  getLoanStatusColor,
} from "./loandisbursement";
import FullLoanDetail from "./FullLoanDetail";
import RepaymentHistory from "../../components/modals/RepaymentHistory";
import images from "../../constants/images";

interface StatusToggleProps {
  activeStatus: string;
  setActiveStatus: (status: string) => void;
}

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
          className="inline-flex justify-between w-48 cursor-pointer rounded-md border border-[#00000080] bg-white px-4 py-2 text-sm font-medium text-black shadow-sm hover:bg-gray-50 focus:outline-none"
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

const StatusToggle = ({ activeStatus, setActiveStatus }: StatusToggleProps) => {
  return (
    <div className="flex bg-white rounded-full border border-[#CDCDCD] p-2 shadow-sm w-fit">
      <button
        className={`px-5 py-3 rounded-full text-sm font-medium cursor-pointer transition-colors duration-200 ${
          activeStatus === "approved"
            ? "bg-[#273E8E] text-white"
            : "text-[#000000B2] bg-transparent"
        }`}
        onClick={() => setActiveStatus("approved")}
      >
        Partner Approved
      </button>

      <button
        className={`px-5 py-3 rounded-full text-sm font-medium cursor-pointer transition-colors duration-200 ${
          activeStatus === "pending"
            ? "bg-[#273E8E] text-white"
            : "text-[#000000B2] bg-transparent"
        }`}
        onClick={() => setActiveStatus("pending")}
      >
        Pending Approval
      </button>
    </div>
  );
};

const Loans_disbursement = () => {
  const [selectedFilter, setSelectedFilter] = useState("More Actions");
  const [loanStatusFilter, setLoanStatusFilter] = useState("Loan Status");
  const [disbursementStatusFilter, setDisbursementStatusFilter] = useState(
    "Disbursement Status"
  );
  const [showLoanDetail, setShowLoanDetail] = useState(false);
  const [selectedLoanId, setSelectedLoanId] = useState<string | null>(null);
  const [disbursementList, setDisbursementList] = useState(disbursementData);
  const [showRepaymentHistory, setShowRepaymentHistory] = useState(false);
  const [selectedLoanForHistory, setSelectedLoanForHistory] = useState<{
    id: string;
    status: "Pending" | "Active" | "Repaid" | "Overdue";
  } | null>(null);
  const [activeStatus, setActiveStatus] = useState("approved"); // default to approved

  const handleNotificationClick = () => {
    console.log("Notification clicked");
  };

  const handleViewLoanDetail = (loanId: string) => {
    setSelectedLoanId(loanId);
    setShowLoanDetail(true);
  };

  const handleCloseLoanDetail = () => {
    setShowLoanDetail(false);
    setSelectedLoanId(null);
  };

  const handleViewRepaymentHistory = (
    loanId: string,
    loanStatus: "Pending" | "Active" | "Repaid" | "Overdue"
  ) => {
    setSelectedLoanForHistory({ id: loanId, status: loanStatus });
    setShowRepaymentHistory(true);
  };

  const handleCloseRepaymentHistory = () => {
    setShowRepaymentHistory(false);
    setSelectedLoanForHistory(null);
  };

  // Handle disbursement status update
  const handleDisbursementUpdate = (loanId: string, status: string) => {
    setDisbursementList((prevList) =>
      prevList.map((loan) =>
        loan.id === loanId
          ? { ...loan, disbursement: status as "Pending" | "Completed" }
          : loan
      )
    );
  };

  // Filter disbursement data based on selected filters
  const filteredDisbursementData = disbursementList.filter((loan) => {
    const loanStatusMatch =
      loanStatusFilter === "Loan Status" ||
      loan.loanStatus === loanStatusFilter;
    const disbursementStatusMatch =
      disbursementStatusFilter === "Disbursement Status" ||
      loan.disbursement === disbursementStatusFilter;
    // Not filtering by activeStatus so it doesn't affect the table data
    return loanStatusMatch && disbursementStatusMatch;
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
      <div className="p-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-black">
            Loans Disbursement
          </h1>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 h-[120px]">
          <div
            className="bg-white rounded-lg p-6 shadow-sm border border-gray-100"
            style={{ boxShadow: "5px 5px 10px 0px rgba(109, 108, 108, 0.25)" }}
          >
            <div className="flex items-center gap-5">
              <div className="w-17 h-17 bg-[#0000FF33] rounded-full flex items-center justify-center">
                <img
                  src="/assets/images/Users.png"
                  alt="Total Loans"
                  className="w-7 h-7 object-contain"
                />
              </div>
              <div>
                <p className="text-sm font-medium text-[#0000FF]">
                  Total Loans
                </p>
                <p className="text-2xl font-bold text-[#0000FF]">30</p>
              </div>
            </div>
          </div>

          <div
            className="bg-white rounded-lg p-6 shadow-sm border border-gray-100"
            style={{ boxShadow: "5px 5px 10px 0px rgba(109, 108, 108, 0.25)" }}
          >
            <div className="flex items-center gap-4">
              <div className="w-17 h-17 bg-[#0000FF33] rounded-full flex items-center justify-center">
                <img
                  src="/assets/images/Users.png"
                  alt="Loans Disbursed"
                  className="w-7 h-7 object-contain"
                />
              </div>
              <div>
                <p className="text-sm font-medium text-[#0000FF]">
                  Loans Disbursed
                </p>
                <p className="text-2xl font-bold text-[#0000FF]">5</p>
              </div>
            </div>
          </div>

          <div
            className="bg-white rounded-lg p-6 shadow-sm border border-gray-100"
            style={{ boxShadow: "5px 5px 10px 0px rgba(109, 108, 108, 0.25)" }}
          >
            <div className="flex items-center gap-4">
              <div className="w-17 h-17 bg-[#0000FF33] rounded-full flex items-center justify-center">
                <img
                  src="/assets/images/Users.png"
                  alt="Amount Disbursed"
                  className="w-7 h-7 object-contain"
                />
              </div>
              <div>
                <p className="text-sm font-medium text-[#0000FF]">
                  Amount Disbursed
                </p>
                <p className="text-2xl font-bold text-[#0000FF]">N2,000,000</p>
              </div>
            </div>
          </div>
        </div>

        {/* Disbursement Summary Section */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-black mb-4">
            Disbursement Summary
          </h2>

          {/* Filter Tabs and Dropdowns */}
          <div className="flex justify-between items-start">
            <div className="flex flex-col space-y-4">
              {/* Filter Tabs Row */}
              <StatusToggle
                activeStatus={activeStatus}
                setActiveStatus={setActiveStatus}
              />

              {/* Dropdowns Row */}
              <div className="flex items-center space-x-4">
                {/* More Actions Dropdown */}
                <CustomDropdown
                  options={["More Actions", "Export", "Print"]}
                  selected={selectedFilter}
                  onSelect={setSelectedFilter}
                />

                {/* Loan Status Dropdown */}
                <CustomDropdown
                  options={[
                    "Loan Status",
                    "Active",
                    "Repaid",
                    "Overdue",
                    "Pending",
                  ]}
                  selected={loanStatusFilter}
                  onSelect={setLoanStatusFilter}
                />

                {/* Disbursement Status Dropdown */}
                <CustomDropdown
                  options={["Disbursement Status", "Pending", "Completed"]}
                  selected={disbursementStatusFilter}
                  onSelect={setDisbursementStatusFilter}
                />
              </div>
            </div>

            {/* Search Box */}
            <div className="relative mt-15">
              <input
                type="text"
                placeholder="Search"
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

        {/* Disbursement Table */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-[#EBEBEB]">
                  <th className="px-6 py-4 text-center text-sm font-medium text-black">
                    <input type="checkbox" className="rounded" />
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-black">
                    Name
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-black">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-black">
                    Duration
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-black">
                    Disbursement
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-black">
                    Loan Status
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-black">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {filteredDisbursementData.map((loan, index) => (
                  <tr
                    key={loan.id}
                    className={`${
                      index % 2 === 0 ? "bg-[#F8F8F8]" : "bg-white"
                    } transition-colors border-b border-gray-100 last:border-b-0`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <input type="checkbox" className="rounded" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black text-center">
                      {loan.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black text-center">
                      {loan.amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black text-center">
                      {loan.duration}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span
                        className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full"
                        style={getDisbursementStatusColor(loan.disbursement)}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full mr-1.5"
                          style={{
                            backgroundColor:
                              loan.disbursement.toLowerCase() === "completed"
                                ? "#008000"
                                : loan.disbursement.toLowerCase() === "pending"
                                ? "#FF8C00"
                                : "#6B7280",
                          }}
                        ></span>
                        {loan.disbursement}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span
                        className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full"
                        style={getLoanStatusColor(loan.loanStatus)}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full mr-1.5"
                          style={{
                            backgroundColor:
                              loan.loanStatus.toLowerCase() === "active"
                                ? "#008000"
                                : loan.loanStatus.toLowerCase() === "repaid"
                                ? "#0000FF"
                                : loan.loanStatus.toLowerCase() === "overdue"
                                ? "#FF0000"
                                : loan.loanStatus.toLowerCase() === "pending"
                                ? "#FF8C00"
                                : "#6B7280",
                          }}
                        ></span>
                        {loan.loanStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          className="cursor-pointer"
                          onClick={() =>
                            handleViewRepaymentHistory(loan.id, loan.loanStatus)
                          }
                        >
                          <img
                            src="/assets/images/eye.svg"
                            alt="View"
                            className="w-8 h-8 object-contain"
                          />
                        </button>
                        {loan.disbursement === "Pending" ? (
                          <button
                            className="text-white px-8 py-3.5 rounded-full hover:opacity-90 transition-opacity text-xs font-medium cursor-pointer"
                            style={{ backgroundColor: "#273E8E" }}
                            onClick={() => handleViewLoanDetail(loan.id)}
                          >
                            Send Loan
                          </button>
                        ) : (
                          <button
                            className="text-white px-7 py-3.5 rounded-full cursor-pointer hover:opacity-90 transition-opacity text-xs font-medium"
                            style={{ backgroundColor: "#273E8E" }}
                            onClick={() => handleViewLoanDetail(loan.id)}
                          >
                            View Details
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Full Loan Detail Modal */}
      {showLoanDetail && selectedLoanId && (
        <FullLoanDetail
          isOpen={showLoanDetail}
          loanId={selectedLoanId}
          onClose={handleCloseLoanDetail}
          onDisbursementUpdate={handleDisbursementUpdate}
        />
      )}

      {/* Repayment History Modal */}
      {showRepaymentHistory && selectedLoanForHistory && (
        <RepaymentHistory
          isOpen={showRepaymentHistory}
          loanId={selectedLoanForHistory.id}
          loanStatus={selectedLoanForHistory.status}
          onClose={handleCloseRepaymentHistory}
        />
      )}
    </div>
  );
};

export default Loans_disbursement;
