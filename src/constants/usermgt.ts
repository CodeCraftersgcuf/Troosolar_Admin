

export type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  bvn: string;
  date: string;
};

export const users: User[] = [
  { id: "1", name: "Germandon Abudu", email: "abcde1@gmail.com", phone: "07023456789", bvn: "29452929394", date: "29/06/2025" },
  { id: "2", name: "Chiara Lawson", email: "abcde2@gmail.com", phone: "07023456789", bvn: "29452929394", date: "29/06/2025" },
  { id: "3", name: "Anita Becker", email: "abcde3@gmail.com", phone: "07023456789", bvn: "29452929394", date: "29/06/2025" },
  { id: "4", name: "Rasheedat Bello", email: "abcde4@gmail.com", phone: "07023456789", bvn: "29452929394", date: "29/06/2025" },
  { id: "5", name: "Adewale Ade", email: "abcde5@gmail.com", phone: "07023456789", bvn: "29452929394", date: "29/06/2025" },
  { id: "6", name: "Janet Ariel", email: "abcde6@gmail.com", phone: "07023456789", bvn: "29452929394", date: "29/06/2025" },
];

export type Stat = {
  label: string;
  value: number;
  icon: string; // Path to the icon
};

export const stats: Stat[] = [
  { 
    label: "Total Users", 
    value: 500, 
    icon: "/assets/images/Users.png" 
  },
  { 
    label: "New Users", 
    value: 100, 
    icon: "/assets/images/Users.png" 
  },
  { 
    label: "Users with Loans", 
    value: 20, 
    icon: "/assets/images/Users.png" 
  },
];
