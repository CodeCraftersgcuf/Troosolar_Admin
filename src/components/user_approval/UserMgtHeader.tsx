import Header from "../../component/Header";

interface Props {
  onNotificationClick: () => void;
}

const UserMgtHeader: React.FC<Props> = ({ onNotificationClick }) => (
  <Header
    adminName="Hi, Admin"
    adminImage="/assets/layout/admin.png"
    onNotificationClick={onNotificationClick}
  />
);

export default UserMgtHeader;
