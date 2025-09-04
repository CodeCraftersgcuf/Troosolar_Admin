import type { LoanDetail } from './UserLoanData';

/**
 * Creates default loan data for a newly added user
 * @param userId The ID of the new user
 * @param userName The name of the new user
 * @returns A loan detail object with default values
 */
export const createDefaultLoanForUser = (userId: string, userName: string): LoanDetail => {
  const today = new Date();
  const formattedDate = `July ${today.getDate()}, 2025 - ${String(today.getHours()).padStart(2, '0')}:${String(today.getMinutes()).padStart(2, '0')} ${today.getHours() >= 12 ? 'PM' : 'AM'}`;
  
  return {
    id: `new-${userId}-1`, // Generate a unique ID for the loan
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
};
