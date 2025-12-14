import { useNavigate } from "react-router-dom";

const NotFoundPublic: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-[#F5F7FF] min-h-screen flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-[#273E8E] mb-4">404</h1>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Page Not Found</h2>
          <p className="text-gray-600 text-lg mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        <div className="space-y-4">
          <button
            onClick={() => navigate("/login")}
            className="bg-[#273E8E] hover:bg-[#1e3270] text-white px-8 py-3 rounded-full text-base font-medium transition-colors shadow-sm cursor-pointer w-full"
          >
            Go to Login
          </button>
          <button
            onClick={() => navigate(-1)}
            className="bg-white hover:bg-gray-50 text-[#273E8E] border-2 border-[#273E8E] px-8 py-3 rounded-full text-base font-medium transition-colors shadow-sm cursor-pointer w-full"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPublic;

