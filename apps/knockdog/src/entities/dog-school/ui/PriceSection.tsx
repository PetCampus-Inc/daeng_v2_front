import { ProductType } from './ProductType';
import { PriceImageSlider } from './PriceImageSlider';
import { LastUpdatedSection } from './LastUpdatedSection';

export function PriceSection() {
  return (
    <div className='mb-12 mt-8 flex flex-col gap-12 px-4'>
      {/* 상품유형 */}
      <ProductType productTypes={['COUNT', 'MEMBERSHIP']} />

      {/* 서비스 및 이용요금 */}
      <div>
        <div className='mb-1 flex items-center justify-between'>
          <span className='body1-bold'>서비스 및 이용요금</span>
          <span className='body2-bold text-neutral-500'>전화걸기</span>
        </div>
        <div className='flex flex-col gap-5'>
          <span className='body2-regular text-text-tertiary'>
            자세한 내용은 업체로 문의 바랍니다.
          </span>

          {/* TODO 서비스 데이터 구조 형식은 변경될 예정이라 우선 퍼블 내용 그대로 적용해 놓음 (재기획중) */}
          <div>
            <span className='body1-bold mb-3 inline-block'>
              Aqua Dog Fitness
            </span>

            <div className='bg-primitive-neutral-50 flex flex-col gap-3 rounded-lg p-4'>
              <div className='grid grid-cols-3'>
                <span className='body2-semibold text-left'>-5kg</span>
                <span className='body2-regular text-center'>5회</span>
                <span className='body2-regular text-right'>720,000원</span>
              </div>
              <div className='grid grid-cols-3'>
                <span className='body2-semibold text-left'>5kg-10kg</span>
                <span className='body2-regular text-center'>5회</span>
                <span className='body2-regular text-right'>720,000원</span>
              </div>

              <div className='grid grid-cols-3'>
                <span className='body2-semibold text-left'>5kg-10kg</span>
                <span className='body2-regular text-center'>15회</span>
                <span className='body2-regular text-right'>720,000원</span>
              </div>

              <div className='grid grid-cols-3'>
                <span className='body2-semibold text-left'>-5kg</span>
                <span className='body2-regular text-center'>5회</span>
                <span className='body2-regular text-right'>720,000원</span>
              </div>
            </div>
          </div>

          {/* Private Personal Lesson */}
          <div>
            <span className='body1-bold mb-3 inline-block'>
              Private Personal Lesson
            </span>

            <div className='bg-primitive-neutral-50 flex flex-col gap-3 rounded-lg p-4'>
              <div className='grid grid-cols-3'>
                <span className='body2-semibold text-left'>전 체중</span>
                <span className='body2-regular text-center'>5회</span>
                <span className='body2-regular text-right'>750,000원</span>
              </div>
              <div className='grid grid-cols-3'>
                <span className='body2-semibold text-left'>전 체중</span>
                <span className='body2-regular text-center'>10회</span>
                <span className='body2-regular text-right'>1,500,000원</span>
              </div>
            </div>
          </div>
          {/* Private Group Lesson */}
          <div>
            <span className='body1-bold mb-3 inline-block'>
              Private Group Lesson
            </span>

            <div className='bg-primitive-neutral-50 flex flex-col gap-3 rounded-lg p-4'>
              <div className='grid grid-cols-3'>
                <span className='body2-semibold text-left'>전 체중</span>
                <span className='body2-regular text-center'>5회</span>
                <span className='body2-regular text-right'>750,000원</span>
              </div>
              <div className='grid grid-cols-3'>
                <span className='body2-semibold text-left'>전 체중</span>
                <span className='body2-regular text-center'>10회</span>
                <span className='body2-regular text-right'>1,500,000원</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 가격표 */}
      <PriceImageSlider
        images={[
          'https://images.unsplash.com/photo-1518717758536-85ae29035b6d',
          'https://images.unsplash.com/photo-1518717758536-85ae29035b6d',
          'https://images.unsplash.com/photo-1518717758536-85ae29035b6d',
          'https://images.unsplash.com/photo-1518717758536-85ae29035b6d',
          'https://images.unsplash.com/photo-1518717758536-85ae29035b6d',
        ]}
      />
      {/* 최종 정보 업데이트 */}
      <LastUpdatedSection lastUpdated='2025-04-29' />
    </div>
  );
}
