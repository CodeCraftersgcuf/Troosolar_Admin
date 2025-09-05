import { useState, useEffect } from 'react';
import images from '../../constants/images';

interface NewNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (subject: string, message: string) => void;
  subject?: string;
  message?: string;
  modalTitle?: string;
}

const NewNotificationModal = ({
  isOpen,
  onClose,
  onSave,
  subject: initialSubject = '',
  message: initialMessage = '',
  modalTitle = "New Notification"
}: NewNotificationModalProps) => {
  const [subject, setSubject] = useState(initialSubject);
  const [message, setMessage] = useState(initialMessage);

  useEffect(() => {
    setSubject(initialSubject);
  }, [initialSubject, isOpen]);

  useEffect(() => {
    setMessage(initialMessage);
  }, [initialMessage, isOpen]);

  const handleSave = () => {
    if ((modalTitle === "Edit Notification" ? true : subject.trim()) && message.trim()) {
      onSave(subject, message);
      setSubject('');
      setMessage('');
      onClose();
    }
  };

  const handleClose = () => {
    setSubject('');
    setMessage('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-brightness-50 bg-opacity-50 flex items-start justify-end z-50">
      <div className="bg-white rounded-xl p-8 w-150 max-w-2xl mx-4 relative">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-xl cursor-pointer"
        >
          <img src={images.cross} alt="" />
        </button>

        {/* Modal Header */}
        <h2 className="text-xl font-semibold text-gray-800 mb-6">{modalTitle}</h2>

        {/* Subject Field */}
        {modalTitle !== "Edit Notification" && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Type subject"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#273E8E] focus:border-[#273E8E] outline-none text-sm"
            />
          </div>
        )}

        {/* Message Field */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Message
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type Message"
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#273E8E] focus:border-[#273E8E] outline-none text-sm resize-none"
          />
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          className="w-full bg-[#273E8E] text-white py-3 rounded-full text-sm font-medium hover:bg-[#1f2f7a] transition-colors cursor-pointer"
        >
          Save
        </button>
      </div>
    </div>
  );
};

export default NewNotificationModal;
