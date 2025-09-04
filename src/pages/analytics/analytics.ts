export interface StatCard {
  title: string;
  value: string;
  category?: string;
}

export interface AnalyticsData {
  general: StatCard[];
  financial: StatCard[];
  revenue: StatCard[];
}

export const analyticsData: AnalyticsData = {
  general: [
    { title: "Total Users", value: "20,000" },
    { title: "Active Users", value: "300" },
    { title: "Total Orders", value: "300" },
    { title: "Bounce Rate", value: "200" },
    { title: "Deleted Accounts", value: "20" },
    { title: "Total Revenue", value: "N20,000" },
    { title: "Total Deposits", value: "N20,000" },
    { title: "Total Withdrawals", value: "N20,000" },
    { title: "Admin Earnings", value: "N20,000" },
    { title: "Top Selling Product", value: "Inverter" }
  ],
  financial: [
    { title: "Total Loans", value: "100" },
    { title: "Approved Loans", value: "300" },
    { title: "Rejected Loans", value: "300" },
    { title: "Pending Loans", value: "400" },
    { title: "Loan amount disbursed", value: "N20,000,000" },
    { title: "Top Partner", value: "ABC Partner" },
    { title: "Overdue loans", value: "12" },
    { title: "Overdue loan amount", value: "N200,000" },
    { title: "Loan default rate", value: "50%" },
    { title: "Repayment completion", value: "50%" }
  ],
  revenue: [
    { title: "Total Revenue", value: "N200,000" },
    { title: "Revenue by product", value: "300" },
    { title: "Delivery fees", value: "N20,000" },
    { title: "Installment fee", value: "N100,000" },
    { title: "Revenue growth rate", value: "40%" },
    { title: "Interests Earned", value: "N10,000" }
  ]
};

export const timePeriods = [
  { value: "alltime", label: "All time" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" }
];

export const revenueProductOptions = [
  { value: "all", label: "All Products" },
  { value: "inverters", label: "Inverters" },
  { value: "panels", label: "Solar Panels" },
  { value: "batteries", label: "Batteries" }
];
