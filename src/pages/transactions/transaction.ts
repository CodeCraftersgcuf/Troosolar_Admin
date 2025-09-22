// Transaction data types and mock data
export interface TransactionData {
  id: string;
  name: string;
  amount: string;
  date: string;
  time: string;
  type: "Deposit" | "Withdrawal - Referral" | "Withdrawal - Underfull payment";
  txId: string;
  status: "Pending" | "Completed";
}

// Mock transaction data
export const transactionData: TransactionData[] = [
  {
    id: "1",
    name: "Adewale Faizah",
    amount: "N200,000",
    date: "05-07-25",
    time: "07:22AM",
    type: "Deposit",
    txId: "2383fm2kikdiwi",
    status: "Pending"
  },
  {
    id: "2",
    name: "Shawn Simon",
    amount: "N200,000",
    date: "05-07-25",
    time: "07:22AM",
    type: "Withdrawal - Referral",
    txId: "2383fm2kikdiwi",
    status: "Completed"
  },
  {
    id: "3",
    name: "Chris dale",
    amount: "N200,000",
    date: "05-07-25",
    time: "07:22AM",
    type: "Withdrawal - Underfull payment",
    txId: "2383fm2kikdiwi",
    status: "Pending"
  },
  {
    id: "4",
    name: "Chris dale",
    amount: "N200,000",
    date: "05-07-25",
    time: "07:22AM",
    type: "Withdrawal - Underfull payment",
    txId: "2383fm2kikdiwi",
    status: "Pending"
  }
];

// Helper functions for styling
export const getTransactionStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'paid':
    case 'completed':
      return { backgroundColor: '#00800033', color: '#008000' };
    case 'pending':
      return { backgroundColor: '#FFA50033', color: '#FF8C00' };
    case 'failed':
    case 'rejected':
      return { backgroundColor: '#FF000033', color: '#FF0000' };
    default:
      return { backgroundColor: '#6B728033', color: '#6B7280' };
  }
};
  