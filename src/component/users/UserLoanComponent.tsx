import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../Header";
import type { User } from "../../constants/usermgt";
import type { LoanDetail } from "./UserLoanData";

//Code Related to the Integration
import { sendToPartnerDetail } from "../../utils/mutations/loans";
import { getAllFinance } from "../../utils/queries/finance";
import { useMutation } from "@tanstack/react-query";


interface ApiLoan {
  loan_application_id: number;
  user_name?: string;
  beneficiary_name?: string;
  loan_amount: number;
  created_at: string;
  loan_status?: {
    send_status: string;
    approval_status: string;
    disbursement_status: string;
  };
}
import KycModal from "./KycModal";
import FullLoanDetail from "../../pages/loans_disbursement/FullLoanDetail";

//Code Related to the Integration
import { useQuery } from "@tanstack/react-query";
import { getFullLoanDetail } from "../../utils/queries/loans";
import Cookies from "js-cookie";

type UserLoanComponentProps = {
  user: User;
  userLoans: LoanDetail[];
};

const UserLoanComponent: React.FC<UserLoanComponentProps> = ({
  user,
}) => {
  const navigate = useNavigate();
  const { id: userIdFromParams } = useParams();
  const token = Cookies.get("token");

  const [showLoanModal, setShowLoanModal] = useState(false);
  const [showKycModal, setShowKycModal] = useState(false);
  const [showSendToPartnerModal, setShowSendToPartnerModal] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState("");
  const [selectedLoanId, setSelectedLoanId] = useState<string>("");


  const {
    data: loanApiData,
    isLoading: isLoanLoading,
    isError: isLoanError,
  } = useQuery({
    queryKey: ["user-loan-detail", userIdFromParams],
    queryFn: () => getFullLoanDetail(userIdFromParams || "", token || ""),
    enabled: !!userIdFromParams && !!token,
  });

  const apiLoans = loanApiData?.data?.loans || [];
  const apiUserInfo = loanApiData?.data?.user_info || {};
  const apiWalletInfo = loanApiData?.data?.wallet_info || {};

  console.log("API Loans Data:", loanApiData);
  const savePartnerSelection = () => {
    const userKey = `user_partner_${user?.name
      ?.replace(/\s+/g, "_")
      .toLowerCase()}`;
    localStorage.setItem(userKey, JSON.stringify({ selectedPartner }));
    alert("Partner selection saved successfully!");
    setShowSendToPartnerModal(false);
  };


  // Function to view loan details
  const viewLoanDetails = (loanId: string) => {
    setSelectedLoanId(loanId);
    setShowLoanModal(true);
  };

  // Status Badge component
  const StatusBadge = ({
    status,
  }: {
    status: "Pending" | "Completed" | "Rejected";
  }) => {
    let style = { backgroundColor: "#FEF3C7", color: "#D97706" }; // Pending - light orange background with darker orange text
    let dotColor = "#D97706";
    let borderClass = "border-[#FFA500] border";

    if (status === "Completed") {
      style = { backgroundColor: "#D1FAE5", color: "#065F46" }; // Completed - light green background with dark green text
      dotColor = "#10B981";
      borderClass = "border-[#008000] border";
    } else if (status === "Rejected") {
      style = { backgroundColor: "#FEE2E2", color: "#DC2626" }; // Rejected - light red background with red text
      dotColor = "#DC2626";
      borderClass = "border-[#FF0000] border";
    }

    return (
      <span
        className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full min-w-[90px] justify-center ${borderClass}`}
        style={style}
      >
        <span
          className="w-2 h-2 rounded-full mr-2"
          style={{ backgroundColor: dotColor }}
        ></span>
        {status}
      </span>
    );
  };

  return (
    <div className="bg-[#F5F7FF] min-h-screen">
      {/* KYC Modal */}
      <KycModal
        isOpen={showKycModal}
        onClose={() => setShowKycModal(false)}
        user={user}
        onSendToPartner={() => {
          setShowSendToPartnerModal(true);
          setShowKycModal(false);
        }}
      />

      {/* Send to Partner Modal */}
      {showSendToPartnerModal && (
        <div className="fixed inset-0 z-50 flex justify-end items-start min-h-screen p-6">
          <div
            className="fixed inset-0 backdrop-brightness-50 bg-black/30"
            onClick={() => setShowSendToPartnerModal(false)}
          ></div>
          <div className="relative bg-white w-[500px] rounded-xl shadow-lg z-10 p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Send to partner</h2>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setShowSendToPartnerModal(false)}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M6 18L18 6M6 6L18 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>

            <div className="mb-6">
              <label className="block text-base font-medium mb-2">
                Select Partnerss
              </label>
              <div className="relative">
                <select
                  className="w-full border border-gray-300 rounded-md p-4 pr-10 appearance-none text-base"
                  value={selectedPartner}
                  onChange={(e) => setSelectedPartner(e.target.value)}
                >
                  <option value="" disabled>
                    Select Partnerss
                  </option>
                  <option value="partner1">Sterling Banssk</option>
                  <option value="partner2">Access Bank</option>
                  <option value="partner3">First Bank</option>
                  <option value="partner4">GTBank</option>
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

            <button
              className="w-full bg-[#2946A9] text-white py-4 rounded-full font-semibold text-base hover:bg-[#243c8c] transition-colors"
              onClick={savePartnerSelection}
            >
              Save
            </button>
          </div>
        </div>
      )}

      {/* Full Loan Detail Modal */}
      <FullLoanDetail
        isOpen={showLoanModal}
        onClose={() => setShowLoanModal(false)}
        loanId={selectedLoanId}
      />

      {/* Header at the very top */}
      <Header />

      {/* Main Content */}
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">
          {apiUserInfo.name || user.name}
        </h1>

        {/* Tabs */}
        <div className="flex gap-8 border-b border-gray-200 mb-6">
          <button
            className="pb-2 cursor-pointer text-[#00000080]"
            onClick={() => navigate(`/user-activity/${user.id}`)}
          >
            Activity
          </button>
          <button className="pb-2 cursor-pointer text-black font-semibold relative">
            Loans
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#273E8E] rounded-full"></div>
          </button>
          <button
            className="pb-2 cursor-pointer text-[#00000080]"
            onClick={() => navigate(`/user-activity/${user.id}/transactions`)}
          >
            Transactions
          </button>
          <button
            className="pb-2 cursor-pointer text-[#00000080]"
            onClick={() => navigate(`/user-activity/${user.id}/orders`)}
          >
            Orders
          </button>
        </div>

        {/* Credit Score & Wallets */}
        <div className="flex flex-wrap gap-6 mb-8">
          <div
            className="bg-gradient-to-br from-[#2946A9] to-[#f9d423] rounded-2xl shadow-lg p-0 flex items-center justify-center min-w-[350px] min-h-[250px] border-2 border-blue-200"
            style={{ boxShadow: "0 4px 24px 0 rgba(41,70,169,0.10)" }}
          >
            <div className="w-full h-full flex items-center justify-center">
              <div className="relative w-[400px] h-[320px] flex items-center justify-center">
                <svg
                  width="340"
                  height="300"
                  viewBox="0 0 340 300"
                  style={{ zIndex: 1 }}
                >
                  <defs>
                    <filter
                      id="gauge-shadow"
                      x="-20%"
                      y="-20%"
                      width="140%"
                      height="140%"
                    >
                      <feDropShadow
                        dx="0"
                        dy="8"
                        stdDeviation="8"
                        flood-color="#bbb"
                      />
                    </filter>
                    <linearGradient id="gauge-arc" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#e53e3e" />
                      <stop offset="100%" stopColor="#38a169" />
                    </linearGradient>
                  </defs>
                  {/* Large white background ellipse with shadow */}
                  <ellipse
                    cx="170"
                    cy="170"
                    rx="130"
                    ry="130"
                    fill="#fff"
                    filter="url(#gauge-shadow)"
                  />
                  {/* Gauge arc (red to green, thinner, fits inside circle) */}
                  <path
                    d="M60,170 A110,110 0 1,1 280,170"
                    fill="none"
                    stroke="url(#gauge-arc)"
                    strokeWidth="10"
                    strokeLinecap="round"
                  />
                  {/* Ticks (green, thin) */}
                  {Array.from({ length: 31 }).map((_, i) => {
                    const angle = Math.PI * (0.75 + (i * 1.5) / 30);
                    const x1 = 170 + 85 * Math.cos(angle);
                    const y1 = 170 + 85 * Math.sin(angle);
                    const x2 = 170 + 110 * Math.cos(angle);
                    const y2 = 170 + 110 * Math.sin(angle);
                    return (
                      <line
                        key={i}
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke="#38a169"
                        strokeWidth="2"
                      />
                    );
                  })}
                  {/* Needle as triangle */}
                  <polygon points="170,170 65,135 170,160" fill="#666" />
                  {/* Center circle overlays needle base */}
                  <circle cx="170" cy="170" r="13" fill="#444" />
                  {/* Centered text */}
                  <text
                    x="170"
                    y="210"
                    fontSize="15"
                    fontWeight="500"
                    fill="#888"
                    textAnchor="middle"
                  >
                    My Credit Score
                  </text>
                  <text
                    x="170"
                    y="250"
                    fontSize="40"
                    fontWeight="bold"
                    fill="#222"
                    textAnchor="middle"
                  >
                    0%
                  </text>
                </svg>
              </div>
            </div>
          </div>
          {/* Wallets */}
          <div className="flex flex-col gap-6 flex-1 min-w-[250px]">
            <div className="flex gap-6">
              <div className="bg-[#273E8E] text-white rounded-2xl shadow-lg flex-1 p-6 flex flex-col justify-between min-w-[200px]">
                <div className="text-[12px] font-semibold text-[#FFFFFFB2] mb-8">
                  Loan Wallet
                </div>
                <div className="text-3xl font-bold mb-6">
                  {apiWalletInfo.loan_balance !== undefined
                    ? `₦${apiWalletInfo.loan_balance}`
                    : "NO"}
                </div>

                <div className="bg-[#1D3073] border border-[#4361C9] rounded-xl p-4">
                  <div className="text-[8px] text-[#FFFFFF80]">
                    Loan Eligible for
                  </div>
                  <div className="text-xl font-semibold mt-1">
                    N500,000
                    <span className="text-lg font-normal">/12months</span>
                  </div>
                </div>
              </div>
              <div className="bg-[#273E8E] text-white rounded-2xl shadow-lg flex-1 p-6 flex flex-col justify-between min-w-[200px]">
                <div className="text-[12px] font-semibold text-[#FFFFFFB2]">
                  General Wallet
                </div>
                <div className="text-3xl font-bold mb-2">
                  {apiWalletInfo.shop_balance !== undefined &&
                    apiWalletInfo.shop_balance !== null
                    ? `₦${apiWalletInfo.shop_balance}`
                    : "N/A"}
                </div>
                <button
                  className="bg-white text-[#000000] cursor-pointer text-sm rounded-full px-8 py-4 font-semibold mt-2"
                  onClick={() => setShowKycModal(true)}
                >
                  KYC Profile
                </button>
              </div>
            </div>

            {/* Next Repayment Section */}
            <div
              className="bg-white rounded-2xl shadow-lg p-6 border border-red-200"
              style={{
                borderColor: "#FFCDD2",
                borderWidth: "1px",
                boxShadow: "0px 4px 16px 0px rgba(255,205,210,0.20)",
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex flex-col space-y-2">
                  <div className="text-gray-400 text-sm">Next Repayment</div>
                  <div className="text-red-500 text-base font-medium">
                    2 days overdue
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="bg-gray-100 rounded-xl px-4 py-2 text-center">
                    <div className="text-2xl font-bold">00</div>
                    <div className="text-xs text-gray-500">Days</div>
                  </div>

                  <div className="flex flex-col mx-1 text-gray-600">
                    <div className="h-1 w-1 bg-gray-600 rounded-full mb-1"></div>
                    <div className="h-1 w-1 bg-gray-600 rounded-full"></div>
                  </div>

                  <div className="bg-gray-100 rounded-xl px-4 py-2 text-center">
                    <div className="text-2xl font-bold">00</div>
                    <div className="text-xs text-gray-500">Hours</div>
                  </div>
                </div>

                <div className="flex flex-col items-end space-y-2">
                  <div className="text-blue-900 text-2xl font-bold">
                    N50,000
                  </div>
                  <button className="bg-blue-900 text-white text-xs px-6 py-2 rounded-full">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Loans Summary Table */}
        <div className="mb-4">
          <div className="mb-2">
            <h2 className="text-xl text-[#000000] font-bold mb-5">
              Loans Summary
            </h2>
          </div>
          {isLoanLoading ? (
            <div className="py-8 text-center text-gray-500">
              Loading loans...
            </div>
          ) : isLoanError ? (
            <div className="py-8 text-center text-red-500">
              Failed to load loans.
            </div>
          ) : apiLoans.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              No loans found for this user.
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-[#EBEBEB] text-black">
                    <th className="p-4 w-12 text-center">
                      <input className="cursor-pointer" type="checkbox" />
                    </th>
                    <th className="p-4 text-center">Name</th>
                    <th className="p-4 text-center">Amount</th>
                    <th className="p-4 text-center">Date</th>
                    <th className="p-4 text-center">Send Status</th>
                    <th className="p-4 text-center">Approval</th>
                    <th className="p-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {apiLoans.map((loan: ApiLoan, idx: number) => (
                    <tr
                      key={loan.loan_application_id}
                      className={`${idx % 2 === 0 ? "bg-[#F8F8F8]" : "bg-white"
                        } hover:bg-gray-50`}
                    >
                      <td className="p-4 text-center">
                        <input className="cursor-pointer" type="checkbox" />
                      </td>
                      <td className="p-4 text-center">
                        {loan.user_name || loan.beneficiary_name || "-"}
                      </td>
                      <td className="p-4 text-center">
                        ₦{loan.loan_amount}
                      </td>
                      <td className="p-4 text-center">
                        {loan.created_at
                          ? new Date(loan.created_at)
                            .toLocaleString("en-GB", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            })
                            .replace(/\//g, "-")
                            .replace(",", "/")
                          : "-"}
                      </td>
                      <td className="p-4 text-center">
                        <StatusBadge
                          status={
                            loan.loan_status?.send_status
                              ? (loan.loan_status.send_status.charAt(0).toUpperCase() +
                                loan.loan_status.send_status.slice(1)) as "Pending" | "Completed" | "Rejected"
                              : "Pending"
                          }
                        />
                      </td>
                      <td className="p-4 text-center">
                        <StatusBadge
                          status={
                            loan.loan_status?.approval_status
                              ? (loan.loan_status.approval_status.charAt(0).toUpperCase() +
                                loan.loan_status.approval_status.slice(1)) as "Pending" | "Completed" | "Rejected"
                              : "Pending"
                          }
                        />
                      </td>
                      <td className="p-4 text-center">
                        <button
                          className="bg-[#273E8E] text-white px-4 py-3 rounded-full text-sm cursor-pointer"
                          onClick={() =>
                            viewLoanDetails(String(loan.loan_application_id))
                          }
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserLoanComponent;
