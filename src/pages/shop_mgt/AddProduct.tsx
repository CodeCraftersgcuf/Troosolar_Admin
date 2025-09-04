import { useState } from 'react';
import images from "../../constants/images";

interface AddProductProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddProduct = ({ isOpen, onClose }: AddProductProps) => {
  const [productName, setProductName] = useState('');
  const [productCategory, setProductCategory] = useState('');
  const [productBrand, setProductBrand] = useState('');  
  const [productPrice, setProductPrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [discountEndDate, setDiscountEndDate] = useState('');
  const [installationPrice, setInstallationPrice] = useState('');
  const [stockQuantity, setStockQuantity] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);
  const [markAsComplimentary, setMarkAsComplimentary] = useState(false);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newImages = Array.from(files).slice(0, 6); // Limit to 6 images
      setSelectedImages(prev => [...prev, ...newImages].slice(0, 6));
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    const productData = {
      id: Date.now().toString(),
      productName,
      productCategory,
      productBrand,
      productPrice,
      discountPrice,
      discountEndDate,
      installationPrice,
      stockQuantity,
      productDescription,
      images: selectedImages.map(img => URL.createObjectURL(img)),
      saveAsTemplate,
      markAsComplimentary,
      createdAt: new Date().toISOString()
    };

    // Store in localStorage
    const existingProducts = JSON.parse(localStorage.getItem('products') || '[]');
    const newProducts = [...existingProducts, productData];
    localStorage.setItem('products', JSON.stringify(newProducts));

    // Reset form
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setProductName('');
    setProductCategory('');
    setProductBrand('');
    setProductPrice('');
    setDiscountPrice('');
    setDiscountEndDate('');
    setInstallationPrice('');
    setStockQuantity('');
    setProductDescription('');
    setSelectedImages([]);
    setSaveAsTemplate(false);
    setMarkAsComplimentary(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-brightness-50 bg-opacity-50 flex items-start justify-end z-[60]">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[100vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Add Product</h2>
          <button
            onClick={onClose}
          >
            <img src={images.cross} className="w-7 h-7" alt="" />
          </button>
        </div>

        <div className="p-6">
          {/* Upload Images Section */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Images
            </label>
            <p className="text-xs text-gray-500 mb-3">Select up to 6 image maximum</p>
            
            {/* Image Upload Grid */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              {/* Upload slots */}
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="relative">
                  {selectedImages[index] ? (
                    <div className="w-20 h-16 border border-gray-300 rounded-lg overflow-hidden relative">
                      <img
                        src={URL.createObjectURL(selectedImages[index])}
                        alt={`Product ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-xs flex items-center justify-center"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <label className="w-20 h-16 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-gray-400">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </label>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            {/* Product Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Name
              </label>
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="Enter your product name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>

            {/* Product Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Category
              </label>
              <select
                value={productCategory}
                onChange={(e) => setProductCategory(e.target.value)}
                className="w-full cursor-pointer px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="">Select Category</option>
                <option value="solar-panels">Solar Panels</option>
                <option value="batteries">Batteries</option>
                <option value="inverters">Inverters</option>
                <option value="chargers">MTTP Chargers</option>
                <option value="led-bulbs">LED Bulbs</option>
                <option value="solar-fans">Solar Fans</option>
              </select>
            </div>

            {/* Product Brand */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Brand
              </label>
              <input
                type="text"
                value={productBrand}
                onChange={(e) => setProductBrand(e.target.value)}
                placeholder="Select Brand"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>

            {/* Product Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Price
              </label>
              <input
                type="text"
                value={productPrice}
                onChange={(e) => setProductPrice(e.target.value)}
                placeholder="Enter product price"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>

            {/* Discount Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Discount Price
              </label>
              <input
                type="text"
                value={discountPrice}
                onChange={(e) => setDiscountPrice(e.target.value)}
                placeholder="Enter discount"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>

            {/* Discount End Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Discount End Date
              </label>
              <input
                type="date"
                value={discountEndDate}
                onChange={(e) => setDiscountEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>

            {/* Installation Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Installation Price
              </label>
              <input
                type="text"
                value={installationPrice}
                onChange={(e) => setInstallationPrice(e.target.value)}
                placeholder="Enter installation price"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>

            {/* Stock Quantity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                No of Stock
              </label>
              <input
                type="text"
                value={stockQuantity}
                onChange={(e) => setStockQuantity(e.target.value)}
                placeholder="Select no of stock"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>

            {/* Product Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Description
              </label>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Enter description 1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
                <input
                  type="text"
                  placeholder="Enter description 2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
                <input
                  type="text"
                  placeholder="Enter description 3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
                <input
                  type="text"
                  placeholder="Enter description 4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
                <input
                  type="text"
                  placeholder="Enter description 5"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Add More Button */}
          <div className="mt-4 flex justify-center">
            <button className="text-gray-400 text-sm font-medium hover:text-gray-700 flex items-center">
              Add More
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
          </div>

          {/* Checkboxes */}
          <div className="mt-6 space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={saveAsTemplate}
                onChange={(e) => setSaveAsTemplate(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-sm cursor-pointer text-gray-700">Mark as Top deal</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={markAsComplimentary}
                onChange={(e) => setMarkAsComplimentary(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-sm cursor-pointer text-gray-700">Mark Installation as complimentary</span>
            </label>
          </div>

          {/* Submit Button */}
          <div className="mt-6">
            <button 
              onClick={handleSubmit}
              className="w-full py-3 px-4 bg-blue-900 cursor-pointer hover:bg-blue-900 text-white font-medium rounded-full transition-colors"
            >
              Add Product
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;
