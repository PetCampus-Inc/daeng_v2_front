import {
  RESULT_STATUS,
  RESULT_STATUS_VALUES,
  type ResultStatus,
} from '@views/role-conversion/complete/config/roleConversionResultStatus';

function resolveResultStatus(status: string | null): ResultStatus {
  if (status && RESULT_STATUS_VALUES.includes(status as ResultStatus)) {
    return status as ResultStatus;
  }

  return RESULT_STATUS.SUCCESS;
}

export { resolveResultStatus };
