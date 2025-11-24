import { Avatar, AvatarFallback, AvatarImage, Divider, Icon } from '@knockdog/ui';

interface PetDetailInfoProps {
  petData: {
    name: string;
    profileImage: string;
    relationship: string;
    breed?: string;
    birthYear?: string;
    weight?: string;
    gender?: 'MALE' | 'FEMALE';
    isNeutered?: 'Y' | 'N';
  };
}

export function PetDetailInfo({ petData }: PetDetailInfoProps) {
  const getGenderDisplay = () => {
    if (!petData.gender) return null;
    return petData.gender === 'MALE' ? (
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
    if (!petData.isNeutered) return '선택해주세요';
    return petData.isNeutered === 'Y' ? '했어요' : '안했어요';
  };

  return (
    <div className='h-full overflow-y-auto'>
      <div className='flex items-center justify-center px-4 py-7'>
        <Avatar className='h-[120px] w-[120px]'>
          <AvatarImage src={petData.profileImage} />
          <AvatarFallback>CN</AvatarFallback>
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
              <span className='body1-bold'>{petData.name}</span>
            </div>
            <Divider />
          </div>

          <div>
            <div className='flex items-center justify-between py-4'>
              <span className='body1-medium'>
                강아지와 내 관계
                <strong className='body2-bold text-text-accent'>*</strong>
              </span>
              <span className='body1-bold'>{petData.relationship}</span>
            </div>
            <Divider />
          </div>

          <div>
            <div className='flex items-center justify-between py-4'>
              <span className='body1-medium'>
                견종
                <span className='label-medium text-text-tertiary'>(선택)</span>
              </span>
              <span className={`body1-${petData.breed ? 'bold' : 'medium text-text-tertiary'}`}>
                {petData.breed || '선택해주세요'}
              </span>
            </div>
            <Divider />
          </div>

          <div>
            <div className='flex items-center justify-between py-4'>
              <span className='body1-medium'>
                태어난 해<span className='label-medium text-text-tertiary'>(선택)</span>
              </span>
              <span className={`body1-${petData.birthYear ? 'bold' : 'medium text-text-tertiary'}`}>
                {petData.birthYear || '선택해주세요'}
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
              <span className={`body1-${petData.weight ? 'bold' : 'medium text-text-tertiary'}`}>
                {petData.weight || '선택해주세요'}
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
              {petData.gender ? (
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
              <span className={`body1-${petData.isNeutered ? 'bold' : 'medium text-text-tertiary'}`}>
                {getNeuteredDisplay()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
