import type { ManualRequest } from '@entities/owner-verification';
import type { RoleConversionKindergartenInfo } from '@views/role-conversion/model/kindergartenInfo';

function toManualRequest(info: RoleConversionKindergartenInfo): ManualRequest | null {
  if (info.source !== 'manual') return null;

  return {
    kindergartenName: info.name,
    kindergartenAddress: info.address,
    kindergartenAddressDetail: (info.addressDetail ?? '').trim() || null,
    kindergartenPhoneNumber: info.kindergartenNumber,
    representativeName: info.ownerName,
    representativePhoneNumber: info.phoneNumber,
  };
}

export { toManualRequest };
