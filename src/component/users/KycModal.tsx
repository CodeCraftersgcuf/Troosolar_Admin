import React, { useState, useEffect } from "react";
import type { User } from "../../constants/usermgt";
import images from "../../constants/images";


//Code Related to the Integration
import { getUserKycDetail } from "../../utils/queries/user_kyc";
import { useQuery } from "@tanstack/react-query";
import Cookies from "js-cookie";



type KycModalProps = {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onSendToPartner: () => void;
};

const KycModal: React.FC<KycModalProps> = ({
  isOpen,
  onClose,
  user,
  onSendToPartner,
}) => {
  const [activeKycTab, setActiveKycTab] = useState<
    "personal" | "credit" | "kyc"
  >("personal");
  const [activeKycSubTab, setActiveKycSubTab] = useState<
    "document" | "beneficiary" | "loanDetails"
  >("document");

  const token = Cookies.get("token");

  // Fetch KYC details from API
  const { data: kycApiData, isLoading: isKycLoading, isError: isKycError } = useQuery({
    queryKey: ["user-kyc-detail", user.id],
    queryFn: () => getUserKycDetail(user.id, token || ""),
    enabled: !!token && !!user.id && isOpen,
  });

  console.log("KYC API Data:", kycApiData);

  // Helper functions for user-specific data
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

  const getUserRelationship = (userId: number) => {
    const relationships = [
      "Spouse",
      "Sibling",
      "Parent",
      "Child",
      "Friend",
      "Relative",
    ];
    return relationships[(userId - 1) % relationships.length];
  };

  const getUserLoanAmount = (userId: number) => {
    const amounts = ["₦150,000", "₦200,000", "₦100,000", "₦300,000", "₦250,000"];
    return amounts[(userId - 1) % amounts.length];
  };

  const getUserDuration = (userId: number) => {
    const durations = ["6 months", "12 months", "18 months", "24 months"];
    return durations[(userId - 1) % durations.length];
  };

  // Form data states with user-specific defaults
  const [_personalData, setPersonalData] = useState({
    firstName: user?.name?.split(" ")[0] || "",
    surname: user?.name?.split(" ")[1] || "",
    email: user?.email || "",
    phone: user?.phone || "",
    bvn: user?.bvn || "",
  });

  const [creditData, setCreditData] = useState({
    accountNumber: "",
    bankName: "",
    accountName: "",
  });

  const [kycData, setKycData] = useState({
    selectedDocument: "",
    beneficiaryName: "",
    beneficiaryRelationship: "",
    beneficiaryEmail: "",
    beneficiaryPhone: "",
    loanAmount: "",
    repaymentDuration: "",
  });

  // Initialize with user-specific data when modal opens
  useEffect(() => {
    if (isOpen && user) {
      const userId = parseInt(user?.id || "1");
      
      setPersonalData({
        firstName: user?.name?.split(" ")[0] || "",
        surname: user?.name?.split(" ")[1] || "",
        email: user?.email || "",
        phone: user?.phone || "",
        bvn: user?.bvn || "",
      });

      setCreditData({
        accountNumber: `123456${userId.toString().padStart(4, "0")}`,
        bankName: getUserBankName(userId),
        accountName: user?.name || "",
      });

      setKycData({
        selectedDocument: "Driver's License",
        beneficiaryName: `Beneficiary ${userId}`,
        beneficiaryRelationship: getUserRelationship(userId),
        beneficiaryEmail: `beneficiary${userId}@email.com`,
        beneficiaryPhone: `+234${userId.toString().padStart(10, "0")}`,
        loanAmount: getUserLoanAmount(userId),
        repaymentDuration: getUserDuration(userId),
      });
    }
  }, [isOpen, user]);

  // Save functions
  // const savePersonalDetails = () => {
  //   const userKey = `user_personal_${user?.name
  //     ?.replace(/\s+/g, "_")
  //     .toLowerCase()}`;
  //   localStorage.setItem(userKey, JSON.stringify(personalData));
  //   alert("Personal details saved successfully!");
  // };

  const saveCreditCheck = () => {
    const userKey = `user_credit_${user?.name
      ?.replace(/\s+/g, "_")
      .toLowerCase()}`;
    localStorage.setItem(userKey, JSON.stringify(creditData));
    alert("Credit check details saved successfully!");
  };

  const saveKycDetails = () => {
    const userKey = `user_kyc_${user?.name
      ?.replace(/\s+/g, "_")
      .toLowerCase()}`;
    localStorage.setItem(userKey, JSON.stringify(kycData));
    alert("KYC details saved successfully!");
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex justify-end items-end sm:items-center bg-black/30 backdrop-brightness-50 p-4">
        <div
          className="fixed inset-0 backdrop-brightness-50 bg-opacity-0"
          onClick={onClose}
        ></div>
        <div className="relative bg-white w-full max-w-[675px] h-[100vh] rounded-xl shadow-lg overflow-y-auto z-10">
          <div className="flex justify-between items-center px-5 pt-4 pb-2">
            <h2 className="text-xl font-semibold">User Details</h2>
            <div className="flex items-center">
              <button
                className="bg-[#273E8E] text-white text-sm py-3 px-6 rounded-full mr-3 cursor-pointer"
                onClick={onSendToPartner}
              >
                Send to Partner
              </button>
              <button
                className="text-gray-600 hover:text-gray-900 p-1 cursor-pointer"
                onClick={onClose}
              >
                 <img src={images.cross} alt="" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b px-5">
            <button
              className={`py-2 px-0 mr-6 cursor-pointer ${
                activeKycTab === "personal"
                  ? "border-b-2 border-[#273E8E] font-medium text-[#273E8E]"
                  : "text-gray-500"
              }`}
              onClick={() => setActiveKycTab("personal")}
            >
              Personal Details
            </button>
            <button
              className={`py-2 px-0 mr-6 cursor-pointer ${
                activeKycTab === "credit"
                  ? "border-b-2 border-[#273E8E] font-medium text-[#273E8E]"
                  : "text-gray-500"
              }`}
              onClick={() => setActiveKycTab("credit")}
            >
              Credit Check
            </button>
            <button
              className={`py-2 px-0 cursor-pointer ${
                activeKycTab === "kyc"
                  ? "border-b-2 border-[#273E8E] font-medium text-[#273E8E]"
                  : "text-gray-500"
              }`}
              onClick={() => setActiveKycTab("kyc")}
            >
              KYC Details
            </button>
          </div>

          {/* Personal Details Content */}
          {activeKycTab === "personal" && (
            <div className="p-5">
              {isKycLoading ? (
                <div className="text-center py-8">
                  <div className="text-gray-500">Loading personal details...</div>
                </div>
              ) : isKycError ? (
                <div className="text-center py-8">
                  <div className="text-red-500">Failed to load personal details.</div>
                </div>
              ) : kycApiData?.data?.user ? (
                <div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded p-2 text-sm"
                      value={kycApiData.data.user.first_name || "N/A"}
                      readOnly
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">
                      Surname
                    </label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded p-2 text-sm"
                      value={kycApiData.data.user.sur_name || "N/A"}
                      readOnly
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      className="w-full border border-gray-300 rounded p-2 text-sm"
                      value={kycApiData.data.user.email || "N/A"}
                      readOnly
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded p-2 text-sm"
                      value={kycApiData.data.user.phone || "N/A"}
                      readOnly
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">
                      User Code
                    </label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded p-2 text-sm"
                      value={kycApiData.data.user.user_code || "N/A"}
                      readOnly
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">
                      Referral Code
                    </label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded p-2 text-sm"
                      value={kycApiData.data.user.refferal_code || "N/A"}
                      readOnly
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">
                      Account Status
                    </label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded p-2 text-sm"
                      value={kycApiData.data.user.is_active ? "Active" : "Inactive"}
                      readOnly
                    />
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-500">No personal data available.</div>
                </div>
              )}
            </div>
          )}

          {/* Credit Check Content */}
          {activeKycTab === "credit" && (
            <div className="p-5">
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Account Number
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded p-2 text-sm"
                  placeholder="Enter your account number"
                  value={creditData.accountNumber}
                  onChange={(e) =>
                    setCreditData({
                      ...creditData,
                      accountNumber: e.target.value,
                    })
                  }
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Bank Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded p-2 pr-8 text-sm"
                    placeholder="Enter bank name"
                    value={creditData.bankName}
                    onChange={(e) =>
                      setCreditData({
                        ...creditData,
                        bankName: e.target.value,
                      })
                    }
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg
                      width="16"
                      height="16"
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

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Account Name
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded p-2 text-sm"
                  placeholder="Enter account name"
                  value={creditData.accountName}
                  onChange={(e) =>
                    setCreditData({
                      ...creditData,
                      accountName: e.target.value,
                    })
                  }
                />
              </div>

              <button
                className="w-full bg-[#273E8E] text-white py-3 rounded-full mt-8 cursor-pointer"
                onClick={saveCreditCheck}
              >
                Save
              </button>
            </div>
          )}

          {/* KYC Details Content */}
          {activeKycTab === "kyc" && (
            <div className="p-5">
              {/* Sub tabs for KYC Details */}
              <div className="flex mb-6 bg-white border border-[#CDCDCD] rounded-full p-2 w-80">
                <button
                  onClick={() => {
                    setActiveKycSubTab("document");
                  }}
                  className={`text-sm py-2.5 px-3  cursor-pointer ${
                    activeKycSubTab === "document"
                      ? "bg-[#273E8E] text-white rounded-full"
                      : "bg-white text-[#000000B2]"
                  }`}
                >
                  Document
                </button>
                <button
                  onClick={() => {
                    setActiveKycSubTab("beneficiary");
                  }}
                  className={`text-sm py-2.5 px-3 cursor-pointer ${
                    activeKycSubTab === "beneficiary"
                      ? "bg-[#273E8E] text-white rounded-full"
                      : "bg-white text-[#000000B2]"
                  }`}
                >
                  Beneficiary
                </button>
                <button
                  onClick={() => {
                    setActiveKycSubTab("loanDetails");
                  }}
                  className={`text-sm py-2 px-3  cursor-pointer ${
                    activeKycSubTab === "loanDetails"
                      ? "bg-[#273E8E] text-white rounded-full"
                      : "bg-white text-[#000000B2]"
                  }`}
                >
                  Loan Details
                </button>
              </div>

              {/* Document Content */}
              {activeKycSubTab === "document" && (
                <div>
                  {isKycLoading ? (
                    <div className="text-center py-8">
                      <div className="text-gray-500">Loading document details...</div>
                    </div>
                  ) : isKycError ? (
                    <div className="text-center py-8">
                      <div className="text-red-500">Failed to load document details.</div>
                    </div>
                  ) : kycApiData?.data?.loan_application ? (
                    <div>
                      <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">
                          Document Type
                        </label>
                        <input
                          type="text"
                          className="w-full border border-gray-300 rounded p-2 text-sm"
                          value={kycApiData.data.loan_application.title_document || "N/A"}
                          readOnly
                        />
                      </div>

                      <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">
                          Uploaded Document
                        </label>
                        {kycApiData.data.loan_application.upload_document ? (
                          <div className="border border-gray-300 rounded-md p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                  <svg
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <rect
                                      x="4"
                                      y="2"
                                      width="16"
                                      height="20"
                                      rx="2"
                                      stroke="#6B7280"
                                      strokeWidth="2"
                                    />
                                    <path
                                      d="M8 10H16"
                                      stroke="#6B7280"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                    />
                                    <path
                                      d="M8 14H16"
                                      stroke="#6B7280"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                    />
                                    <path
                                      d="M8 18H12"
                                      stroke="#6B7280"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                    />
                                  </svg>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-900">
                                    {kycApiData.data.loan_application.title_document || "Document"}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {kycApiData.data.loan_application.upload_document}
                                  </p>
                                </div>
                              </div>
                              <a
                                href={`https://troosolar.hmstech.org/${kycApiData.data.loan_application.upload_document}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                              >
                                View
                              </a>
                            </div>
                          </div>
                        ) : (
                          <div className="border border-dashed border-gray-300 rounded-md p-6 text-center">
                            <div className="flex justify-center mb-2">
                              <svg
                                width="48"
                                height="48"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <rect
                                  x="4"
                                  y="2"
                                  width="16"
                                  height="20"
                                  rx="2"
                                  stroke="#D1D5DB"
                                  strokeWidth="2"
                                />
                                <path
                                  d="M8 10H16"
                                  stroke="#D1D5DB"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                />
                                <path
                                  d="M8 14H16"
                                  stroke="#D1D5DB"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                />
                                <path
                                  d="M8 18H12"
                                  stroke="#D1D5DB"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                />
                              </svg>
                            </div>
                            <p className="text-gray-500 text-sm">
                              No document uploaded
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-gray-500">No document data available.</div>
                    </div>
                  )}
                </div>
              )}

              {/* Beneficiary Content */}
              {activeKycSubTab === "beneficiary" && (
                <div>
                  {isKycLoading ? (
                    <div className="text-center py-8">
                      <div className="text-gray-500">Loading beneficiary details...</div>
                    </div>
                  ) : isKycError ? (
                    <div className="text-center py-8">
                      <div className="text-red-500">Failed to load beneficiary details.</div>
                    </div>
                  ) : kycApiData?.data?.loan_application ? (
                    <div>
                      <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">
                          Beneficiary Name
                        </label>
                        <input
                          type="text"
                          className="w-full border border-gray-300 rounded p-2 text-sm"
                          value={kycApiData.data.loan_application.beneficiary_name || "N/A"}
                          readOnly
                        />
                      </div>

                      <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">
                          Beneficiary Relationship
                        </label>
                        <input
                          type="text"
                          className="w-full border border-gray-300 rounded p-2 text-sm"
                          value={kycApiData.data.loan_application.beneficiary_relationship || "N/A"}
                          readOnly
                        />
                      </div>

                      <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">
                          Beneficiary Email
                        </label>
                        <input
                          type="email"
                          className="w-full border border-gray-300 rounded p-2 text-sm"
                          value={kycApiData.data.loan_application.beneficiary_email || "N/A"}
                          readOnly
                        />
                      </div>

                      <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">
                          Beneficiary Phone Number
                        </label>
                        <input
                          type="text"
                          className="w-full border border-gray-300 rounded p-2 text-sm"
                          value={kycApiData.data.loan_application.beneficiary_phone || "N/A"}
                          readOnly
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-gray-500">No beneficiary data available.</div>
                    </div>
                  )}
                </div>
              )}

              {/* Loan Details Content */}
              {activeKycSubTab === "loanDetails" && (
                <div>
                  {isKycLoading ? (
                    <div className="text-center py-8">
                      <div className="text-gray-500">Loading loan details...</div>
                    </div>
                  ) : isKycError ? (
                    <div className="text-center py-8">
                      <div className="text-red-500">Failed to load loan details.</div>
                    </div>
                  ) : kycApiData?.data?.loan_application ? (
                    <div>
                      <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">
                          Loan Amount
                        </label>
                        <input
                          type="text"
                          className="w-full border border-gray-300 rounded p-2 text-sm"
                          value={kycApiData.data.loan_application.loan_amount ? `₦${kycApiData.data.loan_application.loan_amount.toLocaleString()}` : "N/A"}
                          readOnly
                        />
                      </div>

                      <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">
                          Repayment Duration
                        </label>
                        <input
                          type="text"
                          className="w-full border border-gray-300 rounded p-2 text-sm"
                          value={kycApiData.data.loan_application.repayment_duration ? `${kycApiData.data.loan_application.repayment_duration} months` : "N/A"}
                          readOnly
                        />
                      </div>

                      <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">
                          Application Status
                        </label>
                        <input
                          type="text"
                          className="w-full border border-gray-300 rounded p-2 text-sm"
                          value={kycApiData.data.loan_application.status || "Pending"}
                          readOnly
                        />
                      </div>

                      <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">
                          Created Date
                        </label>
                        <input
                          type="text"
                          className="w-full border border-gray-300 rounded p-2 text-sm"
                          value={kycApiData.data.loan_application.created_at ? new Date(kycApiData.data.loan_application.created_at).toLocaleDateString() : "N/A"}
                          readOnly
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-gray-500">No loan details available.</div>
                    </div>
                  )}
                </div>
              )}

              <button
                className="w-full bg-[#273E8E] text-white py-3 rounded-full mt-8 cursor-pointer"
                onClick={saveKycDetails}
              >
                Save
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default KycModal;
