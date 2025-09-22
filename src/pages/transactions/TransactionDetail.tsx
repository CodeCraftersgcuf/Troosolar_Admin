import type { TransactionData } from './transaction';

interface TransactionDetailProps {
  isOpen: boolean;
  transaction: any;
  onClose: () => void;
}

const TransactionDetail = ({ isOpen, transaction, onClose }: TransactionDetailProps) => {
  console.log('TransactionDetail props:', { isOpen, transaction });

  if (!isOpen || !transaction) {
    console.log('Modal not showing - isOpen:', isOpen, 'transaction:', transaction);
    return null;
  }

  // Map API fields to display format - handle both direct transaction object and API response format
  const amount = transaction.price 
    ? `₦${Number(transaction.price).toLocaleString()}` 
    : transaction.amount 
    ? `₦${Number(transaction.amount).toLocaleString()}` 
    : "-";
    
  const paymentType = transaction.payment_method 
    ? transaction.payment_method.charAt(0).toUpperCase() + transaction.payment_method.slice(1).replace(/_/g, ' ')
    : transaction.method 
    ? transaction.method.charAt(0).toUpperCase() + transaction.method.slice(1)
    : "-";
    
  const txId = transaction.tx_id || transaction.reference || transaction.id || "-";
  
  const status = transaction.status 
    ? transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1) 
    : "-";
    
  // Handle date formatting from API response
  let date = "-";
  let time = "-";
  
  if (transaction.date && transaction.time) {
    // API format: separate date and time fields
    date = transaction.date;
    time = transaction.time;
  } else if (transaction.transacted_at) {
    // Alternative format: combined datetime
    const transactedDate = new Date(transaction.transacted_at);
    date = transactedDate.toLocaleDateString();
    time = transactedDate.toLocaleTimeString();
  }
  
  const title = transaction.title || transaction.name || "-";
  const type = transaction.type 
    ? transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1) 
    : "-";

  return (
    <div className="fixed inset-0 bg-black/40 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Transaction Details</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="text-center mb-6">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
            status.toLowerCase() === 'paid' || status.toLowerCase() === 'completed' ? 'bg-green-500' :
            status.toLowerCase() === 'pending' ? 'bg-yellow-500' :
            status.toLowerCase() === 'rejected' || status.toLowerCase() === 'failed' ? 'bg-red-500' :
              'bg-gray-500'
            }`}>
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {status.toLowerCase() === 'paid' || status.toLowerCase() === 'completed' ? 'Transaction Successful' : 
             status.toLowerCase() === 'pending' ? 'Pending Transaction' : 
             'Transaction'}
          </h3>
          <p className="text-sm text-gray-600">{title}</p>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-sm text-gray-500">Title</span>
            <span className="text-sm font-semibold text-gray-900">{title}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-sm text-gray-500">Amount</span>
            <span className="text-sm font-semibold text-gray-900">{amount}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-sm text-gray-500">Type</span>
            <span className="text-sm text-gray-700">{type}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-sm text-gray-500">Payment Method</span>
            <span className="text-sm text-gray-700">{paymentType}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-sm text-gray-500">Transaction ID</span>
            <span className="text-sm text-gray-700 font-mono">{txId}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-sm text-gray-500">Status</span>
            <span className={`text-sm font-medium px-2 py-1 rounded-full ${
              status.toLowerCase() === 'paid' || status.toLowerCase() === 'completed' ? 'bg-green-100 text-green-800' :
              status.toLowerCase() === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              status.toLowerCase() === 'rejected' || status.toLowerCase() === 'failed' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
              {status}
            </span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-sm text-gray-500">Date & Time</span>
            <span className="text-sm text-gray-700">{date} at {time}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionDetail;
