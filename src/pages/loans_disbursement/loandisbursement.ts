export interface DisbursementData {
  id: string;
  name: string;
  amount: string;
  duration: string;
  disbursement: "Pending" | "Completed";
  loanStatus: "Active" | "Repaid" | "Overdue" | "Pending";
  partnerApproved?: boolean; // Added for filtering with StatusToggle
}

export const disbursementData: DisbursementData[] = [
  {
    id: "1",
    name: "Adewale Faizah",
    amount: "N200,000",
    duration: "3 Months",
    disbursement: "Pending",
    loanStatus: "Active",
    partnerApproved: true,
  },
  {
    id: "2",
    name: "John Adam",
    amount: "N200,000",
    duration: "3 Months",
    disbursement: "Completed",
    loanStatus: "Repaid",
    partnerApproved: true,
  },
  {
    id: "3",
    name: "Chris Banner",
    amount: "N200,000",
    duration: "3 Months",
    disbursement: "Completed",
    loanStatus: "Overdue",
    partnerApproved: false,
  },
  {
    id: "4",
    name: "Adam Waa",
    amount: "N200,000",
    duration: "3 Months",
    disbursement: "Completed",
    loanStatus: "Repaid",
    partnerApproved: true,
  },
  {
    id: "5",
    name: "Anita Shawn",
    amount: "N200,000",
    duration: "3 Months",
    disbursement: "Pending",
    loanStatus: "Pending",
    partnerApproved: false,
  },
  {
    id: "6",
    name: "Chris Banner",
    amount: "N200,000",
    duration: "3 Months",
    disbursement: "Completed",
    loanStatus: "Overdue",
  },
];

// Helper function to get disbursement status colors
export const getDisbursementStatusColor = (status: "Pending" | "Completed" | "disbursed" | string) => {
  switch (status.toLowerCase()) {
    case "pending":
      return { backgroundColor: "#FFA50033", color: "#FF8C00" };
    case "completed":
      return { backgroundColor: "#00800033", color: "#008000" };
    case "disbursed":
      return { backgroundColor: "#0000FF33", color: "#0000FF" };
    default:
      return { backgroundColor: "#FFA50033", color: "#FF8C00" };
  }
};

// Helper function to get loan status colors | "approved" | string
export const getLoanStatusColor = (
  status: "Active" | "Repaid" | "Overdue" | "Pending"
) => {
  switch (status.toLowerCase()) {
    case "active":
      return { backgroundColor: "#00800033", color: "#008000" };
    case "repaid":
      return { backgroundColor: "#0000FF33", color: "#0000FF" };
    case "overdue":
      return { backgroundColor: "#FF000033", color: "#FF0000" };
    case "pending":
      return { backgroundColor: "#FFA50033", color: "#FF8C00" };
    default:
      return { backgroundColor: "#FFA50033", color: "#FF8C00" };
  }


};
