import { ActionButton, Icon } from '@knockdog/ui';

interface NoDogPromptProps {
  nickname: string;
  showRegistrationEmptyState?: boolean;
  onAddDog?: () => void;
}

function NoDogPrompt({ nickname, showRegistrationEmptyState = false, onAddDog }: NoDogPromptProps) {
  if (showRegistrationEmptyState) {
    return (
      <div className='flex w-full flex-col gap-4 px-4 py-4'>
        <div className='flex flex-col gap-1'>
          <h1 className='h3-extrabold text-text-primary'>등록한 강아지가 없어요</h1>
          <p className='body1-regular text-text-secondary'>강아지 프로필을 추가해 보세요.</p>
        </div>
        <ActionButton size='large' onClick={onAddDog}>
          <Icon icon='Plus' className='size-5' />
          강아지를 등록해 주세요
        </ActionButton>
      </div>
    );
  }

  return (
    <div className='px-4'>
      <div className='flex items-center gap-x-2 py-5'>
        <h1 className='h1-extrabold'>
          <strong className='text-text-accent'>{nickname}</strong>
          님의 집
        </h1>
        <Icon icon='Rooftop' className='size-8' />
      </div>
      <div className='pt-3 pb-7'>
        <ActionButton variant='secondaryFill' onClick={onAddDog}>
          <Icon icon='Plus' className='size-4' />
          강아지를 등록해 주세요
        </ActionButton>
      </div>
    </div>
  );
}

export { NoDogPrompt };
