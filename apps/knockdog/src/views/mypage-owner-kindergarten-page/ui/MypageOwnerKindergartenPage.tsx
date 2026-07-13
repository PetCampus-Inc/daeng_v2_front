'use client';

import { useState } from 'react';
import { Divider, Tabs, TabsList, TabsTrigger, TabsContent } from '@knockdog/ui';
import Image from 'next/image';

import { Header } from '@widgets/Header';
import { PricingSection } from '@widgets/kindergarten-tabs';
import {
  ExternalLinksCard,
  LocationMap,
  OperationHoursCard,
  ServiceTagBadge,
  useKindergartenBasicQuery,
} from '@features/kindergarten-basic';
import { ownerMypageContent, useOwnerKindergarten } from '@features/role-conversion';
import { SERVICE_ICON_MAP } from '@entities/kindergarten';
import { SafeArea } from '@shared/ui/safe-area';

const TAB = {
  OPERATION: 'operation',
  PRICING: 'pricing',
} as const;

interface InfoRowProps {
  label: string;
  value: string;
}

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <div className='flex items-center justify-between gap-x-4 p-4'>
      <span className='body1-medium text-text-tertiary shrink-0'>{label}</span>
      {value ? (
        <span className='body1-bold text-text-primary truncate text-right'>{value}</span>
      ) : (
        <span className='body1-regular text-text-primary text-right'>
          {ownerMypageContent.noConfirmedInfoText}
        </span>
      )}
    </div>
  );
}

interface BasicInfoCardProps {
  name: string;
  address: string;
}

function BasicInfoCard({ name, address }: BasicInfoCardProps) {
  const rows: InfoRowProps[] = [
    { label: ownerMypageContent.kindergartenNameLabel, value: name },
    { label: ownerMypageContent.kindergartenAddressLabel, value: address },
    // 전화번호는 basic 응답에 없어 미확인 처리.
    { label: ownerMypageContent.kindergartenPhoneLabel, value: '' },
  ];

  return (
    <div className='px-4 pt-6'>
      <span className='body1-bold text-text-primary'>
        {ownerMypageContent.kindergartenBasicInfoTitle}
      </span>
      <div className='mt-2 flex flex-col'>
        {rows.map((row, index) => (
          <div key={row.label}>
            <InfoRow label={row.label} value={row.value} />
            {index < rows.length - 1 ? <Divider /> : null}
          </div>
        ))}
      </div>
    </div>
  );
}

interface ServiceGroupProps {
  title: string;
  codes?: Parameters<typeof ServiceTagBadge>[0]['code'][];
}

function ServiceGroup({ title, codes }: ServiceGroupProps) {
  const visibleCodes = codes?.filter((code) => SERVICE_ICON_MAP[code]) ?? [];
  if (visibleCodes.length === 0) return null;

  return (
    <div>
      <div className='mb-3'>
        <span className='body1-bold'>{title}</span>
      </div>
      <div className='grid grid-cols-4 gap-3'>
        {visibleCodes.map((code) => (
          <ServiceTagBadge key={code} code={code} />
        ))}
      </div>
    </div>
  );
}

interface SelectedOperationContentProps {
  kindergartenId: string;
  name: string;
  fallbackAddress: string;
}

/** SELECTED 유치원: basic API 데이터를 이 페이지 UI로 매핑 */
function SelectedOperationContent({ kindergartenId, name, fallbackAddress }: SelectedOperationContentProps) {
  const { data } = useKindergartenBasicQuery(kindergartenId);

  const {
    roadAddress,
    coord,
    operationTimes,
    dogBreeds,
    dogServices,
    dogSafetyFacilities,
    visitorAmenities,
    homepageUrl,
    instagramUrl,
    youtubeUrl,
    lastUpdatedAt,
  } = data ?? {};

  return (
    <>
      <BasicInfoCard name={name} address={roadAddress ?? fallbackAddress} />

      <div className='mt-7 mb-12 flex flex-col gap-12 px-4'>
        {operationTimes && operationTimes.length > 0 && (
          <div>
            <div className='mb-3'>
              <span className='body1-bold'>운영시간</span>
            </div>
            {operationTimes.map((operationTime) => (
              <OperationHoursCard key={operationTime.serviceTags} operationTime={operationTime} />
            ))}
          </div>
        )}

        <ServiceGroup title='견종' codes={dogBreeds} />
        <ServiceGroup title='강아지 서비스' codes={dogServices} />
        <ServiceGroup title='강아지 안전·시설' codes={dogSafetyFacilities} />
        <ServiceGroup title='방문객 편의·시설' codes={visitorAmenities} />

        <ExternalLinksCard website={homepageUrl} instagram={instagramUrl} youtube={youtubeUrl} />

        {roadAddress && coord && <LocationMap address={roadAddress} coord={coord} />}

        {lastUpdatedAt && (
          <div className='flex flex-col py-4'>
            <span className='body1-bold'>최종 정보 업데이트</span>
            <span className='body2-regular text-text-tertiary'>{lastUpdatedAt}</span>
          </div>
        )}
      </div>
    </>
  );
}

function MypageOwnerKindergartenPage() {
  const { name, address, source, kindergartenId, imageUrl, usesDefaultImage } =
    useOwnerKindergarten();
  const [activeTab, setActiveTab] = useState<string>(TAB.OPERATION);

  const isSelected = source === 'search';

  return (
    <SafeArea edges={['bottom']} className='flex h-screen flex-col'>
      <Header>
        <Header.LeftSection>
          <Header.BackButton />
        </Header.LeftSection>
        <Header.Title>{ownerMypageContent.kindergartenPageTitle}</Header.Title>
      </Header>

      <Tabs value={activeTab} onValueChange={setActiveTab} className='flex flex-1 flex-col overflow-hidden'>
        <TabsList>
          <TabsTrigger value={TAB.OPERATION}>
            {ownerMypageContent.kindergartenOperationTabLabel}
          </TabsTrigger>
          <TabsTrigger value={TAB.PRICING}>
            {ownerMypageContent.kindergartenPricingTabLabel}
          </TabsTrigger>
        </TabsList>

        <div className='flex-1 overflow-y-auto'>
          <TabsContent value={TAB.OPERATION}>
            <div className='px-4 pt-4'>
              <div className='radius-r3 relative h-[206px] w-full overflow-hidden'>
                {usesDefaultImage || !imageUrl ? (
                  <div className='bg-fill-secondary-50 size-full' />
                ) : (
                  <Image src={imageUrl} alt={name} fill sizes='100vw' className='object-cover' priority />
                )}
              </div>
            </div>

            {isSelected && kindergartenId ? (
              <SelectedOperationContent kindergartenId={kindergartenId} name={name} fallbackAddress={address} />
            ) : (
              <>
                <BasicInfoCard name={name} address={address} />
                <NoConfirmedSections />
              </>
            )}
          </TabsContent>

          <TabsContent value={TAB.PRICING}>
            {isSelected && kindergartenId ? (
              <PricingSection kindergartenId={kindergartenId} />
            ) : (
              <NoConfirmedSections />
            )}
          </TabsContent>
        </div>
      </Tabs>
    </SafeArea>
  );
}

function NoConfirmedSections() {
  return (
    <div className='flex items-center justify-center px-4 py-16'>
      <span className='body1-regular text-text-tertiary'>
        {ownerMypageContent.noConfirmedInfoText}
      </span>
    </div>
  );
}

export { MypageOwnerKindergartenPage };
