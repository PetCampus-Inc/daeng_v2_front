import type { SelectRequest } from '@entities/owner-verification';
import type { RoleConversionKindergartenInfo } from '@views/role-conversion/model/kindergartenInfo';

function toSelectRequest(info: RoleConversionKindergartenInfo): SelectRequest | null {
  if (info.source !== 'search' || !info.placeId) return null;

  const kindergartenId = info.placeId.trim();
  if (!kindergartenId) return null;

  return {
    kindergartenId,
    kindergartenName: info.name,
    kindergartenAddress: info.address,
    kindergartenAddressDetail: (info.addressDetail ?? '').trim() || null,
    kindergartenPhoneNumber: info.kindergartenNumber,
    representativeName: info.ownerName,
    representativePhoneNumber: info.phoneNumber,
  };
}

export { toSelectRequest };
