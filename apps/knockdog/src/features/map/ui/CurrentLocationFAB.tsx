import { FloatingActionButton } from '@knockdog/ui';

export function CurrentLocationFAB() {
  return (
    <FloatingActionButton
      icon='Currentlocation'
      label='현재 위치로 이동'
      variant='neutralLight'
      extended={false}
    />
  );
}
