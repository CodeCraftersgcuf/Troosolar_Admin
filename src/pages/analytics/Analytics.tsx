import { useState, useMemo } from "react";
import {
  timePeriods,
} from "./analytics.ts";
import Header from "../../component/Header";
import { useQuery } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { getAnalytics } from "../../utils/queries/analytics";
import LoadingSpinner from "../../components/common/LoadingSpinner";

const Analytics = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("alltime");
  const [revenueProduct, setRevenueProduct] = useState("all");
  
  const token = Cookies.get("token") || "";
  
  // Convert period value to API format
  const apiPeriod = useMemo(() => {
    if (selectedPeriod === "alltime") return "all_time";
    return selectedPeriod as "daily" | "weekly" | "monthly" | "yearly";
  }, [selectedPeriod]);

  // Fetch analytics data
  const {
    data: analyticsResponse,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["analytics", apiPeriod],
    queryFn: () => getAnalytics(token, { period: apiPeriod }),
    enabled: !!token,
  });

  // Extract data from API response
  const analyticsData = useMemo(() => {
    if (!analyticsResponse?.data) return null;
    
    const { general, financial, revenue } = analyticsResponse.data;
    
    // Format currency values
    const formatCurrency = (value: string | number) => {
      if (!value) return "N0";
      const numValue = typeof value === "string" ? parseFloat(value.replace(/,/g, "")) : value;
      return `N${numValue.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };
    
    // Format percentage values
    const formatPercentage = (value: number | string) => {
      if (value === null || value === undefined) return "0%";
      const numValue = typeof value === "string" ? parseFloat(value) : value;
      return `${numValue.toFixed(1)}%`;
    };
    
    return {
      general: [
        { title: "Total Users", value: general?.total_users?.toLocaleString() || "0" },
        { title: "Active Users", value: general?.active_users?.toLocaleString() || "0" },
        { title: "Total Orders", value: general?.total_orders?.toLocaleString() || "0" },
        { title: "Bounce Rate", value: formatPercentage(general?.bounce_rate || 0) },
        { title: "Deleted Accounts", value: general?.deleted_accounts?.toLocaleString() || "0" },
        { title: "Total Revenue", value: formatCurrency(general?.total_revenue || 0) },
        { title: "Total Deposits", value: formatCurrency(general?.total_deposits || 0) },
        { title: "Total Withdrawals", value: formatCurrency(general?.total_withdrawals || 0) },
        { title: "Admin Earnings", value: formatCurrency(general?.admin_earnings || 0) },
        { title: "Top Selling Product", value: general?.top_selling_product || "N/A" }
      ],
      financial: [
        { title: "Total Loans", value: financial?.total_loans?.toLocaleString() || "0" },
        { title: "Approved Loans", value: financial?.approved_loans?.toLocaleString() || "0" },
        { title: "Rejected Loans", value: financial?.rejected_loans?.toLocaleString() || "0" },
        { title: "Pending Loans", value: financial?.pending_loans?.toLocaleString() || "0" },
        { title: "Loan amount disbursed", value: formatCurrency(financial?.loan_amount_disbursed || 0) },
        { title: "Top Partner", value: financial?.top_partner || "N/A" },
        { title: "Overdue loans", value: financial?.overdue_loans?.toLocaleString() || "0" },
        { title: "Overdue loan amount", value: formatCurrency(financial?.overdue_loan_amount || 0) },
        { title: "Loan default rate", value: formatPercentage(financial?.loan_default_rate || 0) },
        { title: "Repayment completion", value: formatPercentage(financial?.repayment_completion_rate || 0) }
      ],
      revenue: [
        { title: "Total Revenue", value: formatCurrency(revenue?.total_revenue || 0) },
        { title: "Revenue by product", value: revenue?.revenue_by_product?.length?.toString() || "0" },
        { title: "Delivery fees", value: formatCurrency(revenue?.delivery_fees || 0) },
        { title: "Installment fee", value: formatCurrency(revenue?.installation_fees || 0) },
        { title: "Revenue growth rate", value: formatPercentage(revenue?.revenue_growth_rate || 0) },
        { title: "Interests Earned", value: formatCurrency(revenue?.interests_earned || 0) }
      ],
      revenueByProduct: revenue?.revenue_by_product || []
    };
  }, [analyticsResponse]);

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

        {/* Loading State */}
        {isLoading && (
          <LoadingSpinner message="Loading analytics data..." />
        )}

        {/* Error State */}
        {isError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <p className="text-red-600">
              Failed to load analytics data. {error instanceof Error ? error.message : "Please try again."}
            </p>
          </div>
        )}

        {/* Analytics Data */}
        {!isLoading && !isError && analyticsData && (
          <>
            {/* Date Range Display */}
            {analyticsResponse?.data?.date_range && (
              <div className="mb-4 text-sm text-gray-600">
                <span className="font-medium">Period:</span>{" "}
                {new Date(analyticsResponse.data.date_range.start).toLocaleDateString()} -{" "}
                {new Date(analyticsResponse.data.date_range.end).toLocaleDateString()}
              </div>
            )}

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
                        <option value="all">All Products ({stat.value})</option>
                        {analyticsData.revenueByProduct.length > 0 ? (
                          analyticsData.revenueByProduct.map((product: any, idx: number) => {
                            const revenueValue = typeof product.revenue === "string" 
                              ? parseFloat(product.revenue.replace(/,/g, "")) 
                              : product.revenue;
                            return (
                              <option key={idx} value={product.product_id}>
                                {product.product_name} - N{revenueValue.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </option>
                            );
                          })
                        ) : (
                          <option value="none" disabled>No products available</option>
                        )}
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
          </>
        )}
      </div>
    </div>
  );
};

export default Analytics;
