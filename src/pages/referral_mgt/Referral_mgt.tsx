import { useState, useEffect } from "react";
import { referralData, sortOptions, type ReferralData } from "./referral";
import Header from "../../component/Header";
import images from "../../constants/images";

const Referral_mgt = () => {
  const [selectedReferrals, setSelectedReferrals] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("default");
  const [searchTerm, setSearchTerm] = useState("");
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [commissionPercentage, setCommissionPercentage] = useState("");
  const [minimumWithdrawal, setMinimumWithdrawal] = useState("");
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem("referralSettings");
    if (savedSettings) {
      const {
        commissionPercentage: savedCommission,
        minimumWithdrawal: savedMinimum,
      } = JSON.parse(savedSettings);
      setCommissionPercentage(savedCommission || "");
      setMinimumWithdrawal(savedMinimum || "");
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isSortDropdownOpen) {
        const target = event.target as Element;
        const sortDropdown = document.querySelector(".sort-dropdown");
        if (sortDropdown && !sortDropdown.contains(target)) {
          setIsSortDropdownOpen(false);
        }
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
      setSelectedReferrals(referralData.map((referral) => referral.id));
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
    setSortBy(sortOption);
    setIsSortDropdownOpen(false);
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

    // Save settings to localStorage
    const settings = {
      commissionPercentage: commissionPercentage.trim(),
      minimumWithdrawal: minimumWithdrawal.trim(),
      lastUpdated: new Date().toISOString(),
    };

    localStorage.setItem("referralSettings", JSON.stringify(settings));

    // Show success message
    alert("Settings saved successfully!");

    // Close modal
    setIsSettingsModalOpen(false);
  };

  const filteredReferrals = referralData.filter((referral) =>
    referral.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <div className="relative inline-block text-left sort-dropdown">
            <div>
              <button
                onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                className="inline-flex justify-between w-48 cursor-pointer rounded-md border border-[#00000080] bg-white px-4 py-2 text-sm font-medium text-black shadow-sm focus:outline-none"
              >
                {sortOptions.find((option) => option.value === sortBy)?.label ||
                  "Sort by"}
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
              placeholder="Search"
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
          <div className="overflow-x-auto">
            <table className="w-full">
              {/* Table Header */}
              <thead className="bg-[#EBEBEB] border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-center">
                    <input
                      type="checkbox"
                      checked={selectedReferrals.length === referralData.length}
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
                {filteredReferrals.map(
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
                          checked={selectedReferrals.includes(referral.id)}
                          onChange={() => handleSelectReferral(referral.id)}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                        />
                      </td>
                      <td className="px-6 py-4 text-sm text-black text-center">
                        {referral.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-black text-center">
                        {referral.noOfReferral}
                      </td>
                      <td className="px-6 py-4 text-sm text-black text-center">
                        {referral.amountEarned}
                      </td>
                      <td className="px-6 py-4 text-sm text-black text-center">
                        {referral.dateJoined}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
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
                className="w-full bg-blue-900 cursor-pointer hover:bg-blue-800 text-white py-3 px-4 rounded-full text-sm font-medium transition-colors mt-8"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Referral_mgt;
