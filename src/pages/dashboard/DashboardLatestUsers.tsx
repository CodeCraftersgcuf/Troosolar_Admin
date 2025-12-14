import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { User } from "../../constants/dashboard";
import images from "../../constants/images";

interface DashboardLatestUsersProps {
  users: User[];
}

const DashboardLatestUsers: React.FC<DashboardLatestUsersProps> = ({
  users,
}) => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Pagination logic
  const totalPages = Math.ceil(users.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = users.slice(startIndex, endIndex);

  return (
  <div>
    <h2 className="text-2xl mt-[-35px] font-bold text-black mb-10">
      Latest Users
    </h2>
    <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
      {!users || users.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <svg
            className="w-16 h-16 text-gray-400 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
          <p className="text-gray-500 text-lg font-medium mb-2">No Users Yet</p>
          <p className="text-gray-400 text-sm">There are no users to display.</p>
        </div>
      ) : (
        <>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-[#EBEBEB] border border-gray-200">
                <th className="px-6 py-4 text-black font-medium flex justify-center items-center">
                  <input type="checkbox" className="rounded cursor-pointer" />
                </th>
                <th className="px-6 py-4 text-black font-medium text-center">
                  Name
                </th>
                <th className="px-6 py-4 text-black font-medium text-center">
                  Email
                </th>
                <th className="px-6 py-4 text-black font-medium text-center">
                  Phone
                </th>
                <th className="px-6 py-4 text-black font-medium text-center">
                  BVN
                </th>
                <th className="px-6 py-4 text-black font-medium text-center">
                  Date Registered
                </th>
                <th className="px-6 py-4 text-black font-medium text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {currentUsers.map((user, idx) => (
            <tr
              key={user.id}
              className={`${idx !== currentUsers.length - 1
                  ? "border-b border-gray-100"
                  : ""
                } ${idx % 2 === 0 ? "bg-[#F8F8F8]" : "bg-white"
                } `}
            >
              <td className="px-6 py-4 whitespace-nowrap flex justify-center items-center">
                <input type="checkbox" className="rounded cursor-pointer" />
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-gray-900 font-medium text-center">
                {user.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-black text-center">
                {user.email}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-black text-center">
                {user.phone}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-black text-center">
                {user.bvn}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-black text-center">
                {user.date}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center justify-end gap-4">
                  <button
                    className="text-white px-4 py-2 rounded-full cursor-pointer text-sm font-medium transition hover:opacity-90"
                    style={{ backgroundColor: "#273E8E" }}
                    onClick={() => {
                      // Prepare user data with fallback dummy values
                      const userData = {
                        id: user.id || "N/A",
                        name: user.name || "Unknown User",
                        email: user.email || "unknown@email.com",
                        phone: user.phone || "0000000000",
                        bvn: user.bvn || "00000000000",
                        date: user.date || "01/01/1970",
                      };
                      navigate(`/user-activity/${user.id}`, { state: userData });
                    }}
                  >
                    View Details
                  </button>
                  <button className=" w-8 h-8 rounded flex items-center justify-center  cursor-pointer">
                    <img src={images.dots} alt="" />
                  </button>
                </div>
              </td>
            </tr>
              ))}
            </tbody>
          </table>
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-white">
          <div className="flex items-center text-sm text-gray-700">
            <span>
              Showing {startIndex + 1} to {Math.min(endIndex, users.length)} of {users.length} results
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
  </div>
  );
};

export default DashboardLatestUsers;
