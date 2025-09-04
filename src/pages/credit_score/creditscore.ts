// Credit Score data interface
export interface CreditScoreItem {
  id: number;
  name: string;
  creditScore: number;
  loanLimit: number;
  date: string;
  status: string;
}

// Credit Score data
export const creditScoreData: CreditScoreItem[] = [
  {
    id: 1,
    name: "Adewale Faizah",
    creditScore: 95,
    loanLimit: 4000000,
    date: "05-07-25/07:22AM",
    status: "Excellent"
  },
  {
    id: 2,
    name: "John Adam",
    creditScore: 45,
    loanLimit: 4000000,
    date: "05-07-25/07:22AM",
    status: "Poor"
  },
  {
    id: 3,
    name: "Chris Banner",
    creditScore: 95,
    loanLimit: 4000000,
    date: "05-07-25/07:22AM",
    status: "Excellent"
  },
  {
    id: 4,
    name: "Adam Waa",
    creditScore: 50,
    loanLimit: 4000000,
    date: "05-07-25/07:22AM",
    status: "Fair"
  },
  {
    id: 5,
    name: "Anita Shawn",
    creditScore: 95,
    loanLimit: 4000000,
    date: "05-07-25/07:22AM",
    status: "Excellent"
  },
  {
    id: 6,
    name: "Faiz Kalil",
    creditScore: 95,
    loanLimit: 4000000,
    date: "05-07-25/07:22AM",
    status: "Excellent"
  },
  {
    id: 7,
    name: "Wande Moca",
    creditScore: 60,
    loanLimit: 4000000,
    date: "05-07-25/07:22AM",
    status: "Good"
  },
  {
    id: 8,
    name: "Zainab Zee",
    creditScore: 95,
    loanLimit: 4000000,
    date: "05-07-25/07:22AM",
    status: "Excellent"
  }
];
