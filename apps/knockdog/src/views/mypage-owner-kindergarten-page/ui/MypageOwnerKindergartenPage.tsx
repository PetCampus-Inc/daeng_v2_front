'use client';

import { useState, type ReactNode } from 'react';
import {
  ActionButton,
  Divider,
  Icon,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@knockdog/ui';
import Image from 'next/image';
import { MANUAL_STUB_BASIC, MANUAL_STUB_PHONE } from '@views/mypage-owner-kindergarten-page/model/manualKindergartenStub';

import { Header } from '@widgets/Header';
import {
  OperationHoursCard,
  ServiceTagBadge,
  useKindergartenBasicQuery,
} from '@features/kindergarten-basic';
import { ownerMypageContent, useOwnerKindergarten } from '@features/role-conversion';
import { SERVICE_ICON_MAP, type KindergartenBasic } from '@entities/kindergarten';
import { route } from '@shared/constants/route';
import { useStackNavigation } from '@shared/lib/bridge';
import { SafeArea } from '@shared/ui/safe-area';
import { OwnerPricingContent } from '@views/mypage-owner-kindergarten-page/ui/OwnerPricingContent';

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
  // 전화번호는 basic 응답에 없어 기본 미확인. (stub 확인용으로만 주입)
  phone?: string;
}

function BasicInfoCard({ name, address, phone = '' }: BasicInfoCardProps) {
  const rows: InfoRowProps[] = [
    { label: ownerMypageContent.kindergartenNameLabel, value: name },
    { label: ownerMypageContent.kindergartenAddressLabel, value: address },
    { label: ownerMypageContent.kindergartenPhoneLabel, value: phone },
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

interface SectionBlockProps {
  title: string;
  children: ReactNode;
}

function SectionBlock({ title, children }: SectionBlockProps) {
  return (
    <div>
      <div className='mb-3'>
        <span className='body1-bold'>{title}</span>
      </div>
      {children}
    </div>
  );
}

function SectionNoData() {
  return (
    <span className='body1-regular text-text-tertiary'>{ownerMypageContent.noConfirmedInfoText}</span>
  );
}

interface ServiceGroupProps {
  title: string;
  codes?: Parameters<typeof ServiceTagBadge>[0]['code'][];
}

function ServiceGroup({ title, codes }: ServiceGroupProps) {
  const visibleCodes = codes?.filter((code) => SERVICE_ICON_MAP[code]) ?? [];

  return (
    <SectionBlock title={title}>
      {visibleCodes.length > 0 ? (
        <div className='grid grid-cols-4 gap-3'>
          {visibleCodes.map((code) => (
            <ServiceTagBadge key={code} code={code} />
          ))}
        </div>
      ) : (
        <SectionNoData />
      )}
    </SectionBlock>
  );
}

interface LinkRowProps {
  label: string;
  value?: string;
}

function LinkRow({ label, value }: LinkRowProps) {
  return (
    <div className='flex'>
      <dt className='body2-bold text-text-tertiary mr-3 min-w-[76px] flex-shrink-0'>{label}</dt>
      <dd className='body2-regular overflow-wrap-anywhere flex-1 break-all'>
        {value ? (
          <a className='underline' href={value} target='_blank' rel='noopener noreferrer'>
            {value}
          </a>
        ) : (
          <span className='text-text-tertiary'>{ownerMypageContent.noConfirmedInfoText}</span>
        )}
      </dd>
    </div>
  );
}

interface OperationSectionsProps {
  data?: KindergartenBasic;
}

/** basic 데이터(운영시간·서비스·시설·웹사이트)를 이 페이지 UI로 매핑. 값 없으면 '확인된 정보가 없습니다.'로 통일 */
function OperationSections({ data }: OperationSectionsProps) {
  const {
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
    <div className='mt-7 flex flex-col gap-12 px-4'>
      <SectionBlock title='운영시간'>
        {operationTimes && operationTimes.length > 0 ? (
          operationTimes.map((operationTime) => (
            <OperationHoursCard key={operationTime.serviceTags} operationTime={operationTime} />
          ))
        ) : (
          <SectionNoData />
        )}
      </SectionBlock>

      <ServiceGroup title='견종' codes={dogBreeds} />
      <ServiceGroup title='강아지 서비스' codes={dogServices} />
      <ServiceGroup title='강아지 안전·시설' codes={dogSafetyFacilities} />
      <ServiceGroup title='방문객 편의·시설' codes={visitorAmenities} />

      <SectionBlock title='웹사이트·SNS'>
        <dl className='bg-primitive-neutral-50 flex flex-col gap-4 rounded-lg p-4'>
          <LinkRow label='홈페이지' value={homepageUrl} />
          <LinkRow label='인스타그램' value={instagramUrl} />
          <LinkRow label='유튜브' value={youtubeUrl} />
        </dl>
      </SectionBlock>

      <div className='flex flex-col py-4'>
        <span className='body1-bold'>최종 정보 업데이트</span>
        <span className='body2-regular text-text-tertiary'>
          {lastUpdatedAt || ownerMypageContent.noConfirmedInfoText}
        </span>
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

  return (
    <>
      <BasicInfoCard name={name} address={data?.roadAddress ?? fallbackAddress} />
      <OperationSections data={data} />
    </>
  );
}

function MypageOwnerKindergartenPage() {
  const { push } = useStackNavigation();
  const { name, address, source, kindergartenId, imageUrl, usesDefaultImage } =
    useOwnerKindergarten();
  const [activeTab, setActiveTab] = useState<string>(TAB.OPERATION);

  const isSelected = source === 'search';

  const handleEditClick = () => {
    push({ pathname: route.mypage.kindergarten.edit.root });
  };

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
              // TODO(임시): MANUAL은 실데이터가 없어 stub으로 UI 전체 노출. BE 연동 시 제거.
              <>
                <BasicInfoCard name={name} address={address} phone={MANUAL_STUB_PHONE} />
                <OperationSections data={MANUAL_STUB_BASIC} />
              </>
            )}
          </TabsContent>

          <TabsContent value={TAB.PRICING}>
            <OwnerPricingContent
              kindergartenId={
                isSelected && kindergartenId ? String(kindergartenId) : undefined
              }
            />
          </TabsContent>
          {/* TODO: 유치원 정보 수정 플로우 추가 연동 */}
          <div className='flex items-center justify-center px-4 pt-4 pb-10'>
            <ActionButton
              type='button'
              size='medium'
              variant='tertiaryFill'
              className='w-[136px]'
              onClick={handleEditClick}
            >
              <Icon icon='Edit' className='size-5' />
              {ownerMypageContent.editInfoButtonLabel}
            </ActionButton>
          </div>
        </div>
      </Tabs>
    </SafeArea>
  );
}

export { MypageOwnerKindergartenPage };
