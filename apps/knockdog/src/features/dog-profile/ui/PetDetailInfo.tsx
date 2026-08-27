import { Avatar, AvatarFallback, AvatarImage, Divider, Icon } from '@knockdog/ui';
import type { ReactNode } from 'react';
import { RELATIONSHIP, RELATIONSHIP_LABEL } from '@entities/pet';
import type { Pet } from '@entities/pet';

export function PetDetailInfo({ pet, children }: { pet: Pet | undefined; children?: ReactNode }) {
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
    return pet?.isNeutered ? '했어요' : '안 했어요';
  };

  const getRelationshipDisplay = () => {
    if (pet?.relationship === RELATIONSHIP.ETC) return pet?.relationshipText;
    return RELATIONSHIP_LABEL[pet?.relationship || 'ETC'];
  };

  return (
    <div className='h-full overflow-y-auto pt-5'>
      <div className='flex items-center justify-center px-4 py-5'>
        <Avatar className='h-[120px] w-[120px]'>
          {pet?.profileImage && <AvatarImage src={pet.profileImage} className='object-cover' />}
          <AvatarFallback className='bg-primitive-neutral-100'>
            <Icon icon='Paw' className='text-fill-secondary-400 h-[52px] w-[52px]' />
          </AvatarFallback>
        </Avatar>
      </div>
      <div className='px-4'>
        <div className='flex flex-col'>
          <div>
            <div className='flex items-center justify-between gap-3 p-4'>
              <span className='body1-medium shrink-0 whitespace-nowrap'>강아지 이름</span>
              <span className='body1-bold'>{pet?.name}</span>
            </div>
            <Divider />
          </div>

          <div>
            <div className='flex items-center justify-between gap-3 p-4'>
              <span className='body1-medium shrink-0 whitespace-nowrap'>강아지와 내 관계</span>
              <span className='body1-bold'>{getRelationshipDisplay()}</span>
            </div>
            <Divider />
          </div>

          <div>
            <div className='flex items-center justify-between gap-3 p-4'>
              <span className='body1-medium shrink-0 whitespace-nowrap'>견종</span>
              <span className={`body1-${pet?.breed ? 'bold' : 'medium text-text-tertiary'}`}>
                {pet?.breed || '선택해주세요'}
              </span>
            </div>
            <Divider />
          </div>

          <div>
            <div className='flex items-center justify-between gap-3 p-4'>
              <span className='body1-medium shrink-0 whitespace-nowrap'>태어난 해</span>
              <span className={`body1-${pet?.birthYear ? 'bold' : 'medium text-text-tertiary'}`}>
                {pet?.birthYear || '선택해주세요'}
              </span>
            </div>
            <Divider />
          </div>

          <div>
            <div className='flex items-center justify-between gap-3 p-4'>
              <span className='body1-medium shrink-0 whitespace-nowrap'>몸무게(kg)</span>
              <span className={`body1-${pet?.weight ? 'bold' : 'medium text-text-tertiary'}`}>
                {pet?.weight || '선택해주세요'}
              </span>
            </div>
            <Divider />
          </div>

          <div>
            <div className='flex items-center justify-between gap-3 p-4'>
              <span className='body1-medium shrink-0 whitespace-nowrap'>성별</span>
              {pet?.gender ? (
                <span className='body1-bold flex items-center gap-x-1'>{getGenderDisplay()}</span>
              ) : (
                <span className='body1-medium text-text-tertiary'>선택해주세요</span>
              )}
            </div>
            <Divider />
          </div>

          <div>
            <div className='flex items-center justify-between gap-3 p-4'>
              <span className='body1-medium shrink-0 whitespace-nowrap'>중성화 여부</span>
              <span
                className={`body1-${pet?.isNeutered === null || pet?.isNeutered === undefined ? 'medium text-text-tertiary' : 'bold'}`}
              >
                {getNeuteredDisplay()}
              </span>
            </div>
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}
