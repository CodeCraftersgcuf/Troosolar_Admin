import { useState } from "react";
import { adminData, allAdminsData } from "./admin.ts";
import EditProfile from "./EditProfile.tsx";
import AdminDetail from "./AdminDetail.tsx";

const Admin = () => {
  const [activeTab, setActiveTab] = useState<"activity" | "allAdmins">(
    "activity"
  );
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAdminId, setSelectedAdminId] = useState<string | null>(null);

  const handleEditProfile = () => {
    setIsEditProfileOpen(true);
  };

  const handleCloseEditProfile = () => {
    setIsEditProfileOpen(false);
  };

  const handleViewDetails = (adminId: string) => {
    setSelectedAdminId(adminId);
  };

  const handleGoBack = () => {
    setSelectedAdminId(null);
  };

  // If viewing admin details, show AdminDetail component
  if (selectedAdminId) {
    return <AdminDetail adminId={selectedAdminId} onGoBack={handleGoBack} />;
  }

  return (
    <div className="w-full bg-[#F5F7FF]">
      {/* Admin Profile Card */}
      <div
        className="bg-gradient-to-r from-[#4e4376] to-[#f9d423] rounded-lg mb-6 relative"
        style={{
          width: "100%",
          maxWidth: "1209px",
          height: "491px",
          margin: "0 auto",
        }}
      >
        <div className="absolute inset-0 p-12 flex">
          {/* Left Section - Profile Card */}
          <div
            className="bg-gradient-to-br from-[#5D72C2] to-[#FFA50080] bg-opacity-20 border border-[#FFA126] border-opacity-30 rounded-lg p-8 flex flex-col items-center justify-center"
            style={{ width: "310px", height: "100%" }}
          >
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white mb-6">
              <img
                src="/assets/images/profile.png"
                alt="Admin Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <h2 className="text-[#FFFFFF] text-2xl font-medium mb-2 text-center">
              {adminData.surname} {adminData.firstName}
            </h2>
            <p className="text-[#FFFFFF] text-xs opacity-90 mb-20 text-center">
              {adminData.email}
            </p>

            <button
              onClick={handleEditProfile}
              className="bg-white text-gray-900 px-8 py-3 rounded-full font-semibold transition-colors w-full max-w-2xl cursor-pointer"
            >
              Edit Profile
            </button>
          </div>

          {/* Right Section - Details */}
          <div className="flex-1 ml-12 flex justify-between">
            {/* Middle Column - Personal Details */}
            <div className="text-white space-y-8 flex-1">
              <div>
                <p className="text-sm opacity-75 mb-1">First Name</p>
                <p className="text-lg font-medium">{adminData.firstName}</p>
              </div>
              <div>
                <p className="text-sm opacity-75 mb-1">Surname</p>
                <p className="text-lg font-medium">{adminData.surname}</p>
              </div>
              <div>
                <p className="text-sm opacity-75 mb-1">Email Address</p>
                <p className="text-lg font-medium">{adminData.email}</p>
              </div>
              <div>
                <p className="text-sm opacity-75 mb-1">Password</p>
                <p className="text-lg font-medium">{adminData.password}</p>
              </div>
            </div>

            {/* Right Column - BVN and Add Admin Button */}
            <div className="text-white text-right flex flex-col justify-between">
              <div>
                <p className="text-sm opacity-75 mb-1">BVN</p>
                <p className="text-lg font-medium">{adminData.bvn}</p>
              </div>

              <button className="bg-white text-[#000000] px-6 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors cursor-pointer">
                Add new Admin
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Section */}
      <div className="mt-12 px-2">
        <div className="mb-8">
          {/* Tab Group Container */}
          <div
            className="bg-white rounded-full p-2 shadow-sm border border-[#CDCDCD] flex"
            style={{ width: "235px", height: "60px" }}
          >
            <button
              onClick={() => setActiveTab("activity")}
              className={`px-5 py-2 text-sm rounded-full font-medium transition-colors flex-1 cursor-pointer ${
                activeTab === "activity"
                  ? "bg-[#273E8E] text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Activity
            </button>
            <button
              onClick={() => setActiveTab("allAdmins")}
              className={`px-5 py-2 text-sm rounded-full font-medium transition-colors flex-1 cursor-pointer ${
                activeTab === "allAdmins"
                  ? "bg-[#273E8E] text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              All Admins
            </button>
          </div>

          {/* More Actions and Search Row */}
          <div className="mt-4 flex justify-between items-center">
            <button className="bg-white text-gray-600 px-6 py-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors flex items-center space-x-2 shadow-sm cursor-pointer">
              <span>More Actions</span>
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="currentColor"
              >
                <path d="M2 4l4 4 4-4" />
              </svg>
            </button>

            {/* Search Bar - Only show for All Admins tab */}
            {activeTab === "allAdmins" && (
              <div className="relative w-80">
                <input
                  type="text"
                  placeholder="Search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-12 pr-6 py-3.5 border border-[#00000080] rounded-lg text-[15px] w-[320px] focus:outline-none bg-white shadow-[0_2px_6px_rgba(0,0,0,0.05)] placeholder-gray-400"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    className="text-gray-400"
                  >
                    <path
                      d="M7.333 12.667A5.333 5.333 0 1 0 7.333 2a5.333 5.333 0 0 0 0 10.667ZM14 14l-2.9-2.9"
                      stroke="currentColor"
                      strokeWidth="1.33"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Activity Table */}
        {activeTab === "activity" && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-[#EBEBEB] px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <div className="font-medium text-gray-700 text-sm">
                    Activity
                  </div>
                </div>
                <div className="font-medium text-gray-700 text-sm text-center">
                  Date
                </div>
              </div>
            </div>
            <div className="divide-y divide-gray-100">
              {adminData.activity.map((activity, index) => (
                <div
                  key={activity.id}
                  className={`px-6 py-4 ${
                    index % 2 === 0 ? "bg-[#F8F8F8]" : "bg-white"
                  } transition-colors border-b border-gray-100 last:border-b-0 hover:bg-gray-50`}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-gray-800 text-sm">
                        {activity.description}
                      </span>
                    </div>
                    <div className="text-gray-600 text-sm text-center">
                      {activity.date}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Admins Tab Content */}
        {activeTab === "allAdmins" && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              {/* Table Head */}
              <thead className="bg-[#EBEBEB]">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-4 text-center text-sm font-medium text-black"
                  >
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span>Name</span>
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-center text-sm font-medium text-black"
                  >
                    Email
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-center text-sm font-medium text-black"
                  >
                    Role
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-center text-sm font-medium text-black"
                  >
                    BVN
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-center text-sm font-medium text-black"
                  >
                    Date Joined
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-center text-sm font-medium text-black"
                  >
                    Action
                  </th>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody className="bg-white divide-y divide-gray-100">
                {allAdminsData.map((admin, index) => (
                  <tr
                    key={admin.id}
                    className={`${
                      index % 2 === 0 ? "bg-[#F8F8F8]" : "bg-white"
                    } transition-colors border-b border-gray-100 last:border-b-0`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 font-medium">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span>
                          {admin.firstName} {admin.surname}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black text-center">
                      {admin.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black text-center">
                      {admin.role}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black text-center">
                      {admin.bvn}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black text-center">
                      {admin.dateJoined}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => handleViewDetails(admin.id)}
                        className="bg-[#273E8E] text-white px-5 py-3 rounded-full text-sm hover:bg-[#1f2f7a] transition-colors cursor-pointer"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      <EditProfile
        isOpen={isEditProfileOpen}
        onClose={handleCloseEditProfile}
        adminData={adminData}
      />
    </div>
  );
};

export default Admin;
