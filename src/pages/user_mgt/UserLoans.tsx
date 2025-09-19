import { useParams } from "react-router-dom";
import { UserLoanComponent } from "../../component/users";

function UserLoans() {
  // Get user ID from URL params (from /user-activity/:id/loans)
  const { id } = useParams<{ id: string }>();

  console.log("The Id coming", id);

  if (!id) {
    return <div className="p-8 text-xl">User ID not found in URL</div>;
  }

  return (
    <div>
      {/* Render the UserLoanComponent for the selected user */}
      {/* The UserLoanComponent will handle its own API calls using the user ID from URL params */}
      <UserLoanComponent userId={id} />
    </div>
  );
}

export default UserLoans;
