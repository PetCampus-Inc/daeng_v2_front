import { kindergartenRegisterContent } from '../kindergarten-register/config/kindergartenRegisterContent';

interface KindergartenRegisterForm {
  name: string;
  address: string;
  kindergartenNumber: string;
  ownerName: string;
  phoneNumber: string;
}

interface RoleConversionKindergartenInfo {
  name: string;
  address: string;
  kindergartenNumber: string;
  ownerName: string;
  phoneNumber: string;
}

interface KindergartenInfoDisplayItem {
  label: string;
  value: string;
}

function toKindergartenInfo(form: KindergartenRegisterForm): RoleConversionKindergartenInfo {
  return {
    name: form.name,
    address: form.address,
    kindergartenNumber: form.kindergartenNumber,
    ownerName: form.ownerName,
    phoneNumber: form.phoneNumber,
  };
}

function toDisplayItems(info: RoleConversionKindergartenInfo): KindergartenInfoDisplayItem[] {
  return [
    { label: kindergartenRegisterContent.nameLabel, value: info.name },
    { label: kindergartenRegisterContent.addressLabel, value: info.address },
    { label: kindergartenRegisterContent.numberLabel, value: info.kindergartenNumber },
    { label: kindergartenRegisterContent.ownerNameLabel, value: info.ownerName },
    { label: kindergartenRegisterContent.phoneLabel, value: info.phoneNumber },
  ];
}

export type {
  KindergartenInfoDisplayItem,
  KindergartenRegisterForm,
  RoleConversionKindergartenInfo,
};
export { toDisplayItems, toKindergartenInfo };
