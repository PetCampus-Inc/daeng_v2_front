import { z } from 'zod';

const diarySummarySchema = z
  .object({
    diaryId: z.number(),
    title: z.string(),
    body: z.string(),
    thumbnailUrl: z.string(),
    photoCount: z.number(),
  })
  .nullable();

const attendanceSchema = z
  .object({
    attendanceRecordId: z.number(),
    note: z.string(),
  })
  .nullable();

const diaryDateSchema = z.object({
  date: z.string(),
  diary: diarySummarySchema.nullish(),
  canWrite: z.boolean(),
  blockedReason: z.string().nullable().nullish(),
  remainingGenerations: z.number(),
  nextAvailableAt: z.string().nullable().nullish(),
  attendance: attendanceSchema.nullish(),
  onboardingShown: z.boolean(),
});

const diaryDateResponseSchema = z.object({
  status: z.number(),
  message: z.string(),
  data: diaryDateSchema,
});

const generationSchema = z.object({
  generationId: z.number(),
  body: z.string(),
});

const generationResponseSchema = z.object({
  status: z.number(),
  message: z.string(),
  data: generationSchema,
});

const photoUploadSchema = z.object({
  items: z.array(
    z.object({
      tempKey: z.string(),
      uploadUrl: z.string(),
    })
  ),
});

const photoUploadResponseSchema = z.object({
  status: z.number(),
  message: z.string(),
  data: photoUploadSchema,
});

interface DiaryDateSummary {
  id: string;
  title: string;
  body: string;
  thumbnailUrl: string;
  photoCount: number;
}

interface DiaryDateAttendance {
  id: string;
  note: string;
}

interface DiaryDateStatus {
  date: string;
  diary: DiaryDateSummary | null;
  canWrite: boolean;
  blockedReason: string | null;
  remainingGenerations: number;
  nextAvailableAt: string | null;
  attendance: DiaryDateAttendance | null;
  onboardingShown: boolean;
}

interface DiaryGeneration {
  id: string;
  body: string;
}

interface DiaryPhotoUpload {
  tempKey: string;
  uploadUrl: string;
}

function toDiarySummary(dto: z.infer<typeof diarySummarySchema>): DiaryDateSummary | null {
  if (!dto) return null;
  return {
    id: String(dto.diaryId),
    title: dto.title,
    body: dto.body,
    thumbnailUrl: dto.thumbnailUrl,
    photoCount: dto.photoCount,
  };
}

function toDiaryDateStatus(dto: z.infer<typeof diaryDateSchema>): DiaryDateStatus {
  const attendance = dto.attendance;
  return {
    date: dto.date,
    diary: toDiarySummary(dto.diary),
    canWrite: dto.canWrite,
    blockedReason: dto.blockedReason ?? null,
    remainingGenerations: dto.remainingGenerations,
    nextAvailableAt: dto.nextAvailableAt ?? null,
    attendance: attendance ? { id: String(attendance.attendanceRecordId), note: attendance.note } : null,
    onboardingShown: dto.onboardingShown,
  };
}

const parseDiaryDateStatus = (response: unknown) => toDiaryDateStatus(diaryDateResponseSchema.parse(response).data);

const parseDiaryGeneration = (response: unknown): DiaryGeneration => {
  const data = generationResponseSchema.parse(response).data;
  return { id: String(data.generationId), body: data.body };
};

const parseDiaryPhotoUploads = (response: unknown): DiaryPhotoUpload[] =>
  photoUploadResponseSchema.parse(response).data.items;

export { parseDiaryDateStatus, parseDiaryGeneration, parseDiaryPhotoUploads };
export type { DiaryDateAttendance, DiaryDateStatus, DiaryDateSummary, DiaryGeneration, DiaryPhotoUpload };
