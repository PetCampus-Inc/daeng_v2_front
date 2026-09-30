interface NotificationRecipientMetaProps {
  audience?: string;
  guardianName?: string;
  petName: string;
  relativeTime: string;
}

/** 알림 수신자와 상대 시간을 한 줄로 표시한다. */
function NotificationRecipientMeta({
  audience,
  guardianName,
  petName,
  relativeTime,
}: NotificationRecipientMetaProps) {
  const isOwnerRecipient = audience === 'OWNER' && Boolean(guardianName);

  return (
    <p className='body2-regular text-text-secondary w-full truncate whitespace-nowrap'>
      {isOwnerRecipient ? (
        <>
          <span className='inline-block max-w-[40%] truncate align-bottom'>{guardianName}</span>
          <span> 보호자({petName})</span>
        </>
      ) : (
        petName
      )}{' '}
      <span aria-hidden>∙</span> {relativeTime}
    </p>
  );
}

export { NotificationRecipientMeta, type NotificationRecipientMetaProps };
