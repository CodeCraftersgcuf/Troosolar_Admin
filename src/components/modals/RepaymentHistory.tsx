import React from "react";
import images from "../../constants/images";

interface RepaymentHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  loanId: string;
  loanStatus: "Pending" | "Active" | "Repaid" | "Overdue";
}

const RepaymentHistory: React.FC<RepaymentHistoryProps> = ({
  isOpen,
  onClose,
  loanId: _loanId,
  loanStatus,
}) => {
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
    switch (loanStatus) {
      case "Pending":
        return (
          <div className="space-y-4">
            <div className="text-center py-20">
              <p className="text-gray-400 text-lg">
                No repayment history available.
              </p>
            </div>
          </div>
        );

      case "Active":
        return (
          <div className="space-y-4">
            <div className="bg-white border border-[#CDCDCD] rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Next Payment</p>
                  <p className="text-lg font-semibold text-gray-900">
                    05 July, 25
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">20</p>
                      <p className="text-xs text-gray-500">Days</p>
                    </div>
                    <span className="text-xl text-gray-400">:</span>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">18</p>
                      <p className="text-xs text-gray-500">Hours</p>
                    </div>
                  </div>
                  <p className="text-lg font-bold text-gray-900">₦60,000</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="border border-[#CDCDCD] p-5 rounded-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Next Payment</p>
                    <p className="text-lg font-semibold text-blue-600">
                      Paid - 05 June, 25
                    </p>
                  </div>
                  <p className="text-lg font-bold text-gray-900">₦60,000</p>
                </div>
              </div>

              <div className="border border-[#CDCDCD] p-5 rounded-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Next Payment</p>
                    <p className="text-lg font-semibold text-blue-600">
                      Paid - 05 May, 25
                    </p>
                  </div>
                  <p className="text-lg font-bold text-gray-900">₦60,000</p>
                </div>
              </div>
            </div>
          </div>
        );

      case "Repaid":
        return (
          <div className="space-y-4">
            <div className="border border-[#CDCDCD] p-5 rounded-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Next Payment</p>
                  <p className="text-lg font-semibold text-blue-600">
                    Paid - 05 June, 25
                  </p>
                </div>
                <p className="text-lg font-bold text-gray-900">₦60,000</p>
              </div>
            </div>

            <div className="border border-[#CDCDCD] p-5 rounded-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Next Payment</p>
                  <p className="text-lg font-semibold text-blue-600">
                    Paid - 05 June, 25
                  </p>
                </div>
                <p className="text-lg font-bold text-gray-900">₦60,000</p>
              </div>
            </div>

            <div className="border border-[#CDCDCD] p-5 rounded-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Next Payment</p>
                  <p className="text-lg font-semibold text-blue-600">
                    Paid - 05 May, 25
                  </p>
                </div>
                <p className="text-lg font-bold text-gray-900">₦60,000</p>
              </div>
            </div>
          </div>
        );

      case "Overdue":
        return (
          <div className="space-y-4">
            <div
              className="bg-white border border-[#273E8E] rounded-2xl p-5"
              style={{ boxShadow: "0px 0px 5px 0px rgba(0, 0, 255, 1)" }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Next Payment</p>
                  <p className="text-lg font-semibold text-red-600">
                    2 days overdue
                  </p>
                </div>
                <div className="text-right">
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
                  <p className="text-lg font-bold text-gray-900">₦60,000</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="border border-[#CDCDCD] p-5 rounded-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Next Payment</p>
                    <p className="text-lg font-semibold text-blue-600">
                      Paid - 05 June, 25
                    </p>
                  </div>
                  <p className="text-lg font-bold text-gray-900">₦60,000</p>
                </div>
              </div>

              <div className="border border-[#CDCDCD] p-5 rounded-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Next Payment</p>
                    <p className="text-lg font-semibold text-blue-600">
                      Paid - 05 May, 25
                    </p>
                  </div>
                  <p className="text-lg font-bold text-gray-900">₦60,000</p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
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
                  {loanStatus}
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-[#CDCDCD] py-2">
                <span className="text-sm text-[#00000080] font-medium">
                  Loan Amount
                </span>
                <span className="text-sm font-semibold text-gray-900">
                  ₦200,000
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-[#CDCDCD] py-2">
                <span className="text-sm text-[#00000080] font-medium">
                  Interest Rate
                </span>
                <span className="text-sm font-semibold text-gray-900">5%</span>
              </div>
              <div className="flex justify-between items-center border-b border-[#CDCDCD] py-2">
                <span className="text-sm text-[#00000080] font-medium">
                  Loan Period
                </span>
                <span className="text-sm font-semibold text-gray-900">
                  6 months
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-[#00000080] font-medium">
                  Disbursement Date
                </span>
                <span className="text-sm font-semibold text-gray-900">
                  July 3, 2025
                </span>
              </div>
            </div>
          </div>

          {/* Repayment History */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Repayment History
            </h3>
            {renderContent()}
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
