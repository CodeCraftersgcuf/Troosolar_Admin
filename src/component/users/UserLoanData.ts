// Define types for user loan data
export type LoanDetail = {
  id: string;
  userId: string; // Added userId to associate loans with specific users
  name: string;
  loanLimit: string;
  loanAmount: string;
  loanPeriod: string;
  repaymentDuration: string;
  financingPartner: string;
  interestRate: string;
  sendStatus: "Pending" | "Completed";
  approvalStatus: "Pending" | "Completed" | "Rejected";
  disbursementStatus: "Pending" | "Completed";
  sendDate: string;
  approvalDate: string;
  disbursementDate: string;
};

// Sample loan data for all users
export let userLoansData: LoanDetail[] = [
  // Loans for Germandon Abudu (User ID 1)
  {
    id: "1",
    userId: "1",
    name: "Germandon Abudu",
    loanLimit: "500,000",
    loanAmount: "200,000",
    loanPeriod: "6 months",
    repaymentDuration: "monthly",
    financingPartner: "VFD Bank",
    interestRate: "5%",
    sendStatus: "Pending",
    approvalStatus: "Pending",
    disbursementStatus: "Pending",
    sendDate: "July 3, 2025 - 07:22 AM",
    approvalDate: "July 3, 2025 - 07:22 AM",
    disbursementDate: "July 3, 2025 - 07:22 AM"
  },
  {
    id: "2",
    userId: "1",
    name: "Germandon Abudu",
    loanLimit: "500,000",
    loanAmount: "200,000",
    loanPeriod: "6 months",
    repaymentDuration: "monthly",
    financingPartner: "VFD Bank",
    interestRate: "5%",
    sendStatus: "Completed",
    approvalStatus: "Completed",
    disbursementStatus: "Pending",
    sendDate: "July 3, 2025 - 07:22 AM",
    approvalDate: "July 3, 2025 - 07:22 AM",
    disbursementDate: "July 3, 2025 - 07:22 AM"
  },
  {
    id: "3",
    userId: "1",
    name: "Germandon Abudu",
    loanLimit: "500,000",
    loanAmount: "200,000",
    loanPeriod: "6 months",
    repaymentDuration: "monthly",
    financingPartner: "VFD Bank",
    interestRate: "5%",
    sendStatus: "Completed",
    approvalStatus: "Rejected",
    disbursementStatus: "Pending",
    sendDate: "July 3, 2025 - 07:22 AM",
    approvalDate: "July 3, 2025 - 07:22 AM",
    disbursementDate: "July 3, 2025 - 07:22 AM"
  },
  
  // Loans for Chiara Lawson (User ID 2)
  {
    id: "4",
    userId: "2",
    name: "Chiara Lawson",
    loanLimit: "600,000",
    loanAmount: "300,000",
    loanPeriod: "12 months",
    repaymentDuration: "monthly",
    financingPartner: "First Bank",
    interestRate: "4.5%",
    sendStatus: "Completed",
    approvalStatus: "Completed",
    disbursementStatus: "Completed",
    sendDate: "July 1, 2025 - 10:15 AM",
    approvalDate: "July 2, 2025 - 09:30 AM",
    disbursementDate: "July 5, 2025 - 02:45 PM"
  },
  {
    id: "5",
    userId: "2",
    name: "Chiara Lawson",
    loanLimit: "600,000",
    loanAmount: "150,000",
    loanPeriod: "3 months",
    repaymentDuration: "monthly",
    financingPartner: "First Bank",
    interestRate: "3.5%",
    sendStatus: "Pending",
    approvalStatus: "Pending",
    disbursementStatus: "Pending",
    sendDate: "July 10, 2025 - 11:22 AM",
    approvalDate: "July 10, 2025 - 11:22 AM",
    disbursementDate: "July 10, 2025 - 11:22 AM"
  },
  
  // Loans for Anita Becker (User ID 3)
  {
    id: "6",
    userId: "3",
    name: "Anita Becker",
    loanLimit: "700,000",
    loanAmount: "400,000",
    loanPeriod: "12 months",
    repaymentDuration: "monthly",
    financingPartner: "Access Bank",
    interestRate: "5.5%",
    sendStatus: "Completed",
    approvalStatus: "Pending",
    disbursementStatus: "Pending",
    sendDate: "July 5, 2025 - 08:10 AM",
    approvalDate: "July 5, 2025 - 08:10 AM",
    disbursementDate: "July 5, 2025 - 08:10 AM"
  },
  
  // Loans for Rasheedat Bello (User ID 4)
  {
    id: "7",
    userId: "4",
    name: "Rasheedat Bello",
    loanLimit: "450,000",
    loanAmount: "200,000",
    loanPeriod: "6 months",
    repaymentDuration: "monthly",
    financingPartner: "UBA Bank",
    interestRate: "4%",
    sendStatus: "Completed",
    approvalStatus: "Rejected",
    disbursementStatus: "Pending",
    sendDate: "July 7, 2025 - 03:45 PM",
    approvalDate: "July 8, 2025 - 11:30 AM",
    disbursementDate: "July 8, 2025 - 11:30 AM"
  },
  
  // Loans for Adewale Ade (User ID 5)
  {
    id: "8",
    userId: "5",
    name: "Adewale Ade",
    loanLimit: "800,000",
    loanAmount: "500,000",
    loanPeriod: "24 months",
    repaymentDuration: "monthly",
    financingPartner: "GT Bank",
    interestRate: "6%",
    sendStatus: "Completed",
    approvalStatus: "Completed",
    disbursementStatus: "Completed",
    sendDate: "July 2, 2025 - 09:20 AM",
    approvalDate: "July 3, 2025 - 02:15 PM",
    disbursementDate: "July 4, 2025 - 10:30 AM"
  },
  
  // Loans for Janet Ariel (User ID 6)
  {
    id: "9",
    userId: "6",
    name: "Janet Ariel",
    loanLimit: "350,000",
    loanAmount: "150,000",
    loanPeriod: "4 months",
    repaymentDuration: "monthly",
    financingPartner: "Zenith Bank",
    interestRate: "3.75%",
    sendStatus: "Pending",
    approvalStatus: "Pending",
    disbursementStatus: "Pending",
    sendDate: "July 12, 2025 - 04:50 PM",
    approvalDate: "July 12, 2025 - 04:50 PM",
    disbursementDate: "July 12, 2025 - 04:50 PM"
  }
];

/**
 * Adds a new loan for a newly created user
 * @param userId The ID of the new user
 * @param userName The name of the new user
 */
export const addLoanForNewUser = (userId: string, userName: string): void => {
  const today = new Date();
  const formattedDate = `July ${today.getDate()}, 2025 - ${String(today.getHours()).padStart(2, '0')}:${String(today.getMinutes()).padStart(2, '0')} ${today.getHours() >= 12 ? 'PM' : 'AM'}`;
  
  const newLoan: LoanDetail = {
    id: `loan-${userLoansData.length + 1}`,
    userId: userId,
    name: userName,
    loanLimit: "400,000",
    loanAmount: "200,000",
    loanPeriod: "6 months",
    repaymentDuration: "monthly",
    financingPartner: "Default Bank",
    interestRate: "5%",
    sendStatus: "Pending",
    approvalStatus: "Pending",
    disbursementStatus: "Pending",
    sendDate: formattedDate,
    approvalDate: formattedDate,
    disbursementDate: formattedDate
  };
  
  userLoansData = [...userLoansData, newLoan];
};
