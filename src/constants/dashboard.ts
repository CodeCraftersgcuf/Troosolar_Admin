export type Stat = {
  title: string;
  value: string;
  color: string;
  icon: string; // Changed to string path instead of React.ReactNode
};

export type Order = {
  name: string;
  price: string;
  user: string;
  image?: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  bvn: string;
  date: string;
};

export const chartData = {
  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"],
  datasets: [
    {
      label: "Approved loans",
      data: [1500, 1500, 1500, 1500, 1500, 1500, 1500, 1500, 1500],
      backgroundColor: "#D4A216",
      barPercentage: 0.7,
      categoryPercentage: 0.7,
    },
    {
      label: "Pending loans",
      data: [300, 300, 300, 300, 300, 300, 300, 300, 300],
      backgroundColor: "#1D4ED8",
      barPercentage: 0.7,
      categoryPercentage: 0.7,
    },
    {
      label: "Overdue loans",
      data: [500, 500, 500, 500, 500, 500, 500, 500, 500],
      backgroundColor: "#DC2626",
      barPercentage: 0.7,
      categoryPercentage: 0.7,
    },
    {
      label: "Total Orders",
      data: [200, 200, 200, 200, 200, 200, 200, 200, 200],
      backgroundColor: "#000000",
      barPercentage: 0.7,
      categoryPercentage: 0.7,
    },
  ],
};

export const stats: Stat[] = [
  {
    title: "Total Users",
    value: "500",
    color: "text-blue-600",
    icon: "/assets/images/Users.png",
  },
  {
    title: "Total Loans",
    value: "25",
    color: "text-red-600",
    icon: "/assets/images/totalloans.png",
  },
  {
    title: "Total Orders",
    value: "5",
    color: "text-purple-600",
    icon: "/assets/images/totalorders.png",
  },
  {
    title: "Loans",
    value: "₦2,000,000",
    color: "text-green-600",
    icon: "/assets/images/loans.png",
  },
];

export const latestOrders: Order[] = [
  {
    name: "Newman AGM Solar Inverter",
    price: "₦4,500,000",
    user: "Adebisi",
  },
  {
    name: "Newman AGM Solar Inverter",
    price: "₦4,500,000",
    user: "Adebisi",
  },
  {
    name: "Newman AGM Solar Inverter",
    price: "₦4,500,000",
    user: "Adebisi",
  },
];

export const latestUsers: User[] = [
  {
    id: "3",
    name: "Anita Becker",
    email: "abcdefg@gmail.com",
    phone: "07021234567",
    bvn: "29452929394",
    date: "05-07-25/07:22AM",
  },
  {
    id: "4",
    name: "Rasheedat Bello",
    email: "abcdefg@gmail.com",
    phone: "07021234567",
    bvn: "29452929394",
    date: "05-07-25/07:22AM",
  },
  {
    id: "5",
    name: "Adewale Ade",
    email: "abcdefg@gmail.com",
    phone: "07021234567",
    bvn: "29452929394",
    date: "05-07-25/07:22AM",
  },
];