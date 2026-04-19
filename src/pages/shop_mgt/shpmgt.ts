// Shop management data types and mock data
export interface ShopOrderData {
  id: string;
  name: string;
  productName: string;
  amount: string;
  date: string;
  time: string;
  status: string;
}

/** Maps API order_status to table / filter labels. */
export function formatOrderStatusLabel(raw: string | null | undefined): string {
  const k = (raw ?? "").toLowerCase().trim();
  switch (k) {
    case "pending":
      return "Pending";
    case "processing":
      return "Processing";
    case "shipped":
      return "Shipped";
    case "delivered":
    case "completed":
      return "Delivered";
    case "cancelled":
      return "Cancelled";
    case "refunded":
      return "Refunded";
    default:
      return k ? k.charAt(0).toUpperCase() + k.slice(1) : "—";
  }
}

// Product data interface
export interface ProductData {
  id: string;
  name: string;
  category: string;
  price: string;
  stock: number;
  status: "Active" | "Inactive";
  image: string;
  description: string;
}

// Mock product data
export const productData: ProductData[] = [
  {
    id: "1",
    name: "Newman 12200 AGM Solar Inverter",
    category: "Solar Equipment",
    price: "N2,500,000",
    stock: 10,
    status: "Active",
    image: "/assets/images/newmanbadge.png", // Updated to use newmanbadge.png
    description: "High-efficiency solar inverter for residential and commercial use"
  },
  {
    id: "2", 
    name: "Newman 12200 AGM Solar Inverter",
    category: "Solar Equipment",
    price: "N2,500,000",
    stock: 10,
    status: "Active",
    image: "/assets/images/newmanbadge.png", // Updated to use newmanbadge.png
    description: "Complete solar panel kit with mounting hardware"
  },
  {
    id: "3",
    name: "Newman 12200 AGM Solar Inverter",
    category: "Energy Storage",
    price: "N2,500,000",
    stock: 10,
    status: "Active", 
    image: "/assets/images/newmanbadge.png", // Updated to use newmanbadge.png
    description: "Lithium-ion battery pack for solar energy storage"
  },
  {
    id: "4",
    name: "Newman 12200 AGM Solar Inverter",
    category: "Solar Equipment",
    price: "N2,500,000",
    stock: 10,
    status: "Active",
    image: "/assets/images/newmanbadge.png", // Updated to use newmanbadge.png
    description: "MPPT charge controller for optimal battery charging"
  },
  {
    id: "5",
    name: "Newman 12200 AGM Solar Inverter",
    category: "Accessories",
    price: "N2,500,000",
    stock: 10,
    status: "Active",
    image: "/assets/images/newmanbadge.png", // Updated to use newmanbadge.png
    description: "High-quality solar DC cables and connectors"
  },
  {
    id: "6",
    name: "Newman 12200 AGM Solar Inverter",
    category: "Electronics",
    price: "N2,500,000",
    stock: 10,
    status: "Active",
    image: "/assets/images/newmanbadge.png", // Updated to use newmanbadge.png
    description: "Real-time solar system monitoring and analytics"
  },
  {
    id: "7",
    name: "Newman 12200 AGM Solar Inverter",
    category: "Solar Equipment",
    price: "N2,500,000",
    stock: 10,
    status: "Active",
    image: "/assets/images/newmanbadge.png", // Updated to use newmanbadge.png
    description: "Additional solar inverter product"
  },
  {
    id: "8",
    name: "Newman 12200 AGM Solar Inverter",
    category: "Solar Equipment",
    price: "N2,500,000",
    stock: 10,
    status: "Active",
    image: "/assets/images/newmanbadge.png", // Updated to use newmanbadge.png
    description: "Additional solar inverter product"
  }
];

// Mock shop order data
export const shopOrderData: ShopOrderData[] = [
  {
    id: "1",
    name: "Adewale Faizah",
    productName: "Newman Inverter",
    amount: "N1,100,000",
    date: "05-07-25",
    time: "07:22AM",
    status: "Pending"
  },
  {
    id: "2",
    name: "John Adam",
    productName: "Newman Inverter",
    amount: "N1,100,000",
    date: "05-07-25",
    time: "07:22AM",
    status: "Ordered"
  },
  {
    id: "3",
    name: "Chris Banner",
    productName: "Newman Inverter",
    amount: "N1,100,000",
    date: "05-07-25",
    time: "07:22AM",
    status: "Delivered"
  },
  {
    id: "4",
    name: "Adam Waa",
    productName: "Newman Inverter",
    amount: "N1,100,000",
    date: "05-07-25",
    time: "07:22AM",
    status: "Pending"
  },
  {
    id: "5",
    name: "Anita Shawn",
    productName: "Newman Inverter",
    amount: "N1,100,000",
    date: "05-07-25",
    time: "07:22AM",
    status: "Pending"
  },
  {
    id: "6",
    name: "Adewale Faizah",
    productName: "Newman Inverter",
    amount: "N1,100,000",
    date: "05-07-25",
    time: "07:22AM",
    status: "Pending"
  }
];

// Helper function for status colors
export const getOrderStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "delivered":
    case "completed":
      return {
        backgroundColor: "#E6F7FF",
        color: "#008000",
        borderColor: "#008000",
      };
    case "pending":
      return {
        backgroundColor: "#FFF4E6",
        color: "#FF8C00",
        borderColor: "#FF8C00",
      };
    case "processing":
      return {
        backgroundColor: "#EEF2FF",
        color: "#4338CA",
        borderColor: "#4338CA",
      };
    case "shipped":
      return {
        backgroundColor: "#ECFDF5",
        color: "#047857",
        borderColor: "#047857",
      };
    case "cancelled":
      return {
        backgroundColor: "#FEF2F2",
        color: "#B91C1C",
        borderColor: "#B91C1C",
      };
    case "refunded":
      return {
        backgroundColor: "#F3F4F6",
        color: "#4B5563",
        borderColor: "#4B5563",
      };
    default:
      return {
        backgroundColor: "#F5F5F5",
        color: "#6B7280",
        borderColor: "#6B7280",
      };
  }
};
