import React, { useState, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Header from "../../component/Header";
import images from "../../constants/images";
import { getSingleUser } from "../../utils/queries/users";
import { useQuery, useMutation } from "@tanstack/react-query";
import Cookies from "js-cookie";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { editUser } from "../../utils/mutations/user";
// Helper function to format date from API
const formatActivityDate = (dateString: string) => {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear().toString().slice(-2);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = date.getHours() >= 12 ? 'PM' : 'AM';

  return `${day}-${month}-${year}/${hours}:${minutes}${ampm}`;
};

const UserActivity: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const token = Cookies.get("token");

  // Always fetch user from API using id from params
  const { data: apiData, isLoading: isApiLoading } = useQuery({
    queryKey: ["single-user", id],
    queryFn: () => getSingleUser(id || "", token || ""),
    enabled: !!id && !!token,
    staleTime: 5 * 60 * 1000, // cache for 5 minutes
  });

  console.log("Single User API Data:", apiData);
  // Memoize user data so it persists across tab changes
  const user = useMemo(() => {
    if (!apiData?.data) return null;
    return {
      id: String(apiData.data.id),
      name: `${apiData.data.first_name} ${apiData.data.sur_name}`,
      email: apiData.data.email,
      phone: apiData.data.phone,
      bvn: apiData.data.bvn || "",
      date: apiData.data.created_at
        ? new Date(apiData.data.created_at).toLocaleDateString("en-GB")
        : "",
    };
  }, [apiData]);

  // Memoize activities data from API
  const activities = useMemo(() => {
    if (!apiData?.data?.activitys) return [];
    return apiData.data.activitys.map((activity: { activity: string; created_at: string }) => ({
      activity: activity.activity,
      date: formatActivityDate(activity.created_at)
    }));
  }, [apiData]);

  // Move hooks above all conditional returns
  const [showEdit, setShowEdit] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    surname: "",
    email: "",
    phone: "",
    bvn: "",
    password: "",
    referral: "",
  });
  const [success, setSuccess] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Populate form when user data is available
  React.useEffect(() => {
    if (user && apiData?.data) {
      setForm({
        firstName: apiData.data.first_name || "",
        surname: apiData.data.sur_name || "",
        email: apiData.data.email || "",
        phone: apiData.data.phone || "",
        bvn: apiData.data.bvn || "",
        password: "",
        referral: apiData.data.refferal_code || "",
      });
    }
  }, [user, apiData]);

  // Edit user mutation
  const editUserMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      return await editUser(user?.id || "", formData, token || "");
    },
    onSuccess: () => {
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setShowEdit(false);
        // Reset form and image states
        setSelectedImage(null);
        setImagePreview(null);
      }, 1200);
    },
    onError: (error) => {
      console.error("Failed to update user:", error);
      alert("Failed to update user profile. Please try again.");
    },
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    // Create FormData for file upload
    const formData = new FormData();
    
    // Add form fields
    if (form.firstName) formData.append('first_name', form.firstName);
    if (form.surname) formData.append('sur_name', form.surname);
    if (form.email) formData.append('email', form.email);
    if (form.phone) formData.append('phone', form.phone);
    if (form.bvn) formData.append('bvn', form.bvn);
    if (form.password) formData.append('password', form.password);
    if (form.referral) formData.append('referral', form.referral);
    
    // Add image file if selected
    if (selectedImage) {
      console.log('Adding image to FormData:', selectedImage.name, selectedImage.type, selectedImage.size);
      formData.append('profile_picture', selectedImage);
    }

    // Debug: Log FormData contents
    console.log('FormData contents:');
    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }

    editUserMutation.mutate(formData);
  };

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle notification click
  const handleNotificationClick = () => {
    console.log("Notification clicked in User Activity");
  };

  // Show loading indicator if fetching from API
  if (isApiLoading) {
    return (
      <div className="bg-[#F5F7FF] min-h-screen flex items-center justify-center">
        <LoadingSpinner message="Loading user details..." />
      </div>
    );
  }

  // Show not found if user is still not available
  if (!user) return <div className="p-8 text-xl">User not found</div>;

  return (
    <div className="bg-[#F5F7FF] min-h-screen">
      <Header
        adminName="Hi, Admin"
        adminImage="/assets/layout/admin.png"
        onNotificationClick={handleNotificationClick}
      />
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">{user.name}</h1>
        {/* Tabs */}
        <div className="flex gap-8 border-b border-gray-200 text-md mb-6">
          <button
            className={`pb-2 cursor-pointer relative ${!location.pathname.includes("/loans") &&
              !location.pathname.includes("/transactions") &&
              !location.pathname.includes("/orders")
              ? "text-black font-semibold"
              : "text-[#00000080]"
              }`}
            onClick={() => navigate(`/user-activity/${user.id}`)}
          >
            Activity
            {!location.pathname.includes("/loans") &&
              !location.pathname.includes("/transactions") &&
              !location.pathname.includes("/orders") && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-full h-1 bg-[#273E8E] rounded-full"></div>
              )}
          </button>
          <button
            className={`pb-2 cursor-pointer relative ${location.pathname.includes("/loans")
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
            className={`pb-2 cursor-pointer relative ${location.pathname.includes("/transactions")
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
            className={`pb-2 cursor-pointer relative ${location.pathname.includes("/orders")
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
            <div className="w-32 h-32 rounded-full object-cover border-4 border-white mb-4 overflow-hidden flex items-center justify-center bg-gray-200">
              {apiData?.data?.profile_picture ? (
                <img
                  src={`https://troosolar.hmstech.org/users/${apiData.data.profile_picture}`}
                  alt={user.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <div className={`w-full h-full flex items-center justify-center text-white text-lg font-semibold ${apiData?.data?.profile_picture ? 'hidden' : ''}`}>
                {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </div>
            </div>
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
                  {isApiLoading && (
                    <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
                      <div className="text-center">
                        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                        <p className="text-sm text-gray-600">Loading user data...</p>
                      </div>
                    </div>
                  )}
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
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full bg-gray-300 overflow-hidden flex items-center justify-center">
                        {imagePreview ? (
                          <img 
                            src={imagePreview} 
                            alt="Profile preview" 
                            className="w-full h-full object-cover"
                          />
                        ) : apiData?.data?.profile_picture ? (
                          <img 
                            src={`https://troosolar.hmstech.org/users/${apiData.data.profile_picture}`} 
                            alt="Profile" 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <div className={`w-full h-full flex items-center justify-center text-gray-500 text-xs ${imagePreview || apiData?.data?.profile_picture ? 'hidden' : ''}`}>
                          No Image
                        </div>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </div>
                    </div>
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
                        disabled={editUserMutation.isPending}
                        className={`w-full bg-[#273E8E] cursor-pointer text-white text-sm py-3 rounded-full font-medium hover:bg-blue-700 transition-colors flex items-center justify-center ${
                          editUserMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        {editUserMutation.isPending ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                            Updating...
                          </>
                        ) : (
                          'Save'
                        )}
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
              <div className="text-sm text-[#FFFFFF80] mb-2">Surname</div>
              <div>{user.name.split(" ")[1] || user.name}</div>
            </div>
            <div>
              <div className="text-sm text-[#FFFFFF80] mb-2">Password</div>
              <div>**********</div>
            </div>
            <div>
              <div className="text-sm text-[#FFFFFF80] mb-2">First Name</div>
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
                {activities.length > 0 ? (
                  activities.map((item: { activity: string; date: string }, idx: number) => (
                    <tr
                      key={idx}
                      className={`${idx % 2 === 0 ? "bg-[#F8F8F8]" : "bg-white"
                        } `}
                    >
                      <td className="p-4">
                        <input className="cursor-pointer" type="checkbox" />
                      </td>
                      <td className="p-4">{item.activity}</td>
                      <td className="p-4">{item.date}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="p-8 text-center text-gray-500">
                      No activities found for this user.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserActivity;
