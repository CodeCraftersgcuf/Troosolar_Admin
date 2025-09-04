import React from "react";
import type { Stat } from "../../constants/dashboard";

interface DashboardStatsProps {
  stats: Stat[];
}

const iconBg = [
  'bg-[#e0e7ff]',
  'bg-[#fee2e2]',
  'bg-[#ede9fe]',
  'bg-[#dcfce7]',
];

const valueColor = [
  'text-blue-700',
  'text-red-600',
  'text-purple-700',
  'text-green-700',
];

const DashboardStats: React.FC<DashboardStatsProps> = ({ stats }) => (
  <div className="flex w-full gap-6">
    {stats.map((stat, index) => (
      <div
        key={index}
        className="flex-1 bg-white rounded-[20px] shadow-[0_4px_16px_0_rgba(0,0,0,0.08)] px-6 py-4 flex items-center min-w-[220px]"
        style={{ boxShadow: "0px 4px 16px 0px #E0E7FF" }}
      >
        <div className={`w-16 h-16 flex items-center justify-center rounded-full ${iconBg[index]} mr-4`}>
          <img src={stat.icon} alt={stat.title} className="w-8 h-8" />
        </div>
        <div className="flex flex-col justify-center">
          <span className={`text-base font-medium ${valueColor[index]}`}>{stat.title}</span>
          <span className={`text-2xl font-bold ${valueColor[index]}`}>{stat.value}</span>
        </div>
      </div>
    ))}
  </div>
);

export default DashboardStats;
