'use client';

import { useOpenExternalLink } from '@shared/lib/bridge';
import {
  isValidExternalLinkUrl,
  toExternalLinkHref,
} from '@features/kindergarten-basic/lib/externalLinkUrl';

interface ExternalLinksCardProps {
  homepageUrl?: string | null;
  instagramUrl?: string | null;
  blogUrl?: string | null;
}

interface ChannelConfig {
  id: 'homepage' | 'instagram' | 'blog';
  label: string;
  url: string;
}

const CHANNEL_ICON_SRC = {
  homepage: '/images/ico_homepage_link.png',
  instagram: '/images/ico_instagram.png',
  blog: '/images/ico_naver_blog.png',
} as const;

function ChannelIcon({ id }: { id: ChannelConfig['id'] }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- 정적 브랜드/링크 아이콘
    <img
      src={CHANNEL_ICON_SRC[id]}
      alt=''
      width={16}
      height={16}
      className='size-4 shrink-0 object-contain'
      draggable={false}
    />
  );
}

function ExternalLinksCard({ homepageUrl, instagramUrl, blogUrl }: ExternalLinksCardProps) {
  const openExternalLink = useOpenExternalLink();

  const channelCandidates: ChannelConfig[] = [
    { id: 'homepage', label: '홈페이지', url: homepageUrl ?? '' },
    { id: 'instagram', label: '인스타그램', url: instagramUrl ?? '' },
    { id: 'blog', label: '블로그', url: blogUrl ?? '' },
  ];
  const channels = channelCandidates.filter((channel) => isValidExternalLinkUrl(channel.url));

  if (channels.length === 0) return null;

  return (
    <div>
      <div className='mb-3'>
        <span className='body1-bold'>웹사이트 · SNS</span>
      </div>
      <div className='flex flex-wrap gap-2'>
        {channels.map((channel) => {
          const href = toExternalLinkHref(channel.url);
          if (!href) return null;

          return (
            <button
              key={channel.id}
              type='button'
              onClick={() => openExternalLink(href)}
              className='border-line-200 bg-bg-0 radius-full body2-semibold text-text-primary inline-flex items-center gap-1 border px-3 py-2'
            >
              <ChannelIcon id={channel.id} />
              {channel.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export { ExternalLinksCard };
