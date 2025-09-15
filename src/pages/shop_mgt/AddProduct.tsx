import { useState, useMemo, useEffect } from 'react';
import images from "../../constants/images";


//Code Related to the Integration
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Cookies from "js-cookie";
import { addProduct, updateProduct } from '../../utils/mutations/products';
import { getAllCategories } from '../../utils/queries/categories';
import { useQuery } from '@tanstack/react-query';
import { getAllBrands } from '../../utils/queries/brands';

// API Response Interfaces
interface ApiCategory {
  id: number;
  title: string;
  icon: string;
  created_at: string;
  updated_at: string;
}

interface ApiBrand {
  id: number;
  title: string;
  icon: string;
  category_id: number;
  created_at: string;
  updated_at: string;
}


interface AddProductProps {
  isOpen: boolean;
  onClose: () => void;
  editingProduct?: unknown;
}

const AddProduct = ({ isOpen, onClose, editingProduct }: AddProductProps) => {
  const [productName, setProductName] = useState('');
  const [productCategory, setProductCategory] = useState('');
  const [productBrand, setProductBrand] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [discountEndDate, setDiscountEndDate] = useState('');
  const [installationPrice, setInstallationPrice] = useState('');
  const [stockQuantity, setStockQuantity] = useState('');
  const [productDetails, setProductDetails] = useState<string[]>(['', '', '', '', '']);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [featuredImage, setFeaturedImage] = useState<File | null>(null);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [existingFeaturedImage, setExistingFeaturedImage] = useState<string | null>(null);
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);
  const [markAsComplimentary, setMarkAsComplimentary] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get token from cookies
  const token = Cookies.get('token') || '';
  const queryClient = useQueryClient();

  // Fetch categories data
  const {
    data: categoriesResponse,
    isLoading: categoriesLoading
  } = useQuery({
    queryKey: ['categories'],
    queryFn: () => getAllCategories(token),
    enabled: !!token && isOpen,
  });

  // Fetch brands data
  const {
    data: brandsResponse,
    isLoading: brandsLoading
  } = useQuery({
    queryKey: ['brands'],
    queryFn: () => getAllBrands(token),
    enabled: !!token && isOpen,
  });

  // Extract data from API responses
  const apiCategories: ApiCategory[] = useMemo(() => (categoriesResponse as { data?: ApiCategory[] })?.data || [], [categoriesResponse]);
  const apiBrands: ApiBrand[] = useMemo(() => (brandsResponse as { data?: ApiBrand[] })?.data || [], [brandsResponse]);

  // Helper function to get full image URL
  const getImageUrl = (imagePath: string | null) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return `${import.meta.env.VITE_API_BASE_URL || 'https://troosolar.hmstech.org'}${imagePath}`;
  };

  // Populate form when editing
  useEffect(() => {
    if (editingProduct) {
      const product = editingProduct as {
        id: number;
        title: string;
        price: number;
        discount_price?: number;
        discount_end_date?: string;
        installation_price?: number;
        stock: string;
        top_deal: boolean;
        installation_compulsory: boolean;
        category_id: number;
        brand_id: number;
        details?: Array<{ detail: string }>;
        featured_image_url?: string;
        images?: Array<{ image: string }>;
      };

      setProductName(product.title || '');
      setProductPrice(product.price?.toString() || '');
      setDiscountPrice(product.discount_price?.toString() || '');
      setDiscountEndDate(product.discount_end_date ? product.discount_end_date.split('T')[0] : '');
      setInstallationPrice(product.installation_price?.toString() || '');
      setStockQuantity(product.stock || '');
      setSaveAsTemplate(product.top_deal || false);
      setMarkAsComplimentary(product.installation_compulsory || false);

      // Set category and brand names
      const category = apiCategories.find(cat => cat.id === product.category_id);
      const brand = apiBrands.find(brand => brand.id === product.brand_id);
      setProductCategory(category?.title || '');
      setProductBrand(brand?.title || '');

      // Set product details
      if (product.details && product.details.length > 0) {
        const details = product.details.map((d) => d.detail);
        setProductDetails([...details, ...Array(5 - details.length).fill('')]);
      }

      // Set existing images
      setExistingFeaturedImage(getImageUrl(product.featured_image_url || null));
      if (product.images && product.images.length > 0) {
        const imageUrls = product.images.map(img => getImageUrl(img.image)).filter(Boolean) as string[];
        setExistingImages(imageUrls);
      } else {
        setExistingImages([]);
      }

      // Reset new image uploads
      setFeaturedImage(null);
      setSelectedImages([]);
    } else {
      // Reset form for new product
      resetForm();
    }
  }, [editingProduct, apiCategories, apiBrands]);


  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newImages = Array.from(files).slice(0, 6); // Limit to 6 images
      setSelectedImages(prev => [...prev, ...newImages].slice(0, 6));
    }
  };

  const handleFeaturedImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFeaturedImage(file);
    }
  };

  const handleProductDetailChange = (index: number, value: string) => {
    const newDetails = [...productDetails];
    newDetails[index] = value;
    setProductDetails(newDetails);
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  // Add/Update product mutation
  const addProductMutation = useMutation({
    mutationFn: (data: {
      title?: string;
      category_id?: number;
      price?: number;
      brand_id?: number;
      discount_price?: number;
      discount_end_date?: string;
      stock?: string;
      installation_price?: number;
      top_deal?: boolean;
      installation_compulsory?: boolean;
      featured_image?: File;
      images?: File[];
      product_details?: string[];
    }) => {
      if (editingProduct) {
        const product = editingProduct as { id: number };
        return updateProduct(product.id, data, token);
      } else {
        return addProduct(data as {
          title: string;
          category_id: number;
          price: number;
          brand_id?: number;
          discount_price?: number;
          discount_end_date?: string;
          stock?: string;
          installation_price?: number;
          top_deal?: boolean;
          installation_compulsory?: boolean;
          featured_image?: File;
          images?: File[];
          product_details?: string[];
        }, token);
      }
    },
    onSuccess: () => {
      // Invalidate and refetch products
      queryClient.invalidateQueries({ queryKey: ['products'] });
      resetForm();
      onClose();
      setIsSubmitting(false);
    },
    onError: (error: unknown) => {
      console.error('Error adding product:', error);
      setIsSubmitting(false);

      // Show user-friendly error message
      const errorObj = error as { response?: { data?: { message?: string; data?: Record<string, unknown> } } };

      if (errorObj?.response?.data?.message) {
        alert(`Error: ${errorObj.response.data.message}`);
      } else if (errorObj?.response?.data?.data) {
        // Handle validation errors
        const validationErrors = errorObj.response.data.data;
        const errorMessages = Object.entries(validationErrors)
          .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
          .join('\n');
        alert(`Validation Error:\n${errorMessages}`);
      } else {
        alert('An error occurred while adding the product. Please try again.');
      }
    },
  });

  const handleSubmit = async () => {
    if (!productName || !productCategory || !productBrand || !productPrice || !stockQuantity) {
      alert('Please fill in all required fields');
      return;
    }

    if (!editingProduct && !featuredImage) {
      alert('Please select a featured image');
      return;
    }

    setIsSubmitting(true);

    // Find selected category and brand IDs
    const selectedCategoryData = apiCategories.find(cat => cat.title === productCategory);
    const selectedBrandData = apiBrands.find(brand => brand.title === productBrand);

    if (!selectedCategoryData || !selectedBrandData) {
      alert('Please select valid category and brand');
      setIsSubmitting(false);
      return;
    }

    // Prepare product data according to API requirements
    const productData = {
      title: productName,
      category_id: selectedCategoryData.id,
      price: parseFloat(productPrice) || 0,
      brand_id: selectedBrandData.id,
      discount_price: discountPrice ? parseFloat(discountPrice) : undefined,
      discount_end_date: discountEndDate || undefined,
      stock: stockQuantity,
      installation_price: installationPrice ? parseFloat(installationPrice) : undefined,
      top_deal: saveAsTemplate,
      installation_compulsory: markAsComplimentary,
      featured_image: featuredImage || undefined,
      images: selectedImages.length > 0 ? selectedImages : undefined,
      product_details: productDetails.filter(detail => detail.trim() !== '')
    };

    // Debug log to check the data being sent
    console.log('Product data being sent:', {
      ...productData,
      featured_image: productData.featured_image ? 'File present' : 'No file',
      images: productData.images ? `${productData.images.length} files` : 'No files'
    });

    addProductMutation.mutate(productData);
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
    setProductDetails(['', '', '', '', '']);
    setSelectedImages([]);
    setFeaturedImage(null);
    setExistingImages([]);
    setExistingFeaturedImage(null);
    setSaveAsTemplate(false);
    setMarkAsComplimentary(false);
    setIsSubmitting(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-brightness-50 bg-opacity-50 flex items-start justify-end z-[60]">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[100vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">
            {editingProduct ? 'Edit Product' : 'Add Product'}
          </h2>
          <button
            onClick={onClose}
          >
            <img src={images.cross} className="w-7 h-7" alt="" />
          </button>
        </div>

        <div className="p-6">
          {/* Featured Image Section */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Featured Image *
            </label>
            <p className="text-xs text-gray-500 mb-3">Select the main product image</p>

            <div className="w-full">
              {featuredImage ? (
                <div className="w-32 h-24 border border-gray-300 rounded-lg overflow-hidden relative">
                  <img
                    src={URL.createObjectURL(featuredImage)}
                    alt="Featured Product"
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => setFeaturedImage(null)}
                    className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-xs flex items-center justify-center"
                  >
                    ×
                  </button>
                </div>
              ) : existingFeaturedImage ? (
                <div className="w-32 h-24 border border-gray-300 rounded-lg overflow-hidden relative">
                  <img
                    src={existingFeaturedImage}
                    alt="Current Featured Product"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-1 left-1 bg-blue-500 text-white text-xs px-1 rounded">
                    Current
                  </div>
                  <label className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 text-white rounded-full text-xs flex items-center justify-center cursor-pointer hover:bg-blue-600">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFeaturedImageUpload}
                      className="hidden"
                    />
                    +
                  </label>
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

          {/* Upload Additional Images Section */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Images
            </label>
            <p className="text-xs text-gray-500 mb-3">Select up to 6 additional images</p>

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
                  ) : existingImages[index] ? (
                    <div className="w-20 h-16 border border-gray-300 rounded-lg overflow-hidden relative">
                      <img
                        src={existingImages[index]}
                        alt={`Current Product ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-0 left-0 bg-blue-500 text-white text-xs px-1 rounded">
                        Current
                      </div>
                      <label className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 text-white rounded-full text-xs flex items-center justify-center cursor-pointer hover:bg-blue-600">
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                        +
                      </label>
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
                Product Name *
              </label>
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="Enter your product name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                required
              />
            </div>

            {/* Product Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Category *
              </label>
              <select
                value={productCategory}
                onChange={(e) => setProductCategory(e.target.value)}
                className="w-full cursor-pointer px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                required
              >
                <option value="">Select Category</option>
                {categoriesLoading ? (
                  <option value="" disabled>Loading categories...</option>
                ) : (
                  apiCategories.map((category) => (
                    <option key={category.id} value={category.title}>
                      {category.title}
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Product Brand */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Brand *
              </label>
              <select
                value={productBrand}
                onChange={(e) => setProductBrand(e.target.value)}
                className="w-full cursor-pointer px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                required
              >
                <option value="">Select Brand</option>
                {brandsLoading ? (
                  <option value="" disabled>Loading brands...</option>
                ) : (
                  apiBrands.map((brand) => (
                    <option key={brand.id} value={brand.title}>
                      {brand.title}
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Product Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Price *
              </label>
              <input
                type="number"
                value={productPrice}
                onChange={(e) => setProductPrice(e.target.value)}
                placeholder="Enter product price"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                required
              />
            </div>

            {/* Discount Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Discount Price
              </label>
              <input
                type="number"
                value={discountPrice}
                onChange={(e) => setDiscountPrice(e.target.value)}
                placeholder="Enter discount price"
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
                type="number"
                value={installationPrice}
                onChange={(e) => setInstallationPrice(e.target.value)}
                placeholder="Enter installation price"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>

            {/* Stock Quantity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock Quantity *
              </label>
              <input
                type="number"
                value={stockQuantity}
                onChange={(e) => setStockQuantity(e.target.value)}
                placeholder="Enter stock quantity"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                required
              />
            </div>

            {/* Product Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Details
              </label>
              <div className="space-y-2">
                {productDetails.map((detail, index) => (
                  <input
                    key={index}
                    type="text"
                    value={detail}
                    onChange={(e) => handleProductDetailChange(index, e.target.value)}
                    placeholder={`Enter product detail ${index + 1}`}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                ))}
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
              disabled={isSubmitting}
              className={`w-full py-3 px-4 text-white font-medium rounded-full transition-colors flex items-center justify-center ${isSubmitting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-900 cursor-pointer hover:bg-blue-800'
                }`}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {editingProduct ? 'Updating Product...' : 'Adding Product...'}
                </>
              ) : (
                editingProduct ? 'Update Product' : 'Add Product'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;
