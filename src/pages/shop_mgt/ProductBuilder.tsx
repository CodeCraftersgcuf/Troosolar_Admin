import { useState, useMemo, useEffect } from 'react';
import AddCustomService from './AddCustomService';
import images from '../../constants/images';

//Code Related to the Integration
import { addBundle } from '../../utils/mutations/bundle';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Cookies from "js-cookie";
import { getAllProducts } from '../../utils/queries/product';

import { updateBundle } from '../../utils/mutations/bundle';

// API Response Interfaces
interface ApiProduct {
  id: number;
  title: string;
  category_id: number;
  brand_id: number;
  price: number;
  discount_price: number;
  discount_end_date: string;
  stock: string;
  installation_price: number | null;
  top_deal: boolean;
  installation_compulsory: boolean;
  featured_image: string;
  created_at: string;
  updated_at: string;
  old_quantity: string;
  featured_image_url: string;
  details: Array<{
    id: number;
    detail: string;
    product_id: number;
    status: string;
    created_at: string;
    updated_at: string;
  }>;
  images: Array<{
    id: number;
    product_id: number;
    image: string;
    created_at: string;
    updated_at: string;
  }>;
  reviews: unknown[];
}

interface CustomService {
  title: string;
  service_amount: number;
}

interface ProductBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  editingBundle?: any; // <-- add this prop
}

