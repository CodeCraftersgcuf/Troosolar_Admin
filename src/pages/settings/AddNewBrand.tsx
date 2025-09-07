import { useState, useEffect } from 'react';
import images from '../../constants/images';


//Code Related to the Integration
import { useMutation } from '@tanstack/react-query';
import Cookies from "js-cookie";
import { addBrand } from '../../utils/mutations/brands';
import { updateBrand } from '../../utils/mutations/brands';

interface AddNewBrandProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (categoryName: string, brandName: string, status: string) => void;
  editMode?: boolean;
  editData?: any;
}

const AddNewBrand = ({ isOpen, onClose, onSave, editMode = false, editData }: AddNewBrandProps) => {
  const [categoryName, setCategoryName] = useState('');
  const [brandName, setBrandName] = useState('');
  const [status, setStatus] = useState('');
  const token = Cookies.get("token");

  useEffect(() => {
    if (editMode && editData) {
      setCategoryName(editData.category || '');
      setBrandName(editData.brandName || '');
      setStatus(editData.status || '');
    } else {
      setCategoryName('');
      setBrandName('');
      setStatus('');
    }
  }, [editMode, editData, isOpen]);

  // Add brand mutation
  const addMutation = useMutation({
    mutationFn: (payload: { title: string; category_id: string }) =>
      addBrand({ title: payload.title, category_id: payload.category_id }, token || ""),
    onSuccess: () => {
      onSave(categoryName, brandName, status);
      setCategoryName('');
      setBrandName('');
      setStatus('');
      onClose();
    },
  });

  // Update brand mutation
  const updateMutation = useMutation({
    mutationFn: (payload: { id: string; title: string; category_id: string }) =>
      updateBrand(payload.id, { title: payload.title, category_id: payload.category_id }, token || ""),
    onSuccess: () => {
      onSave(categoryName, brandName, status);
      setCategoryName('');
      setBrandName('');
      setStatus('');
      onClose();
    },
  });

  const handleSave = () => {
    if (categoryName.trim() && brandName.trim() && status) {
      if (editMode && editData) {
        updateMutation.mutate({
          id: editData.id,
          title: brandName,
          category_id: categoryName,
        });
      } else {
        addMutation.mutate({
          title: brandName,
          category_id: categoryName,
        });
      }
    }
  };

  const handleClose = () => {
    setCategoryName('');
    setBrandName('');
    setStatus('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-brightness-50 bg-opacity-50 flex items-start justify-end z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl mx-4 relative">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">{editMode ? "Edit Brand" : "Add Brand"}</h2>
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-full cursor-pointer transition-colors"
          >
            <img src={images.cross} alt="" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-6">
          {/* Category Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category Name
            </label>
            <div className="relative">
              <select
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#273E8E] focus:border-[#273E8E] outline-none appearance-none bg-white text-gray-500"
              >
                <option value="">Select category</option>
                <option value="1">Solar Panel</option>
                <option value="2">Inverter</option>
                <option value="3">Batteries</option>
                <option value="4">MPPT Chargers</option>
                <option value="5">LED Bulbs</option>
                <option value="6">Solar Fans</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Brand Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Brand Name
            </label>
            <input
              type="text"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              placeholder="Enter brand name"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#273E8E] focus:border-[#273E8E] outline-none transition-colors"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <div className="relative">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#273E8E] focus:border-[#273E8E] outline-none appearance-none bg-white text-gray-500"
              >
                <option value="">Select status</option>
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4">
          <button
            onClick={handleSave}
            disabled={!categoryName.trim() || !brandName.trim() || !status}
            className="w-full bg-[#273E8E] text-white py-3 rounded-full font-medium hover:bg-[#1f2f7a] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            {addMutation.isPending || updateMutation.isPending ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddNewBrand;
