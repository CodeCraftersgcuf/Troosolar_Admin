import { useState } from "react";
import {
  analyticsData,
  timePeriods,
  revenueProductOptions,
} from "./analytics.ts";
import Header from "../../component/Header";

const Analytics = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("alltime");
  const [revenueProduct, setRevenueProduct] = useState("all");

  const StatCard = ({ title, value, className = "" }: { title: string; value: string | number; className?: string }) => {
    return (
      <div className={`bg-white p-4 shadow-sm ${className}`}>
        <h3
          className="text-sm font-medium mb-3"
          style={{ color: "#00000080", fontSize: "12px" }}
        >
          {title}
        </h3>
        <p
          className="font-semibold"
          style={{ color: "#000000", fontSize: "20px" }}
        >
          {value}
        </p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F5F7FF]">
      <Header />

      <div className="p-6">
        {/* Page Title */}
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Analytics</h1>

        {/* Time Period Filters */}
        <div className="bg-white rounded-full p-2 inline-flex gap-1 mb-8 shadow-sm border border-gray-200">
          {timePeriods.map((period) => (
            <button
              key={period.value}
              onClick={() => setSelectedPeriod(period.value)}
              className={`px-6.5 py-2.5 rounded-full text-sm font-medium transition-colors cursor-pointer ${
                selectedPeriod === period.value
                  ? "bg-blue-900 text-white shadow-sm"
                  : "text-[#000000B2] hover:text-black"
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>

        {/* General Section */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">General</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-4">
            {analyticsData.general.slice(0, 6).map((stat, index) => (
              <StatCard
                key={index}
                title={stat.title}
                value={stat.value}
                className="border border-[#989898] rounded-lg"
              />
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {analyticsData.general.slice(6, 10).map((stat, index) => (
              <StatCard
                key={index}
                title={stat.title}
                value={stat.value}
                className="border border-[#989898] rounded-lg xl:col-span-1"
              />
            ))}
            <div className="xl:col-span-2"></div>{" "}
            {/* Empty space for alignment */}
          </div>
        </div>

        {/* Financial Section */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Financial
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-4">
            {analyticsData.financial.slice(0, 6).map((stat, index) => (
              <StatCard
                key={index}
                title={stat.title}
                value={stat.value}
                className="border border-[#989898] rounded-lg"
              />
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {analyticsData.financial.slice(6, 10).map((stat, index) => (
              <StatCard
                key={index}
                title={stat.title}
                value={stat.value}
                className="border border-[#989898] rounded-lg xl:col-span-1"
              />
            ))}
            <div className="xl:col-span-2"></div>{" "}
            {/* Empty space for alignment */}
          </div>
        </div>

        {/* Revenue Section */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {analyticsData.revenue.map((stat, index) => {
              if (stat.title === "Revenue by product") {
                return (
                  <div
                    key={index}
                    className="bg-white p-4 shadow-sm border border-[#989898] rounded-lg"
                  >
                    <h3 className="text-sm font-medium text-gray-600 mb-2">
                      {stat.title}
                    </h3>
                    <div className="relative">
                      <select
                        value={revenueProduct}
                        onChange={(e) => setRevenueProduct(e.target.value)}
                        className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
                      >
                        {revenueProductOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {stat.value}
                          </option>
                        ))}
                      </select>
                      <svg
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>
                );
              }

              return (
                <StatCard
                  key={index}
                  title={stat.title}
                  value={stat.value}
                  className="border border-[#989898] rounded-lg"
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
