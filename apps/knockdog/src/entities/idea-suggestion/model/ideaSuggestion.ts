/** 제안자가 선택한 사용자 유형 */
type IdeaSuggestionUserType = 'GUARDIAN' | 'OWNER';

interface IdeaSuggestionRequestDto {
  userType: IdeaSuggestionUserType;
  content: string;
}

interface IdeaSuggestionResponseDto {
  id: number;
}

export type { IdeaSuggestionRequestDto, IdeaSuggestionResponseDto, IdeaSuggestionUserType };
