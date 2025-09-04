import { useState } from "react";
import Header from "../../component/Header";
import { creditScoreData } from "./creditscore";
import images from "../../constants/images";

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
          className="inline-flex justify-between w-35 cursor-pointer rounded-md border border-[#00000080] bg-white px-4 py-2 text-sm font-medium text-black shadow-sm hover:bg-gray-50 focus:outline-none"
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

const Credit_score = () => {
  const [sortBy, setSortBy] = useState("Sort by");
  const [filterBy, setFilterBy] = useState("Filter");
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const handleNotificationClick = () => {
    console.log("Notification clicked");
  };

  const handleViewDetails = (user: any) => {
    setSelectedUser(user);
    setShowCreditModal(true);
  };

  const closeModal = () => {
    setShowCreditModal(false);
    setSelectedUser(null);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600 font-bold";
    if (score >= 70) return "text-blue-600 font-bold";
    if (score >= 50) return "text-yellow-600 font-bold";
    return "text-red-600 font-bold";
  };

  const getScoreBackground = (score: number) => {
    if (score >= 90) return "bg-green-50";
    if (score >= 70) return "bg-blue-50";
    if (score >= 50) return "bg-yellow-50";
    return "bg-red-50";
  };

  const filteredData = creditScoreData.filter((item) => {
    // Filter by search term
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    // Filter by credit score category
    let matchesFilter = true;
    if (filterBy === "Excellent (90+)") {
      matchesFilter = item.creditScore >= 90;
    } else if (filterBy === "Good (70-89)") {
      matchesFilter = item.creditScore >= 70 && item.creditScore < 90;
    } else if (filterBy === "Fair (50-69)") {
      matchesFilter = item.creditScore >= 50 && item.creditScore < 70;
    } else if (filterBy === "Poor (Below 50)") {
      matchesFilter = item.creditScore < 50;
    }

    return matchesSearch && matchesFilter;
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
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Credit Score</h1>

        {/* Controls Section */}
        <div className="flex justify-between items-center mb-6">
          {/* Left side - Sort and Filter dropdowns */}
          <div className="flex items-center space-x-4">
            {/* Sort By Dropdown */}

            <CustomDropdown
              options={["Sort by", "Name", "Credit Score", "Date"]}
              selected={sortBy}
              onSelect={setSortBy}
            />

            {/* Filter Dropdown */}
            <CustomDropdown
              options={[
                "Filter",
                "Excellent (90+)",
                "Good (70-89)",
                "Fair (50-69)",
                "Poor (Below 50)",
              ]}
              selected={filterBy || "Filter"}
              onSelect={setFilterBy}
            />
          </div>

          {/* Right side - Search Box */}
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

        {/* Credit Score Table */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-[#EBEBEB]">
                  <th className="px-6 py-4 text-center text-sm text-black">
                    <input type="checkbox" className="rounded cursor-pointer" />
                  </th>
                  <th className="px-6 py-4 text-center text-sm text-black">
                    Name
                  </th>
                  <th className="px-6 py-4 text-center text-sm text-black">
                    Credit Score
                  </th>
                  <th className="px-6 py-4 text-center text-sm text-black">
                    Loan Limit
                  </th>
                  <th className="px-6 py-4 text-center text-sm text-black">
                    Date
                  </th>
                  <th className="px-6 py-4 text-center text-sm text-black">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {filteredData.map((item, index) => (
                  <tr
                    key={item.id}
                    className={`${
                      index % 2 === 0 ? "bg-[#F8F8F8]" : "bg-white"
                    } transition-colors border-b border-gray-100 last:border-b-0`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <input
                        type="checkbox"
                        className="rounded cursor-pointer"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                      {item.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${getScoreBackground(
                          item.creditScore
                        )}`}
                      >
                        <span className={getScoreColor(item.creditScore)}>
                          {item.creditScore}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black text-center">
                      ₦{item.loanLimit.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black text-center">
                      {item.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      <button
                        className="text-white px-6 py-2 rounded-full hover:opacity-90 transition-opacity text-sm font-medium cursor-pointer"
                        style={{ backgroundColor: "#273E8E" }}
                        onClick={() => handleViewDetails(item)}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Credit Check Modal */}
      {showCreditModal && selectedUser && (
        <div className="fixed inset-0 backdrop-brightness-50 flex items-start justify-end z-50 p-6">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg h-[95vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex justify-between items-center px-8 py-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Credit Check - {selectedUser.name}
              </h2>
              <button
                onClick={closeModal}
                className="w-10 h-10 flex items-center justify-center rounded-full cursor-pointer transition"
              >
                <img src={images.cross} alt="Close" className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="px-8 py-6 overflow-y-auto max-h-[calc(95vh-80px)]">
              {/* Credit Score Section */}
              <div
                className="rounded-xl mb-10 p-6"
                style={{
                  background:
                    "linear-gradient(135deg, #273E8E 0%, #FFA500 100%)",
                  boxShadow: "0 4px 18px rgba(0, 0, 0, 0.15)",
                }}
              >
                <div className="flex items-center justify-center">
                  <div className="relative w-52 h-52 bg-white rounded-full shadow-xl flex items-center justify-center">
                    <div className="relative w-44 h-44">
                      <svg className="w-full h-full" viewBox="0 0 200 200">
                        <defs>
                          <linearGradient
                            id="arcGradient"
                            x1="0%"
                            y1="0%"
                            x2="100%"
                            y2="0%"
                          >
                            <stop offset="0%" stopColor="#FF0000" />
                            <stop offset="100%" stopColor="#008000" />
                          </linearGradient>
                        </defs>

                        {Array.from({ length: 72 }, (_, i) => {
                          const angle = (i * 360) / 72;
                          const isMainTick = i % 18 === 0;
                          const tickLength = isMainTick ? 10 : 6;
                          const tickWidth = isMainTick ? 1.5 : 1;
                          const radius = 75;
                          const x1 =
                            100 +
                            (radius - tickLength) *
                              Math.cos((angle * Math.PI) / 180);
                          const y1 =
                            100 +
                            (radius - tickLength) *
                              Math.sin((angle * Math.PI) / 180);
                          const x2 =
                            100 + radius * Math.cos((angle * Math.PI) / 180);
                          const y2 =
                            100 + radius * Math.sin((angle * Math.PI) / 180);

                          return (
                            <line
                              key={i}
                              x1={x1}
                              y1={y1}
                              x2={x2}
                              y2={y2}
                              stroke="#008000"
                              strokeWidth={tickWidth}
                            />
                          );
                        })}

                        <path
                          d="M 10 100 A 90 90 0 0 1 190 100"
                          stroke="url(#arcGradient)"
                          strokeWidth="16"
                          fill="none"
                          strokeLinecap="round"
                        />

                        <g transform="translate(100,100)">
                          <polygon
                            points="0,-70 -3,-5 3,-5"
                            fill="#374151"
                            transform={`rotate(${
                              (selectedUser.creditScore / 100) * 180 - 90
                            })`}
                          />
                          <circle cx="0" cy="0" r="6" fill="#374151" />
                          <circle cx="0" cy="0" r="2.5" fill="white" />
                        </g>
                      </svg>

                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-xs text-gray-500 mb-1 mt-10">
                          My Credit Score
                        </span>
                        <span className="text-4xl font-bold text-gray-900 leading-none">
                          {selectedUser.creditScore}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Information */}
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Account Number
                  </label>
                  <div className="bg-gray-50 px-5 py-3 rounded-lg border text-sm text-gray-900 font-medium">
                    002334593934
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bank Name
                  </label>
                  <div className="bg-gray-50 px-5 py-3 rounded-lg border flex justify-between items-center text-sm text-gray-900 font-medium">
                    Access Bank
                    <svg
                      className="w-4 h-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Account Name
                  </label>
                  <div className="bg-gray-50 px-5 py-3 rounded-lg border text-sm text-gray-900 font-medium">
                    {selectedUser.name}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Credit_score;
