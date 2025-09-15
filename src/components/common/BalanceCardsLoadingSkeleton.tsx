import React from "react";

const BalanceCardsLoadingSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      {/* Total Loan Balance Card Loading */}
      <div
        className="bg-[#273E8E] rounded-2xl p-8 text-white relative overflow-hidden"
        style={{ boxShadow: "5px 5px 10px 0px rgba(109, 108, 108, 0.25)" }}
      >
        <div className="relative z-10">
          <div className="h-6 bg-white bg-opacity-20 rounded w-40 mb-6 animate-pulse"></div>
          <div className="h-12 bg-white bg-opacity-20 rounded w-32 mb-8 animate-pulse"></div>
          <div className="flex justify-end">
            <div className="h-10 bg-white bg-opacity-20 rounded-full w-24 animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Total Shopping Balance Card Loading */}
      <div
        className="bg-[#E8A91D] rounded-2xl p-8 text-white relative overflow-hidden"
        style={{ boxShadow: "5px 5px 10px 0px rgba(109, 108, 108, 0.25)" }}
      >
        <div className="relative z-10">
          <div className="h-6 bg-white bg-opacity-20 rounded w-48 mb-6 animate-pulse"></div>
          <div className="h-12 bg-white bg-opacity-20 rounded w-32 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export default BalanceCardsLoadingSkeleton;
