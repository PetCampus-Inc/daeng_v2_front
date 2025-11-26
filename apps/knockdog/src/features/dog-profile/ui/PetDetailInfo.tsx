import { Avatar, AvatarFallback, AvatarImage, Divider, Icon } from '@knockdog/ui';
import { RELATIONSHIP_LABEL } from '@entities/pet';
import type { Pet } from '@entities/pet';
import Image from 'next/image';

export function PetDetailInfo({ pet }: { pet: Pet | undefined }) {
  const getGenderDisplay = () => {
    if (!pet?.gender) return null;
    return pet.gender === 'MALE' ? (
      <>
        <Icon icon='Male' className='size-5' />
        남자아이
      </>
    ) : (
      <>
        <Icon icon='Female' className='size-5' />
        여자아이
      </>
    );
  };

  const getNeuteredDisplay = () => {
    if (pet?.isNeutered === null || pet?.isNeutered === undefined) return '선택해주세요';
    return pet?.isNeutered ? '했어요' : '안했어요';
  };

  return (
    <div className='h-full overflow-y-auto'>
      <div className='flex items-center justify-center px-4 py-7'>
        <Avatar className='h-[120px] w-[120px]'>
          {pet?.profileImageUrl && <AvatarImage src={pet.profileImageUrl} />}
          <AvatarFallback>
            <Image src='/images/img_default_image.png' alt='default' width={120} height={120} />
          </AvatarFallback>
        </Avatar>
      </div>
      <div className='px-4'>
        <div className='flex flex-col'>
          <div>
            <div className='flex items-center justify-between py-4'>
              <span className='body1-medium'>
                강아지 이름
                <strong className='body2-bold text-text-accent'>*</strong>
              </span>
              <span className='body1-bold'>{pet?.name}</span>
            </div>
            <Divider />
          </div>

          <div>
            <div className='flex items-center justify-between py-4'>
              <span className='body1-medium'>
                강아지와 내 관계
                <strong className='body2-bold text-text-accent'>*</strong>
              </span>
              <span className='body1-bold'>{RELATIONSHIP_LABEL[pet?.relationship || 'ETC']}</span>
            </div>
            <Divider />
          </div>

          <div>
            <div className='flex items-center justify-between py-4'>
              <span className='body1-medium'>
                견종
                <span className='label-medium text-text-tertiary'>(선택)</span>
              </span>
              <span className={`body1-${pet?.breed ? 'bold' : 'medium text-text-tertiary'}`}>
                {pet?.breed || '선택해주세요'}
              </span>
            </div>
            <Divider />
          </div>

          <div>
            <div className='flex items-center justify-between py-4'>
              <span className='body1-medium'>
                태어난 해<span className='label-medium text-text-tertiary'>(선택)</span>
              </span>
              <span className={`body1-${pet?.birthYear ? 'bold' : 'medium text-text-tertiary'}`}>
                {pet?.birthYear || '선택해주세요'}
              </span>
            </div>
            <Divider />
          </div>

          <div>
            <div className='flex items-center justify-between py-4'>
              <span className='body1-medium'>
                몸무게(kg)
                <span className='label-medium text-text-tertiary'>(선택)</span>
              </span>
              <span className={`body1-${pet?.weight ? 'bold' : 'medium text-text-tertiary'}`}>
                {pet?.weight || '선택해주세요'}
              </span>
            </div>
            <Divider />
          </div>

          <div>
            <div className='flex items-center justify-between py-4'>
              <span className='body1-medium'>
                성별
                <span className='label-medium text-text-tertiary'>(선택)</span>
              </span>
              {pet?.gender ? (
                <span className='body1-bold flex items-center gap-x-1'>{getGenderDisplay()}</span>
              ) : (
                <span className='body1-medium text-text-tertiary'>선택해주세요</span>
              )}
            </div>
            <Divider />
          </div>

          <div>
            <div className='flex items-center justify-between py-4'>
              <span className='body1-medium'>
                중성화 여부
                <span className='label-medium text-text-tertiary'>(선택)</span>
              </span>
              <span
                className={`body1-${pet?.isNeutered === null || pet?.isNeutered === undefined ? 'medium text-text-tertiary' : 'bold'}`}
              >
                {getNeuteredDisplay()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
