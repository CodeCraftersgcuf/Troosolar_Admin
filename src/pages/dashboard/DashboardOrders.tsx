import React from "react";
import type { Order } from "../../constants/dashboard";

interface DashboardOrdersProps {
  orders: Order[];
}

const DashboardOrders: React.FC<DashboardOrdersProps> = ({ orders }) => (
  <div
    className="bg-white rounded-lg "
    style={{ height: 420, overflow: "hidden" }}
  >
    <div className="flex justify-between items-center p-4 bg-[#EBEBEB]">
      <h2 className="text-lg font-semibold text-gray-900">Latest Orders</h2>
      <button className="text-blue-600 text-sm hover:underline cursor-pointer">
        View All
      </button>
    </div>
    <div className="space-y-3 p-4" style={{ height: "350px", overflow: "hidden" }}>
      {orders.slice(0, 3).map((_, index) => (
        <div
          key={index}
          className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center justify-between shadow-sm"
        >
          <div className="flex items-center space-x-3">
            <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <img
                src={"/assets/images/newman1.png"}
                alt="Newman AGM Solar Inverter"
                className="w-10 h-10 object-contain"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = "/vite.svg";
                }}
              />
            </div>
            <div>
              <p className="font-medium text-gray-900 text-sm">
                Newman AGM Solar Inverter
              </p>
              <p className="text-blue-900 font-semibold text-base">
                ₦4,500,000
              </p>
              <p className="text-xs text-gray-500">
                Placed by{" "}
                <span className="text-blue-600 underline">Adewale</span>
              </p>
            </div>
          </div>
          <button
            className="text-white text-sm px-6 cursor-pointer py-2 rounded-full hover:opacity-90 transition font-medium shadow-sm"
            style={{ backgroundColor: "#273E8E" }}
          >
            View More
          </button>
        </div>
      ))}
    </div>
  </div>
);

export default DashboardOrders;
