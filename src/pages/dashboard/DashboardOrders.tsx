import React from "react";
import { useNavigate } from "react-router-dom";
import type { Order } from "../../constants/dashboard";

interface DashboardOrdersProps {
  orders: Order[];
}

const DashboardOrders: React.FC<DashboardOrdersProps> = ({ orders }) => {
  const navigate = useNavigate();

  const handleViewMore = () => {
    navigate("/shop-mgt");
  };

  const handleViewAll = () => {
    navigate("/shop-mgt");
  };

  return (
    <div
      className="bg-white rounded-lg "
      style={{ height: 420, overflow: "hidden" }}
    >
      <div className="flex justify-between items-center p-4 bg-[#EBEBEB]">
        <h2 className="text-lg font-semibold text-gray-900">Latest Orders</h2>
        <button
          onClick={handleViewAll}
          className="text-blue-600 text-sm hover:underline cursor-pointer"
        >
          View All
        </button>
      </div>
      <div
        className="space-y-3 p-4"
        style={{ height: "350px", overflow: "hidden" }}
      >
        {!orders || orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <svg
              className="w-16 h-16 text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            <p className="text-gray-500 text-lg font-medium mb-2">No Orders Yet</p>
            <p className="text-gray-400 text-sm">There are no recent orders to display.</p>
          </div>
        ) : (
          orders.slice(0, 3).map((order, index) => (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center justify-between shadow-sm"
            >
              <div className="flex items-center space-x-3">
                <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <img
                    src={order.image || "/vite.svg"}
                    alt={order.name}
                    className="w-10 h-10 object-contain"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = "/vite.svg";
                    }}
                  />
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">
                    {order.name}
                  </p>
                  <p className="text-blue-900 font-semibold text-base">
                    {order.price}
                  </p>
                  <p className="text-xs text-gray-500">
                    Placed by{" "}
                    <span className="text-blue-600 underline">{order.user}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={handleViewMore}
                className="text-white text-sm px-6 cursor-pointer py-2 rounded-full hover:opacity-90 transition font-medium shadow-sm"
                style={{ backgroundColor: "#273E8E" }}
              >
                View More
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DashboardOrders;
