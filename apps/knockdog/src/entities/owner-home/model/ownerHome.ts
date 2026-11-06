interface OwnerHomeSchoolDto {
  schoolId?: number | string | null;
  name?: string | null;
}

interface OwnerHomePendingApprovalsDto {
  count?: number | null;
}

interface OwnerHomeOperationStatusDto {
  date?: string | number[] | null;
  currentlyInCount?: number | null;
  checkedInCount?: number | null;
  checkedOutCount?: number | null;
  sentAttendanceRecordCount?: number | null;
  unsentAttendanceRecordCount?: number | null;
}

interface OwnerHomeCurrentlyInPetDto {
  petId?: number | string | null;
  id?: number | string | null;
  name?: string | null;
  petName?: string | null;
  dogName?: string | null;
  profileImage?: string | null;
  profileImageUrl?: string | null;
  dogProfileUri?: string | null;
  tempKey?: string | null;
  uploadUrl?: string | null;
}

interface OwnerHomeCurrentlyInPetsPreviewDto {
  totalCount?: number | null;
  items?: OwnerHomeCurrentlyInPetDto[] | null;
}

interface OwnerHomeDto {
  school?: OwnerHomeSchoolDto | null;
  pendingApprovals?: OwnerHomePendingApprovalsDto | null;
  operationStatus?: OwnerHomeOperationStatusDto | null;
  currentlyInPetsPreview?: OwnerHomeCurrentlyInPetsPreviewDto | null;
}

interface OwnerHomePetPreview {
  id: string;
  name: string;
  profileImageUrl?: string;
}

interface OwnerHome {
  school: {
    schoolId: string | null;
    name: string;
  };
  pendingApprovalsCount: number;
  operationStatus: {
    date: string | null;
    currentlyInCount: number;
    checkedInCount: number;
    checkedOutCount: number;
    sentAttendanceRecordCount: number;
    unsentAttendanceRecordCount: number;
  };
  currentlyInPetsPreview: {
    totalCount: number;
    items: OwnerHomePetPreview[];
  };
}

const PET_PREVIEW_LIMIT = 5;

function getNumberValue(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function normalizeDateKey(value: unknown): string | null {
  if (typeof value === 'string' && value.length > 0) {
    const datePart = value.slice(0, 10);
    if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) return datePart;
    return null;
  }

  if (Array.isArray(value) && value.length >= 3) {
    const [year, month, day] = value;
    if (
      typeof year === 'number' &&
      typeof month === 'number' &&
      typeof day === 'number' &&
      Number.isFinite(year) &&
      Number.isFinite(month) &&
      Number.isFinite(day)
    ) {
      return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }
  }

  return null;
}

function toOwnerHomePetPreview(
  dto: OwnerHomeCurrentlyInPetDto | null | undefined
): OwnerHomePetPreview | null {
  if (!dto) return null;

  const idValue = dto.petId ?? dto.id ?? dto.tempKey;
  if (idValue == null || idValue === '') return null;

  const name = dto.name ?? dto.petName ?? dto.dogName ?? '';
  const profileImageUrl =
    dto.profileImage ?? dto.profileImageUrl ?? dto.dogProfileUri ?? dto.uploadUrl ?? undefined;

  return {
    id: String(idValue),
    name,
    profileImageUrl: profileImageUrl || undefined,
  };
}

function toOwnerHome(dto: OwnerHomeDto | null | undefined): OwnerHome {
  const previewItems = (dto?.currentlyInPetsPreview?.items ?? [])
    .map(toOwnerHomePetPreview)
    .filter((item): item is OwnerHomePetPreview => item != null)
    .slice(0, PET_PREVIEW_LIMIT);

  const totalCount =
    getNumberValue(dto?.currentlyInPetsPreview?.totalCount) ??
    getNumberValue(dto?.operationStatus?.currentlyInCount) ??
    previewItems.length;

  const schoolId = dto?.school?.schoolId;

  return {
    school: {
      schoolId: schoolId == null || schoolId === '' ? null : String(schoolId),
      name: dto?.school?.name ?? '',
    },
    pendingApprovalsCount: getNumberValue(dto?.pendingApprovals?.count) ?? 0,
    operationStatus: {
      date: normalizeDateKey(dto?.operationStatus?.date),
      currentlyInCount: getNumberValue(dto?.operationStatus?.currentlyInCount) ?? 0,
      checkedInCount: getNumberValue(dto?.operationStatus?.checkedInCount) ?? 0,
      checkedOutCount: getNumberValue(dto?.operationStatus?.checkedOutCount) ?? 0,
      sentAttendanceRecordCount:
        getNumberValue(dto?.operationStatus?.sentAttendanceRecordCount) ?? 0,
      unsentAttendanceRecordCount:
        getNumberValue(dto?.operationStatus?.unsentAttendanceRecordCount) ?? 0,
    },
    currentlyInPetsPreview: {
      totalCount,
      items: previewItems,
    },
  };
}

export { PET_PREVIEW_LIMIT, toOwnerHome };
export type {
  OwnerHome,
  OwnerHomeCurrentlyInPetDto,
  OwnerHomeCurrentlyInPetsPreviewDto,
  OwnerHomeDto,
  OwnerHomeOperationStatusDto,
  OwnerHomePendingApprovalsDto,
  OwnerHomePetPreview,
  OwnerHomeSchoolDto,
};
