import { useParams } from "react-router-dom";
import { users } from "../../constants/usermgt";
import { UserLoanComponent, userLoansData } from "../../component/users";

function UserLoans() {
  // Get user ID from URL params instead of hard-coding
  const { id } = useParams<{ id: string }>();
  const user = users.find(u => u.id === (id || "1"));
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
