import React, { useState, useEffect } from "react";
import images from "../../constants/images";
import LoadingSpinner from "../../components/common/LoadingSpinner";

//Code Related to the Integration
import { getUserKycDetail } from "../../utils/queries/user_kyc";
import { useQuery } from "@tanstack/react-query";
import Cookies from "js-cookie";


type KycProfileProps = {
  isOpen: boolean;
  onClose: () => void;
  userId: number;
  userName: string;
  userEmail?: string;
  userPhone?: string;
  userBvn?: string;
  onSendToPartner: () => void;
};

const KycProfile: React.FC<KycProfileProps> = ({
  userId,
  isOpen,
  onClose,
  userName,
  userEmail = "",
  userPhone = "",
  userBvn = "",
  onSendToPartner,
}) => {
  const [activeKycTab, setActiveKycTab] = useState<
    "personal" | "credit" | "kyc"
  >("personal");
  const [activeKycSubTab, setActiveKycSubTab] = useState<
    "document" | "beneficiary" | "loanDetails"
  >("document");

  console.log("The User ID:", userId);

  // API integration for KYC data
  const token = Cookies.get("token");
  const { data: kycApiData, isLoading: isKycLoading, isError: isKycError } = useQuery({
    queryKey: ["user-kyc-detail", userId],
    queryFn: () => getUserKycDetail(userId, token || ""),
    enabled: isOpen && !!userId && !!token,
  });
  console.log("KYC API Data:", kycApiData);
  console.log("The User ID:", userId);
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
      "Cousin",
    ];
    return relationships[(userId - 1) % relationships.length];
  };

  const getLoanAmount = (userId: number) => {
    const amounts = [
      "₦300,000",
      "₦500,000",
      "₦750,000",
      "₦400,000",
      "₦600,000",
      "₦350,000",
    ];
    return amounts[(userId - 1) % amounts.length];
  };

  const getRepaymentDuration = (userId: number) => {
    const durations = [
      "6 months",
      "12 months",
      "18 months",
      "9 months",
      "15 months",
      "24 months",
    ];
    return durations[(userId - 1) % durations.length];
  };

  // Form data states - initialized with user-specific data
  const [personalData, setPersonalData] = useState({
    firstName: userName?.split(" ")[0] || "",
    surname:
      userName?.split(" ")[1] || userName?.split(" ").slice(1).join(" ") || "",
    email: userEmail,
    phone: userPhone,
    bvn: userBvn,
  });

  const [creditData, setCreditData] = useState({
    accountNumber: `${userId.toString().padStart(10, "0")}`,
    bankName: getUserBankName(userId),
    accountName: userName,
  });

  const [kycData, setKycData] = useState({
    selectedDocument: "National ID",
    beneficiaryName: `${userName} Next of Kin`,
    beneficiaryRelationship: getUserRelationship(userId),
    beneficiaryEmail: `${userName
      ?.split(" ")[0]
      ?.toLowerCase()}.kin@example.com`,
    beneficiaryPhone: `+234 90${userId
      .toString()
      .padStart(2, "0")} 123 456${userId}`,
    loanAmount: getLoanAmount(userId),
    repaymentDuration: getRepaymentDuration(userId),
  });

  // Update form data whenever userId changes or API data is available
  useEffect(() => {
    // Reset tabs to default state when user changes
    setActiveKycTab("personal");
    setActiveKycSubTab("document");

    if (kycApiData?.data) {
      const userData = kycApiData.data.user;
      const loanData = kycApiData.data.loan_application;

      // Update personal data from API
      setPersonalData({
        firstName: userData?.first_name || userName?.split(" ")[0] || "",
        surname: userData?.sur_name || userName?.split(" ")[1] || userName?.split(" ").slice(1).join(" ") || "",
        email: userData?.email || userEmail,
        phone: userData?.phone || userPhone,
        bvn: userData?.bvn || userBvn,
      });

      // Update credit data (using fallback data since not in API)
      setCreditData({
        accountNumber: `${userId.toString().padStart(10, "0")}`,
        bankName: getUserBankName(userId),
        accountName: userData ? `${userData.first_name} ${userData.sur_name}` : userName,
      });

      // Update KYC data from API
      setKycData({
        selectedDocument: loanData?.title_document || "National ID",
        beneficiaryName: loanData?.beneficiary_name || `${userName} Next of Kin`,
        beneficiaryRelationship: loanData?.beneficiary_relationship || getUserRelationship(userId),
        beneficiaryEmail: loanData?.beneficiary_email || `${userName?.split(" ")[0]?.toLowerCase()}.kin@example.com`,
        beneficiaryPhone: loanData?.beneficiary_phone || `+234 90${userId.toString().padStart(2, "0")} 123 456${userId}`,
        loanAmount: loanData?.loan_amount ? `₦${loanData.loan_amount.toLocaleString()}` : getLoanAmount(userId),
        repaymentDuration: loanData?.repayment_duration ? `${loanData.repayment_duration} months` : getRepaymentDuration(userId),
      });
    } else {
      // Fallback to mock data if API data is not available
      setPersonalData({
        firstName: userName?.split(" ")[0] || "",
        surname: userName?.split(" ")[1] || userName?.split(" ").slice(1).join(" ") || "",
        email: userEmail,
        phone: userPhone,
        bvn: userBvn,
      });

      setCreditData({
        accountNumber: `${userId.toString().padStart(10, "0")}`,
        bankName: getUserBankName(userId),
        accountName: userName,
      });

      setKycData({
        selectedDocument: "National ID",
        beneficiaryName: `${userName} Next of Kin`,
        beneficiaryRelationship: getUserRelationship(userId),
        beneficiaryEmail: `${userName?.split(" ")[0]?.toLowerCase()}.kin@example.com`,
        beneficiaryPhone: `+234 90${userId.toString().padStart(2, "0")} 123 456${userId}`,
        loanAmount: getLoanAmount(userId),
        repaymentDuration: getRepaymentDuration(userId),
      });
    }
  }, [userId, userName, userEmail, userPhone, userBvn, kycApiData]);

  // Save functions
  const savePersonalDetails = () => {
    const userKey = `user_personal_${userName
      ?.replace(/\s+/g, "_")
      .toLowerCase()}`;
    localStorage.setItem(userKey, JSON.stringify(personalData));
    alert("Personal details saved successfully!");
  };

  const saveCreditCheck = () => {
    const userKey = `user_credit_${userName
      ?.replace(/\s+/g, "_")
      .toLowerCase()}`;
    localStorage.setItem(userKey, JSON.stringify(creditData));
    alert("Credit check details saved successfully!");
  };

  const saveKycDetails = () => {
    const userKey = `user_kyc_${userName?.replace(/\s+/g, "_").toLowerCase()}`;
    localStorage.setItem(userKey, JSON.stringify(kycData));
    alert("KYC details saved successfully!");
  };

  if (!isOpen) return null;

  return (
    <>
      {/* KYC Profile Modal */}
      <div className="fixed inset-0 z-50 flex justify-end items-end sm:items-center bg-black/30 backdrop-brightness-50 p-4">
        {/* Clickable backdrop */}
        <div className="absolute inset-0" onClick={onClose}></div>

        {/* Modal Box */}
        <div className="relative bg-white w-full max-w-[675px] h-[100vh] rounded-xl shadow-lg overflow-y-auto z-10">
          {/* Loading State */}
          {isKycLoading && (
            <div className="flex items-center justify-center h-full">
              <LoadingSpinner />
            </div>
          )}

          {/* Error State */}
          {isKycError && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-red-500">
                <p className="text-lg font-medium">Failed to load KYC data</p>
                <p className="text-sm mt-2">Please try again later</p>
              </div>
            </div>
          )}

          {/* Content - only show when not loading and no error */}
          {!isKycLoading && !isKycError && (
            <>
              {/* Header */}
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
              <div className="flex border-b px-5 overflow-x-auto">
                <button
                  className={`py-2 px-0 mr-6 cursor-pointer ${activeKycTab === "personal"
                    ? "border-b-4 border-[#273E8E] font-medium text-[#000000]"
                    : "text-[#00000080] cursor-pointer"
                    }`}
                  onClick={() => setActiveKycTab("personal")}
                >
                  Personal Details
                </button>
                <button
                  className={`py-2 px-0 mr-6 cursor-pointer ${activeKycTab === "credit"
                    ? "border-b-4 border-[#273E8E] font-medium text-[#000000]"
                    : "text-[#00000080] cursor-pointer"
                    }`}
                  onClick={() => setActiveKycTab("credit")}
                >
                  Credit Check
                </button>
                <button
                  className={`py-2 px-0 cursor-pointer ${activeKycTab === "kyc"
                    ? "border-b-4 border-[#273E8E] font-medium text-[#000000]"
                    : "text-[#00000080] cursor-pointer"
                    }`}
                  onClick={() => setActiveKycTab("kyc")}
                >
                  KYC Details
                </button>
              </div>

              {/* Personal Details Content */}
              {activeKycTab === "personal" && (
                <div className="p-5">
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded p-2 text-sm"
                      placeholder="Enter your first name"
                      value={personalData.firstName}
                      onChange={(e) =>
                        setPersonalData({
                          ...personalData,
                          firstName: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">
                      Surname
                    </label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded p-2 text-sm"
                      placeholder="Enter your surname"
                      value={personalData.surname}
                      onChange={(e) =>
                        setPersonalData({
                          ...personalData,
                          surname: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      className="w-full border border-gray-300 rounded p-2 text-sm"
                      placeholder="Enter your email address"
                      value={personalData.email}
                      onChange={(e) =>
                        setPersonalData({ ...personalData, email: e.target.value })
                      }
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded p-2 text-sm"
                      placeholder="Enter your phone number"
                      value={personalData.phone}
                      onChange={(e) =>
                        setPersonalData({ ...personalData, phone: e.target.value })
                      }
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">BVN</label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded p-2 text-sm"
                      placeholder="BVN Number"
                      value={personalData.bvn}
                      onChange={(e) =>
                        setPersonalData({ ...personalData, bvn: e.target.value })
                      }
                    />
                  </div>

                  <button
                    className="w-full bg-[#273E8E] cursor-pointer text-white py-3 rounded-full mt-8"
                    onClick={savePersonalDetails}
                  >
                    Save
                  </button>
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
                          setCreditData({ ...creditData, bankName: e.target.value })
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
                    className="w-full bg-[#273E8E] cursor-pointer text-white py-3 rounded-full mt-8"
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
                  <div className="flex mb-6 bg-white border border-[#CDCDCD] rounded-full p-2 w-93">
                    <button
                      onClick={() => {
                        setActiveKycSubTab("document");
                      }}
                      className={`text-sm py-2.5 px-3 cursor-pointer  ${activeKycSubTab === "document"
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
                      className={`text-sm py-2.5 px-3 cursor-pointer ${activeKycSubTab === "beneficiary"
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
                      className={`text-sm py-2.5 px-3 cursor-pointer ${activeKycSubTab === "loanDetails"
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
                      <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">
                          Select Document
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            className="w-full border border-gray-300 rounded p-2 pr-8 text-sm"
                            placeholder="Select Document"
                            value={kycData.selectedDocument}
                            onChange={(e) =>
                              setKycData({
                                ...kycData,
                                selectedDocument: e.target.value,
                              })
                            }
                            readOnly
                          />
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
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
                          Uploaded Document
                        </label>
                        {kycApiData?.data?.loan_application?.upload_document ? (
                          <div className="border border-gray-300 rounded-md p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                                  <svg
                                    width="20"
                                    height="20"
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
                                      stroke="#3B82F6"
                                      strokeWidth="2"
                                    />
                                    <path
                                      d="M8 10H16"
                                      stroke="#3B82F6"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                    />
                                    <path
                                      d="M8 14H16"
                                      stroke="#3B82F6"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                    />
                                    <path
                                      d="M8 18H12"
                                      stroke="#3B82F6"
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
                  )}

                  {/* Beneficiary Content */}
                  {activeKycSubTab === "beneficiary" && (
                    <div>
                      <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">
                          Beneficiary Name
                        </label>
                        <input
                          type="text"
                          className="w-full border border-gray-300 rounded p-2 text-sm"
                          placeholder="Enter beneficiary name"
                          value={kycData.beneficiaryName}
                          onChange={(e) =>
                            setKycData({
                              ...kycData,
                              beneficiaryName: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">
                          Beneficiary Relationship
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            className="w-full border border-gray-300 rounded p-2 pr-8 text-sm"
                            placeholder="Select Relationship"
                            value={kycData.beneficiaryRelationship}
                            onChange={(e) =>
                              setKycData({
                                ...kycData,
                                beneficiaryRelationship: e.target.value,
                              })
                            }
                          />
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
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
                          Beneficiary Email
                        </label>
                        <input
                          type="email"
                          className="w-full border border-gray-300 rounded p-2 text-sm"
                          placeholder="Enter beneficiary email"
                          value={kycData.beneficiaryEmail}
                          onChange={(e) =>
                            setKycData({
                              ...kycData,
                              beneficiaryEmail: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">
                          Beneficiary Phone Number
                        </label>
                        <input
                          type="text"
                          className="w-full border border-gray-300 rounded p-2 text-sm"
                          placeholder="Enter beneficiary phone number"
                          value={kycData.beneficiaryPhone}
                          onChange={(e) =>
                            setKycData({
                              ...kycData,
                              beneficiaryPhone: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  )}

                  {/* Loan Details Content */}
                  {activeKycSubTab === "loanDetails" && (
                    <div>
                      <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">
                          Loan Amount
                        </label>
                        <input
                          type="text"
                          className="w-full border border-gray-300 rounded p-2 text-sm"
                          placeholder="Enter Loan Amount"
                          value={kycData.loanAmount}
                          onChange={(e) =>
                            setKycData({ ...kycData, loanAmount: e.target.value })
                          }
                        />
                      </div>

                      <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">
                          Repayment Duration
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            className="w-full border border-gray-300 rounded p-2 pr-8 text-sm"
                            placeholder="Select Duration"
                            value={kycData.repaymentDuration}
                            onChange={(e) =>
                              setKycData({
                                ...kycData,
                                repaymentDuration: e.target.value,
                              })
                            }
                          />
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
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
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default KycProfile;
