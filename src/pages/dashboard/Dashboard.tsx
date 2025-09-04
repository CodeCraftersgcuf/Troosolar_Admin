import React from "react";
import { chartData, stats, latestOrders, latestUsers } from "../../constants/dashboard";
import DashboardStats from "./DashboardStats";
import DashboardOrders from "./DashboardOrders";
import DashboardLatestUsers from "./DashboardLatestUsers";
import Header from "../../component/Header";

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
      max: 1600, // Setting an upper limit that's a bit above the highest value
      grid: {
        display: false, // Remove the horizontal grid lines
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

const Dashboard: React.FC = () => {
  return (
    <div className="bg-[#F5F7FF] min-h-screen">
      {/* Header at the very top */}
      <Header />

      {/* Main Dashboard Content */}
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>

        {/* Stats */}
        <DashboardStats stats={stats} />

        {/* Chart & Orders */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Bar Chart */}
          <div
            className="bg-white shadow-md rounded-lg p-4 lg:col-span-7"
            style={{ height: 420 }}
          >
            {chartData && chartData.labels && chartData.datasets ? (
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
