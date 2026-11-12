const DIARY_RECORD_KEY = 'diary-records';
const DIARY_HOME_RETURN_KEY = 'diary-home-return';
const DIARY_RECORD_EVENT = 'diary-records-change';

interface DiaryRecord {
  dateKey: string;
  dogName: string;
  body: string;
  photos: string[];
}

function readStorage(key: string) {
  if (typeof window === 'undefined') return null;
  return window.sessionStorage.getItem(key);
}

function readDiaryRecords(): DiaryRecord[] {
  const raw = readStorage(DIARY_RECORD_KEY);
  if (!raw) return [];

  try {
    const records = JSON.parse(raw) as DiaryRecord[];
    if (!Array.isArray(records)) return [];
    return records.filter((record) => record.dateKey && record.body && Array.isArray(record.photos));
  } catch {
    return [];
  }
}

function writeDiaryRecords(records: DiaryRecord[]) {
  if (typeof window === 'undefined') return;
  window.sessionStorage.setItem(DIARY_RECORD_KEY, JSON.stringify(records));
  window.dispatchEvent(new Event(DIARY_RECORD_EVENT));
}

function saveDiaryRecord(record: DiaryRecord) {
  const records = readDiaryRecords().filter((item) => item.dateKey !== record.dateKey);
  writeDiaryRecords([record, ...records]);
}

function readDiaryRecord(dateKey: string) {
  return readDiaryRecords().find((record) => record.dateKey === dateKey) ?? null;
}

function removeDiaryRecord(dateKey: string) {
  writeDiaryRecords(readDiaryRecords().filter((record) => record.dateKey !== dateKey));
}

function saveDiaryHomeReturn(dateKey: string) {
  if (typeof window === 'undefined') return;
  window.sessionStorage.setItem(DIARY_HOME_RETURN_KEY, dateKey);
}

function peekDiaryHomeReturn() {
  return readStorage(DIARY_HOME_RETURN_KEY);
}

function takeDiaryHomeDate() {
  const dateKey = peekDiaryHomeReturn();
  if (dateKey && typeof window !== 'undefined') window.sessionStorage.removeItem(DIARY_HOME_RETURN_KEY);
  return dateKey;
}

function diaryPreviewTitle(body: string) {
  const sentence = body.split(/[!?\n]/)[0]?.trim();
  return sentence || '일기';
}

export {
  DIARY_RECORD_EVENT,
  peekDiaryHomeReturn,
  readDiaryRecord,
  readDiaryRecords,
  removeDiaryRecord,
  saveDiaryHomeReturn,
  saveDiaryRecord,
  takeDiaryHomeDate,
  diaryPreviewTitle,
};
export type { DiaryRecord };
