import React, { useState, useEffect } from "react";

interface Props {
  moreActionsRef: React.RefObject<HTMLDivElement>;
  sortByRef: React.RefObject<HTMLDivElement>;
  showMoreActionsDropdown: boolean;
  setShowMoreActionsDropdown: (v: boolean) => void;
  showSortByDropdown: boolean;
  setShowSortByDropdown: (v: boolean) => void;
  selectedMoreAction: string;
  setSelectedMoreAction: (v: string) => void;
  selectedSortBy: string;
  setSelectedSortBy: (v: string) => void;
  setShowAddModal: (v: boolean) => void;
  onSearch?: (term: string) => void;
  onAction?: (action: string) => void;
  searchTerm?: string;
}

const UserMgtTableControls: React.FC<Props> = ({
  moreActionsRef,
  sortByRef,
  showMoreActionsDropdown,
  setShowMoreActionsDropdown,
  showSortByDropdown,
  setShowSortByDropdown,
  selectedMoreAction,
  setSelectedMoreAction,
  selectedSortBy,
  setSelectedSortBy,
  setShowAddModal: _setShowAddModal,
  onSearch,
  onAction,
  searchTerm = "",
}) => {
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);

  useEffect(() => {
    setLocalSearchTerm(searchTerm);
  }, [searchTerm]);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSearchTerm(e.target.value);
    if (onSearch) onSearch(e.target.value);
    // If an action filter is active, re-apply it
    if (onAction) onAction(selectedMoreAction);
  };

  // Handle More Actions button click
  const handleActionClick = (action: string) => {
    setSelectedMoreAction(action);
    setShowMoreActionsDropdown(false);
    if (onAction) onAction(action);
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2">
      <div className="flex items-center gap-2 mb-3">
        {/* More Actions Dropdown */}
        <div className="relative" ref={moreActionsRef}>
          <button
            className="border cursor-pointer border-[#00000080] rounded-[7px] px-4 py-2 text-sm bg-white flex items-center justify-between min-w-[140px] hover:bg-gray-50 transition-colors"
            onClick={() => {
              setShowMoreActionsDropdown(!showMoreActionsDropdown);
              setShowSortByDropdown(false);
            }}
          >
            <span>{selectedMoreAction}</span>
            <svg
              width="12"
              height="6"
              viewBox="0 0 12 6"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="ml-10"
            >
              <path
                d="M1 1L6 5L11 1"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          {showMoreActionsDropdown && (
            <div className="absolute  top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg z-10">
              <div className="py-1 ">
                <button
                  className="w-full px-4 cursor-pointer py-2 text-left text-sm hover:bg-gray-50 transition-colors"
                  onClick={() => handleActionClick("More Actions")}
                >
                  More Actions
                </button>
                <button
                  className="w-full px-4 py-2 cursor-pointer text-left text-sm hover:bg-gray-50 transition-colors"
                  onClick={() => handleActionClick("Active")}
                >
                  Active
                </button>
                <button
                  className="w-full px-4 py-2 cursor-pointer text-left text-sm hover:bg-gray-50 transition-colors"
                  onClick={() => handleActionClick("Inactive")}
                >
                  Inactive
                </button>
                {/* <button
                  className="w-full px-4 py-2 cursor-pointer text-left text-sm hover:bg-gray-50 transition-colors"
                  onClick={() => {
                    setShowAddModal(true);
                  }}
                >
                  Add new user
                </button> */}
              </div>
            </div>
          )}
        </div>

        {/* Sort By Dropdown */}
        <div className="relative" ref={sortByRef}>
          <button
            className="border border-[#00000080] cursor-pointer rounded-[7px] px-4 py-2 text-sm bg-white flex items-center justify-between min-w-[140px] hover:bg-gray-50 transition-colors"
            onClick={() => {
              setShowSortByDropdown(!showSortByDropdown);
              setShowMoreActionsDropdown(false);
            }}
          >
            <span>{selectedSortBy}</span>
            <svg
              width="12"
              height="6"
              viewBox="0 0 12 6"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="ml-10"
            >
              <path
                d="M1 1L6 5L11 1"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          {showSortByDropdown && (
            <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg z-10">
              <div className="py-1">
                <button
                  className="w-full cursor-pointer px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors"
                  onClick={() => {
                    setSelectedSortBy("Sort By");
                    setShowSortByDropdown(false);
                  }}
                >
                  Sort By
                </button>
                <button
                  className="w-full cursor-pointer px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors"
                  onClick={() => {
                    setSelectedSortBy("Alphabetically");
                    setShowSortByDropdown(false);
                  }}
                >
                  Alphabetically
                </button>
                <button
                  className="w-full cursor-pointer px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors"
                  onClick={() => {
                    setSelectedSortBy("Date Registered");
                    setShowSortByDropdown(false);
                  }}
                >
                  Date Registered
                </button>
                <button
                  className="w-full cursor-pointer px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors"
                  onClick={() => {
                    setSelectedSortBy("Active Users");
                    setShowSortByDropdown(false);
                  }}
                >
                  Active Users
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="flex gap-3 mb-3">
        {/* <button
          className="bg-[#273E8E] text-white px-5 py-2 cursor-pointer rounded-full font-semibold"
          onClick={() => setShowAddModal(true)}
        >
          Add new user
        </button> */}
        <div className="relative">
          <input
            id="user-search-input"
            type="text"
            placeholder="Search"
            value={localSearchTerm}
            onChange={handleSearchChange}
            className="border border-[#00000080] rounded-[5px] pl-10 pr-4 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors min-w-[300px]"
          />
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 103.5 3.5a7.5 7.5 0 0013.65 13.65z"
              />
            </svg>
          </div>
        </div>

      </div>
    </div>
  );
};

export default UserMgtTableControls;
