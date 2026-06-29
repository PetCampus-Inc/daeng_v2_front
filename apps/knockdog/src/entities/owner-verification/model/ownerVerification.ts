interface SelectRequest {
  kindergartenId: number;
  representativeName: string;
  representativePhoneNumber: string;
}

interface ManualRequest {
  kindergartenName: string;
  kindergartenAddress: string;
  kindergartenAddressDetail: string | null;
  kindergartenPhoneNumber: string;
  representativeName: string;
  representativePhoneNumber: string;
}

interface KindergartenVerificationData {
  ownerVerificationId: number;
  kindergartenType: string;
  status: string;
  kindergartenId: number;
  kindergartenName: string;
  kindergartenAddress: string;
  kindergartenAddressDetail: string;
  kindergartenPhoneNumber: string;
  representativeName: string;
  representativePhoneNumber: string;
  nextStep: string;
}

export type { KindergartenVerificationData, ManualRequest, SelectRequest };
