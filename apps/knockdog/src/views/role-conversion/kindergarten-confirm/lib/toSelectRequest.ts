import type { SelectRequest } from '@entities/owner-verification';
import type { RoleConversionKindergartenInfo } from '@views/role-conversion/model/kindergartenInfo';

function toSelectRequest(info: RoleConversionKindergartenInfo): SelectRequest | null {
  if (info.source !== 'search' || !info.placeId) return null;

  const kindergartenId = Number(info.placeId);
  if (!Number.isFinite(kindergartenId)) return null;

  return {
    kindergartenId,
    representativeName: info.ownerName,
    representativePhoneNumber: info.phoneNumber,
    kindergartenAddressDetail: (info.addressDetail ?? '').trim() || null,
  };
}

export { toSelectRequest };
