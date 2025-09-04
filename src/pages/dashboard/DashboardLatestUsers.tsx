import React from "react";
import type { User } from "../../constants/dashboard";
import images from "../../constants/images";

interface DashboardLatestUsersProps {
  users: User[];
}

const DashboardLatestUsers: React.FC<DashboardLatestUsersProps> = ({
  users,
}) => (
  <div>
    <h2 className="text-2xl mt-[-35px] font-bold text-black mb-10">
      Latest Users
    </h2>
    <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
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
          {users.slice(0, 3).map((user, idx) => (
            <tr
              key={idx}
              className={`${
                idx !== users.slice(0, 3).length - 1
                  ? "border-b border-gray-100"
                  : ""
              } ${
                idx % 2 === 0 ? "bg-[#F8F8F8]" : "bg-white"
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
    </div>
  </div>
);

export default DashboardLatestUsers;
