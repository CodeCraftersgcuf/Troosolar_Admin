import images from "../constants/images";

interface HeaderProps {
  adminName?: string;
  adminImage?: string;
  onNotificationClick?: () => void;
}

const Header = ({
  adminName = "Hi, Admin",
  adminImage = "/assets/layout/admin.png",
  onNotificationClick,
}: HeaderProps) => {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex justify-end items-center">
        <div className="flex items-center space-x-4">
          <button className="cursor-pointer" onClick={onNotificationClick}>
            <img className="w-11 h-11" src={images.bell} alt="" />
          </button>
          <div className="flex items-center space-x-3">
            <img
              src={adminImage}
              alt="Admin"
              className="w-8 h-8 rounded-full"
            />
            <span className="font-medium text-gray-700">{adminName}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
