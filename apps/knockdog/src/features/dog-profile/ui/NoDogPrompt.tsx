import { ActionButton, Icon } from '@knockdog/ui';

interface NoDogPromptProps {
  nickname: string;
  onAddDog?: () => void;
}

function NoDogPrompt({ nickname, onAddDog }: NoDogPromptProps) {
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

