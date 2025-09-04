import { useParams, useNavigate, useLocation } from "react-router-dom";
import { users } from "../../constants/usermgt";
import React, { useState } from "react";
import Header from "../../component/Header";
import images from "../../constants/images";

const activities = [
  { activity: "User Created account", date: "05-07-25/07:22AM" },
  { activity: "User Created account", date: "05-07-25/07:22AM" },
  { activity: "User Created account", date: "05-07-25/07:22AM" },
];

const UserActivity: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const user = users.find((u) => u.id === id);
  const [showEdit, setShowEdit] = useState(false);
  const [form, setForm] = useState({
    firstName: user?.name.split(" ")[1] || "",
    surname: user?.name.split(" ")[0] || "",
    email: user?.email || "",
    phone: user?.phone || "",
    bvn: user?.bvn || "",
    password: "",
    referral: "",
  });
  const [success, setSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically update the user in your backend or state
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setShowEdit(false);
    }, 1200);
  };

  // Handle notification click
  const handleNotificationClick = () => {
    console.log("Notification clicked in User Activity");
  };

  if (!user) return <div className="p-8 text-xl">User not found</div>;
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
      />

      {/* Main Content */}
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">{user.name}</h1>

        {/* Tabs */}
        <div className="flex gap-8 border-b border-gray-200 text-md mb-6">
          <button
            className={`pb-2 cursor-pointer relative ${
              !location.pathname.includes("/loans") &&
              !location.pathname.includes("/transactions") &&
              !location.pathname.includes("/orders")
                ? "text-black font-semibold"
                : "text-[#00000080]"
            }`}
          >
            Activity
            {!location.pathname.includes("/loans") &&
              !location.pathname.includes("/transactions") &&
              !location.pathname.includes("/orders") && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-full h-1 bg-[#273E8E] rounded-full"></div>
              )}
          </button>
          <button
            className={`pb-2 cursor-pointer relative ${
              location.pathname.includes("/loans")
                ? "text-black font-semibold"
                : "text-[#00000080]"
            }`}
            onClick={() => navigate(`/user-activity/${user.id}/loans`)}
          >
            Loans
            {location.pathname.includes("/loans") && (
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-full h-1 bg-[#273E8E] rounded-full"></div>
            )}
          </button>
          <button
            className={`pb-2 cursor-pointer relative ${
              location.pathname.includes("/transactions")
                ? "text-black font-semibold"
                : "text-[#00000080]"
            }`}
            onClick={() => navigate(`/user-activity/${user.id}/transactions`)}
          >
            Transactions
            {location.pathname.includes("/transactions") && (
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-full h-1 bg-[#273E8E] rounded-full"></div>
            )}
          </button>
          <button
            className={`pb-2 cursor-pointer relative ${
              location.pathname.includes("/orders")
                ? "text-black font-semibold"
                : "text-[#00000080]"
            }`}
            onClick={() => navigate(`/user-activity/${user.id}/orders`)}
          >
            Orders
            {location.pathname.includes("/orders") && (
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-full h-1 bg-[#273E8E] rounded-full"></div>
            )}
          </button>
        </div>

        {/* Profile Card */}
        <div
          className="bg-gradient-to-r from-[#4e4376] to-[#f9d423] rounded-2xl shadow-lg p-8 flex gap-8 items-center mb-8"
          style={{}}
        >
          <div
            className="flex flex-col items-center w-60 rounded-lg p-5"
            style={{
              background:
                "linear-gradient(162.4deg, rgba(93, 114, 194, 0.7) 12.04%, rgba(255, 165, 0, 0.35) 97.58%)",
              border: "1px solid",
              borderImageSource:
                "linear-gradient(146.63deg, #D1D1FF 3.6%, #FFA126 97.96%)",
              borderImageSlice: 1,
            }}
          >
            <img
              src={"/assets/images/profile.png"}
              alt={user.name}
              className="w-32 h-32 rounded-full object-cover border-4 border-white mb-4"
            />
            <div className="text-white text-xl font-semibold mb-1">
              {user.name}
            </div>
            <div className="text-[#FFFFFF80] text-sm mb-10">{user.email}</div>
            <button
              className="bg-white cursor-pointer text-gray-800 px-14 py-2 rounded-full font-semibold shadow"
              onClick={() => setShowEdit(true)}
            >
              Edit Profile
            </button>
            {showEdit && (
              <div className="fixed inset-0 z-50 flex justify-end items-stretch backdrop-blur-sm bg-black/30">
                <div className="bg-white rounded-l-3xl shadow-xl w-full max-w-lg h-screen p-6 relative flex flex-col">
                  <button
                    className="absolute cursor-pointer top-4 right-4 w-8 h-8 flex items-center justify-center"
                    onClick={() => setShowEdit(false)}
                  >
                    <img src={images.cross} alt="" />
                  </button>
                  <h2 className="text-xl font-semibold mb-4 text-left">
                    Edit Profile
                  </h2>
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-gray-300"></div>
                  </div>
                  <form
                    className="flex-1 flex flex-col justify-between"
                    onSubmit={handleSave}
                  >
                    <div className="space-y-3 flex-1">
                      <div>
                        <label className="block text-gray-700 text-sm mb-1">
                          First Name
                        </label>
                        <input
                          type="text"
                          className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500"
                          placeholder="Enter your first name"
                          value={form.firstName}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              firstName: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 text-sm mb-1">
                          Surname
                        </label>
                        <input
                          type="text"
                          className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500"
                          placeholder="Enter your surname"
                          value={form.surname}
                          onChange={(e) =>
                            setForm((f) => ({ ...f, surname: e.target.value }))
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 text-sm mb-1">
                          Email Address
                        </label>
                        <input
                          type="email"
                          className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500"
                          placeholder="Enter your email address"
                          value={form.email}
                          onChange={(e) =>
                            setForm((f) => ({ ...f, email: e.target.value }))
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 text-sm mb-1">
                          Phone Number
                        </label>
                        <input
                          type="text"
                          className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500"
                          placeholder="Enter your phone number"
                          value={form.phone}
                          onChange={(e) =>
                            setForm((f) => ({ ...f, phone: e.target.value }))
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 text-sm mb-1">
                          BVN
                        </label>
                        <input
                          type="text"
                          className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500"
                          placeholder="BVN Number"
                          value={form.bvn}
                          onChange={(e) =>
                            setForm((f) => ({ ...f, bvn: e.target.value }))
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 text-sm mb-1">
                          Password
                        </label>
                        <input
                          type="password"
                          className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500"
                          placeholder="Enter Password"
                          value={form.password}
                          onChange={(e) =>
                            setForm((f) => ({ ...f, password: e.target.value }))
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 text-sm mb-1">
                          Referral Code
                        </label>
                        <input
                          type="text"
                          className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500"
                          placeholder="Enter Referral Code (Optional)"
                          value={form.referral}
                          onChange={(e) =>
                            setForm((f) => ({ ...f, referral: e.target.value }))
                          }
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <button
                        type="submit"
                        className="w-full bg-[#273E8E] cursor-pointer text-white text-sm py-3 rounded-full font-medium hover:bg-blue-700 transition-colors"
                      >
                        Save
                      </button>
                      {success && (
                        <div className="text-green-600 text-center font-semibold mt-2">
                          Profile updated!
                        </div>
                      )}
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
          <div className="flex-1 grid grid-cols-2 gap-x-12 gap-y-4 text-white text-lg">
            <div>
              <div className="text-sm text-[#FFFFFF80] mb-2">First Name</div>
              <div>{user.name.split(" ")[1] || user.name}</div>
            </div>
            <div>
              <div className="text-sm text-[#FFFFFF80] mb-2">Password</div>
              <div>**********</div>
            </div>
            <div>
              <div className="text-sm text-[#FFFFFF80] mb-2">Surname</div>
              <div>{user.name.split(" ")[0]}</div>
            </div>
            <div>
              <div className="text-sm text-[#FFFFFF80] mb-2">Referral Code</div>
              <div>N/A</div>
            </div>
            <div>
              <div className="text-sm text-[#FFFFFF80] mb-2">Email Address</div>
              <div>{user.email}</div>
            </div>
            <div>
              <div className="text-sm text-[#FFFFFF80] mb-2">BVN</div>
              <div>{user.bvn}</div>
            </div>
            <div>
              <div className="text-sm text-[#FFFFFF80] mb-2">Phone Number</div>
              <div>{user.phone}</div>
            </div>
          </div>
        </div>

        {/* Activity Section */}
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Activity</h2>
          <div className="flex items-center mb-5">
            <select className="border border-[#00000080] rounded-lg px-4 bg-white py-2 text-sm cursor-pointer">
              <option>More Actions</option>
            </select>
          </div>
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <table className="min-w-full">
              <thead className="text-md">
                <tr className="bg-[#EBEBEB] text-black">
                  <th className="p-4 w-12">
                    <input className="cursor-pointer" type="checkbox" />
                  </th>
                  <th className="p-4 text-left">Activity</th>
                  <th className="p-4 text-left">Date</th>
                </tr>
              </thead>
              <tbody>
                {activities.map((item, idx) => (
                  <tr
                    key={idx}
                    className={`${
                      idx % 2 === 0 ? "bg-[#F8F8F8]" : "bg-white"
                    } `}
                  >
                    <td className="p-4">
                      <input className="cursor-pointer" type="checkbox" />
                    </td>
                    <td className="p-4">{item.activity}</td>
                    <td className="p-4">{item.date}</td>
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

export default UserActivity;
