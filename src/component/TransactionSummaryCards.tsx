import "./TransactionSummaryCards.css";

interface TransactionSummaryCardsProps {
  totalTransactions: number;
  totalDeposits: number;
  totalWithdrawals: number;
}

const TransactionSummaryCards = ({ 
  totalTransactions, 
  totalDeposits, 
  totalWithdrawals
}: TransactionSummaryCardsProps) => {
  const formatCurrency = (amount: number) => {
    return `₦${amount.toLocaleString()}`;
  };

  return (
    <div className="summary-cards">
      <div className="summary-card">
        <div className="card-icon transactions-icon">
          <img src="/assets/images/Users.png" alt="Transactions" width="24" height="24" />
        </div>
        <div className="card-content">
          <span className="card-label">Total Transactions</span>
          <span className="card-value">{totalTransactions}</span>
        </div>
      </div>

      <div className="summary-card">
        <div className="card-icon deposits-icon">
          <img src="/assets/images/Users.png" alt="Deposits" width="24" height="24" />
        </div>
        <div className="card-content">
          <span className="card-label">Deposits</span>
          <span className="card-value">{formatCurrency(totalDeposits)}</span>
        </div>
      </div>

      <div className="summary-card">
        <div className="card-icon withdrawals-icon">
          <img src="/assets/images/Users.png" alt="Withdrawals" width="24" height="24" />
        </div>
        <div className="card-content">
          <span className="card-label">Withdrawals</span>
          <span className="card-value">{formatCurrency(totalWithdrawals)}</span>
        </div>
      </div>
    </div>
  );
};

export default TransactionSummaryCards;
