import images from "../../constants/images";
import React, { useState } from "react";

//Code Related to the Integration
import { addUser } from "../../utils/mutations/user";
import { useMutation } from "@tanstack/react-query";
import Cookies from "js-cookie";

interface Props {
  showAddModal: boolean;
  setShowAddModal: (v: boolean) => void;
  onUserAdded?: () => void;
  newUser: {
    name: string;
    email: string;
    phone: string;
    bvn: string;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const UserMgtAddUserModal: React.FC<Props> = ({
  setShowAddModal,
  onUserAdded,
  newUser,
  handleInputChange,
}) => {
  const [formError, setFormError] = useState("");
  const token = Cookies.get("token");

  // Add user mutation
  const addUserMutation = useMutation({
    mutationFn: (userData: { first_name: string; email: string; phone: string; bvn: string }) =>
      addUser(userData, token || ""),
    onSuccess: () => {
      setFormError("");
      setShowAddModal(false);
      // Reset form
      handleInputChange({
        target: { name: "name", value: "" }
      } as React.ChangeEvent<HTMLInputElement>);
      handleInputChange({
        target: { name: "email", value: "" }
      } as React.ChangeEvent<HTMLInputElement>);
      handleInputChange({
        target: { name: "phone", value: "" }
      } as React.ChangeEvent<HTMLInputElement>);
      handleInputChange({
        target: { name: "bvn", value: "" }
      } as React.ChangeEvent<HTMLInputElement>);
      if (onUserAdded) onUserAdded();
    },
    onError: (error: unknown) => {
      let errorMessage = "Failed to add user. Please try again.";
      if (error && typeof error === 'object' && 'response' in error) {
        const apiError = error as { response?: { data?: { message?: string } } };
        errorMessage = apiError?.response?.data?.message || errorMessage;
      }
      setFormError(errorMessage);
    },
  });

  // Handle form submission
  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

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

   
      setFormError("Phone number must be at least 10 digits");
 
      setFormError("BVN must be at least 11 digits");



    // Submit the form
    addUserMutation.mutate({
      first_name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      bvn: newUser.bvn,
    });
  };

  // Check if all fields are filled
  const isFormValid = newUser.name && newUser.email && newUser.phone && newUser.bvn;

  return (
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
          disabled={!isFormValid || addUserMutation.isPending}
          className={`w-full py-3 rounded-full font-semibold text-base transition-colors mt-8 ${
            isFormValid && !addUserMutation.isPending
              ? "bg-[#2946A9] cursor-pointer text-white hover:bg-blue-800"
              : "bg-gray-300 cursor-not-allowed text-gray-500"
          }`}
        >
          {addUserMutation.isPending ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Adding User...
            </div>
          ) : (
            "Add User"
          )}
        </button>
      </form>
    </div>
  </div>
  );
};

export default UserMgtAddUserModal;
