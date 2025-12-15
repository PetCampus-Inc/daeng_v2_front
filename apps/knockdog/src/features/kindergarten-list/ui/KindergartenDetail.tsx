import type { Kindergarten } from '@entities/kindergarten';
import { BottomSheet } from '@shared/ui/bottom-sheet';

interface DogSchoolDetailProps extends Kindergarten {}

export function KindergartenDetail({ ...props }: DogSchoolDetailProps) {
  return (
    <>
      <BottomSheet.Title className='sr-only'>{props.title} 상세</BottomSheet.Title>
      <div className='p-6'>
        <h1 className='mb-4 text-2xl font-bold'>{props.title}</h1>
        <p className='mb-2 text-gray-600'>거리: {props.dist}</p>
        <p className='text-gray-600'>주소: {props.id}</p>
        <div className='mt-8'>
          <h2 className='mb-4 text-lg font-semibold'>상세 정보</h2>
          <p>여기에 상세 정보가 표시됩니다.</p>
        </div>
      </div>
    </>
  );
}
