import { useState } from 'react';
import images from '../../constants/images';

interface AddPartnerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (partnerData: any) => void;
}

const AddPartner = ({ isOpen, onClose, onSave }: AddPartnerProps) => {
  const [formData, setFormData] = useState({
    partnerName: '',
    partnerEmail: '',
    status: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    onSave(formData);
    setFormData({
      partnerName: '',
      partnerEmail: '',
      status: ''
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-brightness-50 bg-opacity-50 flex items-start justify-end z-50">
      <div className="bg-white rounded-lg shadow-xl w-[550px] max-w-[90vw] max-h-[80vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Add Partner</h2>
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
              <select
                name="partnerName"
                value={formData.partnerName}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#273E8E] focus:border-[#273E8E] appearance-none bg-white text-gray-500"
              >
                <option value="">Select category</option>
                <option value="ABC Partner">ABC Partner</option>
                <option value="XYZ Partner">XYZ Partner</option>
                <option value="DEF Partner">DEF Partner</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Partner Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Partner Email
            </label>
            <div className="relative">
              <select
                name="partnerEmail"
                value={formData.partnerEmail}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#273E8E] focus:border-[#273E8E] appearance-none bg-white text-gray-500"
              >
                <option value="">Select category</option>
                <option value="abc@partner.com">abc@partner.com</option>
                <option value="xyz@partner.com">xyz@partner.com</option>
                <option value="def@partner.com">def@partner.com</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
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
            className="w-full bg-[#273E8E] text-white py-3 px-6 rounded-full font-medium hover:bg-[#1f2f7a] transition-colors cursor-pointer"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddPartner;
