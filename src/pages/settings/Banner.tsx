import { useState } from "react";
import NewBannerModal from "./NewBannerModal";

interface BannerItem {
  id: string;
  image: string;
  dateCreated: string;
  isSelected?: boolean;
}

interface BannerProps {
  isModalOpen?: boolean;
  setIsModalOpen?: (open: boolean) => void;
}

const Banner = ({ isModalOpen = false, setIsModalOpen }: BannerProps = {}) => {
  const [bannerList, setBannerList] = useState<BannerItem[]>([
    {
      id: "1",
      image: "/public/assets/images/banner.png", // You can replace with your actual image path
      dateCreated: "05-07-25/07:22AM",
      isSelected: false,
    },
    {
      id: "2",
      image: "/public/assets/images/banner.jpg", // You can replace with your actual image path
      dateCreated: "05-07-25/07:22AM",
      isSelected: false,
    },
    {
      id: "3",
      image: "/public/assets/images/banner.jpg", // You can replace with your actual image path
      dateCreated: "05-07-25/07:22AM",
      isSelected: false,
    },
  ]);

  const handleSelectBanner = (id: string) => {
    setBannerList((prev) =>
      prev.map((banner) =>
        banner.id === id
          ? { ...banner, isSelected: !banner.isSelected }
          : banner
      )
    );
  };

  const handleSelectAll = (checked: boolean) => {
    setBannerList((prev) =>
      prev.map((banner) => ({ ...banner, isSelected: checked }))
    );
  };

  const handleEdit = (id: string) => {
    console.log("Edit banner:", id);
    // Add edit functionality here
  };

  const handleDelete = (id: string) => {
    setBannerList((prev) => prev.filter((banner) => banner.id !== id));
  };

  const handleNewBanner = (image: File | null) => {
    if (image) {
      // Create a URL for the uploaded image (in real app, you'd upload to server)
      const imageUrl = URL.createObjectURL(image);
      const newBanner: BannerItem = {
        id: (bannerList.length + 1).toString(),
        image: imageUrl,
        dateCreated: new Date()
          .toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })
          .replace(/\//g, "-")
          .replace(",", "/"),
        isSelected: false,
      };
      setBannerList((prev) => [...prev, newBanner]);
    }
  };

  const allSelected = bannerList.every((banner) => banner.isSelected);
  const someSelected = bannerList.some((banner) => banner.isSelected);

  return (
    <div className="w-full">
      {/* Banner Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="min-w-full">
          {/* Table Header */}
          <thead className="bg-[#EBEBEB]">
            <tr>
              <th className="px-6 py-4 text-center">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(input) => {
                    if (input)
                      input.indeterminate = someSelected && !allSelected;
                  }}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="w-4 h-4 text-[#273E8E] bg-gray-100 border-gray-300 rounded focus:ring-[#273E8E] focus:ring-2"
                />
              </th>
              <th className="px-6 py-4 text-center">
                <span className="text-sm font-medium text-black">
                  Banner Image
                </span>
              </th>
              <th className="px-6 py-4 text-center">
                <span className="text-sm font-medium text-black">
                  Date Created
                </span>
              </th>
              <th className="px-6 py-4 text-center">
                <span className="text-sm font-medium text-black">Action</span>
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-gray-100">
            {bannerList.map((banner) => (
              <tr key={banner.id} className="bg-[#F8F8F8] transition-colors">
                {/* Checkbox */}
                <td className="px-6 py-4 text-center">
                  <input
                    type="checkbox"
                    checked={banner.isSelected || false}
                    onChange={() => handleSelectBanner(banner.id)}
                    className="w-4 h-4 text-[#273E8E] bg-gray-100 border-gray-300 rounded focus:ring-[#273E8E] focus:ring-2"
                  />
                </td>

                {/* Banner Image */}
                <td className="px-6 py-4 text-center align-middle">
                  <div className="flex justify-center items-center w-48 h-20 rounded-lg overflow-hidden border border-gray-200 mx-auto">
                    <img
                      src={banner.image}
                      alt={`Banner ${banner.id}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/assets/images/banner.png";
                      }}
                    />
                  </div>
                </td>

                {/* Date Created */}
                <td className="px-6 py-4 text-center">
                  <span className="text-sm text-gray-600">
                    {banner.dateCreated}
                  </span>
                </td>

                {/* Actions */}
                <td className="px-6 py-4">
                  <div className="flex flex-row space-x-2 justify-center items-center">
                    <button
                      onClick={() => handleEdit(banner.id)}
                      className="bg-[#273E8E] text-white px-5 py-3 rounded-full text-sm font-medium hover:bg-[#1f2f7a] transition-colors cursor-pointer"
                    >
                      Edit Banner
                    </button>
                    <button
                      onClick={() => handleDelete(banner.id)}
                      className="bg-red-500 text-white px-10 py-3 rounded-full text-sm font-medium hover:bg-red-600 transition-colors cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Empty State */}
        {bannerList.length === 0 && (
          <div className="px-6 py-8 text-center">
            <p className="text-gray-500">No banners found.</p>
          </div>
        )}
      </div>

      {/* New Banner Modal */}
      <NewBannerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen && setIsModalOpen(false)}
        onSave={handleNewBanner}
      />
    </div>
  );
};

export default Banner;
