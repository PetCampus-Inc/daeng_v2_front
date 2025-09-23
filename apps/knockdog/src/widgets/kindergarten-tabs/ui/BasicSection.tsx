'use client';

import { ExternalLinksCard } from '@features/kindergarten-basic';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { LocationMap, ServiceTagBadge } from '@features/kindergarten-basic';
import { OperationHoursCard } from '@features/kindergarten-basic';
import { useKindergartenBasicQuery } from '@features/kindergarten-basic';

function BasicSection() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  if (!id) throw new Error('Company ID is required for basic section');

  const { data: kindergartenBasic } = useKindergartenBasicQuery(id);

  const {
    dogBreeds,
    dogServices,
    dogSafetyFacilities,
    operationTimes,
    visitorAmenities,
    lastUpdatedAt,
    roadAddress,
    coord,
    homepageUrl,
    instagramUrl,
    youtubeUrl,
  } = kindergartenBasic || {};

  return (
    <div className='mb-12 mt-7 flex flex-col gap-12 px-4'>
      {/* 운영시간 */}
      <div>
        <div className='mb-3'>
          <span className='body1-bold'>운영시간</span>
        </div>
        {operationTimes?.map((operationTime) => (
          <OperationHoursCard key={operationTime.serviceTags} operationTime={operationTime} />
        ))}
      </div>

      {/* 견종 */}
      {dogBreeds && dogBreeds.length > 0 && (
        <div>
          <div className='mb-3'>
            <span className='body1-bold'>견종</span>
          </div>
          <div className='grid grid-cols-4 gap-3'>
            {dogBreeds?.map((code) => (
              <ServiceTagBadge key={code} code={code} />
            ))}
          </div>
        </div>
      )}

      {/* 강아지 서비스 */}
      {dogServices && dogServices.length > 0 && (
        <div>
          <div className='mb-3'>
            <span className='body1-bold'>강아지 서비스</span>
          </div>
          <div className='grid grid-cols-4 gap-3'>
            {dogServices?.map((code) => (
              <ServiceTagBadge key={code} code={code} />
            ))}
          </div>
        </div>
      )}

      {/* 강아지 안전시설 */}
      {dogSafetyFacilities && dogSafetyFacilities.length > 0 && (
        <div>
          <div className='mb-3'>
            <span className='body1-bold'>강아지 안전·시설</span>
          </div>
          <div className='grid grid-cols-4 gap-3'>
            {dogSafetyFacilities?.map((code) => (
              <ServiceTagBadge key={code} code={code} />
            ))}
          </div>
        </div>
      )}

      {/* 방문객 편의 시설 */}
      {visitorAmenities && visitorAmenities.length > 0 && (
        <div>
          <div className='mb-3'>
            <span className='body1-bold'>방문객 편의·시설</span>
          </div>
          <div className='grid grid-cols-4 gap-3'>
            {visitorAmenities?.map((code) => (
              <ServiceTagBadge key={code} code={code} />
            ))}
          </div>
        </div>
      )}

      {/* 웹사이트 SNS */}
      <ExternalLinksCard website={homepageUrl} instagram={instagramUrl} youtube={youtubeUrl} />
      {/* 위치 */}
      <LocationMap address={roadAddress || ''} coord={coord || { lat: 0, lng: 0 }} />
      {/* 최종 정보 업데이트 */}
      <div className='flex justify-between py-4'>
        <div className='flex flex-col'>
          <span className='body1-bold'>최종 정보 업데이트</span>
          <span className='body2-regular text-text-tertiary'>{lastUpdatedAt}</span>
        </div>
        <div>
          <Link
            href={`/company/${id}/report-info-update`}
            className='text-text-accent caption2-semibold border-accent rounded-lg border px-3 py-2'
          >
            정보 수정 제보하기
          </Link>
        </div>
      </div>
    </div>
  );
}

export { BasicSection };
