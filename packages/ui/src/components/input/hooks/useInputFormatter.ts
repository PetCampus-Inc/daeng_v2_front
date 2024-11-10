import { ChangeEvent, useCallback } from 'react';

import {
  formatTelNumber,
  formatOnlyNumber,
  formatAlphanumeric,
} from '../lib/formatter';

/**
 * 텍스트 입력 포맷 타입
 * - `text` - 일반 텍스트 (포맷팅 없음)
 * - `tel` - 전화번호 형식 (예 - 010-1234-5678)
 * - `number` - 숫자만 입력
 * - `alphanumeric` - 영문자와 숫자만 입력
 */
export type TextInputFormat = 'text' | 'tel' | 'number' | 'alphanumeric';

interface InputFormatterProps {
  value?: string;
  format?: TextInputFormat;
}

export const useInputFormatter = ({ value, format }: InputFormatterProps) => {
  const handleInput = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      let value = e.currentTarget.value;
      let formattedValue = value;

      if (format === 'tel') formattedValue = formatTelNumber(value);
      else if (format === 'number') formattedValue = formatOnlyNumber(value);
      else if (format === 'alphanumeric')
        formattedValue = formatAlphanumeric(value);

      e.currentTarget.value = formattedValue;
    },
    [value, format]
  );

  return { handleInput };
};
