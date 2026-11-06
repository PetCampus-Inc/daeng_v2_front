const notificationInboxContent = {
  pageTitle: '알림함',
  markAllReadLabel: '모두읽음',
  listFooterCaption: '알림은 14일 이후 순차적으로 지워져요',
  markAllReadDialog: {
    title: '모두 읽음으로 처리할까요?',
    description: '읽지 않은 알림이 모두 읽음 처리되고\n되돌릴 수 없어요.',
    cancelLabel: '닫기',
    confirmLabel: '모두 읽음',
  },
  markAllReadSuccessToast: '모든 알림을 읽음 처리했어요',
  markAllReadFailToast: '모두 읽음 처리에 실패했어요',
  /** M-05: 대상 페이지 접근 권한 없음 / 데이터 삭제 */
  pageNotFoundToast: '확인할 수 없는 알림이에요',
  empty: {
    imageSrc: '/images/image_notification_none.webp',
    imageAlt: '도착한 알림 없음',
    title: '도착한 알림이 없어요',
    description: '새로운 소식이 도착하면 여기에서 확인할 수 있어요',
  },
} as const;

export { notificationInboxContent };
