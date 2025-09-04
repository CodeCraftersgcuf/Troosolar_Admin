import React, { useState } from "react";
import DisburseModal from "../../components/modals/DisburseModal";
import images from "../../constants/images";
import type { LoanDetail } from "../../component/users/UserLoanData";
import jsPDF from 'jspdf';

interface FullLoanDetailProps {
  isOpen: boolean;
  onClose: () => void;
  loanId: string;
  onDisbursementUpdate?: (loanId: string, status: string) => void;
}

const FullLoanDetail: React.FC<FullLoanDetailProps> = ({
  isOpen,
  onClose,
  loanId,
  onDisbursementUpdate,
}) => {
  const [activeTab, setActiveTab] = useState<"loan" | "financial">("loan");
  const [showDisburseModal, setShowDisburseModal] = useState(false);
  const [loanData, setLoanData] = useState<LoanDetail | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // Sample loan data - in real app, this would come from props or API call based on loanId
  const getLoanById = (id: string): LoanDetail | null => {
    const sampleLoans: LoanDetail[] = [
      {
        id: "1",
        userId: "1",
        name: "Adewale Faizah",
        loanLimit: "₦500,000",
        loanAmount: "₦200,000",
        loanPeriod: "3 months",
        repaymentDuration: "Monthly",
        financingPartner: "Sterling Bank",
        interestRate: "15%",
        sendStatus: "Pending",
        sendDate: "Not yet sent",
        approvalStatus: "Pending",
        approvalDate: "Not yet approved",
        disbursementStatus: "Pending",
        disbursementDate: "Not yet disbursed",
      },
      {
        id: "2",
        userId: "2",
        name: "John Adam",
        loanLimit: "₦300,000",
        loanAmount: "₦200,000",
        loanPeriod: "3 months",
        repaymentDuration: "Monthly",
        financingPartner: "Access Bank",
        interestRate: "12%",
        sendStatus: "Completed",
        sendDate: "04-07-25/10:30AM",
        approvalStatus: "Completed",
        approvalDate: "05-07-25/14:45PM",
        disbursementStatus: "Completed",
        disbursementDate: "06-07-25/11:20AM",
      },
      {
        id: "3",
        userId: "3",
        name: "Chris Banner",
        loanLimit: "₦400,000",
        loanAmount: "₦200,000",
        loanPeriod: "3 months",
        repaymentDuration: "Monthly",
        financingPartner: "First Bank",
        interestRate: "13%",
        sendStatus: "Completed",
        sendDate: "03-07-25/16:00PM",
        approvalStatus: "Completed",
        approvalDate: "04-07-25/12:30PM",
        disbursementStatus: "Completed",
        disbursementDate: "05-07-25/08:45AM",
      },
      {
        id: "4",
        userId: "4",
        name: "Adam Waa",
        loanLimit: "₦600,000",
        loanAmount: "₦200,000",
        loanPeriod: "3 months",
        repaymentDuration: "Monthly",
        financingPartner: "GTBank",
        interestRate: "14%",
        sendStatus: "Completed",
        sendDate: "02-07-25/13:15PM",
        approvalStatus: "Completed",
        approvalDate: "03-07-25/10:00AM",
        disbursementStatus: "Completed",
        disbursementDate: "04-07-25/15:30PM",
      },
      {
        id: "5",
        userId: "5",
        name: "Anita Shawn",
        loanLimit: "₦450,000",
        loanAmount: "₦200,000",
        loanPeriod: "3 months",
        repaymentDuration: "Monthly",
        financingPartner: "UBA",
        interestRate: "13.5%",
        sendStatus: "Pending",
        sendDate: "Not yet sent",
        approvalStatus: "Pending",
        approvalDate: "Not yet approved",
        disbursementStatus: "Pending",
        disbursementDate: "Not yet disbursed",
      },
      {
        id: "6",
        userId: "6",
        name: "Chris Banner",
        loanLimit: "₦550,000",
        loanAmount: "₦200,000",
        loanPeriod: "3 months",
        repaymentDuration: "Monthly",
        financingPartner: "Zenith Bank",
        interestRate: "16%",
        sendStatus: "Completed",
        sendDate: "30-06-25/11:30AM",
        approvalStatus: "Completed",
        approvalDate: "01-07-25/16:45PM",
        disbursementStatus: "Completed",
        disbursementDate: "02-07-25/13:00PM",
      },
    ];

    const foundLoan = sampleLoans.find((loan) => loan.id === id);
    
    // If loan not found, create a default loan for the user
    if (!foundLoan) {
      return {
        id: id,
        userId: id,
        name: "Unknown User",
        loanLimit: "₦0",
        loanAmount: "₦0",
        loanPeriod: "N/A",
        repaymentDuration: "N/A",
        financingPartner: "N/A",
        interestRate: "0%",
        sendStatus: "Pending",
        sendDate: "Not yet sent",
        approvalStatus: "Pending",
        approvalDate: "Not yet approved",
        disbursementStatus: "Pending",
        disbursementDate: "Not yet disbursed",
      };
    }
    
    return foundLoan;
  };

  const selectedLoan = loanData || getLoanById(loanId);

  // Initialize loan data when component mounts or loanId changes
  React.useEffect(() => {
    if (loanId && (!loanData || loanData.id !== loanId)) {
      const foundLoan = getLoanById(loanId);
      if (foundLoan) {
        setLoanData(foundLoan);
      }
    }
  }, [loanId, loanData]);

  // Reset state when modal closes
  React.useEffect(() => {
    if (!isOpen) {
      setActiveTab("loan");
      setIsDownloading(false);
    }
  }, [isOpen]);

  // Handle disbursement status change
  const handleDisburse = (loanId: string, status: string) => {
    const loan = selectedLoan || getLoanById(loanId);
    if (loan) {
      const updatedLoan: LoanDetail = {
        ...loan,
        disbursementStatus: status as "Pending" | "Completed",
        disbursementDate:
          status === "Completed"
            ? new Date().toLocaleDateString()
            : "Not yet disbursed",
      };
      setLoanData(updatedLoan);

      // Notify parent component about the change
      if (onDisbursementUpdate) {
        onDisbursementUpdate(loanId, status);
      }
    }
  };

  // Handle account statement download
  const handleDownloadStatement = () => {
    const loan = selectedLoan || getLoanById(loanId);
    if (!loan) {
      alert('Unable to find loan data. Please try again.');
      return;
    }
    
    setIsDownloading(true);
    
    try {
      // Create new PDF document
      const doc = new jsPDF();
      
      // Set font and colors
      doc.setFont("helvetica");
      
      // Header
      doc.setFontSize(20);
      doc.setTextColor(39, 62, 142); // Blue color
      doc.text("TROOSOLAR FINANCIAL SERVICES", 20, 25);
      
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text("ACCOUNT STATEMENT", 20, 35);
      
      // Add a line separator
      doc.setLineWidth(0.5);
      doc.line(20, 40, 190, 40);
      
      // Customer Information Section
      let yPosition = 55;
      doc.setFontSize(14);
      doc.setTextColor(39, 62, 142);
      doc.text("Customer Information", 20, yPosition);
      
      yPosition += 10;
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text(`Name: ${loan.name}`, 25, yPosition);
      yPosition += 6;
      doc.text(`Customer ID: ${loan.userId}`, 25, yPosition);
      yPosition += 6;
      doc.text(`Loan ID: ${loan.id}`, 25, yPosition);
      
      // Loan Details Section
      yPosition += 15;
      doc.setFontSize(14);
      doc.setTextColor(39, 62, 142);
      doc.text("Loan Details", 20, yPosition);
      
      yPosition += 10;
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text(`Loan Amount: ${loan.loanAmount}`, 25, yPosition);
      yPosition += 6;
      doc.text(`Loan Limit: ${loan.loanLimit}`, 25, yPosition);
      yPosition += 6;
      doc.text(`Loan Period: ${loan.loanPeriod}`, 25, yPosition);
      yPosition += 6;
      doc.text(`Interest Rate: ${loan.interestRate}`, 25, yPosition);
      yPosition += 6;
      doc.text(`Repayment Duration: ${loan.repaymentDuration}`, 25, yPosition);
      yPosition += 6;
      doc.text(`Financing Partner: ${loan.financingPartner}`, 25, yPosition);
      
      // Status Information Section
      yPosition += 15;
      doc.setFontSize(14);
      doc.setTextColor(39, 62, 142);
      doc.text("Status Information", 20, yPosition);
      
      yPosition += 10;
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text(`Send Status: ${loan.sendStatus}`, 25, yPosition);
      yPosition += 6;
      doc.text(`Send Date: ${loan.sendDate}`, 25, yPosition);
      yPosition += 6;
      doc.text(`Approval Status: ${loan.approvalStatus}`, 25, yPosition);
      yPosition += 6;
      doc.text(`Approval Date: ${loan.approvalDate}`, 25, yPosition);
      yPosition += 6;
      doc.text(`Disbursement Status: ${loan.disbursementStatus}`, 25, yPosition);
      yPosition += 6;
      doc.text(`Disbursement Date: ${loan.disbursementDate}`, 25, yPosition);
      
      // Financial Summary Section
      yPosition += 15;
      doc.setFontSize(14);
      doc.setTextColor(39, 62, 142);
      doc.text("Financial Summary", 20, yPosition);
      
      yPosition += 10;
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text("Total Income: ₦2,000,000", 25, yPosition);
      yPosition += 6;
      doc.text("Monthly Income: ₦200,000", 25, yPosition);
      yPosition += 6;
      doc.text("Total Debt: ₦400,000", 25, yPosition);
      yPosition += 6;
      doc.text("  • ABC Bank: ₦200,000", 30, yPosition);
      yPosition += 6;
      doc.text("  • Defa Bank: ₦200,000", 30, yPosition);
      
      // Footer
      yPosition += 20;
      doc.setLineWidth(0.3);
      doc.line(20, yPosition, 190, yPosition);
      
      yPosition += 10;
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(`Statement Generated: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 20, yPosition);
      yPosition += 5;
      doc.text("This is an official document from Troosolar Financial Services.", 20, yPosition);
      yPosition += 5;
      doc.text("For inquiries, contact customer support.", 20, yPosition);
      
      // Generate filename and save
      const filename = `Account-Statement-${loan.name.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(filename);
      
      // Show success message
      setTimeout(() => {
        alert('PDF account statement downloaded successfully!');
        setIsDownloading(false);
      }, 500);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF account statement. Please try again.');
      setIsDownloading(false);
    }
  };

  // Status Badge component
  const StatusBadge = ({
    status,
  }: {
    status: string;
  }) => {
    let style = { backgroundColor: "#FFA50033", color: "#FF8C00" }; // Default to pending
    let dotColor = "#FF8C00";

    if (status === "Completed") {
      style = { backgroundColor: "#00800033", color: "#008000" };
      dotColor = "#008000";
    } else if (status === "Rejected") {
      style = { backgroundColor: "#FF000033", color: "#FF0000" };
      dotColor = "#FF0000";
    }

    return (
      <span
        className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full min-w-[75px]"
        style={style}
      >
        <span
          className="w-1.5 h-1.5 rounded-full mr-1.5"
          style={{ backgroundColor: dotColor }}
        ></span>
        {status}
      </span>
    );
  };

  if (!isOpen) return null;

  // Get the current loan data - guaranteed to exist since getLoanById creates a fallback
  const currentLoan = selectedLoan || getLoanById(loanId)!;

  return (
    <div className="fixed inset-0 z-50 flex justify-end items-end sm:items-center">
      <div
        className="fixed inset-0 bg-opacity-0 backdrop-brightness-50"
        onClick={onClose}
      ></div>
      <div className="relative bg-white w-[675px] h-full max-w-[100%] max-h-[100%] sm:rounded-xl shadow-lg overflow-y-auto z-10">
        <div className="flex justify-between items-center px-5 pt-4 pb-2">
          <h2 className="text-xl font-semibold">Full Loan Details</h2>
          <button className=" cursor-pointer " onClick={onClose}>
            {/* <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg> */}
            <img src={images.cross} className="w-7 h-7" alt="" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b px-5">
          <button
            className={`py-2 px-0 mr-6 cursor-pointer ${
              activeTab === "loan"
                ? "border-b-4 border-[#273E8E] font-medium text-black"
                : "text-[#00000080]"
            }`}
            onClick={() => setActiveTab("loan")}
          >
            Loan Details
          </button>
          <button
            className={`py-2 px-0 cursor-pointer ${
              activeTab === "financial"
                ? "border-b-4 border-[#273E8E] font-medium text-black"
                : "text-[#00000080]"
            }`}
            onClick={() => setActiveTab("financial")}
          >
            Financial details
          </button>
        </div>

        {/* Loan Details Content */}
        {activeTab === "loan" && (
          <div className="px-5">
            <div className="mb-6">
              <h3 className="text-sm font-medium my-3">Loan Details</h3>
              <div className="space-y-0 border-[#00000080] border rounded-lg p-5">
                <div className="flex justify-between py-3 border-b border-[#CDCDCD]">
                  <span className="text-[#00000080] text-sm">Name</span>
                  <span className="font-medium text-sm text-right">
                    {currentLoan.name}
                  </span>
                </div>
                <div className="flex justify-between py-3 border-b border-[#CDCDCD]">
                  <span className="text-[#00000080] text-sm">Loan Limit</span>
                  <span className="font-medium text-sm text-right">
                    {currentLoan.loanLimit}
                  </span>
                </div>
                <div className="flex justify-between py-3 border-b border-[#CDCDCD]">
                  <span className="text-[#00000080] text-sm">Loan Amount</span>
                  <span className="font-medium text-sm text-right">
                    {currentLoan.loanAmount}
                  </span>
                </div>
                <div className="flex justify-between py-3 border-b border-[#CDCDCD]">
                  <span className="text-[#00000080] text-sm">Loan Period</span>
                  <span className="font-medium text-sm text-right">
                    {currentLoan.loanPeriod}
                  </span>
                </div>
                <div className="flex justify-between py-3 border-b border-[#CDCDCD]">
                  <span className="text-[#00000080] text-sm">
                    Repayment duration
                  </span>
                  <span className="font-medium text-sm text-right">
                    {currentLoan.repaymentDuration}
                  </span>
                </div>
                <div className="flex justify-between py-3 border-b border-[#CDCDCD]">
                  <span className="text-[#00000080] text-sm">
                    Financing partner
                  </span>
                  <span className="font-medium text-sm text-right">
                    {currentLoan.financingPartner}
                  </span>
                </div>
                <div className="flex justify-between py-3">
                  <span className="text-[#00000080] text-sm">
                    Interest rate
                  </span>
                  <span className="font-medium text-sm text-right">
                    {currentLoan.interestRate}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium my-3">Loan Status</h3>
              <div className="space-y-0 border border-[#00000080] rounded-lg p-5">
                <div className="flex justify-between py-3 border-b border-[#CDCDCD]">
                  <span className="text-[#00000080] text-sm">
                    Send Status (to partner)
                  </span>
                  <StatusBadge status={currentLoan.sendStatus} />
                </div>
                <div className="flex justify-between py-3 border-b border-[#CDCDCD]">
                  <span className="text-[#00000080] text-sm">Send Date</span>
                  <span className="font-medium text-sm text-right">
                    {currentLoan.sendDate}
                  </span>
                </div>
                <div className="flex justify-between py-3 border-b border-[#CDCDCD]">
                  <span className="text-[#00000080] text-sm">
                    Approval Status (from partner)
                  </span>
                  <StatusBadge status={currentLoan.approvalStatus} />
                </div>
                <div className="flex justify-between py-3 border-b border-[#CDCDCD]">
                  <span className="text-[#00000080] text-sm">
                    Approval Date
                  </span>
                  <span className="font-medium text-sm text-right">
                    {currentLoan.approvalDate}
                  </span>
                </div>
                <div className="flex justify-between py-3 border-b border-[#CDCDCD]">
                  <span className="text-[#00000080] text-sm">
                    Disbursement Status
                  </span>
                  <StatusBadge status={currentLoan.disbursementStatus} />
                </div>
                <div className="flex justify-between py-3">
                  <span className="text-[#00000080] text-sm">
                    Disbursement Date
                  </span>
                  <span className="font-medium text-sm text-right">
                    {currentLoan.disbursementDate}
                  </span>
                </div>
              </div>
            </div>

            <button
              className={`w-full py-3 rounded-full font-medium my-5 transition-colors cursor-pointer ${
                currentLoan.disbursementStatus === "Completed"
                  ? "bg-[#939FC7] text-white cursor-not-allowed"
                  : "bg-[#273E8E] hover:bg-blue-700 text-white"
              }`}
              onClick={() =>
                currentLoan.disbursementStatus !== "Completed" &&
                setShowDisburseModal(true)
              }
              disabled={currentLoan.disbursementStatus === "Completed"}
            >
              Disburse Loan
            </button>
          </div>
        )}

        {/* Financial Details Content */}
        {activeTab === "financial" && (
          <div className="px-5">
            <div className="mb-6">
              <h3 className="text-sm font-medium my-3">Credit Check Data</h3>
              <div className="space-y-0 border border-[#00000080] rounded-lg p-2 overflow-hidden">
                <div className="flex justify-between py-3 px-3 border-b border-[#CDCDCD]">
                  <span className="text-gray-500 text-sm">Total Income</span>
                  <span className="font-medium text-sm text-right">
                    ₦2,000,000
                  </span>
                </div>
                <div className="flex justify-between py-3 px-3">
                  <span className="text-gray-500 text-sm">Monthly Income</span>
                  <span className="font-medium text-sm text-right">
                    ₦200,000
                  </span>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-sm font-medium my-3">Debt Status</h3>
              <div className="space-y-0 border border-[#00000080] rounded-lg p-2 overflow-hidden">
                <div className="flex justify-between py-3 px-3 border-b border-[#CDCDCD]">
                  <span className="text-gray-500 text-sm">Debt Status</span>
                  <span className="font-medium text-sm text-right">
                    Owing 2 institutions
                  </span>
                </div>
                <div className="flex justify-between py-3 px-3 border-b border-[#CDCDCD]">
                  <span className="text-gray-500 text-sm">ABC Bank</span>
                  <span className="font-medium text-sm text-right">
                    ₦200,000
                  </span>
                </div>
                <div className="flex justify-between py-3 px-3 border-b border-[#CDCDCD]">
                  <span className="text-gray-500 text-sm">Defa Bank</span>
                  <span className="font-medium text-sm text-right">
                    ₦200,000
                  </span>
                </div>
                <div className="flex justify-between py-3 px-3">
                  <span className="text-gray-500 text-sm">Total Owed</span>
                  <span className="font-medium text-sm text-right">
                    ₦400,000
                  </span>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-sm font-medium my-3">Account Statement</h3>
              <div className="flex items-center justify-between py-3 px-3 border border-[#00000080] rounded-lg p-2">
                <div className="flex items-center">
                  <div className="mr-3">
                    <div className="pdf-icon">
                      <img
                        src="/assets/images/pdf.png"
                        alt="PDF"
                        width="24"
                        height="24"
                        className="object-contain"
                      />
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium">
                      Download Account Statement
                    </div>
                    <div className="text-xs text-gray-500">
                      {isDownloading ? "Generating PDF..." : "PDF • 200kb"}
                    </div>
                  </div>
                </div>
                <button 
                  className={`text-blue-600 hover:text-blue-800 transition-colors ${
                    isDownloading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                  }`}
                  onClick={handleDownloadStatement}
                  disabled={isDownloading}
                  title="Download Account Statement"
                >
                  <div className="download-icon">
                    {isDownloading ? (
                      <div className="w-6 h-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
                    ) : (
                      <img
                        src="/assets/images/download.png"
                        alt="Download"
                        width="24"
                        height="24"
                        className="object-contain"
                      />
                    )}
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Disburse Modal */}
      <DisburseModal
        isOpen={showDisburseModal}
        onClose={() => setShowDisburseModal(false)}
        loanId={loanId}
        amount={currentLoan.loanAmount}
        onDisburse={handleDisburse}
      />
    </div>
  );
};

export default FullLoanDetail;
