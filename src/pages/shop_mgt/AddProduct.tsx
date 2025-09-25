import { useState, useMemo, useEffect } from 'react';
import images from "../../constants/images";

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

  const token = Cookies.get('token') || '';
  const queryClient = useQueryClient();

  // Fetch categories
  const { data: categoriesResponse, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => getAllCategories(token),
    enabled: !!token && isOpen,
  });

  // Fetch brands
  const { data: brandsResponse, isLoading: brandsLoading } = useQuery({
    queryKey: ['brands'],
    queryFn: () => getAllBrands(token),
    enabled: !!token && isOpen,
  });

  const apiCategories: ApiCategory[] = useMemo(
    () => (categoriesResponse as { data?: ApiCategory[] })?.data || [],
    [categoriesResponse]
  );
  const apiBrands: ApiBrand[] = useMemo(
    () => (brandsResponse as { data?: ApiBrand[] })?.data || [],
    [brandsResponse]
  );

  const getImageUrl = (imagePath: string | null) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return `${import.meta.env.VITE_API_BASE_URL || 'https://troosolar.hmstech.org'}${imagePath}`;
  };

  // Populate form when editing
  useEffect(() => {
    if (editingProduct) {
      // Log the raw editingProduct object for debugging
      console.log("➡️ Raw editingProduct from previous screen:", editingProduct);

      // Show a deep inspection of the object
      try {
        console.log("➡️ JSON.stringify(editingProduct):", JSON.stringify(editingProduct, null, 2));
      } catch (e) {
        // If circular structure, fallback
        console.log("➡️ Could not stringify editingProduct:", e);
      }

      // Show all keys and values
      if (typeof editingProduct === "object" && editingProduct !== null) {
        Object.entries(editingProduct as Record<string, any>).forEach(([key, value]) => {
          console.log(`➡️ editingProduct[${key}]:`, value);
        });
      }

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

      console.log("➡️ Parsed product for form state:", product);

      setProductName(product.title || "");
      setProductPrice(product.price?.toString() || "");
      setDiscountPrice(product.discount_price?.toString() || "");
      setDiscountEndDate(
        product.discount_end_date ? product.discount_end_date.split("T")[0] : ""
      );
      setInstallationPrice(product.installation_price?.toString() || "");
      setStockQuantity(product.stock || "");
      setSaveAsTemplate(product.top_deal || false);
      setMarkAsComplimentary(product.installation_compulsory || false);

      const category = apiCategories.find((cat) => cat.id === product.category_id);
      const brand = apiBrands.find((brand) => brand.id === product.brand_id);

      console.log("➡️ Matched category:", category);
      console.log("➡️ Matched brand:", brand);

      setProductCategory(category?.title || "");
      setProductBrand(brand?.title || "");

      if (product.details && product.details.length > 0) {
        const details = product.details.map((d) => d.detail);
        const minFields = Math.max(5, details.length);
        setProductDetails([
          ...details,
          ...Array(minFields - details.length).fill(""),
        ]);

        console.log("➡️ Loaded product details:", details);
      }

      setExistingFeaturedImage(getImageUrl(product.featured_image_url || null));
      if (product.images && product.images.length > 0) {
        const imageUrls = product.images
          .map((img) => getImageUrl(img.image))
          .filter(Boolean) as string[];
        setExistingImages(imageUrls);

        console.log("➡️ Existing images:", imageUrls);
      } else {
        setExistingImages([]);
      }

      setFeaturedImage(null);
      setSelectedImages([]);
    } else {
      resetForm();
    }
  }, [editingProduct, apiCategories, apiBrands]);


  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newImages = Array.from(files).slice(0, 6);
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

  const addMoreField = () => setProductDetails(prev => [...prev, '']);
  const removeField = (index: number) => {
    if (productDetails.length > 1) {
      setProductDetails(prev => prev.filter((_, i) => i !== index));
    }
  };
  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  // ✅ Unified Add / Update mutation
  const addProductMutation = useMutation({
    mutationFn: (data: any) => {
      if (editingProduct) {
        const product = editingProduct as { id: number };
        // Build FormData for update, but ensure all values are strings and not undefined/null
        const updatePayload = new FormData();
        updatePayload.append("title", productName ?? "");
        updatePayload.append("category_id", String(apiCategories.find(cat => cat.title === productCategory)?.id ?? ""));
        updatePayload.append("price", productPrice ?? "0");
        updatePayload.append("brand_id", String(apiBrands.find(brand => brand.title === productBrand)?.id ?? ""));
        updatePayload.append("discount_price", discountPrice ? discountPrice : "0");
        if (discountEndDate) updatePayload.append("discount_end_date", discountEndDate);
        updatePayload.append("stock", stockQuantity ?? "0");
        updatePayload.append("installation_price", installationPrice ? installationPrice : "0");
        updatePayload.append("top_deal", saveAsTemplate ? "1" : "0");
        updatePayload.append("installation_compulsory", markAsComplimentary ? "1" : "0");
        // Only append featured_image if a new one is selected
        if (featuredImage) updatePayload.append("featured_image", featuredImage);
        // Only append images if new ones are selected
        if (selectedImages.length > 0) {
          selectedImages.forEach((img, idx) => {
            updatePayload.append(`images[${idx}]`, img);
          });
        }
        // Always append product_details, even if empty
        productDetails.filter(detail => detail.trim() !== '').forEach((detail, idx) => {
          updatePayload.append(`product_details[${idx}]`, detail);
        });

        // Debug: log all FormData entries
        for (const pair of updatePayload.entries()) {
          console.log(`[FormData] ${pair[0]}:`, pair[1]);
        }

        // Fix: Set the method to POST if the backend expects POST for update with FormData
        // If your backend expects PUT, ensure it can handle FormData with PUT requests.
        // Add _method=PUT for Laravel-style APIs (if needed)
        updatePayload.append("_method", "POST");
        // Pass FormData as the second argument
        return updateProduct(product.id, updatePayload, token);
      } else {
        return addProduct(data, token);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      resetForm();
      onClose();
      setIsSubmitting(false);
      alert(editingProduct ? 'Product updated successfully!' : 'Product added successfully!');
    },
    onError: (error: unknown) => {
      console.error('Error with product operation:', error);
      setIsSubmitting(false);

      const errorObj = error as {
        response?: { data?: { message?: string; data?: Record<string, unknown> } };
      };

      if (errorObj?.response?.data?.message) {
        alert(`Error: ${errorObj.response.data.message}`);
      } else if (errorObj?.response?.data?.data) {
        const validationErrors = errorObj.response.data.data;
        const errorMessages = Object.entries(validationErrors)
          .map(([field, messages]) =>
            `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`
          )
          .join('\n');
        alert(`Validation Error:\n${errorMessages}`);
      } else {
        alert(
          `An error occurred while ${editingProduct ? 'updating' : 'adding'} the product. Please try again.`
        );
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

    const selectedCategoryData = apiCategories.find(cat => cat.title === productCategory);
    const selectedBrandData = apiBrands.find(brand => brand.title === productBrand);
    if (!selectedCategoryData || !selectedBrandData) {
      alert('Please select valid category and brand');
      setIsSubmitting(false);
      return;
    }

    const productData = {
      title: productName,
      category_id: selectedCategoryData.id,
      price: parseFloat(productPrice) || 0,
      brand_id: selectedBrandData.id,
      discount_price: discountPrice ? parseFloat(discountPrice) : 0,
      discount_end_date: discountEndDate || undefined,
      stock: stockQuantity,
      installation_price: installationPrice ? parseFloat(installationPrice) : 0,
      top_deal: saveAsTemplate,
      installation_compulsory: markAsComplimentary,
      featured_image: featuredImage || undefined,
      images: selectedImages.length > 0 ? selectedImages : undefined,
      product_details: productDetails.filter(detail => detail.trim() !== '')
    };

    console.log('Product data being sent:', {
      ...productData,
      featured_image: productData.featured_image ? 'File present' : 'No file',
      images: productData.images ? `${productData.images.length} files` : 'No files',
      isEdit: !!editingProduct
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
                    className="absolute top-0 -right-0 w-4 h-4 bg-red-500 text-white rounded-full text-xs flex items-center justify-center"
                  >
                    <span className='mb-1'>×</span>
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
                        className="absolute top-0 -right-0 w-4 h-4 bg-red-500 text-white rounded-full text-xs flex items-center justify-center"
                      >
                        <span className='mb-1'>×</span>
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
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={detail}
                      onChange={(e) => handleProductDetailChange(index, e.target.value)}
                      placeholder={`Enter product detail ${index + 1}`}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                    {productDetails.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeField(index)}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove this field"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Add More Button */}
          <div className="mt-4 flex justify-center">
            <button
              type="button"
              onClick={addMoreField}
              className="text-blue-600 text-sm font-medium hover:text-blue-700 flex items-center cursor-pointer transition-colors hover:bg-blue-50 px-3 py-2 rounded-lg"
            >
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
