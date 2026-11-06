import type { Metadata } from 'next';

import { OwnerAlbumPage } from '@views/owner-album-page';

export const metadata: Metadata = {
  title: '앨범',
  description: '유치원 원생에게 공유할 사진을 올리고 관리하는 앨범이에요.',
};

export default function Page() {
  return <OwnerAlbumPage />;
}
