import React from "react";
import { users as initialUsers, stats as initialStats } from "../../constants/usermgt";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import UserMgtHeader from "../../components/user_mgt/UserMgtHeader";
import UserMgtStats from "../../components/user_mgt/UserMgtStats";
import UserMgtTableControls from "../../components/user_mgt/UserMgtTableControls";
import UserMgtUsersTable from "../../components/user_mgt/UserMgtUsersTable";
import UserMgtAddUserModal from "../../components/user_mgt/UserMgtAddUserModal";

// Import Related to the Integration
import { getAllUsers } from "../../utils/queries/users";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Cookies from "js-cookie";

const User_mgt: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);
  const [users] = useState(initialUsers);
  const [showMoreActionsDropdown, setShowMoreActionsDropdown] = useState(false);
  const [showSortByDropdown, setShowSortByDropdown] = useState(false);
  const [selectedSortBy, setSelectedSortBy] = useState("Sort By");
  const [openDropdownIndex, setOpenDropdownIndex] = useState<number | null>(
    null
  );
  const moreActionsRef = useRef<HTMLDivElement>(null!);
  const sortByRef = useRef<HTMLDivElement>(null!);
  const dotsDropdownRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    phone: "",
    bvn: "",
    password: "",
  });

  // API integration for users
  const token = Cookies.get("token");
  const { data, isLoading, isError } = useQuery({
    queryKey: ["all-users"],
    queryFn: () => getAllUsers(token || ""),
    enabled: !!token,
  });

  // Map API response to users table
  const apiUsers = React.useMemo(() => {
    return data?.data?.["all users data"]
      ? data.data["all users data"].map((u: {
          id: number;
          first_name: string;
          sur_name: string;
          email: string;
          phone: string;
          bvn?: string;
          created_at?: string;
          is_active: number;
        }) => ({
        id: String(u.id),
        name: `${u.first_name} ${u.sur_name}`,
        email: u.email,
        phone: u.phone,
        bvn: u.bvn || "",
        date: u.created_at
          ? new Date(u.created_at).toLocaleDateString("en-GB")
          : "",
        is_active: u.is_active,
      }))
      : [];
  }, [data]);

  // Map API response to stats cards
  const stats = data?.data
    ? [
      {
        label: "Total Users",
        value: data.data.total_users,
        icon: "/assets/images/Users.png",
      },
      {
        label: "New Users",
        value: data.data["new user"],
        icon: "/assets/images/Users.png",
      },
      {
        label: "Users with Loans",
        value: data.data["user with loan balance"],
        icon: "/assets/images/Users.png",
      },
    ]
    : initialStats;

  // Filtering and actions
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMoreAction, setSelectedMoreAction] = useState("More Actions");
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Use useMemo instead of useEffect + setState to avoid update loops
  const filteredUsers = React.useMemo(() => {
    const baseUsers = apiUsers.length > 0 ? apiUsers : users;
    let filtered = baseUsers;

    if (selectedMoreAction === "Active") {
      filtered = filtered.filter((u: { is_active: number }) => u.is_active === 1);
    } else if (selectedMoreAction === "Inactive") {
      filtered = filtered.filter((u: { is_active: number }) => u.is_active === 0);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (u: { name: string; email: string; phone: string }) =>
          u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.phone.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    if (selectedSortBy !== "Sort By") {
      filtered = [...filtered].sort((a: any, b: any) => {
        switch (selectedSortBy) {
          case "Alphabetically":
            return a.name.localeCompare(b.name);
          case "Date Registered":
            // Sort by date (newest first)
            try {
              const dateA = a.date ? new Date(a.date.split("/").reverse().join("-")).getTime() : 0;
              const dateB = b.date ? new Date(b.date.split("/").reverse().join("-")).getTime() : 0;
              if (isNaN(dateA) && isNaN(dateB)) return 0;
              if (isNaN(dateA)) return 1; // Put invalid dates at end
              if (isNaN(dateB)) return -1;
              return dateB - dateA;
            } catch {
              return 0;
            }
          case "Active Users":
            // Sort by active status (active first)
            return (b.is_active || 0) - (a.is_active || 0);
          default:
            return 0;
        }
      });
    }

    return filtered;
  }, [apiUsers, users, searchTerm, selectedMoreAction, selectedSortBy]);

  // Pagination logic
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedMoreAction, selectedSortBy]);

  // Handle search
  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  // Handle More Actions
  const handleAction = (action: string) => {
    setSelectedMoreAction(action);
  };

  // Handle clicks outside dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        moreActionsRef.current &&
        !moreActionsRef.current.contains(event.target as Node)
      ) {
        setShowMoreActionsDropdown(false);
      }
      if (
        sortByRef.current &&
        !sortByRef.current.contains(event.target as Node)
      ) {
        setShowSortByDropdown(false);
      }
      const clickedOutsideAllDropdowns = dotsDropdownRefs.current.every(
        (ref) => !ref || !ref.contains(event.target as Node)
      );
      if (clickedOutsideAllDropdowns) {
        setOpenDropdownIndex(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewUser((prev) => ({
      ...prev,
      [name]: value,
    }));
  };



  // Handle notification click
  const handleNotificationClick = () => {
    console.log("Notification clicked in User Management");
  };

  // Handle user added callback to refresh data
  const handleUserAdded = () => {
    queryClient.invalidateQueries({ queryKey: ["all-users"] });
  };

  return (
    <div className="bg-[#F5F7FF] min-h-screen">
      <UserMgtHeader onNotificationClick={handleNotificationClick} />
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          User Management
        </h1>
        <UserMgtStats stats={stats} isLoading={isLoading} />
        <div className="mb-5">
          <h1 className="font-bold text-2xl">Users</h1>
        </div>
        <UserMgtTableControls
          moreActionsRef={moreActionsRef}
          sortByRef={sortByRef}
          showMoreActionsDropdown={showMoreActionsDropdown}
          setShowMoreActionsDropdown={setShowMoreActionsDropdown}
          showSortByDropdown={showSortByDropdown}
          setShowSortByDropdown={setShowSortByDropdown}
          selectedMoreAction={selectedMoreAction}
          setSelectedMoreAction={setSelectedMoreAction}
          selectedSortBy={selectedSortBy}
          setSelectedSortBy={setSelectedSortBy}
          setShowAddModal={setShowAddModal}
          onSearch={handleSearch}
          onAction={handleAction}
          searchTerm={searchTerm}
        />
        {isLoading ? (
          <div className="py-8 text-center">
            <div className="inline-flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#273E8E]"></div>
              <span className="ml-3 text-gray-500">Loading users...</span>
            </div>
          </div>
        ) : isError ? (
          <div className="py-8 text-center text-red-500">Failed to load users.</div>
        ) : (
          <>
            <UserMgtUsersTable
              users={currentUsers}
              dotsDropdownRefs={dotsDropdownRefs}
              openDropdownIndex={openDropdownIndex}
              setOpenDropdownIndex={setOpenDropdownIndex}
              navigate={navigate}
            />
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-white mt-4 rounded-lg shadow-sm">
                <div className="flex items-center text-sm text-gray-700">
                  <span>
                    Showing {startIndex + 1} to {Math.min(endIndex, filteredUsers.length)} of {filteredUsers.length} results
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  {/* Previous Button */}
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className={`px-3 py-2 text-sm font-medium rounded-md border ${
                      currentPage === 1
                        ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 cursor-pointer'
                    }`}
                  >
                    Previous
                  </button>
                  
                  {/* Page Numbers */}
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNumber;
                      if (totalPages <= 5) {
                        pageNumber = i + 1;
                      } else if (currentPage <= 3) {
                        pageNumber = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNumber = totalPages - 4 + i;
                      } else {
                        pageNumber = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNumber}
                          onClick={() => setCurrentPage(pageNumber)}
                          className={`px-3 py-2 text-sm font-medium rounded-md border ${
                            currentPage === pageNumber
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
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-2 text-sm font-medium rounded-md border ${
                      currentPage === totalPages
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
      {showAddModal && (
        <UserMgtAddUserModal
          showAddModal={showAddModal}
          setShowAddModal={setShowAddModal}
          onUserAdded={handleUserAdded}
          newUser={newUser}
          handleInputChange={handleInputChange}
        />
      )}
    </div>
  );
};



export default User_mgt;
