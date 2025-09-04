interface TransactionFiltersProps {
  selectedFilter: string;
  onFilterChange: (filter: string) => void;
}

const TransactionFilters = ({ selectedFilter, onFilterChange }: TransactionFiltersProps) => {
  const filters = ["All", "Deposit", "Withdrawals", "Status"];

  return (
    <div className="transaction-filters">
      {filters.map((filter) => (
        <button
          key={filter}
          className={`filter-button ${selectedFilter === filter ? "active" : ""}`}
          onClick={() => onFilterChange(filter)}
        >
          {filter}
        </button>
      ))}
      
      <div className="search-container">
        <input
          type="text"
          placeholder="Search..."
          className="search-input"
        />
        <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path
            d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
};

export default TransactionFilters;
