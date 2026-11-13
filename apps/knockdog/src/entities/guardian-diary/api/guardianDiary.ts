import { parseDiaryDateStatus, parseDiaryGeneration, parseDiaryPhotoUploads } from '../model/guardianDiary';

import { api } from '@shared/api';

interface DiaryPhotoUploadFile {
  filename: string;
  contentType: string;
  size?: number;
}

interface PostDiaryGenerationParams {
  petId: string;
  date: string;
  idempotencyKey: string;
  photoKeys: string[];
  text?: string;
  attendanceRecordId?: string | null;
}

/** `GET` - 선택 날짜의 일기, 알림장, 남은 생성 횟수 */
function getGuardianDiaryDate(petId: string, date: string) {
  return api
    .get(`guardian/pets/${encodeURIComponent(petId)}/diaries/${encodeURIComponent(date)}`)
    .json()
    .then(parseDiaryDateStatus);
}

/** `POST` - 일기 사진 업로드 URL. 응답 순서대로 PUT한다 */
function postDiaryPhotoUploadUrls(files: DiaryPhotoUploadFile[]) {
  return api
    .post('guardian/diaries/photo-upload-urls', { json: { files } })
    .json()
    .then(parseDiaryPhotoUploads);
}

/** `POST` - AI 일기 생성. 같은 Idempotency-Key 재시도는 최초 응답을 다시 받는다 */
function postDiaryGeneration({ petId, date, idempotencyKey, photoKeys, text, attendanceRecordId }: PostDiaryGenerationParams) {
  return api
    .post(`guardian/pets/${encodeURIComponent(petId)}/diaries/${encodeURIComponent(date)}/generations`, {
      json: {
        photoKeys,
        ...(text ? { text } : {}),
        ...(attendanceRecordId ? { attendanceRecordId: Number(attendanceRecordId) } : {}),
      },
      headers: { 'Idempotency-Key': idempotencyKey },
    })
    .json()
    .then(parseDiaryGeneration);
}

export { getGuardianDiaryDate, postDiaryGeneration, postDiaryPhotoUploadUrls };
export type { DiaryPhotoUploadFile, PostDiaryGenerationParams };
