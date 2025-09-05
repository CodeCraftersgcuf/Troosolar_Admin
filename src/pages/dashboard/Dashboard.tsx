import React from "react";
import { chartData as staticChartData, stats as staticStats } from "../../constants/dashboard";
import DashboardStats from "./DashboardStats";
import DashboardOrders from "./DashboardOrders";
import DashboardLatestUsers from "./DashboardLatestUsers";
import Header from "../../component/Header";

//Code related to the Integration 
import {getAdminDashboard} from "../../utils/queries/dashboard";
import { useQuery } from "@tanstack/react-query";
import Cookies from "js-cookie";


import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Legend,
  Tooltip,
} from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, Legend, Tooltip);

const getMaxYValue = (chartData: any) => {
  if (!chartData || !Array.isArray(chartData.datasets)) return 1600;
  // Find the highest value among all datasets
  let max = 0;
  chartData.datasets.forEach((ds: any) => {
    const dsMax = Math.max(...ds.data.map((v: any) => Number(v)));
    if (dsMax > max) max = dsMax;
  });
  // Round up to nearest 500 for better chart steps
  return Math.ceil((max + 100) / 500) * 100 || 500;
};

const Dashboard: React.FC = () => {
  const token = Cookies.get("token");
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: () => getAdminDashboard(token || ""),
    enabled: !!token,
  });

  // Map API response to dashboard stats
  const stats = data?.data?.counts
    ? [
        {
          title: "Total Users",
          value: String(data.data.counts.total_users),
          color: "text-blue-600",
          icon: "/assets/images/Users.png",
        },
        {
          title: "Total Loans",
          value: String(data.data.counts.total_loans),
          color: "text-red-600",
          icon: "/assets/images/totalloans.png",
        },
        {
          title: "Total Orders",
          value: String(data.data.counts.total_orders),
          color: "text-purple-600",
          icon: "/assets/images/totalorders.png",
        },
        {
          title: "Loans",
          value: `₦${data.data.counts.loan_amount}`,
          color: "text-green-600",
          icon: "/assets/images/loans.png",
        },
      ]
    : staticStats;

  // Map API response to chart data
  // Correct chart data mapping for Chart.js
  const chartData = data?.data?.chart
    ? {
        labels: data.data.chart.map((item: any) => item.month),
        datasets: [
          {
            label: "Approved loans",
            data: data.data.chart.map((item: any) => Number(item.approved_loan)),
            backgroundColor: "#D4A216",
            barPercentage: 0.7,
            categoryPercentage: 0.7,
          },
          {
            label: "Pending loans",
            data: data.data.chart.map((item: any) => Number(item.pending_loan)),
            backgroundColor: "#1D4ED8",
            barPercentage: 0.7,
            categoryPercentage: 0.7,
          },
          {
            label: "Overdue loans",
            data: data.data.chart.map((item: any) => Number(item.overdue_loan)),
            backgroundColor: "#DC2626",
            barPercentage: 0.7,
            categoryPercentage: 0.7,
          },
          {
            label: "Total Orders",
            data: data.data.chart.map((item: any) => Number(item.orders)),
            backgroundColor: "#000000",
            barPercentage: 0.7,
            categoryPercentage: 0.7,
          },
        ],
      }
    : staticChartData;

  // Dynamically calculate max Y value for chart
  const dynamicMaxY = getMaxYValue(chartData);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "bottom" as const,
        align: "start" as const,
        labels: {
          boxWidth: 12,
          boxHeight: 12,
          padding: 15,
          font: {
            size: 12,
          },
        },
      },
    },
    layout: {
      padding: {
        bottom: 10,
        top: 10,
        left: 10,
        right: 10,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 12,
          },
        },
      },
      y: {
        beginAtZero: true,
        max: dynamicMaxY,
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 12,
          },
          stepSize: 500,
          callback: function (value: any) {
            return value === 0 ? "0" : value;
          },
        },
      },
    },
  };

  // Map API response to latest orders
  const latestOrders = data?.data?.latest_orders
    ? data.data.latest_orders.slice(0, 3).map((order: any) => ({
        name: order.product,
        price: `₦${order.total_price}`,
        user: order.customer,
      }))
    : [];

  // Map API response to latest users
  const latestUsers = data?.data?.latest_users
    ? data.data.latest_users.slice(0, 3).map((user: any) => ({
        name: user.name,
        email: user.email,
        phone: user.phone,
        bvn: "", // Not provided in API response
        date: user.created_at,
      }))
    : [];

  return (
    <div className="bg-[#F5F7FF] min-h-screen">
      {/* Header at the very top */}
      <Header />

      {/* Main Dashboard Content */}
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>

        {/* Stats */}
        {isLoading ? (
          <div className="py-8 text-center text-gray-500">Loading dashboard...</div>
        ) : isError ? (
          <div className="py-8 text-center text-red-500">Failed to load dashboard data.</div>
        ) : (
          <DashboardStats stats={stats} />
        )}

        {/* Chart & Orders */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Bar Chart */}
          <div
            className="bg-white shadow-md rounded-lg p-4 lg:col-span-7"
            style={{ height: 420 }}
          >
            {chartData && Array.isArray(chartData.labels) && Array.isArray(chartData.datasets) ? (
              <div style={{ height: "380px" }}>
                <Bar data={chartData} options={chartOptions} />
              </div>
            ) : (
              <div className="text-center text-gray-400">
                Chart data not available
              </div>
            )}
          </div>
          {/* Latest Orders */}
          <div className="lg:col-span-5" style={{ height: 480 }}>
            <DashboardOrders orders={latestOrders} />
          </div>
        </div>

        {/* Latest Users Table */}
        <DashboardLatestUsers users={latestUsers} />
      </div>
    </div>
  );
};

export default Dashboard;
