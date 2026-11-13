const DIARY_RECORD_KEY = 'diary-records';
const DIARY_HOME_RETURN_KEY = 'diary-home-return';
const DIARY_RECORD_EVENT = 'diary-records-change';

interface DiaryRecord {
  dateKey: string;
  petId: string | null;
  dogName: string;
  body: string;
  photos: string[];
}

function readStorage(key: string) {
  if (typeof window === 'undefined') return null;
  try {
    return window.sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function isDiaryRecord(record: Partial<DiaryRecord>): record is DiaryRecord {
  return Boolean(record.dateKey && record.dogName && record.body && Array.isArray(record.photos));
}

function readDiaryRecords(): DiaryRecord[] {
  const raw = readStorage(DIARY_RECORD_KEY);
  if (!raw) return [];

  try {
    const records = JSON.parse(raw) as Partial<DiaryRecord>[];
    if (!Array.isArray(records)) return [];
    return records.filter(isDiaryRecord);
  } catch {
    return [];
  }
}

function writeDiaryRecords(records: DiaryRecord[]) {
  if (typeof window === 'undefined') return;
  window.sessionStorage.setItem(DIARY_RECORD_KEY, JSON.stringify(records));
  window.dispatchEvent(new Event(DIARY_RECORD_EVENT));
}

function isVisibleDiary(record: DiaryRecord, petId?: string | null) {
  if (!petId || !record.petId) return true;
  return String(record.petId) === String(petId);
}

function isSameDiary(record: DiaryRecord, dateKey: string, petId: string | null) {
  return record.dateKey === dateKey && (record.petId ?? null) === petId;
}

function saveDiaryRecord(record: DiaryRecord) {
  const records = readDiaryRecords().filter((item) => !isSameDiary(item, record.dateKey, record.petId));
  writeDiaryRecords([{ ...record, petId: record.petId ?? null }, ...records]);
}

function readDiaryRecord(dateKey: string, petId?: string | null) {
  const records = readDiaryRecords().filter((record) => record.dateKey === dateKey);
  if (petId) {
    const matched = records.find((record) => record.petId === petId);
    if (matched) return matched;
  }
  if (!petId || records.length === 1) return records[0] ?? null;
  return null;
}

function removeDiaryRecord(dateKey: string, petId?: string | null) {
  const matched = readDiaryRecord(dateKey, petId);
  if (!matched) return;
  writeDiaryRecords(readDiaryRecords().filter((record) => !isSameDiary(record, matched.dateKey, matched.petId)));
}

function saveDiaryHomeReturn(dateKey: string) {
  if (typeof window === 'undefined') return;
  window.sessionStorage.setItem(DIARY_HOME_RETURN_KEY, dateKey);
  window.dispatchEvent(new Event(DIARY_RECORD_EVENT));
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
  isVisibleDiary,
  readDiaryRecord,
  readDiaryRecords,
  removeDiaryRecord,
  saveDiaryHomeReturn,
  saveDiaryRecord,
  takeDiaryHomeDate,
  diaryPreviewTitle,
};
export type { DiaryRecord };
