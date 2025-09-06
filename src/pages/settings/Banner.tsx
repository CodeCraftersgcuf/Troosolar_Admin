import { useState, useEffect } from "react";
import NewBannerModal from "./NewBannerModal";

// Integration
import { useQuery, useMutation } from "@tanstack/react-query";
import { getAllBanners } from "../../utils/queries/banner";
import { addBanner, deleteBanner, updateBanner } from "../../utils/mutations/banner";
import Cookies from "js-cookie";

const IMAGE_BASE_URL = "http://localhost:8000/storage/";

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
  const [bannerList, setBannerList] = useState<BannerItem[]>([]);
  const [editBanner, setEditBanner] = useState<BannerItem | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [bannerToDelete, setBannerToDelete] = useState<BannerItem | null>(null);

  const token = Cookies.get("token");

  // Fetch banners from API
  const { data: apiData, isLoading, isError, refetch } = useQuery({
    queryKey: ["all-banners"],
    queryFn: () => getAllBanners(token || ""),
    enabled: !!token,
  });
  console.log("getAllBanners response:", apiData);

  // Map API response to bannerList
  useEffect(() => {
    if (apiData?.data) {
      setBannerList(
        apiData.data.map((b: any) => ({
          id: String(b.id),
          image: b.image ? IMAGE_BASE_URL + b.image : "/assets/images/banner.png",
          dateCreated: b.created_at
            ? new Date(b.created_at).toLocaleString("en-GB", {
                day: "2-digit",
                month: "2-digit",
                year: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              }).replace(/\//g, "-").replace(",", "/")
            : "",
          isSelected: false,
        }))
      );
    }
  }, [apiData?.data]);

  // Add banner mutation
  const addMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await addBanner(formData, token || "");
      console.log("addBanner response:", res);
      return res;
    },
    onSuccess: () => {
      refetch();
      setIsModalOpen && setIsModalOpen(false);
    },
    onError: (err) => {
      console.log("addBanner error:", err);
      alert("Failed to add banner.");
    },
  });

  // Delete banner mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await deleteBanner(id, token || "");
      console.log("deleteBanner response:", res);
      return res;
    },
    onSuccess: () => {
      refetch();
      setShowDeleteModal(false);
      setBannerToDelete(null);
    },
    onError: (err) => {
      console.log("deleteBanner error:", err);
      alert("Failed to delete banner.");
    },
  });

  // Update banner mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, formData }: { id: string; formData: FormData }) => {
      const res = await updateBanner(id, formData, token || "");
      console.log("updateBanner response:", res);
      return res;
    },
    onSuccess: () => {
      refetch();
      setEditBanner(null);
      setIsModalOpen && setIsModalOpen(false);
    },
    onError: (err) => {
      console.log("updateBanner error:", err);
      alert("Failed to update banner.");
    },
  });

  // Select/deselect banner
  const handleSelectBanner = (id: string) => {
    setBannerList((prev) =>
      prev.map((banner) =>
        banner.id === id
          ? { ...banner, isSelected: !banner.isSelected }
          : banner
      )
    );
  };

  // Select/deselect all
  const handleSelectAll = (checked: boolean) => {
    setBannerList((prev) =>
      prev.map((banner) => ({ ...banner, isSelected: checked }))
    );
  };

  // Edit banner: open modal with data
  const handleEdit = (id: string) => {
    const banner = bannerList.find((b) => b.id === id);
    if (banner) {
      setEditBanner(banner);
      setIsModalOpen && setIsModalOpen(true);
    }
  };

  // Save new or updated banner (calls mutation)
  const handleNewBanner = (image: File | null, link: string) => {
    if (editBanner) {
      if (image) {
        const formData = new FormData();
        formData.append("image", image);
        // updateBanner mutation
        updateMutation.mutate({ id: editBanner.id, formData });
      }
    } else {
      if (image) {
        const formData = new FormData();
        formData.append("image", image);
        // addBanner mutation
        addMutation.mutate(formData);
      }
    }
  };

  // Delete banner (calls mutation)
  const confirmDelete = () => {
    if (bannerToDelete) {
      // deleteBanner mutation
      deleteMutation.mutate(bannerToDelete.id);
    }
  };

  const allSelected = bannerList.length > 0 && bannerList.every((banner) => banner.isSelected);
  const someSelected = bannerList.some((banner) => banner.isSelected);

  return (
    <div className="w-full">
      {/* Banner Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="px-6 py-8 text-center text-gray-500">Loading banners...</div>
        ) : isError ? (
          <div className="px-6 py-8 text-center text-red-500">Failed to load banners.</div>
        ) : (
          <table className="min-w-full">
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
            <tbody className="divide-y divide-gray-100">
              {bannerList.map((banner) => (
                <tr key={banner.id} className="bg-[#F8F8F8] transition-colors">
                  <td className="px-6 py-4 text-center">
                    <input
                      type="checkbox"
                      checked={banner.isSelected || false}
                      onChange={() => handleSelectBanner(banner.id)}
                      className="w-4 h-4 text-[#273E8E] bg-gray-100 border-gray-300 rounded focus:ring-[#273E8E] focus:ring-2"
                    />
                  </td>
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
                  <td className="px-6 py-4 text-center">
                    <span className="text-sm text-gray-600">
                      {banner.dateCreated}
                    </span>
                  </td>
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
        )}
        {!isLoading && !isError && bannerList.length === 0 && (
          <div className="px-6 py-8 text-center">
            <p className="text-gray-500">No banners found.</p>
          </div>
        )}
      </div>

      {/* New/Edit Banner Modal */}
      <NewBannerModal
        isOpen={isModalOpen || !!editBanner}
        onClose={() => {
          setIsModalOpen && setIsModalOpen(false);
          setEditBanner(null);
        }}
        onSave={handleNewBanner}
        {...(editBanner
          ? {
              image: editBanner.image,
              modalTitle: "Edit Banner",
            }
          : { modalTitle: "New Banner" })}
      />

      {/* Confirm Delete Modal */}
      {/* You can reuse ConfirmDeleteModal from notifications if you want */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-xl p-8 max-w-sm w-full shadow-lg relative">
            <button
              onClick={cancelDelete}
              className="absolute top-4 right-4 text-xl cursor-pointer"
            >
              <img src="/assets/images/cross.png" alt="" />
            </button>
            <h2 className="text-lg font-semibold mb-4 text-gray-900">Confirm Delete</h2>
            <p className="mb-8 text-gray-700">Are you sure you want to delete this banner?</p>
            <div className="flex justify-end gap-4">
              <button
                onClick={cancelDelete}
                className="px-6 py-2 rounded-full bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 transition-colors"
              >
                No
              </button>
              <button
                onClick={confirmDelete}
                className="px-6 py-2 rounded-full bg-[#FF0000] text-white font-medium hover:bg-red-600 transition-colors"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Banner;
