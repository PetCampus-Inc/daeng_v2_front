const notificationInboxContent = {
  pageTitle: '알림함',
  markAllReadLabel: '모두읽음',
  listFooterCaption: '알림은 14일 이후 순차적으로 지워져요',
  empty: {
    imageSrc: '/images/image_notification_none.webp',
    imageAlt: '도착한 알림 없음',
    title: '도착한 알림이 없어요',
    description: '새로운 소식이 도착하면 여기에서 확인할 수 있어요',
  },
} as const;

export { notificationInboxContent };
