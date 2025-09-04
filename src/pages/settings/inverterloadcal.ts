// Tool categories and data for the Tools page

export interface ToolCategory {
  id: string;
  name: string;
  isActive: boolean;
}

export interface ApplianceItem {
  id: string;
  name: string;
  wattage: number;
  quantity: number;
  totalWattage: number;
}

export interface RoomType {
  id: string;
  name: string;
  icon: string; // This will now be the path to the PNG icon
  appliances: ApplianceItem[];
}

// Tool categories
export const toolCategories: ToolCategory[] = [
  { id: 'inverter', name: 'Inverter Load Calculator', isActive: true },
  { id: 'solar', name: 'Solar Panel Calculator', isActive: false },
  { id: 'battery', name: 'Battery Estimator', isActive: false },
  { id: 'savings', name: 'Solar Savings Estimator', isActive: false }
];

// Room types with their default appliances
export const roomTypes: RoomType[] = [
  {
    id: '1bedroom',
    name: '1 Bedroom',
    icon: '/assets/images/bedroom1.png', // Replace with your PNG path
    appliances: [
      { id: '1', name: 'Ceiling Fan', wattage: 70, quantity: 2, totalWattage: 140 },
      { id: '2', name: 'Ceiling Fan', wattage: 70, quantity: 2, totalWattage: 140 },
      { id: '3', name: 'Ceiling Fan', wattage: 70, quantity: 2, totalWattage: 140 },
      { id: '4', name: 'Ceiling Fan', wattage: 70, quantity: 2, totalWattage: 140 },
      { id: '5', name: 'Ceiling Fan', wattage: 70, quantity: 2, totalWattage: 140 },
      { id: '6', name: 'Ceiling Fan', wattage: 70, quantity: 2, totalWattage: 140 },
      { id: '7', name: 'Ceiling Fan', wattage: 70, quantity: 2, totalWattage: 140 }
    ]
  },
  {
    id: '2bedroom',
    name: '2 Bedroom',
    icon: '/assets/images/bedroom2.png', // Replace with your PNG path
    appliances: [
      { id: '1', name: 'Ceiling Fan', wattage: 70, quantity: 2, totalWattage: 140 },
      { id: '2', name: 'Ceiling Fan', wattage: 70, quantity: 2, totalWattage: 140 },
      { id: '3', name: 'Ceiling Fan', wattage: 70, quantity: 2, totalWattage: 140 },
      { id: '4', name: 'Ceiling Fan', wattage: 70, quantity: 2, totalWattage: 140 },
      { id: '5', name: 'Ceiling Fan', wattage: 70, quantity: 2, totalWattage: 140 },
      { id: '6', name: 'Ceiling Fan', wattage: 70, quantity: 2, totalWattage: 140 },
      { id: '7', name: 'Ceiling Fan', wattage: 70, quantity: 2, totalWattage: 140 }
    ]
  },
  {
    id: '3bedroom',
    name: '3 Bedroom',
    icon: '/assets/images/bedroom3.png', // Replace with your PNG path
    appliances: [
      { id: '1', name: 'Ceiling Fan', wattage: 70, quantity: 2, totalWattage: 140 },
      { id: '2', name: 'Ceiling Fan', wattage: 70, quantity: 2, totalWattage: 140 },
      { id: '3', name: 'Ceiling Fan', wattage: 70, quantity: 2, totalWattage: 140 },
      { id: '4', name: 'Ceiling Fan', wattage: 70, quantity: 2, totalWattage: 140 },
      { id: '5', name: 'Ceiling Fan', wattage: 70, quantity: 2, totalWattage: 140 },
      { id: '6', name: 'Ceiling Fan', wattage: 70, quantity: 2, totalWattage: 140 },
      { id: '7', name: 'Ceiling Fan', wattage: 70, quantity: 2, totalWattage: 140 }
    ]
  },
  {
    id: 'custom',
    name: 'Custom',
    icon: '/assets/images/custom.png', // Replace with your PNG path
    appliances: [
      { id: '1', name: 'Ceiling Fan', wattage: 70, quantity: 2, totalWattage: 140 },
      { id: '2', name: 'Ceiling Fan', wattage: 70, quantity: 2, totalWattage: 140 },
      { id: '3', name: 'Ceiling Fan', wattage: 70, quantity: 2, totalWattage: 140 },
      { id: '4', name: 'Ceiling Fan', wattage: 70, quantity: 2, totalWattage: 140 },
      { id: '5', name: 'Ceiling Fan', wattage: 70, quantity: 2, totalWattage: 140 },
      { id: '6', name: 'Ceiling Fan', wattage: 70, quantity: 2, totalWattage: 140 },
      { id: '7', name: 'Ceiling Fan', wattage: 70, quantity: 2, totalWattage: 140 }
    ]
  }
];

// Default appliances that can be added
export const defaultAppliances = [
  { name: 'Ceiling Fan', wattage: 70 },
  { name: 'LED Bulb', wattage: 10 },
  { name: 'TV', wattage: 120 },
  { name: 'Refrigerator', wattage: 150 },
  { name: 'Air Conditioner', wattage: 1500 },
  { name: 'Washing Machine', wattage: 500 },
  { name: 'Microwave', wattage: 800 },
  { name: 'Water Heater', wattage: 2000 },
  { name: 'Iron', wattage: 1000 },
  { name: 'Computer', wattage: 300 }
];
