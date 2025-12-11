import { CircleAvatar } from './CircleAvatar';

export function StackedCircleAvatars({
  avatars,
  size = 80,
}: {
  avatars: Array<{ src?: string; alt?: string }>;
  size?: number;
}) {
  return (
    <div className='flex items-center justify-center'>
      {avatars.map((avatar, idx) => (
        <div
          key={idx}
          className='relative'
          style={{
            marginLeft: idx > 0 ? `-${size * 0.4}px` : '0',
            zIndex: avatars.length + idx,
          }}
        >
          <CircleAvatar size={size} src={avatar.src} alt={avatar.alt} className='ring-2 ring-white' />
        </div>
      ))}
    </div>
  );
}
