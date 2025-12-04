import images from "../../constants/images";

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  bvn: string;
  date: string;
}

interface Props {
  users: User[];
  dotsDropdownRefs: React.MutableRefObject<(HTMLDivElement | null)[]>;
  openDropdownIndex: number | null;
  setOpenDropdownIndex: (idx: number | null) => void;
  navigate: (path: string) => void;
}

const UserMgtUsersTable: React.FC<Props> = ({
  users,
  dotsDropdownRefs,
  openDropdownIndex,
  setOpenDropdownIndex,
  navigate,
}) => (
  <div className="bg-white rounded-lg shadow overflow-x-auto">
    {users.length === 0 ? (
      <div className="py-16 text-center text-gray-500 text-lg">
        No users found.
      </div>
    ) : (
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
                  onClick={() => {
                    navigate(`/user-activity/${user.id}`);
                  }}
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
                            navigate(`/user-activity/${user.id}/transactions`);
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
    )}
  </div>
);

export default UserMgtUsersTable;
