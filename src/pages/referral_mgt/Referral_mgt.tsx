import { useState, useEffect, useRef, useMemo } from "react";
import { sortOptions } from "./referral";
import Header from "../../component/Header";
import images from "../../constants/images";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { getReferralSettings, getReferralList } from "../../utils/queries/referral";
import { updateReferralSettings } from "../../utils/mutations/referral";
import LoadingSpinner from "../../components/common/LoadingSpinner";

interface ReferralData {
  id: number;
  name: string;
  email: string;
  user_code: string;
  no_of_referral: number;
  amount_earned: string;
  date_joined: string;
}

const Referral_mgt = () => {
  const [selectedReferrals, setSelectedReferrals] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<"name" | "referral_count" | "total_earned" | "created_at" | "default">("default");
  const [sortOrder] = useState<"asc" | "desc">("desc");
  const [searchTerm, setSearchTerm] = useState("");
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [commissionPercentage, setCommissionPercentage] = useState("");
  const [minimumWithdrawal, setMinimumWithdrawal] = useState("");
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

  const token = Cookies.get("token") || "";
  const queryClient = useQueryClient();

  // Fetch referral settings
  const {
    data: settingsResponse,
    isLoading: settingsLoading,
  } = useQuery({
    queryKey: ["referral-settings"],
    queryFn: () => getReferralSettings(token),
    enabled: !!token,
  });

  // Load settings from API when available
  useEffect(() => {
    if (settingsResponse?.data) {
      setCommissionPercentage(settingsResponse.data.commission_percentage?.toString() || "");
      setMinimumWithdrawal(settingsResponse.data.minimum_withdrawal?.toString() || "");
    }
  }, [settingsResponse]);

  // Build query params for referral list
  const queryParams = useMemo(() => {
    const params: any = {
      per_page: itemsPerPage,
      page: currentPage,
    };
    if (searchTerm) {
      params.search = searchTerm;
    }
    if (sortBy !== "default") {
      params.sort_by = sortBy;
      params.sort_order = sortOrder;
    }
    return params;
  }, [searchTerm, sortBy, sortOrder, currentPage, itemsPerPage]);

  // Fetch referral list
  const {
    data: referralListResponse,
    isLoading: referralListLoading,
    isError: referralListError,
  } = useQuery({
    queryKey: ["referral-list", queryParams],
    queryFn: () => getReferralList(token, queryParams),
    enabled: !!token,
  });

  // Extract referral data from API response
  const referralData: ReferralData[] = useMemo(() => {
    return referralListResponse?.data?.data || [];
  }, [referralListResponse]);

  // Extract pagination info
  const pagination = useMemo(() => {
    return referralListResponse?.data?.pagination || {
      current_page: 1,
      last_page: 1,
      per_page: 15,
      total: 0,
    };
  }, [referralListResponse]);

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: (payload: { commission_percentage?: number; minimum_withdrawal?: number }) =>
      updateReferralSettings(payload, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["referral-settings"] });
      alert("Settings updated successfully!");
      setIsSettingsModalOpen(false);
    },
    onError: (error: any) => {
      console.error("Error updating settings:", error);
      const errorMessage = error?.message || error?.data?.message || "Failed to update settings. Please try again.";
      alert(`Error: ${errorMessage}`);
    },
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sortDropdownRef.current &&
        !sortDropdownRef.current.contains(event.target as Node)
      ) {
        setIsSortDropdownOpen(false);
      }
    };

    if (isSortDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSortDropdownOpen]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedReferrals(referralData.map((referral) => referral.id.toString()));
    } else {
      setSelectedReferrals([]);
    }
  };

  const handleSelectReferral = (referralId: string) => {
    setSelectedReferrals((prev) =>
      prev.includes(referralId)
        ? prev.filter((id) => id !== referralId)
        : [...prev, referralId]
    );
  };

  const handleSortSelect = (sortOption: string) => {
    if (sortOption === "default") {
      setSortBy("default");
    } else {
      // Map UI sort options to API sort fields
      const sortMap: Record<string, "name" | "referral_count" | "total_earned" | "created_at"> = {
        name: "name",
        referrals: "referral_count",
        amount: "total_earned",
        date: "created_at",
      };
      setSortBy(sortMap[sortOption] || "created_at");
    }
    setIsSortDropdownOpen(false);
    setCurrentPage(1); // Reset to first page when sorting changes
  };

  const handleSaveSettings = () => {
    // Validate input
    if (!commissionPercentage.trim() || !minimumWithdrawal.trim()) {
      alert("Please fill in both fields before saving.");
      return;
    }

    // Validate commission percentage is a number
    const commissionNum = parseFloat(commissionPercentage);
    if (isNaN(commissionNum) || commissionNum < 0 || commissionNum > 100) {
      alert("Please enter a valid commission percentage between 0 and 100.");
      return;
    }

    // Validate minimum withdrawal is a number
    const withdrawalNum = parseFloat(minimumWithdrawal.replace(/,/g, ""));
    if (isNaN(withdrawalNum) || withdrawalNum < 0) {
      alert("Please enter a valid minimum withdrawal amount.");
      return;
    }

    // Update settings via API
    updateSettingsMutation.mutate({
      commission_percentage: commissionNum,
      minimum_withdrawal: withdrawalNum,
    });
  };

  // Format currency
  const formatCurrency = (value: string | number) => {
    if (!value) return "N0";
    const numValue = typeof value === "string" ? parseFloat(value.replace(/,/g, "")) : value;
    return `N${numValue.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1); // Reset to first page when search changes
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  return (
    <div className="min-h-screen bg-[#F5F7FF]">
      <Header />

      <div className="p-6">
        {/* Header Section with Title and Settings Button */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Referral</h1>
          <button
            onClick={() => setIsSettingsModalOpen(true)}
            className="bg-blue-900 hover:bg-blue-900 text-white cursor-pointer px-5 py-3 rounded-full text-sm font-medium transition-colors"
          >
            Referral Settings
          </button>
        </div>

        {/* Controls Section */}
        <div className="flex items-center justify-between mb-6">
          {/* Sort Dropdown */}
          <div className="relative inline-block text-left" ref={sortDropdownRef}>
            <div>
              <button
                onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                className="inline-flex justify-between w-48 cursor-pointer rounded-md border border-[#00000080] bg-white px-4 py-2 text-sm font-medium text-black shadow-sm focus:outline-none"
              >
                {sortOptions.find((option) => {
                  if (sortBy === "default") return option.value === "default";
                  const sortMap: Record<string, string> = {
                    name: "name",
                    referral_count: "referrals",
                    total_earned: "amount",
                    created_at: "date",
                  };
                  return option.value === sortMap[sortBy];
                })?.label || "Sort by"}
                <img src={images.arrow} alt="" />
              </button>
            </div>

            {isSortDropdownOpen && (
              <div className="absolute mt-2 w-48 origin-top-right rounded-xl shadow-xl bg-white border border-gray-200 z-50">
                <ul className="py-2">
                  {sortOptions.map((option) => (
                    <li
                      key={option.value}
                      onClick={() => handleSortSelect(option.value)}
                      className="px-4 py-2 text-black text-sm cursor-pointer hover:bg-gray-100"
                    >
                      {option.label}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Search Box */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name, email, or user code"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-6 py-3.5 border border-[#00000080] rounded-lg text-[15px] w-[320px] focus:outline-none bg-white shadow-[0_2px_6px_rgba(0,0,0,0.05)] placeholder-gray-400"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-4 w-4 text-gray-400"
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

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {referralListLoading ? (
            <LoadingSpinner message="Loading referral data..." />
          ) : referralListError ? (
            <div className="py-16 text-center text-red-500 text-lg">
              Failed to load referral data. Please try again.
            </div>
          ) : referralData.length === 0 ? (
            <div className="py-16 text-center text-gray-500 text-lg">
              No referrals found.
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  {/* Table Header */}
                  <thead className="bg-[#EBEBEB] border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-center">
                        <input
                          type="checkbox"
                          checked={selectedReferrals.length === referralData.length && referralData.length > 0}
                          onChange={(e) => handleSelectAll(e.target.checked)}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                        />
                      </th>
                      <th className="px-6 py-4 text-center text-sm font-medium text-black">
                        Name
                      </th>
                      <th className="px-6 py-4 text-center text-sm font-medium text-black">
                        No of referral
                      </th>
                      <th className="px-6 py-4 text-center text-sm font-medium text-black">
                        Amount Earned
                      </th>
                      <th className="px-6 py-4 text-center text-sm font-medium text-black">
                        Date joined
                      </th>
                    </tr>
                  </thead>

                  {/* Table Body */}
                  <tbody className="divide-y divide-gray-200">
                    {referralData.map(
                      (referral: ReferralData, index: number) => (
                        <tr
                          key={referral.id}
                          className={`${
                            index % 2 === 0 ? "bg-[#F8F8F8]" : "bg-white"
                          } transition-colors border-b border-gray-100 last:border-b-0`}
                        >
                          <td className="px-6 py-4 text-center">
                            <input
                              type="checkbox"
                              checked={selectedReferrals.includes(referral.id.toString())}
                              onChange={() => handleSelectReferral(referral.id.toString())}
                              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                            />
                          </td>
                          <td className="px-6 py-4 text-sm text-black text-center">
                            {referral.name}
                          </td>
                          <td className="px-6 py-4 text-sm text-black text-center">
                            {referral.no_of_referral}
                          </td>
                          <td className="px-6 py-4 text-sm text-black text-center">
                            {formatCurrency(referral.amount_earned)}
                          </td>
                          <td className="px-6 py-4 text-sm text-black text-center">
                            {referral.date_joined}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              {pagination.last_page > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-white">
                  <div className="flex items-center text-sm text-gray-700">
                    <span>
                      Showing {((pagination.current_page - 1) * pagination.per_page) + 1} to{" "}
                      {Math.min(pagination.current_page * pagination.per_page, pagination.total)} of{" "}
                      {pagination.total} results
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* Previous Button */}
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={pagination.current_page === 1}
                      className={`px-3 py-2 text-sm font-medium rounded-md border ${
                        pagination.current_page === 1
                          ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 cursor-pointer'
                      }`}
                    >
                      Previous
                    </button>

                    {/* Page Numbers */}
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: Math.min(5, pagination.last_page) }, (_, i) => {
                        let pageNumber;
                        if (pagination.last_page <= 5) {
                          pageNumber = i + 1;
                        } else if (pagination.current_page <= 3) {
                          pageNumber = i + 1;
                        } else if (pagination.current_page >= pagination.last_page - 2) {
                          pageNumber = pagination.last_page - 4 + i;
                        } else {
                          pageNumber = pagination.current_page - 2 + i;
                        }

                        return (
                          <button
                            key={pageNumber}
                            onClick={() => setCurrentPage(pageNumber)}
                            className={`px-3 py-2 text-sm font-medium rounded-md border ${
                              pagination.current_page === pageNumber
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
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.last_page))}
                      disabled={pagination.current_page === pagination.last_page}
                      className={`px-3 py-2 text-sm font-medium rounded-md border ${
                        pagination.current_page === pagination.last_page
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
      </div>

      {/* Settings Modal */}
      {isSettingsModalOpen && (
        <div className="fixed inset-0 backdrop-brightness-50 bg-opacity-50 flex items-start justify-end z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Settings</h2>
              <button
                onClick={() => setIsSettingsModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full cursor-pointer transition-colors"
              >
                <img src={images.cross} className="w-7 h-7" alt="" />
              </button>
            </div>

            {/* Form Content */}
            <div className="space-y-6">
              {/* Commission Percentage */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Set Commission Percentage
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Enter a number"
                    value={commissionPercentage}
                    onChange={(e) => setCommissionPercentage(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm pr-10"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl font-light">
                    %
                  </span>
                </div>
              </div>

              {/* Minimum Withdrawal Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Withdrawal amount
                </label>
                <input
                  type="text"
                  placeholder="Enter amount"
                  value={minimumWithdrawal}
                  onChange={(e) => setMinimumWithdrawal(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>

              {/* Save Button */}
              <button
                onClick={handleSaveSettings}
                disabled={updateSettingsMutation.isPending || settingsLoading}
                className={`w-full bg-blue-900 cursor-pointer hover:bg-blue-800 text-white py-3 px-4 rounded-full text-sm font-medium transition-colors mt-8 ${
                  updateSettingsMutation.isPending || settingsLoading
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                {updateSettingsMutation.isPending || settingsLoading ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Referral_mgt;
