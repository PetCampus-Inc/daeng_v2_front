import { FloatingActionButton } from '@knockdog/ui';

export function ListFAB({ onClick }: { onClick: () => void }) {
  return (
    <FloatingActionButton
      icon='List'
      label='목록보기'
      variant='neutralLight'
      extended={false}
      onClick={onClick}
    />
  );
}
