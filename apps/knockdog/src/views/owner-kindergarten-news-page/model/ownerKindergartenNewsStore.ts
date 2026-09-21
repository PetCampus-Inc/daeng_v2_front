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

  sourceItems = sortOwnerKindergartenNews([item, ...sourceItems]);
  emit();
  return item;
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
  deleteOwnerKindergartenNewsItem,
  createOwnerKindergartenNewsItem,
  subscribeOwnerKindergartenNews,
};
