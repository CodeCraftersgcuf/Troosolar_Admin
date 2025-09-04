export interface NotificationItem {
  id: string;
  message: string;
  dateCreated: string;
  isSelected?: boolean;
}

export const notificationTypes = [
  { id: 'notification', label: 'Notification' },
  { id: 'banner', label: 'Banner' }
];

export const notifications: NotificationItem[] = [
  {
    id: '1',
    message: 'We are the best solar company in Nigeria.....',
    dateCreated: '05-07-25/07:22AM',
    isSelected: false
  },
  {
    id: '2',
    message: 'We are the best solar company in Nigeria.....',
    dateCreated: '05-07-25/07:22AM',
    isSelected: false
  },
  {
    id: '3',
    message: 'We are the best solar company in Nigeria.....',
    dateCreated: '05-07-25/07:22AM',
    isSelected: false
  }
];
