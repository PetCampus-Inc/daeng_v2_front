import { kindergartenRegisterContent } from '../kindergarten-register/config/kindergartenRegisterContent';

type KindergartenRegisterSource = 'manual' | 'search';

interface KindergartenRegisterForm {
  source: KindergartenRegisterSource;
  placeId?: string;
  name: string;
  address: string;
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
  kindergartenNumber: '',
  ownerName: '',
  phoneNumber: '',
};

function fromSearchPrefill(prefill: SearchPrefill): KindergartenRegisterForm {
  return {
    source: 'search',
    placeId: prefill.placeId,
    name: prefill.name,
    address: prefill.address,
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
  KindergartenRegisterSource,
  RoleConversionKindergartenInfo,
  SearchPrefill,
};
export { emptyRegisterForm, fromSearchPrefill, toDisplayItems, toKindergartenInfo };
