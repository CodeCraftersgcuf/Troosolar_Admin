import React from "react";
import images from "../../constants/images";
import LoadingSpinner from "../common/LoadingSpinner";

//Code Related to the Integration
import { useQuery } from "@tanstack/react-query";
import { getRepaymentHistory } from "../../utils/queries/loans";
import Cookies from "js-cookie";

interface RepaymentHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  loanStatus: "Pending" | "Active" | "Repaid" | "Overdue";
}

interface PaymentData {
  id: number;
  mono_calculation_id: number;
  amount: number;
  payment_date: string;
  status: string;
  computed_status: string;
  paid_at?: string;
  remaining_duration: number;
  transaction?: {
    id: number;
    tx_id: string;
    method: string;
    type: string;
    status: string;
    amount: number;
    reference: string;
    transacted_at: string;
  } | null;
  is_overdue: boolean;
}

const RepaymentHistory: React.FC<RepaymentHistoryProps> = ({
  isOpen,
  onClose,
  userId: userId,
  loanStatus,
}) => {
  console.log("The User ID inside the Repayment History:", userId);
  const token = Cookies.get("token");

  // Fetch repayment history data
  const {
    data: repaymentData,
    isLoading: isRepaymentLoading,
    isError: isRepaymentError,
  } = useQuery({
    queryKey: ["repayment-history", userId],
    queryFn: () => getRepaymentHistory(userId, token || ""),
    enabled: !!userId && !!token && isOpen,
  });

  console.log("Repayment History API Data:", repaymentData);

  if (!isOpen) return null;

  // Get status-specific data
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return { bg: "#FFF4E6", text: "#FF8C00" };
      case "active":
        return { bg: "#E6F7FF", text: "#008000" };
      case "repaid":
        return { bg: "#E8E5FF", text: "#0000FF" };
      case "overdue":
        return { bg: "#FFE6E6", text: "#FF0000" };
      default:
        return { bg: "#F5F5F5", text: "#6B7280" };
    }
  };

  const statusColors = getStatusColor(loanStatus);

  const renderContent = () => {
    // Get API data
    const currentMonthPayments = repaymentData?.data?.current_month || [];
    const historyPayments = repaymentData?.data?.history || [];
    const overdueCount = repaymentData?.data?.overdueCount || 0;

    // If no data available, show appropriate message
    if (currentMonthPayments.length === 0 && historyPayments.length === 0) {
      return (
        <div className="space-y-4">
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">
              No repayment history available.
            </p>
          </div>
        </div>
      );
    }

    // Render current month payments (upcoming/overdue)
    const renderCurrentMonthPayments = () => {
      if (currentMonthPayments.length === 0) return null;

      return currentMonthPayments.map((payment: PaymentData, index: number) => {
        const isOverdue = payment.is_overdue || false;
        const paymentDate = new Date(payment.payment_date);
        const formattedDate = paymentDate.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "long",
          year: "2-digit"
        });

        return (
          <div
            key={payment.id || index}
            className={`border rounded-2xl p-5 ${
              isOverdue 
                ? "border-[#273E8E] bg-white" 
                : "border-[#CDCDCD] bg-white"
            }`}
            style={isOverdue ? { boxShadow: "0px 0px 5px 0px rgba(0, 0, 255, 1)" } : {}}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">
                  {payment.status === "paid" ? "Payment" : "Next Payment"}
                </p>
                <p className={`text-lg font-semibold ${
                  payment.status === "paid" 
                    ? "text-blue-600" 
                    : isOverdue 
                      ? "text-red-600" 
                      : "text-gray-900"
                }`}>
                  {payment.status === "paid" 
                    ? `Paid - ${formattedDate}` 
                    : isOverdue 
                      ? `${overdueCount} days overdue`
                      : formattedDate
                  }
                </p>
              </div>
              <div className="text-right">
                {payment.status !== "paid" && (
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">00</p>
                      <p className="text-xs text-gray-500">Days</p>
                    </div>
                    <span className="text-xl text-gray-400">:</span>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">00</p>
                      <p className="text-xs text-gray-500">Hours</p>
                    </div>
                  </div>
                )}
                <p className="text-lg font-bold text-gray-900">
                  ₦{payment.amount?.toLocaleString() || "60,000"}
                </p>
              </div>
            </div>
          </div>
        );
      });
    };

    // Render history payments
    const renderHistoryPayments = () => {
      if (historyPayments.length === 0) return null;

      return historyPayments.map((payment: PaymentData, index: number) => {
        const paymentDate = new Date(payment.payment_date);
        const formattedDate = paymentDate.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "long",
          year: "2-digit"
        });

        return (
          <div key={payment.id || index} className="border border-[#CDCDCD] p-5 rounded-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Payment</p>
                <p className="text-lg font-semibold text-blue-600">
                  Paid - {formattedDate}
                </p>
              </div>
              <p className="text-lg font-bold text-gray-900">
                ₦{payment.amount?.toLocaleString() || "60,000"}
              </p>
            </div>
          </div>
        );
      });
    };

    return (
      <div className="space-y-4">
        {/* Current Month Payments */}
        {renderCurrentMonthPayments()}
        
        {/* History Payments */}
        {renderHistoryPayments()}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end items-end sm:items-center">
      {/* Overlay */}
      <div
        className="fixed inset-0 backdrop-blur-sm bg-white/30"
        onClick={onClose}
      ></div>

      {/* Modal Container */}
      <div className="relative bg-white w-full h-full sm:max-w-3xl sm:h-auto sm:rounded-2xl z-10 shadow-xl flex flex-col max-h-screen">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Repayment History
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center cursor-pointer"
          >
            <img src={images.cross} alt="" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-10">
          {/* Loan Details */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Loan Details
            </h3>
            {isRepaymentLoading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner message="Loading loan details..." size="md" />
              </div>
            ) : isRepaymentError ? (
              <div className="py-8 text-center text-red-500">
                Failed to load loan details.
              </div>
            ) : (
              <div className=" rounded-2xl border border-[#00000080] p-4 space-y-4">
                <div className="flex justify-between items-center border-b border-[#CDCDCD] py-2">
                  <span className="text-sm text-gray-600 font-medium">
                    Loan Status
                  </span>
                  <span
                    className="px-4 py-1.5 text-sm font-medium rounded-full"
                    style={{
                      backgroundColor: statusColors.bg,
                      color: statusColors.text,
                    }}
                  >
                    {repaymentData?.data?.loan?.status || loanStatus}
                  </span>
                </div>
                <div className="flex justify-between items-center border-b border-[#CDCDCD] py-2">
                  <span className="text-sm text-[#00000080] font-medium">
                    Loan Amount
                  </span>
                  <span className="text-sm font-semibold text-gray-900">
                    ₦{repaymentData?.data?.loan?.loan_amount?.toLocaleString() || "200,000"}
                  </span>
                </div>
                <div className="flex justify-between items-center border-b border-[#CDCDCD] py-2">
                  <span className="text-sm text-[#00000080] font-medium">
                    Interest Rate
                  </span>
                  <span className="text-sm font-semibold text-gray-900">
                    {repaymentData?.data?.loan?.interest_rate || "5"}%
                  </span>
                </div>
                <div className="flex justify-between items-center border-b border-[#CDCDCD] py-2">
                  <span className="text-sm text-[#00000080] font-medium">
                    Loan Period
                  </span>
                  <span className="text-sm font-semibold text-gray-900">
                    {repaymentData?.data?.loan?.repayment_duration || "6"} months
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[#00000080] font-medium">
                    Disbursement Date
                  </span>
                  <span className="text-sm font-semibold text-gray-900">
                    {repaymentData?.data?.loan?.created_at 
                      ? new Date(repaymentData.data.loan.created_at).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric"
                        })
                      : "July 3, 2025"
                    }
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Repayment History */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Repayment History
            </h3>
            {isRepaymentLoading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner message="Loading repayment history..." size="md" />
              </div>
            ) : isRepaymentError ? (
              <div className="py-8 text-center text-red-500">
                Failed to load repayment history.
              </div>
            ) : (
              renderContent()
            )}
          </div>
        </div>

        {/* Footer Action */}
        <div className="p-6 border-t border-gray-200">
          <button
            className="w-full bg-[#273E8E] text-white py-4 rounded-full font-semibold text-lg hover:bg-[#243c8c] transition-colors cursor-pointer"
            onClick={() => {
              console.log("Send notification clicked");
              // Add notification logic here
            }}
          >
            Send Notification
          </button>
        </div>
      </div>
    </div>
  );
};

export default RepaymentHistory;
