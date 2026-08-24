import { kindergartenRegisterContent } from '@views/role-conversion/kindergarten-register/config/kindergartenRegisterContent';

type KindergartenRegisterSource = 'manual' | 'search';

interface KindergartenRegisterForm {
  source: KindergartenRegisterSource;
  placeId?: string;
  name: string;
  address: string;
  /** 선택 */
  addressDetail: string;
  kindergartenNumber: string;
  ownerName: string;
  phoneNumber: string;
}

interface SearchPrefill {
  placeId: string;
  name: string;
  address: string;
  kindergartenNumber: string;
}

interface RoleConversionKindergartenInfo {
  source: KindergartenRegisterSource;
  placeId?: string;
  name: string;
  address: string;
  /** 선택 */
  addressDetail: string;
  kindergartenNumber: string;
  ownerName: string;
  phoneNumber: string;
}

interface KindergartenInfoDisplayItem {
  label: string;
  value: string;
}

const emptyRegisterForm: KindergartenRegisterForm = {
  source: 'manual',
  name: '',
  address: '',
  addressDetail: '',
  kindergartenNumber: '',
  ownerName: '',
  phoneNumber: '',
};

function fromKindergartenInfo(info: RoleConversionKindergartenInfo): KindergartenRegisterForm {
  return {
    source: info.source,
    placeId: info.placeId,
    name: info.name,
    address: info.address,
    addressDetail: info.addressDetail ?? '',
    kindergartenNumber: info.kindergartenNumber,
    ownerName: info.ownerName,
    phoneNumber: info.phoneNumber,
  };
}

function fromSearchPrefill(prefill: SearchPrefill): KindergartenRegisterForm {
  return {
    source: 'search',
    placeId: prefill.placeId,
    name: prefill.name,
    address: prefill.address,
    addressDetail: '',
    kindergartenNumber: prefill.kindergartenNumber,
    ownerName: '',
    phoneNumber: '',
  };
}

function toKindergartenInfo(form: KindergartenRegisterForm): RoleConversionKindergartenInfo {
  return {
    source: form.source,
    placeId: form.placeId,
    name: form.name,
    address: form.address,
    addressDetail: (form.addressDetail ?? '').trim(),
    kindergartenNumber: form.kindergartenNumber,
    ownerName: form.ownerName,
    phoneNumber: form.phoneNumber,
  };
}

function toDisplayItems(info: RoleConversionKindergartenInfo): KindergartenInfoDisplayItem[] {
  const addressDetail = (info.addressDetail ?? '').trim();
  const addressValue = addressDetail ? `${info.address}\n${addressDetail}` : info.address;

  return [
    { label: kindergartenRegisterContent.nameLabel, value: info.name },
    { label: kindergartenRegisterContent.addressLabel, value: addressValue },
    { label: kindergartenRegisterContent.numberLabel, value: info.kindergartenNumber },
    { label: kindergartenRegisterContent.ownerNameLabel, value: info.ownerName },
    { label: kindergartenRegisterContent.phoneLabel, value: info.phoneNumber },
  ];
}

export type {
  KindergartenInfoDisplayItem,
  KindergartenRegisterForm,
  KindergartenRegisterSource,
  RoleConversionKindergartenInfo,
  SearchPrefill,
};
export { emptyRegisterForm, fromKindergartenInfo, fromSearchPrefill, toDisplayItems, toKindergartenInfo };
