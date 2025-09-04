import { useState } from "react";
import { notifications, notificationTypes } from "./notifications";
import type { NotificationItem } from "./notifications";
import Banner from "./Banner";
import NewNotificationModal from "./NewNotificationModal";

const Notifications = () => {
  const [activeType, setActiveType] = useState("notification");
  const [notificationList, setNotificationList] =
    useState<NotificationItem[]>(notifications);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);

  const handleSelectNotification = (id: string) => {
    setNotificationList((prev) =>
      prev.map((notification) =>
        notification.id === id
          ? { ...notification, isSelected: !notification.isSelected }
          : notification
      )
    );
  };

  const handleSelectAll = (checked: boolean) => {
    setNotificationList((prev) =>
      prev.map((notification) => ({ ...notification, isSelected: checked }))
    );
  };

  const handleEdit = (id: string) => {
    console.log("Edit notification:", id);
    // Add edit functionality here
  };

  const handleDelete = (id: string) => {
    setNotificationList((prev) =>
      prev.filter((notification) => notification.id !== id)
    );
  };

  const handleNewNotification = (subject: string, message: string) => {
    const newNotification: NotificationItem = {
      id: (notificationList.length + 1).toString(),
      message: `${subject} - ${message}`,
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
    setNotificationList((prev) => [...prev, newNotification]);
  };

  const allSelected = notificationList.every(
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
              className={`px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer ${
                activeType === type.id
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
        /* Notifications Table */
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
                  className={`${
                    index % 2 === 0 ? "bg-[#F8F8F8]" : "bg-white"
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

          {/* Empty State */}
          {notificationList.length === 0 && (
            <div className="px-6 py-8 text-center">
              <p className="text-gray-500">No notifications found.</p>
            </div>
          )}
        </div>
      ) : (
        /* Banner Component */
        <Banner
          isModalOpen={isBannerModalOpen}
          setIsModalOpen={setIsBannerModalOpen}
        />
      )}

      {/* New Notification Modal */}
      <NewNotificationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleNewNotification}
      />
    </div>
  );
};

export default Notifications;
