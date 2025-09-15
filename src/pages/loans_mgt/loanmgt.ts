// Loan management data types and constants

export interface LoanData {
  id: number;
  name: string;
  amount: string;
  date: string;
  sendStatus: string;
  approval: string;
}

export const loanData: LoanData[] = [
  { id: 1, name: "Adewale Folanh", amount: "₦500,000", date: "05-07-25/07:22AM", sendStatus: "Pending", approval: "Pending" },
  { id: 2, name: "John Adam", amount: "₦500,000", date: "05-07-25/07:22AM", sendStatus: "Pending", approval: "Pending" },
  { id: 3, name: "Chris Banner", amount: "₦500,000", date: "05-07-25/07:22AM", sendStatus: "Pending", approval: "Pending" },
  { id: 4, name: "Adam West", amount: "₦500,000", date: "05-07-25/07:22AM", sendStatus: "Pending", approval: "Pending" },
  { id: 5, name: "Anna Shawn", amount: "₦500,000", date: "05-07-25/07:22AM", sendStatus: "Pending", approval: "Pending" },
  { id: 6, name: "Fair Kadi", amount: "₦500,000", date: "05-07-25/07:22AM", sendStatus: "Pending", approval: "Pending" },
];

// Helper function to get status background color
export const getStatusBgColor = (status: string | undefined | null) => {
  // Handle null, undefined, or empty string cases
  if (!status || typeof status !== 'string') {
    return { backgroundColor: '#6B728033', color: '#6B7280' };
  }
  
  switch (status.toLowerCase()) {
    case 'pending':
      return { backgroundColor: '#FFA50033', color: '#FF8C00' };
    case 'completed':
      return { backgroundColor: '#00800033', color: '#008000' };
    case 'rejected':
      return { backgroundColor: '#FF000033', color: '#FF0000' };
    case 'delivered':
      return { backgroundColor: '#00800033', color: '#008000' };
    default:
      return { backgroundColor: '#6B728033', color: '#6B7280' };
  }
};
