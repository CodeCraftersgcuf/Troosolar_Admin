import images from "../../constants/images";
import React from "react";

interface Props {
  showAddModal: boolean;
  setShowAddModal: (v: boolean) => void;
  formError: string;
  handleAddUser: (e: React.FormEvent) => void;
  newUser: {
    name: string;
    email: string;
    phone: string;
    bvn: string;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const UserMgtAddUserModal: React.FC<Props> = ({
  showAddModal,
  setShowAddModal,
  formError,
  handleAddUser,
  newUser,
  handleInputChange,
}) => (
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
);

export default UserMgtAddUserModal;
