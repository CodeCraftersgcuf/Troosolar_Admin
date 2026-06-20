import { useParams } from "react-router-dom";
import UserBnplApplicationsPanel from "../../component/users/UserBnplApplicationsPanel";

function UserLoans() {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return <div className="p-8 text-xl">User ID not found in URL</div>;
  }

  return (
    <div>
      <UserBnplApplicationsPanel userId={id} />
    </div>
  );
}

export default UserLoans;
