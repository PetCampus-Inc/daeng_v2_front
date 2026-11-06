import { MOCK_OWNER_KINDERGARTEN_NEWS } from '@views/owner-kindergarten-news-page/config/ownerKindergartenNewsMock';
import { sortOwnerKindergartenNews } from '@views/owner-kindergarten-news-page/lib/sortOwnerKindergartenNews';
import type { OwnerKindergartenNewsItem } from '@views/owner-kindergarten-news-page/model/ownerKindergartenNews';

type Listener = () => void;

let sourceItems = sortOwnerKindergartenNews(MOCK_OWNER_KINDERGARTEN_NEWS);
const listeners = new Set<Listener>();

function emit() {
  listeners.forEach((listener) => listener());
}

function getOwnerKindergartenNewsSource() {
  return sourceItems;
}

function getOwnerKindergartenNewsCount() {
  return sourceItems.length;
}

function getOwnerKindergartenNewsById(newsId: string) {
  return sourceItems.find((item) => item.id === newsId) ?? null;
}

function getActiveAnnouncementNews() {
  return sourceItems.find((item) => item.isAnnouncement) ?? null;
}

function deleteOwnerKindergartenNewsItem(newsId: string) {
  sourceItems = sourceItems.filter((item) => item.id !== newsId);
  emit();
}

function createOwnerKindergartenNewsItem(
  input: Omit<OwnerKindergartenNewsItem, 'id' | 'publishedAt' | 'readCount' | 'readers'> & {
    id?: string;
    publishedAt?: string;
    readCount?: number;
    readers?: OwnerKindergartenNewsItem['readers'];
  }
) {
  const nextSource = input.isAnnouncement
    ? sourceItems.map((item) => (item.isAnnouncement ? { ...item, isAnnouncement: false } : item))
    : sourceItems;

  const item: OwnerKindergartenNewsItem = {
    id: input.id ?? `news-${Date.now()}`,
    isAnnouncement: input.isAnnouncement,
    publishedAt: input.publishedAt ?? new Date().toISOString(),
    readCount: input.readCount ?? 0,
    guardianTotalCount: input.guardianTotalCount,
    title: input.title,
    body: input.body,
    thumbnailUrl: input.thumbnailUrl,
    imageUrls: input.imageUrls,
    readers: input.readers ?? [],
  };

  sourceItems = sortOwnerKindergartenNews([item, ...nextSource]);
  emit();
  return item;
}

function updateOwnerKindergartenNewsItem(
  newsId: string,
  input: Pick<
    OwnerKindergartenNewsItem,
    'isAnnouncement' | 'title' | 'body' | 'thumbnailUrl' | 'imageUrls'
  >
) {
  const current = sourceItems.find((item) => item.id === newsId);
  if (!current) return null;

  let nextSource = sourceItems.map((item) =>
    item.id === newsId
      ? {
          ...item,
          isAnnouncement: input.isAnnouncement,
          title: input.title,
          body: input.body,
          thumbnailUrl: input.thumbnailUrl,
          imageUrls: input.imageUrls,
        }
      : item
  );

  if (input.isAnnouncement) {
    nextSource = nextSource.map((item) =>
      item.id !== newsId && item.isAnnouncement ? { ...item, isAnnouncement: false } : item
    );
  }

  sourceItems = sortOwnerKindergartenNews(nextSource);
  emit();
  return getOwnerKindergartenNewsById(newsId);
}

function subscribeOwnerKindergartenNews(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export {
  getOwnerKindergartenNewsById,
  getOwnerKindergartenNewsSource,
  getOwnerKindergartenNewsCount,
  getActiveAnnouncementNews,
  deleteOwnerKindergartenNewsItem,
  createOwnerKindergartenNewsItem,
  updateOwnerKindergartenNewsItem,
  subscribeOwnerKindergartenNews,
};
