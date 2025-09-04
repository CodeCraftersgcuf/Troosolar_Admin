// Balance data types and mock data
export interface BalanceData {
  id: string;
  name: string;
  loanBalance: string;
  mainBalance: string;
  totalTopup: string;
  totalWithdrawal: string;
}

// Mock balance data
export const balanceData: BalanceData[] = [
  {
    id: "1",
    name: "Adewale Faizah",
    loanBalance: "N200,000",
    mainBalance: "N200,000",
    totalTopup: "N100,000",
    totalWithdrawal: "N100,000"
  },
  {
    id: "2",
    name: "John Adam",
    loanBalance: "N200,000",
    mainBalance: "N200,000",
    totalTopup: "N100,000",
    totalWithdrawal: "N100,000"
  },
  {
    id: "3",
    name: "Chris Banner",
    loanBalance: "N200,000",
    mainBalance: "N200,000",
    totalTopup: "N100,000",
    totalWithdrawal: "N100,000"
  },
  {
    id: "4",
    name: "Adam Waa",
    loanBalance: "N200,000",
    mainBalance: "N200,000",
    totalTopup: "N100,000",
    totalWithdrawal: "N100,000"
  },
  {
    id: "5",
    name: "Anita Shawn",
    loanBalance: "N200,000",
    mainBalance: "N200,000",
    totalTopup: "N100,000",
    totalWithdrawal: "N100,000"
  },
  {
    id: "6",
    name: "Chris Banner",
    loanBalance: "N200,000",
    mainBalance: "N200,000",
    totalTopup: "N100,000",
    totalWithdrawal: "N100,000"
  }
];
