const ownerPassTemplateContent = {
  managementTitle: '이용권 관리',
  managementDescription: '자주 사용하는 이용권을 관리 할 수 있어요.',
  emptyTitle: '아직 등록된 이용권이 없어요',
  emptyDescription: '자주 사용하는 이용권을 등록할 수 있어요.',
  createButtonLabel: '이용권 등록하기',
  submitButtonLabel: '등록하기',
  nameLabel: '이용권 이름',
  namePlaceholder: '이름을 입력하세요.',
  chargeCountLabel: '충전 횟수',
  chargeCountPlaceholder: '횟수를 입력하세요.',
  durationLabel: '유효기간',
  duplicateNameError: '이미 같은 이름의 템플릿이 있어요.',
  chargeCountError: '충전 횟수는 1~1000회 사이로 입력해 주세요.',
  durationError: '유효기간은 1~99 사이로 입력해 주세요.',
  unsavedTitle: '이용권을 저장하지 않고 나갈까요?',
  unsavedDescription: '변경한 내용이 저장되지 않아요.',
  deleteTitle: '이용권을 삭제할까요?',
  deleteDescription: '이미 충전한 이용권은 그대로 사용할 수 있어요',
} as const;

export { ownerPassTemplateContent };
