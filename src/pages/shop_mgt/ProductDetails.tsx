import { useState } from "react";
import type { ProductData } from "./shpmgt";

import images from "../../constants/images";

//Code Related to the Integration
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { deleteProduct } from "../../utils/mutations/products";
import { getSingleProduct } from "../../utils/queries/product";

// API Response Interfaces
interface ApiProductDetail {
  id: number;
  detail: string;
  product_id: number;
  status: string;
  created_at: string;
  updated_at: string;
}

interface ApiProductImage {
  id: number;
  product_id: number;
  image: string;
  created_at: string;
  updated_at: string;
}

interface ApiSingleProduct {
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
  details: ApiProductDetail[];
  images: ApiProductImage[];
  reviews: unknown[];
}

interface ProductDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  product: ProductData | null;
  onEdit?: (product: unknown) => void;
}

const ProductDetails = ({ isOpen, onClose, product, onEdit }: ProductDetailsProps) => {
  const [activeTab, setActiveTab] = useState("details");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Get token from cookies
  const token = Cookies.get('token') || '';
  const queryClient = useQueryClient();

  // Fetch single product data
  const {
    data: productResponse,
    isLoading: productLoading,
    error: productError
  } = useQuery({
    queryKey: ['singleProduct', product?.id],
    queryFn: () => getSingleProduct(product?.id || '', token),
    enabled: !!product?.id && !!token && isOpen,
  });

  // Extract product data from API response
  const apiProduct: ApiSingleProduct | null = productResponse?.data || null;

  // Delete product mutation
  const deleteProductMutation = useMutation({
    mutationFn: (id: string) => deleteProduct(id, token),
    onSuccess: () => {
      // Invalidate and refetch products
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setShowDeleteConfirm(false);
      setIsDeleting(false);
      onClose();
    },
    onError: (error: unknown) => {
      console.error('Error deleting product:', error);
      setIsDeleting(false);
      alert('Error deleting product. Please try again.');
    },
  });

  // Helper function to get full image URL
  const getImageUrl = (imagePath: string | null) => {
    if (!imagePath) return '/assets/images/newmanbadge.png';
    if (imagePath.startsWith('http')) return imagePath;
    return `${import.meta.env.VITE_API_BASE_URL || 'https://troosolar.hmstech.org'}${imagePath}`;
  };

  // Helper function to format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleEdit = () => {
    if (apiProduct && onEdit) {
      onEdit(apiProduct);
    }
  };

  const handleDelete = () => {
    if (product?.id) {
      deleteProductMutation.mutate(product.id);
    }
  };

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 backdrop-brightness-50 bg-opacity-50 flex items-start justify-end z-50 p-4">
      <div className="bg-white rounded-2xl max-w-sm w-full max-h-[95vh] overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Product Details
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full  cursor-pointer"
          >
            <img src={images.cross} className="w-7 h-7" alt="" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {productLoading ? (
            <div className="space-y-4">
              {/* Loading skeleton for image */}
              <div className="bg-gray-200 rounded-2xl animate-pulse" style={{ height: "250px" }}></div>
              
              {/* Loading skeleton for product info */}
              <div className="bg-gray-200 rounded-2xl p-3 animate-pulse">
                <div className="h-6 bg-gray-300 rounded mb-2"></div>
                <div className="h-8 bg-gray-300 rounded mb-2"></div>
                <div className="h-4 bg-gray-300 rounded"></div>
              </div>
              
              {/* Loading skeleton for buttons */}
              <div className="flex gap-3">
                <div className="flex-1 h-10 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="flex-1 h-10 bg-gray-200 rounded-full animate-pulse"></div>
              </div>
            </div>
          ) : productError ? (
            <div className="text-center py-8">
              <p className="text-red-500">Error loading product details</p>
              <button
                onClick={onClose}
                className="mt-2 text-blue-500 hover:text-blue-700 text-sm underline"
              >
                Close
              </button>
            </div>
          ) : apiProduct ? (
            <>
              {/* Product Image Section */}
              <div className="mb-4">
                <div
                  className="relative bg-white rounded-2xl overflow-hidden border border-[#00000080]"
                  style={{ height: "250px" }}
                >
                  <img
                    src={getImageUrl(apiProduct.featured_image_url)}
                    alt={apiProduct.title}
                    className="w-full h-full object-contain p-4"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/assets/images/newman1.png";
                    }}
                  />

                  {/* Image Counter */}
                  <div className="absolute bottom-3 right-3 bg-black bg-opacity-60 text-white px-2 py-1 rounded text-xs font-medium">
                    1/{apiProduct.images.length + 1}
                  </div>
                </div>
              </div>

              {/* Product Info */}
              <div className="bg-white border border-[#273E8E] rounded-2xl p-3 mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {apiProduct.title}
                </h3>
                <div className="text-2xl font-bold text-blue-900 mb-2">
                  {formatPrice(apiProduct.discount_price || apiProduct.price)}
                </div>
                {apiProduct.discount_price && apiProduct.discount_price !== apiProduct.price && (
                  <div className="text-sm text-gray-500 line-through mb-2">
                    {formatPrice(apiProduct.price)}
                  </div>
                )}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1">
                    <span className="text-gray-600">Stock:</span>
                    <span className="font-semibold text-gray-900">
                      {apiProduct.stock}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-gray-600">Category ID:</span>
                    <span className="font-semibold text-gray-900">{apiProduct.category_id}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-gray-600">Brand ID:</span>
                    <span className="font-semibold text-gray-900">{apiProduct.brand_id}</span>
                  </div>
                </div>

                {/* Star Rating */}
                <div className="flex items-center gap-2 mt-3">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className="w-4 h-4 text-yellow-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mb-4">
                <button 
                  onClick={handleEdit}
                  className="flex-1 bg-white text-black border border-[#273E8E] cursor-pointer py-2.5 px-4 rounded-full text-sm font-medium hover:bg-gray-100 transition-colors"
                >
                  Edit Product
                </button>
                <button 
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex-1 bg-[#FF0000] text-white cursor-pointer py-2.5 px-4 rounded-full text-sm font-medium hover:bg-red-600 transition-colors border border-[#FFFFFF]"
                >
                  Delete Product
                </button>
              </div>

          {/* Tabs */}
          <div className="mb-4">
            <div
              className="bg-white border border-[#CDCDCD] rounded-full p-2 flex"
              style={{ width: 190 }}
            >
              <button
                onClick={() => setActiveTab("details")}
                className={`flex-1 py-2 px-4 text-sm cursor-pointer font-medium rounded-full transition-colors ${activeTab === "details"
                    ? "bg-[#273E8E] text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                  }`}
              >
                Details
              </button>
              <button
                onClick={() => setActiveTab("reviews")}
                className={`flex-1 py-2 px-4 text-sm cursor-pointer font-medium rounded-full transition-colors ${activeTab === "reviews"
                    ? "bg-[#273E8E] text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                  }`}
              >
                Reviews
              </button>
            </div>
          </div>

              {/* Tab Content */}
              {activeTab === "details" && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900 text-sm mb-3">
                    Product Details
                  </h4>
                  <div className="space-y-2 border border-[#00000080] rounded-2xl p-3">
                    {apiProduct.details && apiProduct.details.length > 0 ? (
                      apiProduct.details.map((detail) => (
                        <div key={detail.id} className="flex items-center gap-2">
                          <img src={images.Lightning} alt="" />
                          <span className="text-gray-700 text-sm">{detail.detail}</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-gray-500 text-sm text-center py-4">
                        No product details available
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "reviews" && (
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 text-sm mb-4">
                    Reviews
                  </h4>

                  {apiProduct.reviews && apiProduct.reviews.length > 0 ? (
                    <>
                      {/* Review Summary */}
                      <div className="bg-white rounded-lg mb-4">
                        <div className="flex items-center justify-between border border-[#00000080] rounded-2xl p-4">
                          <div className="flex items-center gap-2">
                            <div className="flex">
                              {[1, 2, 3, 4].map((star) => (
                                <svg
                                  key={star}
                                  className="w-5 h-5 text-[#273E8E]"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                              <svg
                                className="w-5 h-5 text-[#D9D9D9]"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            </div>
                            <span className="font-semibold text-gray-900">4.8</span>
                          </div>
                          <span className="text-sm text-gray-600">{apiProduct.reviews.length} Reviews</span>
                        </div>
                      </div>

                      {/* Individual Reviews */}
                      <div className="space-y-4">
                        {apiProduct.reviews.map((review: unknown, index: number) => {
                          const reviewData = review as { user_name?: string; rating?: number; created_at?: string; comment?: string };
                          return (
                          <div key={index} className="border border-[#00000080] rounded-2xl p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                  <span className="text-gray-600 font-medium text-sm">
                                    {reviewData.user_name ? reviewData.user_name.charAt(0).toUpperCase() : 'U'}
                                  </span>
                                </div>
                                <div>
                                  <h5 className="font-medium text-gray-900 text-sm">
                                    {reviewData.user_name || 'Anonymous'}
                                  </h5>
                                  <div className="flex items-center gap-1 mt-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <svg
                                        key={star}
                                        className={`w-3 h-3 ${star <= (reviewData.rating || 4) ? 'text-[#273E8E]' : 'text-[#D9D9D9]'}`}
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                      >
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                      </svg>
                                    ))}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-400">
                                  {reviewData.created_at ? new Date(reviewData.created_at).toLocaleDateString() : 'N/A'}
                                </span>
                                <button className="text-red-500 text-xs hover:text-red-700 cursor-pointer">
                                  Delete
                                </button>
                              </div>
                            </div>
                            <p className="text-sm text-gray-700 mt-2">
                              {reviewData.comment || 'No comment provided'}
                            </p>
                          </div>
                          );
                        })}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No reviews available for this product</p>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">Product not found</p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 backdrop-brightness-50 bg-opacity-50 flex items-center justify-center z-[70]">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Product</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this product? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className={`flex-1 py-2 px-4 text-white rounded-lg transition-colors flex items-center justify-center ${
                    isDeleting 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {isDeleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Deleting...
                    </>
                  ) : (
                    'Delete'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;
