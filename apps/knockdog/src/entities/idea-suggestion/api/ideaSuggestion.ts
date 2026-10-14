import type { IdeaSuggestionResponseDto, IdeaSuggestionRequestDto } from '../model/ideaSuggestion';

import { api, type ApiResponse } from '@shared/api';

/** `POST` - 아이디어 제안 등록. 같은 Idempotency-Key 재시도는 최초 성공 응답 */
function postIdeaSuggestion({ idempotencyKey, body }: { idempotencyKey: string; body: IdeaSuggestionRequestDto }) {
  return api
    .post('idea-suggestions', {
      json: body,
      headers: {
        'Idempotency-Key': idempotencyKey,
      },
    })
    .json<ApiResponse<IdeaSuggestionResponseDto>>();
}

export { postIdeaSuggestion };
