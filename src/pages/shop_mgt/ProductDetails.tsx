import { useState } from "react";
import type { ProductData } from "./shpmgt";

import images from "../../constants/images";

interface ProductDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  product: ProductData | null;
}

const ProductDetails = ({ isOpen, onClose, product }: ProductDetailsProps) => {
  const [activeTab, setActiveTab] = useState("details");

  if (!isOpen || !product) return null;

  // Sample product images - you can replace with actual product images
  const productImages = [
    product.image || "/assets/images/newman1.png",
    "/assets/images/newman1.png",
    "/assets/images/newmanbadge.png",
  ];

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
          {/* Product Image Section */}
          <div className="mb-4">
            <div
              className="relative bg-white rounded-2xl overflow-hidden border border-[#00000080]"
              style={{ height: "250px" }}
            >
              <img
                src={productImages[0]}
                alt={product.name}
                className="w-full h-full object-contain p-4"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/assets/images/newman1.png";
                }}
              />

              {/* Image Counter */}
              <div className="absolute bottom-3 right-3 bg-black bg-opacity-60 text-white px-2 py-1 rounded text-xs font-medium">
                1/{productImages.length}
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className="bg-white border border-[#273E8E] rounded-2xl p-3 mb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {product.name}
            </h3>
            <div className="text-2xl font-bold text-blue-900 mb-2">
              {product.price}
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1">
                <span className="text-gray-600">Quantity:</span>
                <span className="font-semibold text-gray-900">
                  {product.stock}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-gray-600">Orders:</span>
                <span className="font-semibold text-gray-900">10</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-gray-600">Completed Orders:</span>
                <span className="font-semibold text-gray-900">8</span>
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
            <button className="flex-1 bg-white text-black border border-[#273E8E]  cursor-pointer py-2.5 px-4 rounded-full text-sm font-medium hover:bg-gray-100 transition-colors">
              Edit Product
            </button>
            <button className="flex-1 bg-[#FF0000] text-white cursor-pointer py-2.5 px-4 rounded-full text-sm font-medium hover:bg-red-600 transition-colors border border-[#FFFFFF]">
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
                className={`flex-1 py-2 px-4 text-sm cursor-pointer font-medium rounded-full transition-colors ${
                  activeTab === "details"
                    ? "bg-[#273E8E] text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                Details
              </button>
              <button
                onClick={() => setActiveTab("reviews")}
                className={`flex-1 py-2 px-4 text-sm cursor-pointer font-medium rounded-full transition-colors ${
                  activeTab === "reviews"
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
                <div className="flex items-center gap-2">
                  <img src={images.Lightning} alt="" />
                  <span className="text-gray-700 text-sm">Longer Life</span>
                </div>
                <div className="flex items-center gap-2">
                  <img src={images.Lightning} alt="" />
                  <span className="text-gray-700 text-sm">
                    Forecasting Anti Explosion Filter
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <img src={images.Lightning} alt="" />
                  <span className="text-gray-700 text-sm">Leak Free</span>
                </div>
                <div className="flex items-center gap-2">
                  <img src={images.Lightning} alt="" />
                  <span className="text-gray-700 text-sm">
                    MaxPowerful Grid Technology
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <img src={images.Lightning} alt="" />
                  <span className="text-gray-700 text-sm">
                    Maintenance Free
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <img src={images.Lightning} alt="" />
                  <span className="text-gray-700 text-sm">
                    Fahrenheit SchutzTM Heat Protection Case
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 text-sm mb-4">
                Reviews
              </h4>

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
                  <span className="text-sm text-gray-600">32 Reviews</span>
                </div>
              </div>

              {/* Individual Reviews */}
              <div className="space-y-4">
                {/* Review 1 */}
                <div className="border border-[#00000080] rounded-2xl p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-gray-600 font-medium text-sm">
                          AD
                        </span>
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-900 text-sm">
                          Adewale
                        </h5>
                        <div className="flex items-center gap-1 mt-1">
                          {[1, 2, 3, 4].map((star) => (
                            <svg
                              key={star}
                              className="w-3 h-3 text-[#273E8E]"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                          <svg
                            className="w-3 h-3 text-[#D9D9D9]"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">03-04-25</span>
                      <button className="text-red-500 text-xs hover:text-red-700 cursor-pointer">
                        Delete
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mt-2">
                    The product is very good and i enjoyed using it
                  </p>
                </div>

                {/* Review 2 */}
                <div className="border border-[#00000080] rounded-2xl p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-gray-600 font-medium text-sm">
                          AD
                        </span>
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-900 text-sm">
                          Adewale
                        </h5>
                        <div className="flex items-center gap-1 mt-1">
                          {[1, 2, 3, 4].map((star) => (
                            <svg
                              key={star}
                              className="w-3 h-3 text-[#273E8E]"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                          <svg
                            className="w-3 h-3 text-[#D9D9D9]"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">03-04-25</span>
                      <button className="text-red-500 text-xs hover:text-red-700 cursor-pointer">
                        Delete
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mt-2">
                    The product is very good and i enjoyed using it
                  </p>
                </div>

                {/* Review 3 */}
                <div className="border border-[#00000080] rounded-2xl p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-gray-600 font-medium text-sm">
                          AD
                        </span>
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-900 text-sm">
                          Adewale
                        </h5>
                        <div className="flex items-center gap-1 mt-1">
                          {[1, 2, 3, 4].map((star) => (
                            <svg
                              key={star}
                              className="w-3 h-3 text-[#273E8E]"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                          <svg
                            className="w-3 h-3 text-[#D9D9D9]"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">03-04-25</span>
                      <button className="text-red-500 text-xs hover:text-red-700 cursor-pointer">
                        Delete
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mt-2">
                    The product is very good and i enjoyed using it
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
