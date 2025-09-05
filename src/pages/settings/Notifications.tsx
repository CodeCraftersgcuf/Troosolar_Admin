import { useState, useEffect } from "react";
import { notificationTypes } from "./notifications";
import type { NotificationItem } from "./notifications";
import Banner from "./Banner";
import NewNotificationModal from "./NewNotificationModal";
import ConfirmDeleteModal from "./ConfirmDeleteModal";

// Integration
import { useQuery, useMutation } from "@tanstack/react-query";
import { getAllNotification } from "../../utils/queries/notification";
import Cookies from "js-cookie";
import { addNotification, deleteNotification, updateNotification } from "../../utils/mutations/notification";

const Notifications = () => {
  const [activeType, setActiveType] = useState("notification");
  const [notificationList, setNotificationList] = useState<NotificationItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [editNotification, setEditNotification] = useState<NotificationItem | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState<NotificationItem | null>(null);

  const token = Cookies.get("token");

  // Fetch notifications from API
  const { data: apiData, isLoading, isError, refetch } = useQuery({
    queryKey: ["all-notifications"],
    queryFn: () => getAllNotification(token || ""),
    enabled: !!token,
  });

  // Map API response to notificationList
  useEffect(() => {
    if (apiData?.data) {
      setNotificationList(
        apiData.data.map((n: any) => ({
          id: String(n.id),
          message: n.message,
          dateCreated: n.created_at
            ? new Date(n.created_at).toLocaleString("en-GB", {
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

  // Add notification mutation
  const addMutation = useMutation({
    mutationFn: async ({ subject, message }: { subject: string; message: string }) => {
      return await addNotification({ subject, message }, token || "");
    },
    onSuccess: () => {
      refetch();
      setIsModalOpen(false);
    },
    onError: () => {
      alert("Failed to add notification.");
    },
  });

  // Delete notification mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await deleteNotification(id, token || "");
    },
    onSuccess: () => {
      refetch();
    },
    onError: () => {
      alert("Failed to delete notification.");
    },
  });

  // Update notification mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, message }: { id: string; message: string }) => {
      return await updateNotification(id, { message }, token || "");
    },
    onSuccess: () => {
      refetch();
      setEditNotification(null);
      setIsModalOpen(false);
    },
    onError: () => {
      alert("Failed to update notification.");
    },
  });

  // Select/deselect notification
  const handleSelectNotification = (id: string) => {
    setNotificationList((prev) =>
      prev.map((notification) =>
        notification.id === id
          ? { ...notification, isSelected: !notification.isSelected }
          : notification
      )
    );
  };

  // Select/deselect all
  const handleSelectAll = (checked: boolean) => {
    setNotificationList((prev) =>
      prev.map((notification) => ({ ...notification, isSelected: checked }))
    );
  };

  // Edit notification: open modal with data
  const handleEdit = (id: string) => {
    const notif = notificationList.find((n) => n.id === id);
    if (notif) {
      setEditNotification(notif);
      setIsModalOpen(true);
    }
  };

  // Delete notification: open confirmation modal
  const handleDelete = (id: string) => {
    const notif = notificationList.find((n) => n.id === id);
    if (notif) {
      setNotificationToDelete(notif);
      setShowDeleteModal(true);
    }
  };

  // Confirm delete action
  const confirmDelete = () => {
    if (notificationToDelete) {
      deleteMutation.mutate(notificationToDelete.id);
      setShowDeleteModal(false);
      setNotificationToDelete(null);
    }
  };

  // Cancel delete action
  const cancelDelete = () => {
    setShowDeleteModal(false);
    setNotificationToDelete(null);
  };

  // Save new or updated notification
  const handleNewNotification = (subject: string, message: string) => {
    if (editNotification) {
      updateMutation.mutate({ id: editNotification.id, message });
    } else {
      addMutation.mutate({ subject, message });
    }
  };

  const allSelected = notificationList.length > 0 && notificationList.every(
    (notification) => notification.isSelected
  );
  const someSelected = notificationList.some(
    (notification) => notification.isSelected
  );

  return (
    <div className="w-full">
      {/* Notification Types */}
      <div className="flex items-center justify-between mb-6">
        <div className="inline-flex bg-white rounded-full p-2 border border-[#CDCDCD]">
          {notificationTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setActiveType(type.id)}
              className={`px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer ${activeType === type.id
                  ? "bg-[#273E8E] text-white shadow-xs"
                  : "text-[#000000B2] hover:text-black"
                }`}
            >
              {type.label}
            </button>
          ))}
        </div>

        {/* New Notification Button */}
        <button
          onClick={() => {
            setEditNotification(null);
            if (activeType === "notification") {
              setIsModalOpen(true);
            } else {
              setIsBannerModalOpen(true);
            }
          }}
          className="bg-[#273E8E] text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-[#1f2f7a] transition-colors cursor-pointer"
        >
          {activeType === "banner" ? "New Banner" : "New Notification"}
        </button>
      </div>

      {/* Conditional Content based on activeType */}
      {activeType === "notification" ? (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {isLoading ? (
            <div className="px-6 py-8 text-center text-gray-500">Loading notifications...</div>
          ) : isError ? (
            <div className="px-6 py-8 text-center text-red-500">Failed to load notifications.</div>
          ) : (
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
                      className="w-4 h-4 text-[#273E8E] bg-[#F8F8F8] border-gray-300 rounded focus:ring-[#273E8E] focus:ring-2"
                    />
                  </th>
                  <th className="px-6 py-4 text-center">
                    <span className="text-sm font-medium text-black">
                      Notification
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
                {notificationList.map((notification, index) => (
                  <tr
                    key={notification.id}
                    className={`${index % 2 === 0 ? "bg-[#F8F8F8]" : "bg-white"
                      } transition-colors border-b border-gray-100 last:border-b-0 px-6 py-4 `}
                  >
                    {/* Checkbox */}
                    <td className="px-6 py-4 text-center">
                      <input
                        type="checkbox"
                        checked={notification.isSelected || false}
                        onChange={() => handleSelectNotification(notification.id)}
                        className="w-4 h-4 text-[#273E8E] bg-gray-100 border-gray-300 rounded focus:ring-[#273E8E] focus:ring-2"
                      />
                    </td>
                    {/* Notification Message */}
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm text-gray-800">
                        {notification.message}
                      </span>
                    </td>
                    {/* Date Created */}
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm text-gray-600">
                        {notification.dateCreated}
                      </span>
                    </td>
                    {/* Actions */}
                    <td className="px-6 py-4 text-center">
                      <div className="flex space-x-2 justify-center items-center">
                        <button
                          onClick={() => handleEdit(notification.id)}
                          className="bg-[#273E8E] text-white px-5 py-3 rounded-full text-sm font-medium hover:bg-[#1f2f7a] transition-colors cursor-pointer"
                        >
                          Edit Notification
                        </button>
                        <button
                          onClick={() => handleDelete(notification.id)}
                          className="bg-[#FF0000] text-white px-10 py-3 rounded-full text-sm font-medium hover:bg-red-600 transition-colors cursor-pointer"
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
          {/* Empty State */}
          {!isLoading && !isError && notificationList.length === 0 && (
            <div className="px-6 py-8 text-center">
              <p className="text-gray-500">No notifications found.</p>
            </div>
          )}
        </div>
      ) : (
        <Banner
          isModalOpen={isBannerModalOpen}
          setIsModalOpen={setIsBannerModalOpen}
        />
      )}

      {/* New/Edit Notification Modal */}
      <NewNotificationModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditNotification(null);
        }}
        onSave={handleNewNotification}
        {...(editNotification
          ? {
              subject: "",
              message: editNotification.message,
              modalTitle: "Edit Notification"
            }
          : { modalTitle: "New Notification" })}
      />

      {/* Confirm Delete Modal */}
      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        message="Are you sure you want to delete this notification?"
      />
    </div>
  );
};

export default Notifications;
