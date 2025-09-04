// Solar Panel Calculator data and interfaces

export interface SolarApplianceItem {
  id: string;
  name: string;
  wattage: number;
  quantity: number;
  totalWattage: number;
}

export interface SolarRoomType {
  id: string;
  name: string;
  icon: string;
  appliances: SolarApplianceItem[];
}

// Room types with their default appliances for Solar Panel Calculator
export const solarRoomTypes: SolarRoomType[] = [
  {
    id: '1bedroom',
    name: '1 Bedroom',
    icon: '/assets/images/bedroom1.png',
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
    icon: '/assets/images/bedroom2.png',
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
    icon: '/assets/images/bedroom3.png',
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
    icon: '/assets/images/custom.png',
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

// Default appliances for Solar Panel Calculator
export const solarDefaultAppliances = [
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
