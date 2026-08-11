interface PrivacyConsentPolicySection {
  title: string;
  items: readonly PrivacyConsentPolicyItem[];
}

interface PrivacyConsentPolicyItem {
  text: string;
  note?: string;
  nestedItem?: string;
}

const privacyConsentPolicyIntro =
  '회사는 보호자와 반려견의 유치원 연결 신청, 연결 승인 처리 및 유치원 생활 정보 제공을 위해 아래와 같이 개인정보를 수집·이용하며, 서비스 제공에 필요한 범위에서 해당 유치원의 원장 및 같은 유치원에 연결된 보호자에게 공개할 수 있습니다.';

const privacyConsentPolicySections: readonly PrivacyConsentPolicySection[] = [
  {
    title: '수집·이용 항목:',
    items: [
      { text: '필수 : 보호자 정보(이름, 성별, 연락처, 주소), 반려견 정보(이름, 보호자와의 관계, 견종, 몸무게, 성별)' },
      {
        text: '선택 : 보호자 상세 주소·비상연락처, 반려견 정보(태어난 해, 중성화 여부, 사진)',
        note:
          '※ 비상연락처에 본인이 아닌 다른 사람의 연락처를 입력하는 경우, 사전에 해당 본인의 동의를 받아야 하며 이에 대한 책임은 입력한 보호자에게 있습니다.',
      },
      { text: '연결 신청 정보: 신청 유치원, 신청 일시, 신청 상태, 승인/거절 처리 결과, 연결 상태' },
      { text: '연결 후 생성 정보: 등하원 기록, 알림장, 사진 등 유치원 운영 기록' },
    ],
  },
  {
    title: '수집·이용 목적:',
    items: [
      { text: '유치원 연결 신청 접수 및 승인 처리' },
      { text: '연결 후 등하원, 알림장, 사진 공유 등 유치원 생활 정보 제공' },
      { text: '보호자 응대, 비상 연락, 중복 신청 방지' },
      { text: '문의 및 분쟁 대응' },
    ],
  },
  {
    title: '제공 대상:',
    items: [
      { text: '연결 신청한 해당 유치원의 원장' },
      {
        text: '같은 유치원에 연결된 보호자',
        nestedItem: '단, 재원 기간 중 공용 앨범에 게시된 운영 기록에 한함',
      },
    ],
  },
  {
    title: '보유·이용 기간:',
    items: [
      { text: '유치원 연결 종료 후 3년' },
      { text: '단, 관련 법령 또는 내부 보관 기준에 따라 보관이 필요한 정보는 해당 기간 동안 보관' },
    ],
  },
];

const privacyConsentPolicyClosing = [
  '연결이 해제되면 해당 유치원은 신규 등하원 처리, 신규 알림장 작성, 신규 사진 등록을 할 수 없습니다. 다만 연결 해제 전 생성된 기존 운영 기록은 읽기 전용으로 보존될 수 있습니다.',
  '동의를 거부할 권리가 있으나, 동의하지 않을 경우 유치원 연결 신청을 진행할 수 없어요.',
] as const;

export { privacyConsentPolicyClosing, privacyConsentPolicyIntro, privacyConsentPolicySections };
