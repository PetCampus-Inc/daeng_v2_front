import { z } from 'zod';

const homeLatePetsSchema = z.object({
  count: z.number(),
  items: z.array(
    z.object({
      reservationId: z.number(),
      petId: z.number(),
      name: z.string(),
      profileImage: z.string().nullable(),
      reservedTime: z.string(),
    })
  ),
});

const homePendingApprovalsSchema = z.object({
  count: z.number(),
  latestId: z.number().nullable(),
  bannerVisible: z.boolean(),
});

const ownerHomeResponseSchema = z.object({
  school: z.object({ schoolId: z.number(), name: z.string() }),
  operationStatus: z.object({
    date: z.union([z.string(), z.tuple([z.number(), z.number(), z.number()])]),
    currentlyInCount: z.number(),
    checkedInCount: z.number(),
    absentCount: z.number(),
    checkedOutCount: z.number(),
    sentAttendanceRecordCount: z.number(),
    unsentAttendanceRecordCount: z.number(),
  }),
  pendingApprovals: homePendingApprovalsSchema,
  notCheckedInPets: homeLatePetsSchema,
});

type HomeLatePetsDto = z.infer<typeof homeLatePetsSchema>;
type HomePendingApprovalsDto = z.infer<typeof homePendingApprovalsSchema>;

export { ownerHomeResponseSchema };
export type { HomeLatePetsDto, HomePendingApprovalsDto };
