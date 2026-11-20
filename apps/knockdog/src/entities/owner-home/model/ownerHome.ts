import type { z } from 'zod';
import type { ownerHomeResponseSchema } from './ownerHomeSchema';

type OwnerHomeDto = z.infer<typeof ownerHomeResponseSchema>;
type OwnerHomeSchoolDto = OwnerHomeDto['school'];
type OwnerHomePendingApprovalsDto = OwnerHomeDto['pendingApprovals'];
type OwnerHomeOperationStatusDto = OwnerHomeDto['operationStatus'];

interface OwnerHomePetPreview {
  id: string;
  name: string;
  profileImageUrl?: string;
}
interface OwnerHome {
  school: { schoolId: string; name: string };
  pendingApprovals: { count: number; latestId: number | null; bannerVisible: boolean };
  operationStatus: {
    date: string;
    currentlyInCount: number;
    checkedInCount: number;
    absentCount: number;
    checkedOutCount: number;
    sentAttendanceRecordCount: number;
    unsentAttendanceRecordCount: number;
  };
  latePets: { count: number; items: OwnerHomePetPreview[] };
}

const toOwnerHome = (dto: OwnerHomeDto): OwnerHome => ({
  school: { schoolId: String(dto.school.schoolId), name: dto.school.name },
  pendingApprovals: { ...dto.pendingApprovals },
  operationStatus: {
    ...dto.operationStatus,
    date: Array.isArray(dto.operationStatus.date)
      ? dto.operationStatus.date
          .map((value, index) => (index === 0 ? String(value) : String(value).padStart(2, '0')))
          .join('-')
      : dto.operationStatus.date,
  },
  // OQ-S5: 서버가 지각을 판정한다. 순서·인원수·전체 목록을 그대로 사용한다.
  latePets: {
    count: dto.notCheckedInPets.count,
    items: dto.notCheckedInPets.items.map((pet) => ({
      id: String(pet.reservationId),
      name: pet.name,
      profileImageUrl: pet.profileImage ?? undefined,
    })),
  },
});

export { toOwnerHome };
export type {
  OwnerHome,
  OwnerHomeDto,
  OwnerHomeSchoolDto,
  OwnerHomePendingApprovalsDto,
  OwnerHomeOperationStatusDto,
  OwnerHomePetPreview,
};
