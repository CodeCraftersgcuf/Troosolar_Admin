import images from "../../constants/images";
import type { ShopOrderData } from "./shpmgt";

interface OrderDetailModalProps {
  isOpen: boolean;
  order: ShopOrderData | null;
  onClose: () => void;
}

const OrderDetailModal = ({
  isOpen,
  order,
  onClose,
}: OrderDetailModalProps) => {
  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 backdrop-brightness-50 flex items-end justify-end z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-hidden shadow-xl">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
          <h2 className="text-lg font-semibold text-gray-900">Order Details</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full  cursor-pointer"
          >
            <img src={images.cross} alt="" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* Change Status Section */}
          <div className="p-5">
            <div className="flex flex-col text-sm text-gray-600">
              <div className="mt-2">
                <span>Change Status</span>
              </div>
              <div className="flex flex-row items-center justify-between border border-[#CDCDCD] rounded-2xl p-5 mt-5 cursor-pointer">
                <div className="flex items-center justify-center text-[#00000080]">
                  <span>Change order status</span>
                </div>
                <div>
                  <img
                    src={images.rightarrow}
                    alt=""
                    className="w-3 h-3 mt-1"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Modal Content */}
          <div className="p-5 space-y-4">
            {/* Status Badge */}
            <div className="text-center p-5 border border-[#00000080] bg-white rounded-2xl">
              <div
                className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-3 ${
                  order.status === "Delivered"
                    ? "bg-green-100"
                    : order.status === "Pending"
                    ? "bg-orange-100"
                    : "bg-blue-100"
                }`}
              >
                {order.status === "Delivered" ? (
                  // <svg
                  //   className="w-8 h-8 text-green-600"
                  //   fill="currentColor"
                  //   viewBox="0 0 20 20"
                  // >
                  //   <path
                  //     fillRule="evenodd"
                  //     d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  //     clipRule="evenodd"
                  //   />
                  // </svg>
                  <img src={images.tick} alt="" />
                ) : order.status === "Pending" ? (
                  <svg
                    className="w-8 h-8 text-orange-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-8 h-8 text-blue-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
              <p className="text-sm font-medium text-gray-900 mb-1">
                {order.status === "Delivered"
                  ? "Order Delivered"
                  : order.status === "Pending"
                  ? "Order Pending"
                  : "Order Placed"}
              </p>
              <p className="text-xs text-gray-600 mb-3">
                {order.status === "Delivered"
                  ? `Order has been successfully delivered on ${order.date}`
                  : order.status === "Pending"
                  ? `Order is being processed. Expected delivery: July 7, 2024`
                  : `Order has been placed successfully on ${order.date}`}
              </p>
              <div
                className={`text-xs px-3 py-1 rounded-full inline-block ${
                  order.status === "Delivered"
                    ? "bg-green-50 text-green-700"
                    : order.status === "Pending"
                    ? "bg-orange-50 text-orange-700"
                    : "bg-blue-50 text-blue-700"
                }`}
              >
                Order ID: {order.id}
              </div>
            </div>

            {/* Product Details */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">
                Product Details
              </h3>
              <div className="flex items-center space-x-3 p-1.5 bg-white border border-[#00000080] rounded-2xl">
                <div className="w-19 h-19 bg-[#F3F3F3] rounded-2xl flex items-center justify-center flex-shrink-0">
                  <img
                    src="/assets/images/newman1.png"
                    alt={order.productName}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900 truncate">
                    {order.productName}
                  </h4>
                  <p className="text-lg font-bold text-gray-900">
                    {order.amount}
                  </p>
                  <p className="text-xs text-gray-600">
                    Order Date: {order.date}/{order.time}
                  </p>
                </div>
              </div>
            </div>

            {/* Customer Details */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">
                Customer Details
              </h3>
              <div className=" p-5 border border-[#00000080] rounded-2xl">
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-gray-600">Customer Name</span>
                  </div>
                  <p className="text-gray-900 font-medium">{order.name}</p>
                  <div className="flex justify-between mt-2">
                    <span className="text-gray-600">Contact</span>
                    <span className="text-gray-900">07012345678</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order Status</span>
                    <span
                      className={`font-medium ${
                        order.status === "Delivered"
                          ? "text-green-600"
                          : order.status === "Pending"
                          ? "text-orange-600"
                          : "text-blue-600"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Details */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2 ">
                Delivery Details
              </h3>
              <div className="bg-white rounded-2xl border border-[#00000080] ">
                <div className="space-y-2 text-xs">
                  <div className="border-b border-[#CDCDCD] p-3">
                    <span className="text-gray-600">Delivery Address</span>
                  </div>
                  <div className="p-3 pr-5 pl-5">
                    <div className="p-5 bg-[#EDEDED] rounded-2xl">
                      <p className="text-[#00000080] mb-1 text-[10px]">
                        Address
                      </p>
                      <p className="text-black text-[13px]">
                        No 1 Janos street, Wuse Lagos
                      </p>
                      <p className="text-[#00000080] mb-1 mt-1 text-[10px]">
                        Phone Number
                      </p>
                      <p className="text-black text-[13px]">07012345678</p>
                    </div>

                    <div className="flex justify-between mt-5 mb-3 border-b border-[#CDCDCD] p-1 pb-3">
                      <span className="text-[#00000080] text-[14px]">
                        Estimated time
                      </span>
                      <span className="text-black text-[14px]">
                        July 7, 2024
                      </span>
                    </div>
                    <div className="flex justify-between p-1">
                      <span className="text-[#00000080] text-[14px] ">
                        Price
                      </span>
                      {/* <span
                        className={`font-medium ${
                          order.status === "Delivered"
                            ? "text-green-600"
                            : order.status === "Pending"
                            ? "text-orange-600"
                            : "text-blue-600"
                        }`}
                      >
                        {order.status}
                      </span> */}
                      <span className="text-[#273E8E] text-[14px]">
                        N20,000
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Installation */}
            {order.status === "Delivered" && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">
                  Installation
                </h3>
                <div className="border border-[#00000080] rounded-2xl p-3">
                  <div className="border-2 border-dashed border-[#273E8E] rounded-lg p-3 bg-[#273E8E1A] mb-5">
                    <p className="text-xs text-[#273E8E] text-[14px]">
                      Installation will be carried one of our skilled <br />
                      technician , you can choose not to use our installers
                    </p>
                  </div>

                  <div className="flex justify-between text-xs mb-3 border-b border-[#CDCDCD] p-1 pb-3">
                    <span className="text-[#00000080] text-[14px]">
                      Estimated time
                    </span>
                    <span className="text-black text-[14px]">July 7, 2024</span>
                  </div>
                  <div className="flex justify-between text-xs p-1">
                    <span className="text-[#00000080] text-[14px] ">Price</span>
                    <span className="text-[#273E8E] text-[14px]">N20,000</span>
                  </div>
                </div>
              </div>
            )}

            {order.status === "Pending" && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">
                  Installation
                </h3>
                <div className="border border-[#00000080] rounded-2xl p-3">
                  <div className="border-2 border-dashed border-[#273E8E] rounded-lg p-3 bg-[#273E8E1A] mb-5">
                    <p className="text-xs text-[#273E8E] text-[14px]">
                      Installation will be carried one of our skilled <br />
                      technician , you can choose not to use our installers
                    </p>
                  </div>

                  <div className="flex justify-between text-xs mb-3 border-b border-[#CDCDCD] p-1 pb-3">
                    <span className="text-[#00000080] text-[14px]">
                      Estimated time
                    </span>
                    <span className="text-black text-[14px]">July 7, 2024</span>
                  </div>
                  <div className="flex justify-between text-xs p-1">
                    <span className="text-[#00000080] text-[14px] ">Price</span>
                    <span className="text-[#273E8E] text-[14px]">N20,000</span>
                  </div>
                </div>
              </div>
            )}

            {order.status === "Ordered" && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">
                  Installation
                </h3>
                <div className="border border-[#00000080] rounded-2xl p-3">
                  <div className="border-2 border-dashed border-[#273E8E] rounded-lg p-3 bg-[#273E8E1A] mb-5">
                    <p className="text-xs text-[#273E8E] text-[14px]">
                      Installation will be carried one of our skilled <br />
                      technician , you can choose not to use our installers
                    </p>
                  </div>

                  <div className="flex justify-between text-xs mb-3 border-b border-[#CDCDCD] p-1 pb-3">
                    <span className="text-[#00000080] text-[14px]">
                      Estimated time
                    </span>
                    <span className="text-black text-[14px]">July 7, 2024</span>
                  </div>
                  <div className="flex justify-between text-xs p-1">
                    <span className="text-[#00000080] text-[14px] ">Price</span>
                    <span className="text-[#273E8E] text-[14px]">N20,000</span>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Summary */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">
                Payment Summary
              </h3>
              <div className="space-y-2 text-xs rounded-2xl p-3 border border-[#00000080]">
                <div className="flex justify-between p-1 border-b border-[#CDCDCD]">
                  <span className="text-[#00000080] text-[14px]">
                    Payment method
                  </span>
                  <span className="text-black text-[14px]">Loan</span>
                </div>
                <div className="flex justify-between p-1 border-b border-[#CDCDCD]">
                  <span className="text-[#00000080] text-[14px]">
                    Loan Amount
                  </span>
                  <span className="text-[#273E8E] text-[14px]">N4,040,000</span>
                </div>
                <div className="flex justify-between p-1 border-b border-[#CDCDCD]">
                  <span className="text-[#00000080] text-[14px]">
                    Base Payment
                  </span>
                  <span className="text-[#273E8E] text-[14px]">N500,000</span>
                </div>
                <div className="flex justify-between p-1 border-b border-[#CDCDCD]">
                  <span className="text-[#00000080] text-[14px]">
                    Amount Owed
                  </span>
                  <span className="text-[#273E8E] text-[14px]">N4,000,000</span>
                </div>
                <div className="flex justify-between p-1 border-b border-[#CDCDCD]">
                  <span className="text-[#00000080] text-[14px]">
                    Loan Period
                  </span>
                  <span className="text-black text-[14px]">6 months</span>
                </div>
                <div className="flex justify-between p-1">
                  <span className="text-[#00000080] text-[14px]">
                    First Repayment
                  </span>
                  <span className="text-black text-[14px]">July 3, 2025</span>
                </div>
              </div>
            </div>

            {/* Customer Review (only for delivered orders) */}
            {order.status === "Delivered" && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">
                  Customer Review
                </h3>
                <div className="flex items-start space-x-3 rounded-2xl p-3 border border-[#00000080]">
                  <div className="w-8 h-8 bg-[#D9D9D9] rounded-full flex items-center justify-center text-xs font-medium text-[#00000080] flex-shrink-0">
                    AD
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900 mb-1">
                          Adewale
                        </span>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <svg
                              key={star}
                              className={`w-3 h-3 ${
                                star <= 4 ? "text-[#273E8E]" : "text-[#D9D9D9]"
                              }`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                      </div>
                      <span className="text-xs text-[#00000080]">03-04-25</span>
                    </div>
                    <p className="text-xs text-[#000000] mt-2 ml-[-43px]">
                      The product is very good and i enjoyed using it
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailModal;
