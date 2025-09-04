import { useState } from "react";
import Header from "../../component/Header";
import { balanceData } from "./balance";
import type { BalanceData } from "./balance";
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
          className="inline-flex justify-between w-48 cursor-pointer rounded-md border border-[#00000080] bg-white px-4 py-2 text-sm font-medium text-black shadow-sm hover:bg-gray-50 focus:outline-none"
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

const Balances = () => {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("More Actions");

  const handleNotificationClick = () => {
    console.log("Notification clicked");
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(balanceData.map((user) => user.id));
    }
    setSelectAll(!selectAll);
  };

  const handleSelectUser = (userId: string) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter((id) => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

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
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Balances</h1>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Total Loan Balance Card */}
          <div
            className="bg-[#273E8E] rounded-2xl p-8 text-white relative overflow-hidden"
            style={{ boxShadow: "5px 5px 10px 0px rgba(109, 108, 108, 0.25)" }}
          >
            <div className="relative z-10">
              <h3 className="text-lg font-medium mb-6">Total Loan Balance</h3>
              <p className="text-4xl font-bold mb-8">N50,000,000</p>
              <div className="flex justify-end">
                <button className="bg-white bg-opacity-20 hover:bg-opacity-30 text-[#273E8E] px-5 py-3 rounded-full text-sm font-medium transition-colors">
                  Fund Wallet
                </button>
              </div>
            </div>
          </div>

          {/* Total Shopping Balance Card */}
          <div
            className="bg-[#E8A91D] rounded-2xl p-8 text-white relative overflow-hidden"
            style={{ boxShadow: "5px 5px 10px 0px rgba(109, 108, 108, 0.25)" }}
          >
            <div className="relative z-10">
              <h3 className="text-lg font-medium mb-6">
                Total Shopping Balance
              </h3>
              <p className="text-4xl font-bold">N50,000,000</p>
            </div>
          </div>
        </div>

        {/* Balance Summary Section */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Balance Summary
          </h2>

          {/* Controls Row */}
          <div className="flex justify-between items-center mb-4">
            {/* More Actions Dropdown */}
            <CustomDropdown
              options={["More Actions", "Export Data", "Bulk Action"]}
              selected={selectedFilter}
              onSelect={setSelectedFilter}
            />

            {/* Search Box */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search"
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
        </div>

        {/* Balance Table */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-[#EBEBEB]">
                  <th className="px-6 py-4 text-center text-sm font-medium text-black">
                    <input
                      type="checkbox"
                      className="rounded"
                      checked={selectAll}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-black">
                    Name
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-black">
                    Loan Balance
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-black">
                    Main Balance
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-black">
                    Total Topup
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-black">
                    Total Withdrawal
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {balanceData.map((balance: BalanceData, index: number) => (
                  <tr
                    key={balance.id}
                    className={`${
                      index % 2 === 0 ? "bg-[#F8F8F8]" : "bg-white"
                    } transition-colors border-b border-gray-100 last:border-b-0`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <input
                        type="checkbox"
                        className="rounded"
                        checked={selectedUsers.includes(balance.id)}
                        onChange={() => handleSelectUser(balance.id)}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-center">
                      {balance.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                      {balance.loanBalance}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                      {balance.mainBalance}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                      {balance.totalTopup}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                      {balance.totalWithdrawal}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Balances;
