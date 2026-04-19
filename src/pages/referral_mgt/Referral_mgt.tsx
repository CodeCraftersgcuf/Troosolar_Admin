import { useState, useEffect, useRef, useMemo } from "react";
import { sortOptions } from "./referral";
import Header from "../../component/Header";
import images from "../../constants/images";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { getReferralSettings, getReferralList, getReferredSignups } from "../../utils/queries/referral";
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

interface ReferredSignupRow {
  id: number;
  name: string;
  email: string;
  code_used: string;
  referrer_name: string | null;
  referrer_email: string | null;
  referrer_user_code: string | null;
  joined_at: string | null;
}

const Referral_mgt = () => {
  const [selectedReferrals, setSelectedReferrals] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<"name" | "referral_count" | "total_earned" | "created_at" | "default">("default");
  const [sortOrder] = useState<"asc" | "desc">("desc");
  const [searchTerm, setSearchTerm] = useState("");
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [minimumWithdrawal, setMinimumWithdrawal] = useState("");
  const [rewardType, setRewardType] = useState<"fixed" | "percentage">("fixed");
  const [fixedRewardNgn, setFixedRewardNgn] = useState("");
  const [percentageReward, setPercentageReward] = useState("");
  const [outrightDiscount, setOutrightDiscount] = useState("");
  const [referredSearchTerm, setReferredSearchTerm] = useState("");
  const [referredPage, setReferredPage] = useState(1);
  const [referredPerPage] = useState(10);
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
      const d = settingsResponse.data;
      setMinimumWithdrawal(d.minimum_withdrawal?.toString() || "");
      const rt = d.referral_reward_type === "percentage" ? "percentage" : "fixed";
      setRewardType(rt);
      const fixed =
        d.referral_fixed_ngn != null && d.referral_fixed_ngn !== ""
          ? String(d.referral_fixed_ngn)
          : d.referral_reward_value != null && rt === "fixed"
            ? String(d.referral_reward_value)
            : "";
      setFixedRewardNgn(fixed);
      const pctRaw =
        d.referral_percentage != null && d.referral_percentage !== ""
          ? d.referral_percentage
          : d.commission_percentage;
      setPercentageReward(
        pctRaw != null && pctRaw !== "" ? String(pctRaw) : ""
      );
      setOutrightDiscount(
        d.outright_discount_percentage != null && d.outright_discount_percentage !== ""
          ? String(d.outright_discount_percentage)
          : "0"
      );
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

  const referredQueryParams = useMemo(() => {
    const params: { per_page: number; page: number; search?: string } = {
      per_page: referredPerPage,
      page: referredPage,
    };
    if (referredSearchTerm.trim()) {
      params.search = referredSearchTerm.trim();
    }
    return params;
  }, [referredSearchTerm, referredPage, referredPerPage]);

  const {
    data: referredResponse,
    isLoading: referredLoading,
    isError: referredError,
  } = useQuery({
    queryKey: ["referral-referred-signups", referredQueryParams],
    queryFn: () => getReferredSignups(token, referredQueryParams),
    enabled: !!token,
  });

  const referredRows: ReferredSignupRow[] = useMemo(() => {
    return referredResponse?.data?.data || [];
  }, [referredResponse]);

  const referredPagination = useMemo(() => {
    return referredResponse?.data?.pagination || {
      current_page: 1,
      last_page: 1,
      per_page: referredPerPage,
      total: 0,
    };
  }, [referredResponse, referredPerPage]);

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: (payload: Parameters<typeof updateReferralSettings>[0]) =>
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
    const withdrawalNum = parseFloat(minimumWithdrawal.replace(/,/g, ""));
    if (minimumWithdrawal.trim() === "" || isNaN(withdrawalNum) || withdrawalNum < 0) {
      alert("Please enter a valid minimum withdrawal amount (₦).");
      return;
    }

    const outrightNum = outrightDiscount.trim() === "" ? 0 : parseFloat(outrightDiscount.replace(/,/g, ""));
    if (isNaN(outrightNum) || outrightNum < 0 || outrightNum > 100) {
      alert("Outright discount must be between 0 and 100.");
      return;
    }

    const payload: Parameters<typeof updateReferralSettings>[0] = {
      minimum_withdrawal: withdrawalNum,
      outright_discount_percentage: outrightNum,
      referral_reward_type: rewardType,
    };

    if (rewardType === "fixed") {
      const fixedNum = parseFloat(fixedRewardNgn.replace(/,/g, ""));
      if (fixedRewardNgn.trim() === "" || isNaN(fixedNum) || fixedNum <= 0) {
        alert("Enter a fixed referrer reward amount greater than zero (₦).");
        return;
      }
      payload.referral_fixed_ngn = fixedNum;
    } else {
      const pctNum = parseFloat(percentageReward.replace(/,/g, ""));
      if (percentageReward.trim() === "" || isNaN(pctNum) || pctNum <= 0 || pctNum > 100) {
        alert("Enter a percentage between 0 and 100 of the qualifying purchase.");
        return;
      }
      payload.referral_percentage = pctNum;
    }

    updateSettingsMutation.mutate(payload);
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

  useEffect(() => {
    const timer = setTimeout(() => {
      setReferredPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [referredSearchTerm]);

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

        {/* Users who signed up with a referral code */}
        <div className="mt-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Signups using a referral code</h2>
              <p className="text-sm text-gray-500 mt-1">
                New accounts that entered someone&apos;s code at registration. Referrer is credited when they complete a qualifying purchase (per referral settings).
              </p>
            </div>
            <input
              type="text"
              placeholder="Search name, email, or code"
              value={referredSearchTerm}
              onChange={(e) => setReferredSearchTerm(e.target.value)}
              className="pl-4 pr-4 py-2.5 border border-[#00000080] rounded-lg text-sm w-full sm:w-72 focus:outline-none bg-white"
            />
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {referredLoading ? (
              <LoadingSpinner message="Loading referred signups..." />
            ) : referredError ? (
              <div className="py-12 text-center text-red-500">Failed to load referred signups.</div>
            ) : referredRows.length === 0 ? (
              <div className="py-12 text-center text-gray-500">No signups with a referral code yet.</div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[#EBEBEB] border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-black">New user</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-black">Email</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-black">Code used</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-black">Referred by</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-black">Joined</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {referredRows.map((row, index) => (
                        <tr
                          key={row.id}
                          className={index % 2 === 0 ? "bg-[#F8F8F8]" : "bg-white"}
                        >
                          <td className="px-4 py-3 text-sm text-black">{row.name}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">{row.email}</td>
                          <td className="px-4 py-3 text-sm font-mono text-gray-800">{row.code_used}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            {row.referrer_name || "—"}
                            {row.referrer_user_code ? (
                              <span className="block text-xs text-gray-500">{row.referrer_user_code}</span>
                            ) : null}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">{row.joined_at || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {referredPagination.last_page > 1 && (
                  <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
                    <span className="text-sm text-gray-600">
                      Page {referredPagination.current_page} of {referredPagination.last_page} (
                      {referredPagination.total} total)
                    </span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setReferredPage((p) => Math.max(1, p - 1))}
                        disabled={referredPagination.current_page <= 1}
                        className="px-3 py-1.5 text-sm rounded-md border border-gray-300 bg-white disabled:opacity-50"
                      >
                        Previous
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setReferredPage((p) =>
                            Math.min(referredPagination.last_page, p + 1)
                          )
                        }
                        disabled={referredPagination.current_page >= referredPagination.last_page}
                        className="px-3 py-1.5 text-sm rounded-md border border-gray-300 bg-white disabled:opacity-50"
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
            <div className="space-y-5 max-h-[calc(100vh-8rem)] overflow-y-auto pr-1">
              <p className="text-xs text-gray-500 -mt-2 mb-2">
                Choose how referrers are paid, then enter only that value. Fixed and percentage cannot apply at the same time.
              </p>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Referrer payout type
                </label>
                <select
                  value={rewardType}
                  onChange={(e) =>
                    setRewardType(e.target.value === "percentage" ? "percentage" : "fixed")
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                >
                  <option value="fixed">Fixed cash amount (₦) per qualifying purchase</option>
                  <option value="percentage">Percentage (%) of qualifying purchase</option>
                </select>
              </div>

              {rewardType === "fixed" ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount (₦)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 50000"
                    value={fixedRewardNgn}
                    onChange={(e) => setFixedRewardNgn(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Percentage of purchase (%)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 5"
                    value={percentageReward}
                    onChange={(e) => setPercentageReward(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum withdrawal (₦)
                </label>
                <input
                  type="text"
                  placeholder="Enter amount"
                  value={minimumWithdrawal}
                  onChange={(e) => setMinimumWithdrawal(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Outright purchase discount when using a referrer code at checkout (%)
                </label>
                <input
                  type="text"
                  placeholder="0"
                  value={outrightDiscount}
                  onChange={(e) => setOutrightDiscount(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Optional shop discount for the buyer; separate from the referrer&apos;s reward.
                </p>
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
