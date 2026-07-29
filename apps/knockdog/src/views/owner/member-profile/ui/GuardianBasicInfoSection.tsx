'use client';

import { Divider, Icon } from '@knockdog/ui';

import type { OwnerPetGuardian } from '@entities/owner-pet';

import {
  getGuardianGenderLabel,
  ownerMemberProfileContent,
} from '../config/ownerMemberProfileContent';

interface GuardianBasicInfoSectionProps {
  guardian: OwnerPetGuardian;
  onCopy: (label: string, value: string) => void;
}

interface InfoRowProps {
  label: string;
  value: string;
  copyable?: boolean;
  onCopy?: () => void;
}

function displayValue(value: string | null | undefined) {
  if (value == null || value.trim().length === 0) {
    return ownerMemberProfileContent.emptyValue;
  }

  return value;
}

function InfoRow({ label, value, copyable = false, onCopy }: InfoRowProps) {
  const canCopy = copyable && value !== ownerMemberProfileContent.emptyValue;

  return (
    <div className='flex items-center justify-between py-4'>
      <div className='flex items-center gap-1'>
        <span className='body2-regular text-text-secondary'>{label}</span>
        {canCopy ? (
          <button
            type='button'
            aria-label={`${label} 복사`}
            className='inline-flex size-4 shrink-0 items-center justify-center'
            onClick={onCopy}
          >
            <Icon icon='Copy' className='text-text-secondary size-4' />
          </button>
        ) : null}
      </div>
      <span className='body1-bold text-text-primary'>{value}</span>
    </div>
  );
}

interface AddressRowProps {
  label: string;
  address: string;
  addressDetail?: string;
  onCopy: () => void;
}

function AddressRow({ label, address, addressDetail, onCopy }: AddressRowProps) {
  const hasAddress = Boolean(address) || Boolean(addressDetail);
  const displayAddress = displayValue(address);

  return (
    <div className='flex flex-col gap-2.5 py-4'>
      <div className='flex items-center gap-1'>
        <span className='body2-regular text-text-secondary'>{label}</span>
        {hasAddress ? (
          <button
            type='button'
            aria-label={`${label} 복사`}
            className='inline-flex size-4 shrink-0 items-center justify-center'
            onClick={onCopy}
          >
            <Icon icon='Copy' className='text-text-secondary size-4' />
          </button>
        ) : null}
      </div>
      <div className='body1-bold text-text-primary'>
        <p>{displayAddress}</p>
        {addressDetail ? <p>{addressDetail}</p> : null}
      </div>
    </div>
  );
}

function GuardianBasicInfoSection({ guardian, onCopy }: GuardianBasicInfoSectionProps) {
  const fullAddress = [guardian.address, guardian.addressDetail].filter(Boolean).join(' ');

  return (
    <div className='flex flex-col gap-4 px-4 py-5'>
      <h2 className='h3-extrabold text-text-primary'>{ownerMemberProfileContent.basicInfoTitle}</h2>

      <div className='bg-bg-0 radius-r3 flex flex-col overflow-hidden px-4'>
        <InfoRow
          label={ownerMemberProfileContent.nameLabel}
          value={displayValue(guardian.name)}
        />
        <Divider />
        <InfoRow
          label={ownerMemberProfileContent.genderLabel}
          value={getGuardianGenderLabel(guardian.gender)}
        />
        <Divider />
        <InfoRow
          label={ownerMemberProfileContent.phoneLabel}
          value={displayValue(guardian.phone)}
          copyable
          onCopy={() => onCopy(ownerMemberProfileContent.phoneLabel, guardian.phone)}
        />
        <Divider />
        <InfoRow
          label={ownerMemberProfileContent.emergencyPhoneLabel}
          value={displayValue(guardian.emergencyPhone)}
          copyable
          onCopy={() =>
            onCopy(ownerMemberProfileContent.emergencyPhoneLabel, guardian.emergencyPhone)
          }
        />
        <Divider />
        <AddressRow
          label={ownerMemberProfileContent.addressLabel}
          address={guardian.address}
          addressDetail={guardian.addressDetail}
          onCopy={() => onCopy(ownerMemberProfileContent.addressLabel, fullAddress)}
        />
      </div>
    </div>
  );
}

export { GuardianBasicInfoSection };
