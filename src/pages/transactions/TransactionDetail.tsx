import type { TransactionData } from './transaction';

interface TransactionDetailProps {
  isOpen: boolean;
  transaction: TransactionData | null;
  onClose: () => void;
}

const TransactionDetail = ({ isOpen, transaction, onClose }: TransactionDetailProps) => {
  if (!isOpen || !transaction) return null;

  // Simple test modal - always show this for now
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Transaction History</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
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
            {transaction.type === 'Deposit' ? 'Deposit Successful' : 'Withdrawal Successful'}
          </h3>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-sm text-gray-500">Amount</span>
            <span className="text-sm font-semibold text-gray-900">{transaction.amount}</span>
          </div>
          
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-sm text-gray-500">Payment type</span>
            <span className="text-sm text-gray-700">
              {transaction.type === 'Deposit' ? 'Wallet deposit' : 'Order Payment - Part'}
            </span>
          </div>
          
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-sm text-gray-500">Transaction Id</span>
            <span className="text-sm text-gray-700">{transaction.txId}</span>
          </div>
          
          <div className="flex justify-between items-center py-2">
            <span className="text-sm text-gray-500">Date</span>
            <span className="text-sm text-gray-700">July 3, 2025 - 08:12 AM</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionDetail;
