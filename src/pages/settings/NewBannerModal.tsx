import { useState } from "react";
import images from "../../constants/images";

interface NewBannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (image: File | null, link: string) => void;
}

const NewBannerModal = ({ isOpen, onClose, onSave }: NewBannerModalProps) => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [bannerLink, setBannerLink] = useState("");

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
    }
  };

  const handleSave = () => {
    if (selectedImage && bannerLink.trim()) {
      onSave(selectedImage, bannerLink);
      setSelectedImage(null);
      setBannerLink("");
      onClose();
    }
  };

  const handleClose = () => {
    setSelectedImage(null);
    setBannerLink("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-brightness-50 bg-opacity-50 flex items-start justify-end z-50">
      <div className="bg-white rounded-xl p-6 w-110 max-w-md mx-4 relative">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 cursor-pointer"
        >
          <img src={images.cross} alt="" />
        </button>

        {/* Modal Header */}
        <h2 className="text-xl font-semibold text-gray-800 mb-6">
          Upload Banner
        </h2>

        {/* Banner Image Upload */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Banner Image
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="banner-upload"
            />
            <label htmlFor="banner-upload" className="cursor-pointer">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 mb-3 text-gray-400">
                  <svg fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                  </svg>
                </div>
                <p className="text-sm text-gray-500">
                  {selectedImage ? selectedImage.name : "Upload banner image"}
                </p>
                {!selectedImage && (
                  <p className="text-xs text-gray-400 mt-1">
                    Click to select an image file
                  </p>
                )}
              </div>
            </label>
          </div>
        </div>

        {/* Banner Link */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Banner Link
          </label>
          <input
            type="url"
            value={bannerLink}
            onChange={(e) => setBannerLink(e.target.value)}
            placeholder="Enter URL"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#273E8E] focus:border-[#273E8E] outline-none text-sm"
          />
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={!selectedImage || !bannerLink.trim()}
          className="w-full bg-[#273E8E] text-white py-3 rounded-full text-sm font-medium hover:bg-[#1f2f7a] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer"
        >
          Save
        </button>
      </div>
    </div>
  );
};

export default NewBannerModal;
