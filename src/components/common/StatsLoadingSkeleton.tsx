import React from "react";

interface StatsLoadingSkeletonProps {
  count?: number;
  cardHeight?: string;
  iconSize?: string;
  iconBgColor?: string;
}

const StatsLoadingSkeleton: React.FC<StatsLoadingSkeletonProps> = ({ 
  count = 3,
  cardHeight = "h-[120px]",
  iconSize = "w-17 h-17",
  iconBgColor = "#0000FF33"
}) => {
  return (
    <>
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className={`bg-white rounded-lg p-6 shadow-sm border border-gray-100 ${cardHeight}`}
          style={{ boxShadow: "5px 5px 10px 0px rgba(109, 108, 108, 0.25)" }}
        >
          <div className="flex items-center gap-5">
            <div 
              className={`${iconSize} rounded-full flex items-center justify-center`}
              style={{ backgroundColor: iconBgColor }}
            >
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#273E8E]"></div>
            </div>
            <div>
              <div className="h-4 bg-gray-200 rounded w-20 mb-2 animate-pulse"></div>
              <div className="h-8 bg-gray-200 rounded w-12 animate-pulse"></div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export default StatsLoadingSkeleton;
