'use client';

import Image from 'next/image';

import { ownerHomeContent } from '@views/owner-home-page/config/ownerHomeContent';

interface OwnerHomeQuickMenuProps {
  pendingConnectionCount: number;
  onConnectionClick: () => void;
  onAlbumClick: () => void;
  onNewsClick: () => void;
  onInviteClick: () => void;
}

function OwnerHomeQuickMenu({
  pendingConnectionCount,
  onConnectionClick,
  onAlbumClick,
  onNewsClick,
  onInviteClick,
}: OwnerHomeQuickMenuProps) {
  const { quickMenu } = ownerHomeContent;
  const badgeLabel =
    pendingConnectionCount > 99 ? '99+' : pendingConnectionCount > 0 ? String(pendingConnectionCount) : null;

  const items = [
    {
      key: 'connection',
      label: quickMenu.connection.label,
      ariaLabel: quickMenu.connection.ariaLabel,
      iconSrc: quickMenu.connection.iconSrc,
      onClick: onConnectionClick,
      badge: badgeLabel,
    },
    {
      key: 'album',
      label: quickMenu.album.label,
      ariaLabel: quickMenu.album.ariaLabel,
      iconSrc: quickMenu.album.iconSrc,
      onClick: onAlbumClick,
    },
    {
      key: 'news',
      label: quickMenu.news.label,
      ariaLabel: quickMenu.news.ariaLabel,
      iconSrc: quickMenu.news.iconSrc,
      onClick: onNewsClick,
    },
    {
      key: 'invite',
      label: quickMenu.invite.label,
      ariaLabel: quickMenu.invite.ariaLabel,
      iconSrc: quickMenu.invite.iconSrc,
      onClick: onInviteClick,
    },
  ] as const;

  return (
    <div className='flex w-full items-center justify-between'>
      {items.map((item) => (
        <button
          key={item.key}
          type='button'
          aria-label={item.ariaLabel}
          className='flex w-20 flex-col items-center justify-center gap-2'
          onClick={item.onClick}
        >
          <span className='radius-r2 bg-bg-0 relative flex aspect-square w-full items-center justify-center overflow-hidden p-1 shadow-[0px_6px_12px_0px_rgba(0,0,0,0.02)]'>
            <span className='relative size-[60px] shrink-0'>
              <Image src={item.iconSrc} alt='' fill className='object-contain' sizes='60px' />
            </span>
            {'badge' in item && item.badge ? (
              <span className='bg-fill-secondary-600 absolute top-1 right-1 flex min-w-5 flex-col items-end justify-center rounded-xl px-1 py-0.5'>
                <span className='caption2-extrabold w-full text-center text-white'>{item.badge}</span>
              </span>
            ) : null}
          </span>
          <span className='label-semibold text-text-secondary'>{item.label}</span>
        </button>
      ))}
    </div>
  );
}

export { OwnerHomeQuickMenu };
export type { OwnerHomeQuickMenuProps };
