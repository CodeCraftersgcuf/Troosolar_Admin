import { useState } from 'react';
import AddCustomService from './AddCustomService';
import images from '../../constants/images';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
}

interface ProductBuilderProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProductBuilder = ({ isOpen, onClose }: ProductBuilderProps) => {
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [bundleName, setBundleName] = useState('');
  const [totalPrice, setTotalPrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [discountEndDate, setDiscountEndDate] = useState('');
  const [isAddServiceOpen, setIsAddServiceOpen] = useState(false);

  // Sample products data (matching the image)
  const availableProducts: Product[] = [
    {
      id: '1',
      name: 'Newman 12200 ACM Solar Inverter',
      price: 4500000,
      image: '/assets/images/newman1.png'
    },
    {
      id: '2',
      name: 'Newman 12200 ACM Solar Inverter',
      price: 4500000,
      image: '/assets/images/newman1.png'
    },
    {
      id: '3',
      name: 'Newman 12200 ACM Solar Inverter',
      price: 4500000,
      image: '/assets/images/newman1.png'
    }
  ];

  const handleProductSelect = (product: Product) => {
    const isSelected = selectedProducts.find(p => p.id === product.id);
    if (isSelected) {
      setSelectedProducts(prev => prev.filter(p => p.id !== product.id));
    } else {
      setSelectedProducts(prev => [...prev, product]);
    }
  };

  const handleCreateBundle = () => {
    const bundleData = {
      products: selectedProducts,
      bundleName,
      totalPrice,
      discountPrice,
      discountEndDate,
      createdAt: new Date().toISOString()
    };

    // Store in localStorage
    const existingBundles = JSON.parse(localStorage.getItem('productBundles') || '[]');
    const newBundles = [...existingBundles, { ...bundleData, id: Date.now().toString() }];
    localStorage.setItem('productBundles', JSON.stringify(newBundles));

    // Reset form
    setSelectedProducts([]);
    setBundleName('');
    setTotalPrice('');
    setDiscountPrice('');
    setDiscountEndDate('');
    
    onClose();
  };

  const handleAddCustomService = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent form submission
    e.stopPropagation(); // Stop event bubbling
    setIsAddServiceOpen(true);
    // Keep ProductBuilder open when opening AddCustomService
  };

  const handleCloseAddService = () => {
    setIsAddServiceOpen(false);
  };

  const formatPrice = (price: number) => {
    return `₦${price.toLocaleString()}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-brightness-50 bg-opacity-50 flex items-start justify-end z-50">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[100vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Product Builder</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full  cursor-pointer"
           
          >
          <img src={images.cross} className="w-7 h-7" alt="" />
          </button>
        </div>

        <div className="p-4">
          {/* Add New Button */}
          <div className="flex justify-end mb-4">
            <button className="text-blue-600 text-sm font-medium hover:text-blue-700">
              Add New +
            </button>
          </div>

          {/* Product List */}
          <div className="space-y-3 mb-6">
            {availableProducts.map((product) => {
              const isSelected = selectedProducts.find(p => p.id === product.id);
              return (
                <div
                  key={product.id}
                  onClick={() => handleProductSelect(product)}
                  className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    isSelected 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/assets/images/newman1.png';
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900 mb-1">{product.name}</h3>
                    <p className="text-lg font-semibold text-gray-900">{formatPrice(product.price)}</p>
                  </div>
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                    isSelected 
                      ? 'border-blue-500 bg-blue-500' 
                      : 'border-gray-300'
                  }`}>
                    {isSelected && (
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            {/* Bundle Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bundle Name
              </label>
              <input
                type="text"
                value={bundleName}
                onChange={(e) => setBundleName(e.target.value)}
                placeholder="Enter bundle name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Total Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Price
              </label>
              <input
                type="text"
                value={totalPrice}
                onChange={(e) => setTotalPrice(e.target.value)}
                placeholder="Enter total price"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Discount Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Discount Price
              </label>
              <input
                type="text"
                value={discountPrice}
                onChange={(e) => setDiscountPrice(e.target.value)}
                placeholder="Enter discount price"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Discount End Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Discount End Date
              </label>
              <input
                type="date"
                value={discountEndDate}
                onChange={(e) => setDiscountEndDate(e.target.value)}
                placeholder="dd/mm/yyyy"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 mt-6">
            
            <button 
              type="button"
              onClick={handleAddCustomService}
              className="w-full py-3 px-4 cursor-pointer border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-full transition-colors"
            >
              Add Custom Service
            </button>
            
            
            
            <button 
              type="button"
              onClick={handleCreateBundle}
              className="w-full py-3 px-4 cursor-pointer bg-blue-900 hover:bg-blue-900 text-white font-medium rounded-full transition-colors"
            >
              Create bundle
            </button>
            
          </div>
        </div>
      </div>

      {/* AddCustomService Modal */}
      {isAddServiceOpen && (
        <AddCustomService 
          isOpen={isAddServiceOpen}
          onClose={handleCloseAddService}
        />
      )}
    </div>
  );
};

export default ProductBuilder;
