import React from "react";
import { users as initialUsers, stats as initialStats } from "../../constants/usermgt";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { addLoanForNewUser } from "../../component/users/UserLoanData";
import UserMgtHeader from "../../components/user_mgt/UserMgtHeader";
import UserMgtStats from "../../components/user_mgt/UserMgtStats";
import UserMgtTableControls from "../../components/user_mgt/UserMgtTableControls";
import UserMgtUsersTable from "../../components/user_mgt/UserMgtUsersTable";
import UserMgtAddUserModal from "../../components/user_mgt/UserMgtAddUserModal";

// Import Related to the Integration
import { getAllUsers } from "../../utils/queries/users";
import { useQuery } from "@tanstack/react-query";
import Cookies from "js-cookie";

const User_mgt: React.FC = () => {
  const navigate = useNavigate();
  const [showAddModal, setShowAddModal] = useState(false);
  const [users, setUsers] = useState(initialUsers);
  const [showMoreActionsDropdown, setShowMoreActionsDropdown] = useState(false);
  const [showSortByDropdown, setShowSortByDropdown] = useState(false);
  const [selectedSortBy, setSelectedSortBy] = useState("Sort By");
  const [openDropdownIndex, setOpenDropdownIndex] = useState<number | null>(
    null
  );
  const moreActionsRef = useRef<HTMLDivElement>(null);
  const sortByRef = useRef<HTMLDivElement>(null);
  const dotsDropdownRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    phone: "",
    bvn: "",
  });
  const [formError, setFormError] = useState("");

  // API integration for users
  const token = Cookies.get("token");
  const { data, isLoading, isError } = useQuery({
    queryKey: ["all-users"],
    queryFn: () => getAllUsers(token || ""),
    enabled: !!token,
  });

  // Map API response to users table
  const apiUsers = data?.data?.["all users data"]
    ? data.data["all users data"].map((u: any) => ({
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

  // Use useMemo instead of useEffect + setState to avoid update loops
  const filteredUsers = React.useMemo(() => {
    const baseUsers = apiUsers.length > 0 ? apiUsers : users;
    let filtered = baseUsers;

    if (selectedMoreAction === "Active") {
      filtered = filtered.filter((u: any) => u.is_active === 1);
    } else if (selectedMoreAction === "Inactive") {
      filtered = filtered.filter((u: any) => u.is_active === 0);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (u: any) =>
          u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.phone.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [apiUsers, users, searchTerm, selectedMoreAction]);

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

  // Get today's date in the format DD/MM/YYYY
  const getCurrentDate = () => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, "0");
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const year = today.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Generate a unique ID
  const generateId = () => {
    return ((apiUsers.length || users.length) + 1).toString();
  };

  // Handle form submission
  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!newUser.name || !newUser.email || !newUser.phone || !newUser.bvn) {
      setFormError("All fields are required");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newUser.email)) {
      setFormError("Please enter a valid email address");
      return;
    }

    // Phone validation (simple)
    if (newUser.phone.length < 10) {
      setFormError("Phone number must be at least 10 digits");
      return;
    }

    // Create new user with today's date and a new ID
    const userId = generateId();
    const newUserWithDetails = {
      id: userId,
      ...newUser,
      date: getCurrentDate(),
    };

    // Add the new user to the list
    setUsers([...users, newUserWithDetails]);

    // Also create a default loan for this user
    addLoanForNewUser(userId, newUser.name);

    // Reset the form and close modal
    setFormError("");
    setShowAddModal(false);
    setNewUser({ name: "", email: "", phone: "", bvn: "" });

    // Show success message
    alert("User added successfully with default loan information!");
  };

  // Handle notification click
  const handleNotificationClick = () => {
    console.log("Notification clicked in User Management");
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
          <UserMgtUsersTable
            users={filteredUsers}
            dotsDropdownRefs={dotsDropdownRefs}
            openDropdownIndex={openDropdownIndex}
            setOpenDropdownIndex={setOpenDropdownIndex}
            navigate={navigate}
          />
        )}
      </div>
      {showAddModal && (
        <UserMgtAddUserModal
          showAddModal={showAddModal}
          setShowAddModal={setShowAddModal}
          formError={formError}
          handleAddUser={handleAddUser}
          newUser={newUser}
          handleInputChange={handleInputChange}
        />
      )}
    </div>
  );
};



export default User_mgt;
