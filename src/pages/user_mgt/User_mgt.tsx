import { users as initialUsers, stats } from "../../constants/usermgt";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { addLoanForNewUser } from "../../component/users/UserLoanData";
import Header from "../../component/Header";
import images from "../../constants/images";

const User_mgt: React.FC = () => {
  const navigate = useNavigate();
  const [showAddModal, setShowAddModal] = useState(false);
  const [users, setUsers] = useState(initialUsers);
  const [showMoreActionsDropdown, setShowMoreActionsDropdown] = useState(false);
  const [showSortByDropdown, setShowSortByDropdown] = useState(false);
  const [selectedMoreAction, setSelectedMoreAction] = useState("More Actions");
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

      // Check dots dropdowns
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
    return (users.length + 1).toString();
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
      {/* Header Component */}
      <Header
        adminName="Hi, Admin"
        adminImage="/assets/layout/admin.png"
        onNotificationClick={handleNotificationClick}
      />

      {/* Main Content */}
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          User Management
        </h1>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-5 border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div
                className="rounded-full w-16 h-16 flex items-center justify-center"
                style={{ backgroundColor: "#0000FF33" }}
              >
                <img src={stat.icon} alt={stat.label} className="w-8 h-8" />
              </div>
              <div>
                <p
                  className="text-sm font-medium mb-1"
                  style={{ color: "#0000FF" }}
                >
                  {stat.label}
                </p>
                <p className="text-2xl font-bold" style={{ color: "#0000FF" }}>
                  {stat.value}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mb-5">
          <h1 className="font-bold text-2xl">Users</h1>
        </div>

        {/* Users Table Controls */}
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
                      onClick={() => {
                        setSelectedMoreAction("More Actions");
                        setShowMoreActionsDropdown(false);
                      }}
                    >
                      More Actions
                    </button>
                    <button
                      className="w-full px-4 py-2 cursor-pointer text-left text-sm hover:bg-gray-50 transition-colors"
                      onClick={() => {
                        setSelectedMoreAction("Active");
                        setShowMoreActionsDropdown(false);
                      }}
                    >
                      Active
                    </button>
                    <button
                      className="w-full px-4 py-2 cursor-pointer text-left text-sm hover:bg-gray-50 transition-colors"
                      onClick={() => {
                        setSelectedMoreAction("Inactive");
                        setShowMoreActionsDropdown(false);
                      }}
                    >
                      Inactive
                    </button>
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
            <button
              className="bg-[#273E8E] text-white px-5 py-2 cursor-pointer rounded-full font-semibold"
              onClick={() => setShowAddModal(true)}
            >
              Add new user
            </button>
            <div className="relative">
              <input
                type="text"
                placeholder="Search"
                className="border border-[#00000080] rounded-[7px] px-12 py-3 pr-8 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors min-w-[300px]"
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M19 19L13 13M15 8C15 11.866 11.866 15 8 15C4.13401 15 1 11.866 1 8C1 4.13401 4.13401 1 8 1C11.866 1 15 4.13401 15 8Z"
                    stroke="#9CA3AF"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-[#EBEBEB] text-black">
                <th className="p-4 text-center">
                  <input type="checkbox" className="rounded" />
                </th>
                <th className="p-4 text-center font-medium">Name</th>
                <th className="p-4 text-center font-medium">Email</th>
                <th className="p-4 text-center font-medium">Phone</th>
                <th className="p-4 text-center font-medium">BVN</th>
                <th className="p-4 text-center font-medium">Date Registered</th>
                <th className="p-4 text-center font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((user, idx) => (
                <tr
                  key={idx}
                  className={`${idx % 2 === 0 ? "bg-[#F8F8F8]" : "bg-white"} `}
                >
                  <td className="p-4 text-center">
                    <input type="checkbox" className="rounded" />
                  </td>
                  <td className="p-4 text-center font-medium">{user.name}</td>
                  <td className="p-4 text-center text-black">{user.email}</td>
                  <td className="p-4 text-center text-black">{user.phone}</td>
                  <td className="p-4 text-center text-black">{user.bvn}</td>
                  <td className="p-4 text-center text-black">{user.date}</td>
                  <td className="flex items-center justify-end p-4 gap-2">
                    <button
                      className="bg-[#273E8E] text-white px-5 py-2 cursor-pointer rounded-full font-normal transition hover:bg-blue-800"
                      // style={{ minWidth: 160 }}
                      onClick={() => navigate(`/user-activity/${user.id}`)}
                    >
                      View Details
                    </button>
                    {/* Three-dot (vertical ellipsis) menu button */}
                    <div
                      className="relative ml-2.5"
                      ref={(el) => {
                        dotsDropdownRefs.current[idx] = el;
                      }}
                    >
                      <img
                        className="cursor-pointer"
                        src={images.dots}
                        alt=""
                        onClick={() => {
                          setOpenDropdownIndex(
                            openDropdownIndex === idx ? null : idx
                          );
                        }}
                      />
                      {openDropdownIndex === idx && (
                        <div
                          className="absolute top-full right-1.5 mt-3 w-48 bg-white border border-gray-200 rounded-md z-10"
                          style={{ boxShadow: "0 4px 16px #6D6C6C40" }}
                        >
                          <div className="py-1">
                            <button
                              className="w-full px-4 py-2 text-left text-md hover:bg-gray-50 transition-colors cursor-pointer"
                              onClick={() => {
                                navigate(`/user-activity/${user.id}/loans`);
                                setOpenDropdownIndex(null);
                              }}
                            >
                              View Loans
                            </button>
                            <button
                              className="w-full px-4 py-2 text-left text-md hover:bg-gray-50 transition-colors cursor-pointer"
                              onClick={() => {
                                navigate(
                                  `/user-activity/${user.id}/transactions`
                                );
                                setOpenDropdownIndex(null);
                              }}
                            >
                              View Transactions
                            </button>
                            <button
                              className="w-full px-4 py-2 text-left text-md hover:bg-gray-50 transition-colors cursor-pointer"
                              onClick={() => {
                                navigate(`/user-activity/${user.id}/orders`);
                                setOpenDropdownIndex(null);
                              }}
                            >
                              View Orders
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

      {/* Add New User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex justify-end h-[90vh]">
          <div
            className="fixed inset-0 backdrop-brightness-50 bg-black/30"
            onClick={() => setShowAddModal(false)}
          ></div>
          <div className="relative bg-white w-[500px] rounded-xl shadow-lg z-10 p-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800">Add New User</h2>
              <button
                className="cursor-pointer transition-colors"
                onClick={() => setShowAddModal(false)}
              >
                <img src={images.cross} alt="" className="w-8 h-8" />
              </button>
            </div>

            {formError && (
              <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-md border border-red-100">
                <p className="font-medium">{formError}</p>
              </div>
            )}

            <form onSubmit={handleAddUser} className="space-y-5">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter user's full name"
                  value={newUser.name}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter email address"
                  value={newUser.email}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Phone Number
                </label>
                <input
                  type="text"
                  name="phone"
                  className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter phone number"
                  value={newUser.phone}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  BVN
                </label>
                <input
                  type="text"
                  name="bvn"
                  className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter BVN number"
                  value={newUser.bvn}
                  onChange={handleInputChange}
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#2946A9] cursor-pointer text-white py-3 rounded-full font-semibold text-base hover:bg-blue-800 transition-colors mt-8"
              >
                Add User
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default User_mgt;
