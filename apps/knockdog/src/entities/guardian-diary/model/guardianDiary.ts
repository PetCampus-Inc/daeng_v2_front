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

function padDatePart(part: number) {
  return String(part).padStart(2, '0');
}

function toDateText(value: string | number[]) {
  if (typeof value === 'string') return value;
  const [year, month, day, hour = 0, minute = 0, second = 0] = value;
  if (year == null || month == null || day == null) return '';
  const date = `${year}-${padDatePart(month)}-${padDatePart(day)}`;
  if (value.length < 4) return date;
  return `${date}T${padDatePart(hour)}:${padDatePart(minute)}:${padDatePart(second)}`;
}

const nullableDateTimeSchema = z
  .union([z.string(), z.array(z.number()), z.null()])
  .nullish()
  .transform((value) => (value == null ? null : toDateText(value) || null));

const diaryDateSchema = z.object({
  date: z.union([z.string(), z.array(z.number())]).transform(toDateText),
  diary: diarySummarySchema.nullish(),
  canWrite: z.boolean(),
  blockedReason: z.string().nullable().nullish(),
  remainingGenerations: z.number(),
  nextAvailableAt: nullableDateTimeSchema,
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
    diary: toDiarySummary(dto.diary ?? null),
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

const diaryDetailPhotoSchema = z.object({
  url: z.string(),
  order: z.number(),
});

const diaryDetailSchema = z.object({
  diaryId: z.number(),
  petId: z.number(),
  date: z.union([z.string(), z.array(z.number())]).transform(toDateText),
  title: z.string(),
  body: z.string(),
  photos: z.array(diaryDetailPhotoSchema),
  edited: z.boolean(),
  savedAt: z.unknown().optional(),
  modifiedAt: z.unknown().optional(),
});

const diaryDetailResponseSchema = z.object({
  status: z.number(),
  message: z.string(),
  data: diaryDetailSchema,
});

const diaryMonthDaySchema = z.object({
  date: z.string(),
  diaryId: z.number(),
  thumbnailUrl: z.string(),
  photoCount: z.number(),
});

const diaryMonthResponseSchema = z.object({
  status: z.number(),
  message: z.string(),
  data: z.object({
    days: z.array(diaryMonthDaySchema),
  }),
});

interface DiaryDetail {
  id: string;
  petId: string;
  date: string;
  title: string;
  body: string;
  photos: string[];
  isEdited: boolean;
}

interface DiaryMonthDay {
  date: string;
  id: string;
  thumbnailUrl: string;
  photoCount: number;
}

function toDiaryDetail(dto: z.infer<typeof diaryDetailSchema>): DiaryDetail {
  const photos = [...dto.photos].sort((left, right) => left.order - right.order).map((photo) => photo.url);
  return {
    id: String(dto.diaryId),
    petId: String(dto.petId),
    date: dto.date,
    title: dto.title,
    body: dto.body,
    photos,
    isEdited: dto.edited,
  };
}

const parseDiaryDetail = (response: unknown) => toDiaryDetail(diaryDetailResponseSchema.parse(response).data);

const diaryDeleteResponseSchema = z.object({
  status: z.number().int(),
  message: z.string(),
});

const parseDiaryDelete = (response: unknown) => diaryDeleteResponseSchema.parse(response);

const parseDiaryMonth = (response: unknown): DiaryMonthDay[] =>
  diaryMonthResponseSchema.parse(response).data.days.map((day) => ({
    date: day.date,
    id: String(day.diaryId),
    thumbnailUrl: day.thumbnailUrl,
    photoCount: day.photoCount,
  }));

export { parseDiaryDateStatus, parseDiaryDelete, parseDiaryDetail, parseDiaryGeneration, parseDiaryMonth, parseDiaryPhotoUploads };
export type {
  DiaryDateAttendance,
  DiaryDateStatus,
  DiaryDateSummary,
  DiaryDetail,
  DiaryGeneration,
  DiaryMonthDay,
  DiaryPhotoUpload,
};
