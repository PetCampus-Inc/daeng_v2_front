import { CHARGE_COUNT_ERROR } from '@views/owner/member-ticket-charge/model/memberTicketCharge';

const memberTicketChargeContent = {
  title: '이용권 충전',
  startDate: {
    label: '시작일',
    placeholder: '시작일을 선택하세요',
    sheetTitle: '시작일 선택',
    confirm: (date: string) => `${date} 선택`,
  },
  preset: {
    label: '등록된 이용권',
    optional: '(선택)',
    placeholder: '이용권 선택하기',
  },
  name: {
    label: '이용권 이름',
    placeholder: '이름을 입력하세요',
    maxLength: 50,
  },
  count: {
    label: '충전 횟수',
    placeholder: '횟수를 입력하세요',
    unit: '회',
    error: CHARGE_COUNT_ERROR,
  },
  duration: {
    none: '만료 없음',
    month: (months: number) => `${months}개월`,
    custom: '직접 입력',
    hint: (start: string, end: string) => `* ${start}부터 사용하고 ${end}에 만료돼요.`,
  },
  submit: '충전하기',
  failure: '이용권을 충전하지 못했어요.',
  leave: {
    title: '충전하지 않고 나갈까요?',
    description: '입력한 내용이 저장되지 않아요.',
    stay: '닫기',
    exit: '나가기',
  },
} as const;

export { memberTicketChargeContent };
