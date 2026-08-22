'use client';

import { useEffect, useState, type ReactNode } from 'react';
import {
  ActionButton,
  Divider,
  Icon,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@knockdog/ui';
import { useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import { overlay } from 'overlay-kit';
import { OwnerPricingContent } from '@views/mypage-owner-kindergarten-page/ui/OwnerPricingContent';

import { Header } from '@widgets/Header';
import { OperationHoursCard, ServiceTagBadge } from '@features/kindergarten-basic';
import { ownerMypageContent, useOwnerKindergarten } from '@features/role-conversion';
import { SERVICE_ICON_MAP, type KindergartenBasic } from '@entities/kindergarten';
import {
  formatLastUpdatedAt,
  ownerSchoolProfileQueryKey,
} from '@entities/owner-school';
import { pricingQueryKeys } from '@entities/pricing/config/pricingQueryKeys';
import { useUserStore } from '@entities/user';
import { route } from '@shared/constants/route';
import { useStackNavigation } from '@shared/lib/bridge';
import { ImageGalleryViewer } from '@shared/ui/image-gallery-viewer';
import { SafeArea } from '@shared/ui/safe-area';

const TAB = {
  OPERATION: 'operation',
  PRICING: 'pricing',
} as const;

interface InfoRowProps {
  label: string;
  value?: string;
  lines?: string[];
}

function InfoRow({ label, value, lines }: InfoRowProps) {
  const displayLines = (lines ?? (value ? [value] : [])).filter(Boolean);
  const isMultiline = displayLines.length > 1;

  return (
    <div className={`flex justify-between gap-x-4 p-4 ${isMultiline ? 'items-start' : 'items-center'}`}>
      <span className='body1-medium text-text-tertiary shrink-0'>{label}</span>
      {displayLines.length > 0 ? (
        <div className='flex min-w-0 flex-1 flex-col items-end'>
          {displayLines.map((line) => (
            <span key={line} className='body1-bold text-text-primary w-full truncate text-right'>
              {line}
            </span>
          ))}
        </div>
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
  addressDetail?: string;
  phone?: string;
}

function BasicInfoCard({ name, address, addressDetail = '', phone = '' }: BasicInfoCardProps) {
  return (
    <div className='px-4 pt-6'>
      <span className='body1-bold text-text-primary'>
        {ownerMypageContent.kindergartenBasicInfoTitle}
      </span>
      <div className='mt-2 flex flex-col'>
        <InfoRow label={ownerMypageContent.kindergartenNameLabel} value={name} />
        <Divider />
        <InfoRow
          label={ownerMypageContent.kindergartenAddressLabel}
          lines={[address, addressDetail]}
        />
        <Divider />
        <InfoRow label={ownerMypageContent.kindergartenPhoneLabel} value={phone} />
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

/** school profile → 운영시간·서비스·시설·웹사이트. 값 없으면 '확인된 정보가 없어요.' */
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
          {formatLastUpdatedAt(lastUpdatedAt) || ownerMypageContent.noConfirmedInfoText}
        </span>
      </div>
    </div>
  );
}

function MypageOwnerKindergartenPage() {
  const { push } = useStackNavigation();
  const queryClient = useQueryClient();
  const userId = useUserStore((state) => state.user?.userId);
  const {
    name,
    streetAddress,
    addressDetail,
    phoneNumber,
    source,
    kindergartenId,
    imageUrl,
    imageUrls,
    usesDefaultImage,
    basic,
    pricing,
    hasOwnerSavedPricing,
  } = useOwnerKindergarten();
  const [activeTab, setActiveTab] = useState<string>(TAB.OPERATION);

  const isSelected = source === 'search';

  // Stack WebView는 수정 화면 invalidate가 이 화면 캐시에 전달되지 않음 → 복귀 시 재조회
  useEffect(() => {
    async function refetchOwnerKindergarten() {
      if (document.visibilityState === 'hidden') return;

      await queryClient.invalidateQueries({
        queryKey: ownerSchoolProfileQueryKey(userId),
      });

      if (kindergartenId) {
        await queryClient.invalidateQueries({
          queryKey: pricingQueryKeys.byId(kindergartenId),
        });
      }
    }

    const handleRefresh = () => {
      refetchOwnerKindergarten().catch(() => undefined);
    };

    window.addEventListener('pageshow', handleRefresh);
    document.addEventListener('visibilitychange', handleRefresh);

    return () => {
      window.removeEventListener('pageshow', handleRefresh);
      document.removeEventListener('visibilitychange', handleRefresh);
    };
  }, [kindergartenId, queryClient, userId]);

  const handleEditClick = () => {
    if (activeTab === TAB.PRICING) {
      push({ pathname: route.mypage.kindergarten.edit.pricing.root });
      return;
    }

    push({ pathname: route.mypage.kindergarten.edit.root });
  };

  const handleImageClick = () => {
    if (imageUrls.length === 0) return;

    overlay.open(({ isOpen, close }) => (
      <ImageGalleryViewer
        isOpen={isOpen}
        close={close}
        images={imageUrls}
        ariaLabel='유치원 사진 보기'
      />
    ));
  };

  return (
    <SafeArea edges={['bottom']} className='flex h-dvh flex-col'>
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
            <div className='px-4 pt-5'>
              <button
                type='button'
                onClick={handleImageClick}
                disabled={imageUrls.length === 0}
                aria-label={imageUrls.length > 0 ? `유치원 사진 ${imageUrls.length}장 보기` : undefined}
                className='radius-r3 bg-bg-0 relative block h-[200px] w-full overflow-hidden'
              >
                {usesDefaultImage || !imageUrl ? (
                  <div className='bg-fill-secondary-50 size-full' />
                ) : (
                  <Image src={imageUrl} alt={name} fill sizes='100vw' className='object-cover' priority />
                )}

                {imageUrls.length > 0 ? (
                  <span className='caption1-semibold text-text-primary-inverse absolute right-4 bottom-4 rounded-full bg-[rgba(15,20,26,0.7)] px-2 py-1'>
                    1/{imageUrls.length}
                  </span>
                ) : null}
              </button>
            </div>

            <BasicInfoCard
              name={name}
              address={streetAddress}
              addressDetail={addressDetail}
              phone={phoneNumber}
            />
            <OperationSections data={basic} />
          </TabsContent>

          <TabsContent value={TAB.PRICING}>
            <OwnerPricingContent
              kindergartenId={isSelected && !hasOwnerSavedPricing ? kindergartenId : undefined}
              pricing={pricing}
            />
          </TabsContent>

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
