import { useState, useEffect } from 'react';
import images from '../../constants/images';

//Code Related to Integration
import { addPartnerFinancing, updatePartnerFinancing } from '../../utils/mutations/finance';
import { useMutation } from '@tanstack/react-query';
import Cookies from "js-cookie";

interface AddPartnerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (partnerData: any) => void;
  editMode?: boolean;
  editData?: any;
}

const AddPartner = ({ isOpen, onClose, onSave, editMode = false, editData }: AddPartnerProps) => {
  const [formData, setFormData] = useState({
    partnerName: '',
    partnerEmail: '',
    status: ''
  });
  const [emailError, setEmailError] = useState<string>("");

  useEffect(() => {
    if (editMode && editData) {
      setFormData({
        partnerName: editData.name || '',
        partnerEmail: editData.partnerEmail || '', // Use partnerEmail from editData
        status: editData.status || ''
      });
    } else {
      setFormData({
        partnerName: '',
        partnerEmail: '',
        status: ''
      });
    }
  }, [editMode, editData, isOpen]);

  const token = Cookies.get("token");

  // Add partner mutation
  const addMutation = useMutation({
    mutationFn: (payload: any) =>
      addPartnerFinancing(
        {
          name: payload.partnerName,
          email: payload.partnerEmail,
          status: payload.status,
        },
        token || ""
      ),
    onSuccess: () => {
      onSave(formData);
      setFormData({
        partnerName: '',
        partnerEmail: '',
        status: ''
      });
      onClose();
    },
  });

  // Update partner mutation
  const updateMutation = useMutation({
    mutationFn: (payload: any) =>
      updatePartnerFinancing(
        editData?.id,
        {
          name: payload.partnerName,
          email: payload.partnerEmail,
          status: payload.status,
        },
        token || ""
      ),
    onSuccess: () => {
      onSave(formData);
      setFormData({
        partnerName: '',
        partnerEmail: '',
        status: ''
      });
      onClose();
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (name === "partnerEmail") {
      // Simple email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      setEmailError(value && !emailRegex.test(value) ? "Please enter a valid email address." : "");
    }
  };

  const handleSave = () => {
    if (editMode) {
      updateMutation.mutate(formData);
    } else {
      addMutation.mutate(formData);
    }
  };

  const isFormValid =
    formData.partnerName &&
    formData.partnerEmail &&
    formData.status &&
    !emailError;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-brightness-50 bg-opacity-50 flex items-start justify-end z-50">
      <div className="bg-white rounded-lg shadow-xl w-[550px] max-w-[90vw] max-h-[80vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            {editMode ? "Edit Partner" : "Add Partner"}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full cursor-pointer transition-colors"
          >
           <img src={images.cross} alt="" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Partner Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Partner Name
            </label>
            <div className="relative">
              <input
                type="text"
                name="partnerName"
                value={formData.partnerName}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#273E8E] focus:border-[#273E8E] bg-white text-gray-700"
                placeholder="Enter partner name"
              />
            </div>
          </div>

          {/* Partner Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Partner Email
            </label>
            <div className="relative">
              <input
                type="email"
                required={true}
                name="partnerEmail"
                value={formData.partnerEmail}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#273E8E] focus:border-[#273E8E] bg-white text-gray-700 ${
                  emailError ? "border-red-500" : ""
                }`}
                placeholder="Enter partner email"
              />
              {emailError && (
                <span className="text-xs text-red-600 mt-1 absolute left-0 top-full">
                  {emailError}
                </span>
              )}
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <div className="relative">
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#273E8E] focus:border-[#273E8E] appearance-none bg-white text-gray-500"
              >
                <option value="">Select status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-gray-200">
          <button
            onClick={handleSave}
            className={`w-full bg-[#273E8E] text-white py-3 px-6 rounded-full font-medium hover:bg-[#1f2f7a] transition-colors cursor-pointer ${
              !isFormValid ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={
              addMutation.isPending ||
              updateMutation.isPending ||
              !isFormValid
            }
          >
            {addMutation.isPending || updateMutation.isPending ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};


export default AddPartner;
