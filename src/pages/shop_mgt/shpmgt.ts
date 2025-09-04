// Shop management data types and mock data
export interface ShopOrderData {
  id: string;
  name: string;
  productName: string;
  amount: string;
  date: string;
  time: string;
  status: "Pending" | "Ordered" | "Delivered";
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
    case 'delivered':
      return {
        backgroundColor: '#E6F7FF',
        color: '#008000',
        borderColor: '#008000'
      };
    case 'pending':
      return {
        backgroundColor: '#FFF4E6',
        color: '#FF8C00',
        borderColor: '#FF8C00'
      };
    case 'ordered':
      return {
        backgroundColor: '#E6E6FF',
        color: '#5A67D8',
        borderColor: '#5A67D8'
      };
    default:
      return {
        backgroundColor: '#F5F5F5',
        color: '#6B7280',
        borderColor: '#6B7280'
      };
  }
};
