import type { OptionItem } from '@shared/ui/option-select-sheet';

type AdmissionTimeField = 'weekdayStart' | 'weekdayEnd' | 'weekendStart' | 'weekendEnd';

const TIME_PLACEHOLDER = {
  start: '09:00',
  end: '12:00',
} as const;

/** 00:00~24:00, 30분 단위. 24:00은 마감 시간용 */
function createTimeOptions(stepMinutes = 30): OptionItem[] {
  const options: OptionItem[] = [];
  const end = 24 * 60;

  for (let minutes = 0; minutes <= end; minutes += stepMinutes) {
    const hours = String(Math.floor(minutes / 60)).padStart(2, '0');
    const mins = String(minutes % 60).padStart(2, '0');
    const label = `${hours}:${mins}`;
    options.push({ value: label, label });
  }

  return options;
}

const TIME_OPTIONS = createTimeOptions();

const TIME_SHEET_TITLE: Record<AdmissionTimeField, string> = {
  weekdayStart: '등원 시작 시간 · 평일',
  weekdayEnd: '등원 마감 시간 · 평일',
  weekendStart: '등원 시작 시간 · 주말',
  weekendEnd: '등원 마감 시간 · 주말',
};

export { TIME_OPTIONS, TIME_PLACEHOLDER, TIME_SHEET_TITLE };
export type { AdmissionTimeField };
