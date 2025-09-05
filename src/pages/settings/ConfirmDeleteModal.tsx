import React from "react";
import images from "../../constants/images";

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  message?: string;
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  message = "Are you sure you want to delete?",
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-xl p-8 max-w-sm w-full shadow-lg relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-xl cursor-pointer"
        >
          <img src={images.cross} alt="" />
        </button>
        <h2 className="text-lg font-semibold mb-4 text-gray-900">Confirm Delete</h2>
        <p className="mb-8 text-gray-700">{message}</p>
        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-full bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 transition-colors"
          >
            No
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2 rounded-full bg-[#FF0000] text-white font-medium hover:bg-red-600 transition-colors"
          >
            Yes
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;
