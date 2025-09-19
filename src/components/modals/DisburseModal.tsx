import React, { useState } from "react";
import images from "../../constants/images";

interface DisburseModalProps {
  isOpen: boolean;
  onClose: () => void;
  loanId: string;
  amount: string;
  onDisburse: (loanId: string, status: string) => void;
}

//Code Related to the Integration
import { useMutation } from "@tanstack/react-query";
import { loanGrant } from "../../utils/mutations/loans";
import Cookies from "js-cookie";

const DisburseModal: React.FC<DisburseModalProps> = ({
  isOpen,
  onClose,
  loanId,
  amount,
  onDisburse,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [editableAmount, setEditableAmount] = useState(
    amount.replace(/[^\d]/g, "")
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const token = Cookies.get("token");

  const statusOptions = [
    { value: "Pending", label: "Pending" },
    { value: "Completed", label: "Completed" },
    { value: "Rejected", label: "Rejected" },
    { value: "active", label: "Active" },
  ];

  const mutation = useMutation({
    mutationFn: async () => {
      return await loanGrant(
        loanId,
        {
          distribute_amount: Number(editableAmount),
          status: selectedStatus,
        },
        token || ""
      );
    },
    onSuccess: (data) => {
      if (onDisburse) {
        onDisburse(loanId, selectedStatus);
      }
      onClose();
      setSelectedStatus("");
      setShowDropdown(false);
      setEditableAmount("");
      setIsSubmitting(false);
      alert(data?.message || "Loan disbursed successfully!");
    },
    onError: (error: any) => {
      setIsSubmitting(false);
      alert(error?.message || "Failed to disburse loan.");
    },
  });

  const handleDisburse = () => {
    if (selectedStatus && editableAmount) {
      setIsSubmitting(true);
      mutation.mutate();
    }
  };

  const handleClose = () => {
    onClose();
    setSelectedStatus("");
    setShowDropdown(false);
    setEditableAmount(amount.replace(/[^\d]/g, ""));
    setIsSubmitting(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-start justify-end sm:justify-end p-0 sm:p-6">
      <div
        className="fixed inset-0 backdrop-brightness-50 bg-white/30"
        onClick={handleClose}
      ></div>

      <div className="relative bg-white rounded-t-2xl sm:rounded-2xl shadow-xl z-10 w-full h-full sm:w-[500px] sm:h-auto sm:max-w-[90vw] boder border-[#CDCDCD]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Loan Disbursement
          </h2>
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center cursor-pointer"
          >
            <img src={images.cross} alt="" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Amount to disburse */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount to disburse
            </label>
            <input
              type="number"
              value={editableAmount}
              onChange={(e) =>
                setEditableAmount(e.target.value.replace(/[^\d]/g, ""))
              }
              min={0}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 font-medium"
              placeholder="Enter amount"
              disabled={isSubmitting}
            />
          </div>

          {/* Change status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Change status
            </label>
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-left flex items-center justify-between hover:border-gray-400 transition-colors cursor-pointer"
                disabled={isSubmitting}
              >
                <span
                  className={selectedStatus ? "text-gray-900" : "text-gray-500"}
                >
                  {selectedStatus || "Change status"}
                </span>
                <svg
                  className={`w-5 h-5 text-gray-400 transition-transform ${
                    showDropdown ? "rotate-180" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {showDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 ">
                  {statusOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setSelectedStatus(option.value);
                        setShowDropdown(false);
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg cursor-pointer"
                      disabled={isSubmitting}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-4 p-6 border-t border-gray-200">
          <button
            onClick={handleClose}
            className="px-6 py-2 text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors cursor-pointer"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            onClick={handleDisburse}
            disabled={!selectedStatus || !editableAmount || isSubmitting}
            className={`px-6 py-2 rounded-full font-medium transition-colors cursor-pointer ${
              selectedStatus && editableAmount && !isSubmitting
                ? "bg-[#273E8E] text-white hover:bg-[#1e2f6b]"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {isSubmitting ? "Processing..." : "Disburse"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DisburseModal;
