import { useState } from 'react';
import images from '../../constants/images';

interface AddCustomServiceProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddCustomService = ({ isOpen, onClose }: AddCustomServiceProps) => {
  const [serviceName, setServiceName] = useState('');
  const [serviceAmount, setServiceAmount] = useState('');

  const handleSave = () => {
    const serviceData = {
      serviceName,
      serviceAmount,
      createdAt: new Date().toISOString()
    };

    // Store in localStorage
    const existingServices = JSON.parse(localStorage.getItem('customServices') || '[]');
    const newServices = [...existingServices, { ...serviceData, id: Date.now().toString() }];
    localStorage.setItem('customServices', JSON.stringify(newServices));

    // Reset form
    setServiceName('');
    setServiceAmount('');
    
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-brightness-50 bg-opacity-50 flex items-start justify-end z-[60]">
      <div className="bg-white rounded-lg w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Add Custom Service</h2>
          <button
            onClick={onClose}
           
          >
             <img src={images.cross} className="w-7 h-7" alt="" />
          </button>
        </div>

        <div className="p-6">
          {/* Form Fields */}
          <div className="space-y-4">
            {/* Service Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name of Service
              </label>
              <input
                type="text"
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
                placeholder="Enter name of service"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Service Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service Amount
              </label>
              <input
                type="text"
                value={serviceAmount}
                onChange={(e) => setServiceAmount(e.target.value)}
                placeholder="Enter cost of service (Naira)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Save Button */}
          <div className="mt-6">
            <button 
              onClick={handleSave}
              className="w-full py-3 px-4 bg-blue-900 hover:bg-blue-900 text-white font-medium rounded-full transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddCustomService;
