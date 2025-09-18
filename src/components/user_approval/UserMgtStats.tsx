import React from "react";

interface Stat {
  icon: string;
  label: string;
  value: string;
}

const UserMgtStats: React.FC<{ stats: Stat[]; isLoading?: boolean }> = ({ stats, isLoading = false }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
    {isLoading ? (
      // Show loading indicators for 3 stat cards
      Array.from({ length: 3 }).map((_, idx) => (
        <div
          key={idx}
          className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-5 border border-gray-100"
        >
          <div
            className="rounded-full w-16 h-16 flex items-center justify-center"
            style={{ backgroundColor: "#0000FF33" }}
          >
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#273E8E]"></div>
          </div>
          <div>
            <div className="h-4 bg-gray-200 rounded w-20 mb-2 animate-pulse"></div>
            <div className="h-8 bg-gray-200 rounded w-12 animate-pulse"></div>
          </div>
        </div>
      ))
    ) : (
      stats.map((stat, idx) => (
        <div
          key={idx}
          className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-5 border border-gray-100 hover:shadow-md transition-shadow"
        >
          <div
            className="rounded-full w-16 h-16 flex items-center justify-center"
            style={{ backgroundColor: "#0000FF33" }}
          >
            <img src={stat.icon} alt={stat.label} className="w-8 h-8" />
          </div>
          <div>
            <p
              className="text-sm font-medium mb-1"
              style={{ color: "#0000FF" }}
            >
              {stat.label}
            </p>
            <p className="text-2xl font-bold" style={{ color: "#0000FF" }}>
              {stat.value}
            </p>
          </div>
        </div>
      ))
    )}
  </div>
);

export default UserMgtStats;
