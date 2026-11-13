import { formatDiaryDogSubject } from '@knockdog/ui';

const DIARY_GENERATE_DELAY_MS = 1600;
const DIARY_WORD_INTERVAL_MS = 80;
const DIARY_LOADING_TEXT = '오늘 밟았던 풀밭 냄새를 떠올리는 중...';
const DIARY_GENERATING_TOAST = '일기를 만드는 중이에요. 잠시 후 다시 시도해주세요';
const DIARY_ERROR_TEXT = '일시적 오류로 일기를 생성하지 못했어요. 잠시 후 다시 시도해 주세요.';
const DIARY_WEEKDAY = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'] as const;
const MOCK_DIARY_BODY =
  '오늘은 누나가 아침 일찍 유치원에 데려다줬어! 운동장에서 보더콜리 친구랑 공놀이를 했는데, 내가 공을 세 번이나 먼저 잡았지. 점심은 하나도 안 남기고 다 먹었어. 낮잠 시간엔 너무 졸려서 금방 잠들었어.\n\n집에 와서는 누나랑 공원에 가서 낙엽을 밟았는데, 바스락 소리가 너무 재밌었어. 내일도 이렇게 신나는 하루였으면 좋겠다!';

type DiaryGenerateStatus = 'generating' | 'error' | 'done';
type DiaryGenerateDialog = 'leave' | 'save';

interface DiaryDialogCopy {
  title: string;
  lines: readonly [string, string];
  confirmLabel: string;
}

const DIARY_DIALOG_COPY: Record<DiaryGenerateDialog, DiaryDialogCopy> = {
  leave: {
    title: '저장하지 않고 나갈까요?',
    lines: ['AI 일기는 하루에 세 번만 만들 수 있어요.', '지금 나가면 남은 횟수는 1회 줄어요.'],
    confirmLabel: '나가기',
  },
  save: {
    title: '이대로 저장할까요?',
    lines: ['AI 일기는 하루에 세 번만 만들 수 있어요.', '내용은 나중에 직접 수정할 수 있어요.'],
    confirmLabel: '저장하기',
  },
};

function formatDiaryDateLabel(date: Date) {
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 ${DIARY_WEEKDAY[date.getDay()]}`;
}

function getGenerateButtonLabel(dogName: string, isExitOpen: boolean) {
  const subject = formatDiaryDogSubject(dogName);
  return isExitOpen ? `${subject} 아직 일기를 쓰고 있어요` : `${subject} 열심히 일기를 쓰고 있어요`;
}

function getDiaryDialogCopy(dialog: DiaryGenerateDialog) {
  return DIARY_DIALOG_COPY[dialog];
}

function getDiarySaveToast(dogName: string) {
  const suffix = '의 일기를 저장했어요';
  return { name: dogName, suffix, nativeTitle: `${dogName}${suffix}` };
}

function revealDiaryText(body: string, wordCount: number) {
  if (wordCount <= 0) return '';

  const parts = body.split(/(\s+)/);
  let words = 0;
  let result = '';

  for (const part of parts) {
    if (part.trim()) {
      if (words >= wordCount) break;
      words += 1;
    }
    result += part;
  }

  return result;
}

export {
  DIARY_ERROR_TEXT,
  DIARY_GENERATE_DELAY_MS,
  DIARY_GENERATING_TOAST,
  DIARY_LOADING_TEXT,
  DIARY_WORD_INTERVAL_MS,
  MOCK_DIARY_BODY,
  formatDiaryDateLabel,
  getDiaryDialogCopy,
  getDiarySaveToast,
  getGenerateButtonLabel,
  revealDiaryText,
};
export type { DiaryDialogCopy, DiaryGenerateDialog, DiaryGenerateStatus };
