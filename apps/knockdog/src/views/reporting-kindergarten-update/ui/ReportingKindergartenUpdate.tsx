'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { overlay } from 'overlay-kit';

import { ActionButton } from '@knockdog/ui';
import { useStackNavigation } from '@shared/lib/bridge';
import { ReportOptionCard } from '@features/dog-school';
import { Header } from '@widgets/Header';
import { AddressSelectMapSheet } from './AddressSelectMapSheet';
import { PhotoUploadSection } from './PhotoUploadSection';
import { AddressChangeSection } from './AddressChangeSection';
import { checkOptions } from '../model/checkOptions';
import { useReportingForm } from '../model/useReportingForm';
import { useReportingMutate } from '../api/useReportingMutate';

type CheckedKey = (typeof checkOptions)[number]['key'];

const MAX_UPLOAD_COUNT = 3;
const PHOTO_UPLOAD_KEYS: CheckedKey[] = ['closed', 'price', 'phone', 'time'];

function ReportingKindergartenUpdate() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const roadAddress = searchParams?.get('roadAddress') ?? null;
  const id = params?.id;

  const { push, back } = useStackNavigation();
  const { isChecked, toggleCheck, newAddress, setNewAddress, setFiles, reportingParams, isFormValid } =
    useReportingForm();

  const { mutate: reportingMutate, isPending } = useReportingMutate(id!, reportingParams, {
    onSuccess: back,
  });

  if (!id) return null;

  const handleAddressSelectMapSheet = () => {
    overlay.open(({ isOpen, close }) => (
      <AddressSelectMapSheet
        isOpen={isOpen}
        close={close}
        defaultLocation={{ lat: 37.3595704, lng: 127.105399, name: roadAddress ?? '' }}
        onSelect={(location) => setNewAddress(location.name)}
      />
    ));
  };

  const handleManualAddress = () => {
    push({ pathname: `/kindergarten/${id}/report-info-update/manual-address` });
  };

  const renderOptionContent = (key: CheckedKey) => {
    if (PHOTO_UPLOAD_KEYS.includes(key)) {
      return (
        <PhotoUploadSection
          maxCount={MAX_UPLOAD_COUNT}
          onChange={(files) => setFiles(key as 'closed' | 'price' | 'phone' | 'time', files)}
        />
      );
    }

    if (key === 'address') {
      return (
        <AddressChangeSection
          currentAddress={roadAddress}
          newAddress={newAddress}
          onAddressChange={setNewAddress}
          onMapSelect={handleAddressSelectMapSheet}
          onManualInput={handleManualAddress}
        />
      );
    }

    return null;
  };

  return (
    <>
      <div className='sticky top-0 z-10'>
        <Header>
          <Header.LeftSection>
            <Header.BackButton />
          </Header.LeftSection>
          <Header.Title>정보 수정 제보하기</Header.Title>
        </Header>
      </div>

      <div>
        <div className='h-[calc(100vh-77px)]'>
          <div className='label-medium text-text-secondary bg-neutral-50 px-4 pb-3 pt-[10px]'>
            최대 <span className='text-text-accent'>{MAX_UPLOAD_COUNT}</span>장까지 등록 가능
          </div>

          <div className='h-[calc(100vh-167px)] overflow-y-auto'>
            {checkOptions.map((opt) => (
              <ReportOptionCard
                key={opt.key}
                checked={isChecked(opt.key)}
                title={opt.title}
                description={opt.description}
                onCheckedChange={(v) => toggleCheck(opt.key, v)}
              >
                {renderOptionContent(opt.key)}
              </ReportOptionCard>
            ))}
          </div>
        </div>
      </div>

      <div className='fixed bottom-0 left-0 right-0 z-10 flex w-screen items-center gap-1 bg-white p-4'>
        <ActionButton disabled={!isFormValid || isPending} onClick={() => reportingMutate(reportingParams)}>
          정보 수정 제보하기
        </ActionButton>
      </div>
    </>
  );
}

export { ReportingKindergartenUpdate };
