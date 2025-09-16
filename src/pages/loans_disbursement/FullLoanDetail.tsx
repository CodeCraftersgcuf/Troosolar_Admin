import React, { useState } from "react";
import DisburseModal from "../../components/modals/DisburseModal";
import images from "../../constants/images";
import jsPDF from 'jspdf';

//code related to the integration
import { getSingleLoanDetail } from "../../utils/queries/loans";
import { useQuery } from "@tanstack/react-query";
import Cookies from "js-cookie";

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
  const [isDownloading, setIsDownloading] = useState(false);

  // API integration for full loan detail
  const token = Cookies.get("token");
  const { data: apiLoan, isLoading: isLoanLoading, isError: isLoanError } = useQuery({
    queryKey: ["full-loan-detail", loanId],
    queryFn: () => getSingleLoanDetail(loanId, token || ""),
    enabled: isOpen && !!loanId && !!token,
  });

  // Map API response to loan detail object
  const currentLoan = apiLoan?.data
    ? {
        id: String(apiLoan.data.id ?? loanId),
        userId: String(apiLoan.data.user_id ?? loanId),
        name: apiLoan.data.user ? `${apiLoan.data.user.first_name} ${apiLoan.data.user.sur_name}` : "Unknown User",
        loanLimit: apiLoan.data.mono?.loan_limit !== null ? `₦${apiLoan.data.mono.loan_limit}` : "N/A",
        loanAmount: apiLoan.data.loan_amount !== null ? `₦${apiLoan.data.loan_amount.toLocaleString()}` : "N/A",
        loanPeriod: apiLoan.data.repayment_duration !== null ? `${apiLoan.data.repayment_duration} months` : "N/A",
        repaymentDuration: apiLoan.data.mono?.repayment_duration !== null ? `${apiLoan.data.mono.repayment_duration} months` : "N/A",
        financingPartner: "Mono",
        interestRate: apiLoan.data.mono?.interest_rate !== null ? `${apiLoan.data.mono.interest_rate}%` : "N/A",
        sendStatus: apiLoan.data.loan_status?.send_status || "Pending",
        sendDate: apiLoan.data.loan_status?.send_date ? new Date(apiLoan.data.loan_status.send_date).toLocaleDateString() : "Not yet sent",
        approvalStatus: apiLoan.data.loan_status?.approval_status || "Pending",
        approvalDate: apiLoan.data.loan_status?.approval_date ? new Date(apiLoan.data.loan_status.approval_date).toLocaleDateString() : "Not yet approved",
        disbursementStatus: apiLoan.data.loan_status?.disbursement_status || "Pending",
        disbursementDate: apiLoan.data.loan_status?.disbursement_date ? new Date(apiLoan.data.loan_status.disbursement_date).toLocaleDateString() : "Not yet disbursed",
        // Additional fields from the API response
        beneficiaryName: apiLoan.data.beneficiary_name || "N/A",
        beneficiaryEmail: apiLoan.data.beneficiary_email || "N/A",
        beneficiaryRelationship: apiLoan.data.beneficiary_relationship || "N/A",
        beneficiaryPhone: apiLoan.data.beneficiary_phone || "N/A",
        titleDocument: apiLoan.data.title_document || "N/A",
        uploadDocument: apiLoan.data.upload_document || "N/A",
        totalAmount: apiLoan.data.mono?.total_amount ? `₦${apiLoan.data.mono.total_amount.toLocaleString()}` : "N/A",
        downPayment: apiLoan.data.mono?.down_payment ? `₦${apiLoan.data.mono.down_payment.toLocaleString()}` : "N/A",
        creditScore: apiLoan.data.mono?.credit_score || "N/A",
        isOverdue: apiLoan.data.mono?.is_overdue || false,
      }
    : null;

  // Show loading indicator while fetching
  if (isOpen && isLoanLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center text-gray-500 text-lg">
          Loading loan details...
        </div>
      </div>
    );
  }

  // Show error if failed to fetch
  if (isOpen && isLoanError) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center text-red-500 text-lg">
          Failed to load loan details.
        </div>
      </div>
    );
  }

  // Show not found if no loan data
  if (isOpen && !currentLoan) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center text-gray-500 text-lg">
          Loan details not found.
        </div>
      </div>
    );
  }


  // Handle account statement download
  const handleDownloadStatement = () => {
    const loan = currentLoan;
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
      doc.text(`Loan Amount: ${loan.loanAmount}`, 25, yPosition);
      yPosition += 6;
      doc.text(`Total Amount: ${loan.totalAmount}`, 25, yPosition);
      yPosition += 6;
      doc.text(`Down Payment: ${loan.downPayment}`, 25, yPosition);
      yPosition += 6;
      doc.text(`Interest Rate: ${loan.interestRate}`, 25, yPosition);
      yPosition += 6;
      doc.text(`Credit Score: ${loan.creditScore}`, 25, yPosition);
      yPosition += 6;
      doc.text(`Overdue Status: ${loan.isOverdue ? 'Overdue' : 'Current'}`, 25, yPosition);
      
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

  if (!isOpen || !currentLoan) return null;

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

            {/* Beneficiary Information */}
            <div className="mb-6">
              <h3 className="text-sm font-medium my-3">Beneficiary Information</h3>
              <div className="space-y-0 border-[#00000080] border rounded-lg p-5">
                <div className="flex justify-between py-3 border-b border-[#CDCDCD]">
                  <span className="text-[#00000080] text-sm">Beneficiary Name</span>
                  <span className="font-medium text-sm text-right">
                    {currentLoan.beneficiaryName}
                  </span>
                </div>
                <div className="flex justify-between py-3 border-b border-[#CDCDCD]">
                  <span className="text-[#00000080] text-sm">Beneficiary Email</span>
                  <span className="font-medium text-sm text-right">
                    {currentLoan.beneficiaryEmail}
                  </span>
                </div>
                <div className="flex justify-between py-3 border-b border-[#CDCDCD]">
                  <span className="text-[#00000080] text-sm">Relationship</span>
                  <span className="font-medium text-sm text-right">
                    {currentLoan.beneficiaryRelationship}
                  </span>
                </div>
                <div className="flex justify-between py-3">
                  <span className="text-[#00000080] text-sm">Phone Number</span>
                  <span className="font-medium text-sm text-right">
                    {currentLoan.beneficiaryPhone}
                  </span>
                </div>
              </div>
            </div>

            {/* Document Information */}
            <div className="mb-6">
              <h3 className="text-sm font-medium my-3">Document Information</h3>
              <div className="space-y-0 border-[#00000080] border rounded-lg p-5">
                <div className="flex justify-between py-3 border-b border-[#CDCDCD]">
                  <span className="text-[#00000080] text-sm">Document Type</span>
                  <span className="font-medium text-sm text-right">
                    {currentLoan.titleDocument}
                  </span>
                </div>
                <div className="flex justify-between py-3">
                  <span className="text-[#00000080] text-sm">Uploaded Document</span>
                  <span className="font-medium text-sm text-right">
                    {currentLoan.uploadDocument !== "N/A" ? (
                      <a 
                        href={currentLoan.uploadDocument} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        View Document
                      </a>
                    ) : (
                      "N/A"
                    )}
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
              <h3 className="text-sm font-medium my-3">Loan Financial Summary</h3>
              <div className="space-y-0 border border-[#00000080] rounded-lg p-2 overflow-hidden">
                <div className="flex justify-between py-3 px-3 border-b border-[#CDCDCD]">
                  <span className="text-gray-500 text-sm">Loan Amount</span>
                  <span className="font-medium text-sm text-right">
                    {currentLoan.loanAmount}
                  </span>
                </div>
                <div className="flex justify-between py-3 px-3 border-b border-[#CDCDCD]">
                  <span className="text-gray-500 text-sm">Total Amount</span>
                  <span className="font-medium text-sm text-right">
                    {currentLoan.totalAmount}
                  </span>
                </div>
                <div className="flex justify-between py-3 px-3 border-b border-[#CDCDCD]">
                  <span className="text-gray-500 text-sm">Down Payment</span>
                  <span className="font-medium text-sm text-right">
                    {currentLoan.downPayment}
                  </span>
                </div>
                <div className="flex justify-between py-3 px-3">
                  <span className="text-gray-500 text-sm">Interest Rate</span>
                  <span className="font-medium text-sm text-right">
                    {currentLoan.interestRate}
                  </span>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-sm font-medium my-3">Credit Information</h3>
              <div className="space-y-0 border border-[#00000080] rounded-lg p-2 overflow-hidden">
                <div className="flex justify-between py-3 px-3 border-b border-[#CDCDCD]">
                  <span className="text-gray-500 text-sm">Credit Score</span>
                  <span className="font-medium text-sm text-right">
                    {currentLoan.creditScore}
                  </span>
                </div>
                <div className="flex justify-between py-3 px-3 border-b border-[#CDCDCD]">
                  <span className="text-gray-500 text-sm">Loan Limit</span>
                  <span className="font-medium text-sm text-right">
                    {currentLoan.loanLimit}
                  </span>
                </div>
                <div className="flex justify-between py-3 px-3 border-b border-[#CDCDCD]">
                  <span className="text-gray-500 text-sm">Repayment Duration</span>
                  <span className="font-medium text-sm text-right">
                    {currentLoan.repaymentDuration}
                  </span>
                </div>
                <div className="flex justify-between py-3 px-3">
                  <span className="text-gray-500 text-sm">Overdue Status</span>
                  <span className="font-medium text-sm text-right">
                    {currentLoan.isOverdue ? (
                      <span className="text-red-600">Overdue</span>
                    ) : (
                      <span className="text-green-600">Current</span>
                    )}
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
        loanId={currentLoan.id}
        amount={currentLoan.loanAmount}
        onDisburse={(id, status) => {
          if (onDisbursementUpdate) onDisbursementUpdate(id, status);
        }}
      />
    </div>
  );
};

export default FullLoanDetail;
