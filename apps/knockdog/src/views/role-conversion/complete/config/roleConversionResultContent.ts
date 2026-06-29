import { RESULT_STATUS, type ResultStatus } from './roleConversionResultStatus';

interface ResultContent {
  titleLines: readonly string[];
  descriptionLines: readonly string[];
  imageAlt: string;
  imageSrc: string;
  primaryButtonLabel: string;
  secondaryButtonLabel: string;
}

const SUCCESS_IMAGE = '/images/img_owner_success.png';
const ERROR_IMAGE = '/images/img_owner_error.png';

const resultContentMap = Object.freeze({
  [RESULT_STATUS.SUCCESS]: {
    titleLines: ['원장 권한이 열렸어요'],
    descriptionLines: ['이제 보호자를 초대해 유치원과 연결할 수 있어요.'],
    imageAlt: '원장 권한 인증 성공',
    imageSrc: SUCCESS_IMAGE,
    primaryButtonLabel: '보호자 초대하기',
    secondaryButtonLabel: '나중에 하기',
  },
  [RESULT_STATUS.DUPLICATE]: {
    titleLines: ['이미 등록된 사업자 번호예요'],
    descriptionLines: [
      '등록한 적이 없거나 원장 권한 확인이 필요하면',
      '고객센터로 문의해 주세요.',
    ],
    imageAlt: '원장 권한 인증 실패',
    imageSrc: ERROR_IMAGE,
    primaryButtonLabel: '고객센터 문의',
    secondaryButtonLabel: '사업자번호 다시 입력',
  },
  [RESULT_STATUS.CLOSED_OR_SUSPENDED]: {
    titleLines: ['현재 상태로는', '원장 인증을 진행할 수 없어요'],
    descriptionLines: [
      '휴업/폐업/미등록 상태의',
      '사업자등록번호는 등록할 수 없어요.',
      '실제 상태와 다르면 고객센터로 문의해 주세요.',
    ],
    imageAlt: '원장 권한 인증 실패',
    imageSrc: ERROR_IMAGE,
    primaryButtonLabel: '고객센터 문의',
    secondaryButtonLabel: '사업자번호 다시 입력',
  },
  [RESULT_STATUS.TEMPORARY]: {
    titleLines: ['사업자 정보를 확인하지 못했어요'],
    descriptionLines: ['입력한 내용은 유지돼요.', '잠시 후 다시 시도해 주세요.'],
    imageAlt: '원장 권한 인증 실패',
    imageSrc: ERROR_IMAGE,
    primaryButtonLabel: '다시 시도',
    secondaryButtonLabel: '나중에 하기',
  },
} satisfies Record<ResultStatus, ResultContent>);

function getResultContent(status: ResultStatus) {
  return resultContentMap[status];
}

export { getResultContent, resultContentMap, type ResultContent };
