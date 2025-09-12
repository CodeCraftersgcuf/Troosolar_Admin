import type { TransactionData } from './transaction';

interface TransactionDetailProps {
  isOpen: boolean;
  transaction: any;
  onClose: () => void;
}

const TransactionDetail = ({ isOpen, transaction, onClose }: TransactionDetailProps) => {
  if (!isOpen || !transaction) return null;

  // Map API fields
  const amount = transaction.price ? `₦${Number(transaction.price).toLocaleString()}` : "-";
  const paymentType = transaction.payment_method ? transaction.payment_method.charAt(0).toUpperCase() + transaction.payment_method.slice(1) : "-";
  const txId = transaction.tx_id || transaction.id || "-";
  const status = transaction.status ? transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1) : "-";
  const date = transaction.date || "-";
  const time = transaction.time || "-";
  const name = transaction.name || "-";
  const title = transaction.title || "-";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Transaction History</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {status === 'Paid' ? 'Deposit Successful' : status === 'Pending' ? 'Pending Transaction' : 'Transaction'}
          </h3>
          <p className="text-sm text-gray-600">{title}</p>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-sm text-gray-500">Amount</span>
            <span className="text-sm font-semibold text-gray-900">{amount}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-sm text-gray-500">Payment type</span>
            <span className="text-sm text-gray-700">{paymentType}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-sm text-gray-500">Transaction Id</span>
            <span className="text-sm text-gray-700">{txId}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-sm text-gray-500">Status</span>
            <span className="text-sm text-gray-700">{status}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-sm text-gray-500">Name</span>
            <span className="text-sm text-gray-700">{name}</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-sm text-gray-500">Date</span>
            <span className="text-sm text-gray-700">{date} {time ? `- ${time}` : ""}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionDetail;
