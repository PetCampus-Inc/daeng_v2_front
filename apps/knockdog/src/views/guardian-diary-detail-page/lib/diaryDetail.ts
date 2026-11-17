import { diaryPreviewTitle } from '@shared/lib/diary-write/diaryRecord';

const DIARY_WEEKDAY = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'] as const;
const DIARY_WEEKDAY_SHORT = ['일', '월', '화', '수', '목', '금', '토'] as const;
const DIARY_DELETE_TITLE = '이 일기를 삭제할까요?';
const DIARY_DELETE_LINES = ['삭제한 일기는 복구할 수 없어요.', '다시 만들면 오늘 남은 횟수가 1번 줄어요.'] as const;
const DIARY_DELETE_CANCEL = '닫기';

function formatDiaryDetailDate(date: Date) {
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 ${DIARY_WEEKDAY[date.getDay()]}`;
}

function formatDiaryDeleteToast(date: Date) {
  const label = `${date.getMonth() + 1}월 ${date.getDate()}일 (${DIARY_WEEKDAY_SHORT[date.getDay()]})`;
  const suffix = ' 일기를 삭제했어요';
  return { label, suffix, nativeTitle: `${label}${suffix}` };
}

export { DIARY_DELETE_CANCEL, DIARY_DELETE_LINES, DIARY_DELETE_TITLE, diaryPreviewTitle, formatDiaryDeleteToast, formatDiaryDetailDate };