const ProductBuilder = ({ isOpen, onClose, editingBundle }: ProductBuilderProps) => {
  const [selectedProducts, setSelectedProducts] = useState<ApiProduct[]>([]);
  const [bundleName, setBundleName] = useState('');
  const [bundleType, setBundleType] = useState('');
  const [totalPrice, setTotalPrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [discountEndDate, setDiscountEndDate] = useState('');
  const [featuredImage, setFeaturedImage] = useState<File | null>(null);
  const [customServices, setCustomServices] = useState<CustomService[]>([]);
  const [isAddServiceOpen, setIsAddServiceOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get token from cookies
  const token = Cookies.get('token') || '';
  const queryClient = useQueryClient();

  // Fetch products from API
  const { data: productsResponse, isLoading: productsLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => getAllProducts(token),
    enabled: !!token && isOpen,
  });

  // Extract products data from API response
  const availableProducts: ApiProduct[] = useMemo(() =>
    (productsResponse as { data?: ApiProduct[] })?.data || [],
    [productsResponse]
  );

  // Helper function to get full image URL
  const getImageUrl = (imagePath: string | null) => {
    if (!imagePath) return '/assets/images/newman1.png';
    if (imagePath.startsWith('http')) return imagePath;
    return `${import.meta.env.VITE_API_BASE_URL || 'https://troosolar.hmstech.org'}${imagePath}`;
  };

  const handleProductSelect = (product: ApiProduct) => {
    const isSelected = selectedProducts.find(p => p.id === product.id);
    if (isSelected) {
      setSelectedProducts(prev => prev.filter(p => p.id !== product.id));
    } else {
      setSelectedProducts(prev => [...prev, product]);
    }
  };

  // Add bundle mutation (for create)
  const addBundleMutation = useMutation({
    mutationFn: (data: any) => addBundle(data, token),
    onSuccess: () => {
      // Invalidate and refetch bundles
      queryClient.invalidateQueries({ queryKey: ['bundles'] });
      resetForm();
      onClose();
    },
    onError: (error: unknown) => {
      console.error('Error creating bundle:', error);
      setIsSubmitting(false);
      alert('Error creating bundle. Please try again.');
    },
  });

  // Add update bundle mutation (for edit)
  const updateBundleMutation = useMutation({
    mutationFn: (data: { id: number; payload: any }) => updateBundle(data.id, data.payload, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bundles'] });
      resetForm();
      onClose();
    },
    onError: (error: unknown) => {
      setIsSubmitting(false);
      alert('Error updating bundle. Please try again.');
    },
  });

  // Populate form when editing a bundle
  useEffect(() => {
    if (editingBundle) {
      setBundleName(editingBundle.title || "");
      setBundleType(editingBundle.bundle_type || "");
      setTotalPrice(editingBundle.total_price ? String(editingBundle.total_price) : "");
      setDiscountPrice(editingBundle.discount_price ? String(editingBundle.discount_price) : "");
      setDiscountEndDate(editingBundle.discount_end_date || "");
      // Don't prefill file input
      // Preselect products from bundle_items
      if (editingBundle.bundle_items && Array.isArray(editingBundle.bundle_items)) {
        const productIds = editingBundle.bundle_items.map((item: any) => item.product_id);
        const selected = availableProducts.filter(p => productIds.includes(p.id));
        setSelectedProducts(selected);
      }
      // Preselect custom services
      setCustomServices(editingBundle.custom_services || []);
    } else {
      resetForm();
    }
    // eslint-disable-next-line
  }, [editingBundle, isOpen, availableProducts]);

  const handleCreateOrUpdateBundle = () => {
    if (!bundleName || !bundleType || !totalPrice || selectedProducts.length === 0) {
      alert('Please fill in all required fields and select at least one product');
      return;
    }
    if (!featuredImage && !editingBundle) {
      alert('Please select a featured image');
      return;
    }
    setIsSubmitting(true);

    const bundleData = {
      title: bundleName,
      bundle_type: bundleType,
      total_price: parseFloat(totalPrice),
      discount_price: discountPrice ? parseFloat(discountPrice) : undefined,
      discount_end_date: discountEndDate || undefined,
      featured_image: featuredImage || undefined,
      items: selectedProducts.map(product => product.id),
      custom_services: customServices.length > 0 ? customServices : undefined
    };

    if (editingBundle) {
      updateBundleMutation.mutate({ id: editingBundle.id, payload: bundleData });
    } else {
      addBundleMutation.mutate(bundleData);
    }
  };

  const resetForm = () => {
    setSelectedProducts([]);
    setBundleName('');
    setBundleType('');
    setTotalPrice('');
    setDiscountPrice('');
    setDiscountEndDate('');
    setFeaturedImage(null);
    setCustomServices([]);
    setIsSubmitting(false);
  };

  const handleFeaturedImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFeaturedImage(file);
    }
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
          <h2 className="text-lg font-semibold text-gray-900">
            {editingBundle ? "Edit Bundle" : "Product Builder"}
          </h2>
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
            {productsLoading ? (
              // Loading skeleton
              Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="h-5 bg-gray-200 rounded animate-pulse w-20"></div>
                  </div>
                  <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
                </div>
              ))
            ) : availableProducts.length > 0 ? (
              availableProducts.map((product) => {
                const isSelected = selectedProducts.find(p => p.id === product.id);
                return (
                  <div
                    key={product.id}
                    onClick={() => handleProductSelect(product)}
                    className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${isSelected
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                      <img
                        src={getImageUrl(product.featured_image_url)}
                        alt={product.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/assets/images/newman1.png';
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-gray-900 mb-1">{product.title}</h3>
                      <p className="text-lg font-semibold text-gray-900">{formatPrice(product.price)}</p>
                    </div>
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${isSelected
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
              })
            ) : (
              <div className="text-center py-8 text-gray-500">
                No products available
              </div>
            )}
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            {/* Bundle Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bundle Name *
              </label>
              <input
                type="text"
                value={bundleName}
                onChange={(e) => setBundleName(e.target.value)}
                placeholder="Enter bundle name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Bundle Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bundle Type *
              </label>
              <select
                value={bundleType}
                onChange={(e) => setBundleType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select bundle type</option>
                <option value="solar_package">Solar Package</option>
                <option value="inverter_package">Inverter Package</option>
                <option value="battery_package">Battery Package</option>
                <option value="custom">Custom Bundle</option>
              </select>
            </div>

            {/* Featured Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Featured Image *
              </label>
              <p className="text-xs text-gray-500 mb-3">Select the main bundle image</p>

              <div className="w-full">
                {featuredImage ? (
                  <div className="w-32 h-24 border border-gray-300 rounded-lg overflow-hidden relative">
                    <img
                      src={URL.createObjectURL(featuredImage)}
                      alt="Featured Bundle"
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => setFeaturedImage(null)}
                      className="absolute top-0 -right-0 w-4 h-4 bg-red-500 text-white rounded-full text-xs flex items-center justify-center"
                    >
                      <span className='mb-1'>×</span>
                    </button>
                  </div>
                ) : (
                  <label className="w-32 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-gray-400">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFeaturedImageUpload}
                      className="hidden"
                    />
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </label>
                )}
              </div>
            </div>

            {/* Total Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Price *
              </label>
              <input
                type="number"
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
              onClick={handleCreateOrUpdateBundle}
              disabled={isSubmitting}
              className={`w-full py-3 px-4 font-medium rounded-full transition-colors flex items-center justify-center ${isSubmitting
                ? 'bg-gray-400 cursor-not-allowed text-white '
                : editingBundle
                  ? 'bg-[#E8A91D] cursor-pointer hover:bg-[#d89a1a]'
                  : 'bg-blue-900 cursor-pointer hover:bg-blue-800'
                }`}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center text-white">
                  <div className="animate-spin text-white rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {editingBundle ? "Updating Bundle..." : "Creating Bundle..."}
                </div>
              ) : (
                <span className="text-white">
                  {editingBundle ? "Update Bundle" : "Create Bundle"}
                </span>
              )}
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
