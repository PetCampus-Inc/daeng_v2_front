import { MOCK_OWNER_KINDERGARTEN_NEWS } from '@views/owner-kindergarten-news-page/config/ownerKindergartenNewsMock';
import { sortOwnerKindergartenNews } from '@views/owner-kindergarten-news-page/lib/sortOwnerKindergartenNews';

type Listener = () => void;

let sourceItems = sortOwnerKindergartenNews(MOCK_OWNER_KINDERGARTEN_NEWS);
const listeners = new Set<Listener>();

function emit() {
  listeners.forEach((listener) => listener());
}

function getOwnerKindergartenNewsSource() {
  return sourceItems;
}

function getOwnerKindergartenNewsById(newsId: string) {
  return sourceItems.find((item) => item.id === newsId) ?? null;
}

function deleteOwnerKindergartenNewsItem(newsId: string) {
  sourceItems = sourceItems.filter((item) => item.id !== newsId);
  emit();
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
  deleteOwnerKindergartenNewsItem,
  subscribeOwnerKindergartenNews,
};
