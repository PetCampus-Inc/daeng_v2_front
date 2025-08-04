import { LastUpdatedSection } from './LastUpdatedSection';
import { BusinessHours } from './BusinessHours';
import { DogSchoolLocationMap } from './DogSchoolLocationMap';
import { IconWithLabel } from './IconWithLabel';
import { WebSiteInfo } from './WebSiteInfo';
import type {
  견종,
  강아지_서비스,
  강아지_안전_시설,
  방문객_편의_시설,
} from '../model/mock';

export function DefaultInfoSection() {
  return (
    <div className='mb-12 mt-7 flex flex-col gap-12 px-4'>
      {/* 운영시간 */}
      <BusinessHours />

      {/* 견종 */}
      <div>
        <div className='mb-3'>
          <span className='body1-bold'>견종</span>
        </div>
        <div className='grid grid-cols-4 gap-3'>
          {['ALL_BREEDS', 'SMALL_DOGS_ONLY', 'MEDIUM_LARGE_DOGS_ONLY'].map(
            (code) => (
              <IconWithLabel key={code} code={code as 견종} />
            )
          )}
        </div>
      </div>
      {/* 강아지 서비스 */}
      <div>
        <div className='mb-3'>
          <span className='body1-bold'>강아지 서비스</span>
        </div>
        <div className='grid grid-cols-4 gap-3'>
          {['DAYCARE', 'HOTEL', 'STAY_24H', 'TEMPERAMENT', 'SPLIT_CLASS'].map(
            (code) => (
              <IconWithLabel key={code} code={code as 강아지_서비스} />
            )
          )}
        </div>
      </div>
      {/* 강아지 안전시설 */}
      <div>
        <div className='mb-3'>
          <span className='body1-bold'>강아지 안전·시설</span>
        </div>
        <div className='grid grid-cols-4 gap-3'>
          {[
            'NON_SLIP',
            'CCTV',
            'PLAYGROUND',
            'ROOFTOP',
            'TERRACE',
            'TRAINING_GROUND',
            'YARD',
          ].map((code) => (
            <IconWithLabel key={code} code={code as 강아지_안전_시설} />
          ))}
        </div>
      </div>
      {/* 방문객 편의 시설 */}
      <div>
        <div className='mb-3'>
          <span className='body1-bold'>방문객 편의·시설</span>
        </div>
        <div className='grid grid-cols-4 gap-3'>
          {[
            'PICK_DROP',
            'DIARY',
            'DOG_SHOP',
            'DOG_CAFE',
            'PARKING',
            'VALET',
          ].map((code) => (
            <IconWithLabel key={code} code={code as 방문객_편의_시설} />
          ))}
        </div>
      </div>
      {/* 웹사이트 SNS */}
      <WebSiteInfo />
      {/* 위치 */}
      <DogSchoolLocationMap address='서울특별시 강북구 미아동 345-2' />
      {/* 최종 정보 업데이트 */}
      <LastUpdatedSection lastUpdated='2025-04-29' />
    </div>
  );
}
