import { useState, useEffect } from 'react';
import Header from "../../component/Header";
import { transactionData, getTransactionStatusColor } from './transaction';
import type { TransactionData } from './transaction';
import TransactionDetail from './TransactionDetail';
import images from "../../constants/images";

const Transactions = () => {
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("Status");
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [showTransactionDetail, setShowTransactionDetail] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionData | null>(null);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);

  const handleNotificationClick = () => {
    console.log("Notification clicked");
  };

  const handleDropdownToggle = (transactionId: string) => {
    setOpenDropdownId(openDropdownId === transactionId ? null : transactionId);
  };

  const handleStatusSelect = (status: string) => {
    setStatusFilter(status);
    setIsStatusDropdownOpen(false);
  };

  const handleDropdownAction = (action: string, transactionId: string) => {
    
    
    console.log(`${action} for transaction:`, transactionId);
    
    if (action === 'View Transaction details') {
      const transaction = transactionData.find(t => t.id === transactionId);
      console.log('Found transaction:', transaction); // Debug log
      if (transaction) {
        setSelectedTransaction(transaction);
        setShowTransactionDetail(true);
        console.log('Modal should open now'); // Debug log
      } else {
        console.error('Transaction not found with ID:', transactionId);
      }
    }
    
    setOpenDropdownId(null);
  };

  const handleCloseTransactionDetail = () => {
    console.log('Closing transaction detail modal'); // Debug log
    setShowTransactionDetail(false);
    setSelectedTransaction(null);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openDropdownId) {
        setOpenDropdownId(null);
      }
      // Close status dropdown when clicking outside
      if (isStatusDropdownOpen) {
        const target = event.target as Element;
        const statusDropdown = document.querySelector('.status-dropdown');
        if (statusDropdown && !statusDropdown.contains(target)) {
          setIsStatusDropdownOpen(false);
        }
      }
    };

    if (openDropdownId || isStatusDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openDropdownId, isStatusDropdownOpen]);

  // Debug: Track modal state changes
  useEffect(() => {
    console.log('Modal state changed:', { 
      showTransactionDetail, 
      selectedTransactionId: selectedTransaction?.id,
      selectedTransactionName: selectedTransaction?.name 
    });
  }, [showTransactionDetail, selectedTransaction]);

  // Filter transaction data based on selected filters
  const filteredTransactionData = transactionData.filter((transaction: TransactionData) => {
    const statusMatch = statusFilter === "Status" || transaction.status === statusFilter;
    return statusMatch;
  });

  return (
    <div className="bg-[#F5F7FF] min-h-screen">
      {/* Header Component */}
      <Header 
        adminName="Hi, Admin"
        adminImage="/assets/layout/admin.png"
        onNotificationClick={handleNotificationClick}
      />

      {/* Main Content */}
      <div className="p-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 h-[120px]">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100"
            style={{ boxShadow: "5px 5px 10px 0px rgba(109, 108, 108, 0.25)" }}
          >
            <div className="flex items-center gap-5">
              <div className="w-17 h-17 bg-[#0000FF33] rounded-full flex items-center justify-center">
                <img 
                  src="/assets/images/Users.png" 
                  alt="Total Users" 
                  className="w-6 h-6 object-contain"
                />
              </div>
              <div>
                <p className="text-sm font-medium text-[#0000FF]">Total Users</p>
                <p className="text-2xl font-bold text-[#0000FF]">30</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100"
            style={{ boxShadow: "5px 5px 10px 0px rgba(109, 108, 108, 0.25)" }}
          >
            <div className="flex items-center gap-4">
              <div className="w-17 h-17 bg-[#0000FF33] rounded-full flex items-center justify-center">
                <img 
                  src="/assets/images/Users.png" 
                  alt="Total Transactions" 
                  className="w-6 h-6 object-contain"
                />
              </div>
              <div>
                <p className="text-sm font-medium text-[#0000FF]">Total Transactions</p>
                <p className="text-2xl font-bold text-[#0000FF]">5</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100"
            style={{ boxShadow: "5px 5px 10px 0px rgba(109, 108, 108, 0.25)" }}
          >
            <div className="flex items-center gap-4">
              <div className="w-17 h-17 bg-[#0000FF33] rounded-full flex items-center justify-center">
                <img 
                  src="/assets/images/Users.png" 
                  alt="Transactions" 
                  className="w-6 h-6 object-contain"
                />
              </div>
              <div>
                <p className="text-sm font-medium text-[#0000FF]">Transactions</p>
                <p className="text-2xl font-bold text-[#0000FF]">N2,000,000</p>
              </div>
            </div>
          </div>
        </div>

        {/* Transaction Summary Section */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Transaction Summary</h2>
          
          {/* Filter Tabs and Dropdowns */}
          <div className="flex justify-between items-center">
            {/* Single Row with Tabs and Status Dropdown */}
            <div className="flex items-center space-x-4">
              {/* Filter Tabs */}
              <div className="flex bg-white rounded-full cursor-pointer border border-gray-200 p-2 shadow-sm">
                <button 
                  className={`px-4.5 py-2 rounded-full cursor-pointer text-sm font-medium transition-colors ${
                    selectedFilter === 'All' 
                      ? 'bg-[#273E8E] text-white' 
                      : 'text-gray-600 '
                  }`}
                  onClick={() => setSelectedFilter('All')}
                >
                  All
                </button>
                <button 
                  className={`px-4 py-1.5 rounded-full  cursor-pointer text-sm font-medium transition-colors ${
                    selectedFilter === 'Deposit' 
                      ? 'bg-[#273E8E] text-white' 
                      : 'text-gray-600 '
                  }`}
                  onClick={() => setSelectedFilter('Deposit')}
                >
                  Deposit
                </button>
                <button 
                  className={`px-4 py-1.5 rounded-full cursor-pointer text-sm font-medium transition-colors ${
                    selectedFilter === 'Withdrawals' 
                      ? 'bg-[#273E8E] text-white' 
                      : 'text-gray-600 '
                  }`}
                  onClick={() => setSelectedFilter('Withdrawals')}
                >
                  Withdrawals
                </button>
              </div>

              {/* Status Dropdown */}
              <div className="relative inline-block text-left status-dropdown">
                <div>
                  <button
                    onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                    className="inline-flex justify-between w-48 cursor-pointer rounded-md border border-[#00000080] bg-white px-4 py-2 text-sm font-medium text-black shadow-sm  focus:outline-none"
                  >
                    {statusFilter}
                    <img src={images.arrow} alt="" />
                  </button>
                </div>

                {isStatusDropdownOpen && (
                  <div className="absolute mt-2 w-48 origin-top-right rounded-xl shadow-xl bg-white border border-gray-200 z-50">
                    <ul className="py-2">
                      {["Status", "Pending", "Completed"].map((option: string, index: number) => (
                        <li
                          key={index}
                          onClick={() => handleStatusSelect(option)}
                          className="px-4 py-2 text-black text-sm cursor-pointer hover:bg-gray-100"
                        >
                          {option}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
            
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
        {/* Transaction Table */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-[#EBEBEB]">
                  <th className="px-6 py-4 text-center text-sm font-medium text-gray-200">
                    <input type="checkbox" className="rounded" />
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-black">Name</th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-black">Amount</th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-black">Date</th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-black">Type</th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-black">Tx ID</th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-black">Status</th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-black">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {filteredTransactionData.map((transaction: TransactionData, index: number) => (
                  <tr key={transaction.id}                     className={`${
                      index % 2 === 0 ? "bg-[#F8F8F8]" : "bg-white"
                    } transition-colors border-b border-gray-100 last:border-b-0`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input type="checkbox" className="rounded" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-center">
                      {transaction.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 text-center">
                      {transaction.amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-center">
                      {transaction.date}/{transaction.time}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-center">
                      {transaction.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-center">
                      {transaction.txId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span 
                        className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full"
                        style={getTransactionStatusColor(transaction.status)}
                      >
                        <span 
                          className="w-1.5 h-1.5 rounded-full mr-1.5"
                          style={{
                            backgroundColor: transaction.status.toLowerCase() === "completed" 
                              ? '#008000' 
                              : transaction.status.toLowerCase() === "pending"
                              ? '#FF8C00'
                              : '#6B7280'
                          }}
                        ></span>
                        {transaction.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2 relative">
                        <button 
                          className="relative p-2 text-gray-600 hover:text-gray-900"
                          onClick={() => handleDropdownToggle(transaction.id)}
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                          </svg>
                        </button>
                        
                        {/* Dropdown Menu */}
                        {openDropdownId === transaction.id && (
                          <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                            <div className="py-2">
                              <button
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 cursor-pointer hover:bg-gray-50 transition-colors"
                               onClick={() => handleDropdownAction('View Transaction details', transaction.id)  }
                                
                              >
                                View Transaction details
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Transaction Detail Modal */}
      <TransactionDetail
        isOpen={showTransactionDetail}
        transaction={selectedTransaction}
        onClose={handleCloseTransactionDetail}
      />
    </div>
  );
};

export default Transactions;