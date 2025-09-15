import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { users } from "../../constants/usermgt";
import { UserLoanComponent, userLoansData } from "../../component/users";
import LoadingSpinner from "../../components/common/LoadingSpinner";

function UserLoans() {
  const [isLoading, setIsLoading] = useState(true);
  
  // Get user ID from URL params instead of hard-coding
  const { id } = useParams<{ id: string }>();
  const user = users.find(u => u.id === (id || "1"));

  // Simulate loading for user lookup
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500); // Brief loading state

    return () => clearTimeout(timer);
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner message="Loading user loans..." />
      </div>
    );
  }

  if (!user) return <div className="p-8 text-xl">User not found</div>;

  // Filter loans for the current user
  const userLoans = userLoansData.filter(loan => loan.userId === user.id);
  
  return (
    <div>
      {/* Render the UserLoanComponent for the selected user */}
      <UserLoanComponent user={user} userLoans={userLoans} />
    </div>
  );
}

export default UserLoans;
