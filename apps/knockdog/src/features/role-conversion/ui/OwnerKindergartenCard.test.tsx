// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { OwnerKindergartenCard } from './OwnerKindergartenCard';

vi.mock('@knockdog/ui', () => ({ Icon: () => null }));

afterEach(cleanup);

describe('원장 마이페이지 유치원 이미지 오류 복구', () => {
  test.each([undefined, null, '', '   ', 'school/photo.jpg', 'https://', '//images.example.com/photo.jpg', 'javascript:alert(1)'])(
    '이미지 주소가 유효하지 않아도 유치원 정보를 보고 상세로 이동할 수 있다 (%s)',
    (imageUrl) => {
      const onClick = vi.fn();
      render(<OwnerKindergartenCard name='테스트 유치원' address='서울시' imageUrl={imageUrl} onClick={onClick} />);

      fireEvent.click(screen.getByRole('button', { name: /테스트 유치원/ }));

      expect(onClick).toHaveBeenCalledOnce();
      expect(screen.queryByAltText('')).toBeNull();
    }
  );

  test('정상 이미지가 로딩에 실패하면 기본 이미지로 바꾸고 새 이미지로 교체하면 다시 표시한다', () => {
    const { rerender } = render(
      <OwnerKindergartenCard name='테스트 유치원' address='서울시' imageUrl='/images/school.jpg' />
    );

    fireEvent.error(screen.getByAltText(''));
    expect(screen.queryByAltText('')).toBeNull();

    rerender(<OwnerKindergartenCard name='테스트 유치원' address='서울시' imageUrl='/images/new-school.jpg' />);
    expect(screen.getByAltText('')).toBeTruthy();
  });
});
