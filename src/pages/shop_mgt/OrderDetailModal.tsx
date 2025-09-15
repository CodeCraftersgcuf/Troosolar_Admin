import images from "../../constants/images";
import { useState, useEffect } from "react";

import { useQuery } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { getSingleOrder } from "../../utils/queries/orders";

interface OrderDetailModalProps {
  isOpen: boolean;
  order: {
    id: number;
    order_number?: string;
    order_status?: string;
    payment_status?: string;
    payment_method?: string;
    total_price?: string;
    created_at?: string;
    delivery_address?: {
      address?: string;
      phone_number?: string;
    };
    items?: Array<{
      item?: {
        title?: string;
        featured_image?: string;
      };
    }>;
    user_info?: {
      name?: string;
      phone?: string;
    };
    include_user_info?: {
      first_name?: string;
      phone?: string;
    };
    installation?: {
      installation_date?: string;
      installation_fee?: string;
      technician_name?: string;
    };
  } | null;
  onClose: () => void;
}

const OrderDetailModal = ({ isOpen, order, onClose }: OrderDetailModalProps) => {
  const token = Cookies.get("token");
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  // Reset image loading state when order changes
  useEffect(() => {
    if (order?.id) {
      setImageLoading(true);
      setImageError(false);
    }
  }, [order?.id]);

  // Fetch order details from API
  const {
    data: apiData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["single-order-detail", order?.id],
    queryFn: () => getSingleOrder(order?.id || 0, token || ""),
    enabled: !!order?.id && isOpen,
  });

  if (!isOpen || !order) return null;

  if (isLoading) {
    return (
      <div className="fixed inset-0 backdrop-brightness-50 flex items-end justify-end z-50 p-4">
        <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-hidden shadow-xl flex items-center justify-center">
          <div className="py-12 text-center text-gray-500">Loading order details...</div>
        </div>
      </div>
    );
  }

  if (isError || !apiData?.data) {
    return (
      <div className="fixed inset-0 backdrop-brightness-50 flex items-end justify-end z-50 p-4">
        <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-hidden shadow-xl flex items-center justify-center">
          <div className="py-12 text-center text-red-500">Failed to load order details.</div>
        </div>
      </div>
    );
  }

  const data = apiData.data;
  const productName = data.items && data.items.length > 0 ? data.items[0].item?.title : "-";
  const productImage = data.items && data.items.length > 0 ? data.items[0].item?.featured_image : "/assets/images/newman1.png";

  // Image load handlers
  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };
  const customerName = data.user_info?.name || data.include_user_info?.first_name || "-";
  const customerPhone = data.user_info?.phone || data.include_user_info?.phone || "-";
  const deliveryAddress = data.delivery_address?.address || "-";
  const deliveryPhone = data.delivery_address?.phone_number || "-";
  const orderStatus = data.order_status || "-";
  const orderDate = data.created_at || "-";
  const orderAmount = data.total_price ? `₦${Number(data.total_price).toLocaleString()}` : "-";
  const paymentMethod = data.payment_method || "-";
  const installation = data.installation || null;

  const Base_image_url = "https://troosolar.hmstech.org";

  return (
    <div className="fixed inset-0 backdrop-brightness-50 flex items-end justify-end z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-hidden shadow-xl">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
          <h2 className="text-lg font-semibold text-gray-900">Order Details</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full cursor-pointer">
            <img src={images.cross} alt="" />
          </button>
        </div>
        {/* Scrollable Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* Status Badge */}
          <div className="text-center p-5 border border-[#00000080] bg-white rounded-2xl">
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-3 ${orderStatus === "delivered" ? "bg-green-100" : orderStatus === "pending" ? "bg-orange-100" : "bg-blue-100"}`}>
              {orderStatus === "delivered" ? (
                <img src={images.tick} alt="" />
              ) : orderStatus === "pending" ? (
                <svg className="w-8 h-8 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <p className="text-sm font-medium text-gray-900 mb-1">
              {orderStatus === "delivered" ? "Order Delivered" : orderStatus === "pending" ? "Order Pending" : "Order Placed"}
            </p>
            <p className="text-xs text-gray-600 mb-3">
              {orderStatus === "delivered" ? `Order has been successfully delivered on ${orderDate}` : orderStatus === "pending" ? `Order is being processed.` : `Order has been placed successfully on ${orderDate}`}
            </p>
            <div className={`text-xs px-3 py-1 rounded-full inline-block ${orderStatus === "delivered" ? "bg-green-50 text-green-700" : orderStatus === "pending" ? "bg-orange-50 text-orange-700" : "bg-blue-50 text-blue-700"}`}>
              Order ID: {data.order_number || data.id || "-"}
            </div>
          </div>
          {/* Product Details */}
          <div className="p-5 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Product Details</h3>
              <div className="flex items-center space-x-3 p-1.5 bg-white border border-[#00000080] rounded-2xl">
                <div className="w-19 h-19 bg-[#F3F3F3] rounded-2xl flex items-center justify-center flex-shrink-0 relative">
                  {imageLoading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#273E8E]"></div>
                    </div>
                  )}
                  {imageError ? (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200 rounded-lg">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  ) : (
                    <img
                      src={`${Base_image_url}${productImage}`}
                      alt={productName}
                      className={`w-full h-full object-cover rounded-lg ${imageLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
                      onLoad={handleImageLoad}
                      onError={handleImageError}
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900 truncate">{productName}</h4>
                  <p className="text-lg font-bold text-gray-900">{orderAmount}</p>
                  <p className="text-xs text-gray-600">Order Date: {orderDate}</p>
                </div>
              </div>
            </div>
            {/* Customer Details */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Customer Details</h3>
              <div className="p-5 border border-[#00000080] rounded-2xl">
                <div className="space-y-2 text-xs">
                  <div><span className="text-gray-600">Customer Name</span></div>
                  <p className="text-gray-900 font-medium">{customerName}</p>
                  <div className="flex justify-between mt-2">
                    <span className="text-gray-600">Contact</span>
                    <span className="text-gray-900">{customerPhone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order Status</span>
                    <span className={`font-medium ${orderStatus === "delivered" ? "text-green-600" : orderStatus === "pending" ? "text-orange-600" : "text-blue-600"}`}>{orderStatus}</span>
                  </div>
                </div>
              </div>
            </div>
            {/* Delivery Details */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Delivery Details</h3>
              <div className="bg-white rounded-2xl border border-[#00000080]">
                <div className="space-y-2 text-xs">
                  <div className="border-b border-[#CDCDCD] p-3"><span className="text-gray-600">Delivery Address</span></div>
                  <div className="p-3 pr-5 pl-5">
                    <div className="p-5 bg-[#EDEDED] rounded-2xl">
                      <p className="text-[#00000080] mb-1 text-[10px]">Address</p>
                      <p className="text-black text-[13px]">{deliveryAddress}</p>
                      <p className="text-[#00000080] mb-1 mt-1 text-[10px]">Phone Number</p>
                      <p className="text-black text-[13px]">{deliveryPhone}</p>
                    </div>
                    <div className="flex justify-between mt-5 mb-3 border-b border-[#CDCDCD] p-1 pb-3">
                      <span className="text-[#00000080] text-[14px]">Estimated time</span>
                      <span className="text-black text-[14px]">{installation?.installation_date || "-"}</span>
                    </div>
                    <div className="flex justify-between p-1">
                      <span className="text-[#00000080] text-[14px]">Price</span>
                      <span className="text-[#273E8E] text-[14px]">{installation?.installation_fee ? `₦${Number(installation.installation_fee).toLocaleString()}` : "-"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Installation */}
            {installation && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Installation</h3>
                <div className="border border-[#00000080] rounded-2xl p-3">
                  <div className="border-2 border-dashed border-[#273E8E] rounded-lg p-3 bg-[#273E8E1A] mb-5">
                    <p className="text-xs text-[#273E8E] text-[14px]">Installation will be carried out by {installation.technician_name || "our skilled technician"}. You can choose not to use our installers.</p>
                  </div>
                  <div className="flex justify-between text-xs mb-3 border-b border-[#CDCDCD] p-1 pb-3">
                    <span className="text-[#00000080] text-[14px]">Estimated time</span>
                    <span className="text-black text-[14px]">{installation.installation_date || "-"}</span>
                  </div>
                  <div className="flex justify-between text-xs p-1">
                    <span className="text-[#00000080] text-[14px]">Price</span>
                    <span className="text-[#273E8E] text-[14px]">{installation.installation_fee ? `₦${Number(installation.installation_fee).toLocaleString()}` : "-"}</span>
                  </div>
                </div>
              </div>
            )}
            {/* Payment Summary */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Payment Summary</h3>
              <div className="space-y-2 text-xs rounded-2xl p-3 border border-[#00000080]">
                <div className="flex justify-between p-1 border-b border-[#CDCDCD]">
                  <span className="text-[#00000080] text-[14px]">Payment method</span>
                  <span className="text-black text-[14px]">{paymentMethod}</span>
                </div>
                <div className="flex justify-between p-1 border-b border-[#CDCDCD]">
                  <span className="text-[#00000080] text-[14px]">Amount</span>
                  <span className="text-[#273E8E] text-[14px]">{orderAmount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailModal;
