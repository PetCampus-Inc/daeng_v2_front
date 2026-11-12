import { formatDiaryDogSubject } from '@knockdog/ui';

import { startOfDay, isSameDay } from '@shared/lib/calendar-date';

const DIARY_PHOTO_LIMIT = 3;
const DIARY_TEXT_LIMIT = 300;
const DIARY_PROMPT_INTERVAL_MS = 3000;
const DIARY_TEXT_PLACEHOLDER =
  '공원에서 신나게 낙엽을 밟았다. 길에서 고구마 냄새를 맡고 흥분한 모습이 귀여웠다.';
const DIARY_IMPORT_BANNER_KEY = 'diary-import-banner-hidden';
const DIARY_WEEKDAY = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'] as const;

interface DiaryWritePhoto {
  id: string;
  src: string;
}

interface DiaryWriteNotice {
  date: string;
  body: string;
}

function hasBatchim(name: string) {
  const lastChar = name.at(-1);
  if (!lastChar) return false;
  const code = lastChar.charCodeAt(0);
  return code >= 0xac00 && code <= 0xd7a3 && (code - 0xac00) % 28 !== 0;
}

function formatDiaryObject(dogName: string) {
  if (!dogName) return dogName;
  return `${dogName}${hasBatchim(dogName) ? '을' : '를'}`;
}

function formatDiaryTopic(dogName: string) {
  if (!dogName) return dogName;
  return `${dogName}${hasBatchim(dogName) ? '은' : '는'}`;
}

function buildDiaryPrompts(dogName: string) {
  const subject = formatDiaryDogSubject(dogName);
  const objectName = formatDiaryObject(dogName);
  const topic = formatDiaryTopic(dogName);

  return [
    `${subject} 오늘 가장 기뻐했던 순간은 무엇인가요?`,
    `${subject} 오늘 가장 맛있게 먹은 것은 뭔가요?`,
    `${topic} 오늘 산책에서 무엇을 가장 좋아했나요?`,
    `오늘 ${objectName} 보며 무슨 생각을 했나요?`,
  ];
}

interface DiaryImportVisibility {
  hasNotice: boolean;
  isNoticeReady: boolean;
  isImported: boolean;
  isImportDismissed: boolean;
}

function hasMockArrivedNotice(date: Date, today = new Date()) {
  return isSameDay(startOfDay(date), startOfDay(today));
}

function isDiaryImportVisible({ hasNotice, isNoticeReady, isImported, isImportDismissed }: DiaryImportVisibility) {
  return isNoticeReady && hasNotice && !isImported && !isImportDismissed;
}

function canSubmitDiary(photoCount: number, text: string, isTextRequired: boolean) {
  if (photoCount <= 0) return false;
  if (!isTextRequired) return true;
  return text.trim().length > 0;
}

function parseDiaryDate(value: string | null) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [yearText, monthText, dayText] = value.split('-');
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
  return startOfDay(date);
}

function formatDiaryNoticeDate(date: Date) {
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 ${DIARY_WEEKDAY[date.getDay()]}`;
}

function hasDismissedDiaryImport() {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(DIARY_IMPORT_BANNER_KEY) === 'dismissed';
}

function dismissDiaryImport() {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(DIARY_IMPORT_BANNER_KEY, 'dismissed');
}

export {
  DIARY_IMPORT_BANNER_KEY,
  DIARY_PHOTO_LIMIT,
  DIARY_PROMPT_INTERVAL_MS,
  DIARY_TEXT_LIMIT,
  DIARY_TEXT_PLACEHOLDER,
  buildDiaryPrompts,
  canSubmitDiary,
  isDiaryImportVisible,
  dismissDiaryImport,
  formatDiaryNoticeDate,
  formatDiaryObject,
  formatDiaryTopic,
  hasDismissedDiaryImport,
  hasMockArrivedNotice,
  parseDiaryDate,
};
export type { DiaryWriteNotice, DiaryWritePhoto };
