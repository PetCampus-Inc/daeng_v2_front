'use client';

import { useParams } from 'next/navigation';
import { overlay } from 'overlay-kit';
import { ActionButton } from '@knockdog/ui';
import { useStackNavigation } from '@shared/lib/bridge';
import { toast } from '@shared/ui/toast';
import { PhotoUploader } from '@shared/ui/photo-uploader';
import { ReportOptionCard } from '@entities/reporting';
import { useKindergartenBasicQuery } from '@features/kindergarten-basic';
import { Header } from '@widgets/Header';
import { useMoveImageMutation } from '@shared/lib/media';
import { AddressSelectMapSheet } from './AddressSelectMapSheet';
import { AddressChangeSection } from './AddressChangeSection';
import { checkOptions } from '../model/checkOptions';
import { useReportingForm } from '../model/useReportingForm';
import { useReportingMutate } from '../api/useReportingMutate';
import type { AddressData } from '@entities/address';

type CheckedKey = (typeof checkOptions)[number]['key'];

const MAX_UPLOAD_COUNT = 3;
const PHOTO_UPLOAD_KEYS: CheckedKey[] = ['closed', 'price', 'phone', 'time'];

function ReportingKindergartenUpdate() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const { data: kindergartenBasic } = useKindergartenBasicQuery(id!);
  const roadAddress = kindergartenBasic?.roadAddress ?? null;

  const { pushForResult, back } = useStackNavigation();
  const { isChecked, toggleCheck, newAddress, setNewAddress, setFiles, reportingParams, isFormValid, files } =
    useReportingForm();

  const { mutateAsync: moveImageAsync } = useMoveImageMutation();

  const { mutate: reportingMutate, isPending } = useReportingMutate(id!, reportingParams, {
    onSuccess: () => {
      toast({
        title: '제보가 성공적으로 접수 되었어요!',
        type: 'success',
        shape: 'square',
        position: 'bottom-above-nav',
      });

      back();
    },
    onError: (error: Error) => {
      toast({
        title: '제보 접수에 실패했어요',
        description: error.message,
        type: 'default',
        shape: 'square',
        position: 'bottom-above-nav',
      });
    },
  });

  if (!id) return null;

  const handleAddressSelectMapSheet = () => {
    overlay.open(({ isOpen, close }) => (
      <AddressSelectMapSheet
        isOpen={isOpen}
        close={close}
        defaultLocation={{ lat: 37.3595704, lng: 127.105399, name: roadAddress ?? '' }}
        onSelect={(location) => {
          setNewAddress(location.name);
        }}
      />
    ));
  };

  const handleManualAddress = async () => {
    try {
      const result = await pushForResult<AddressData>({
        pathname: `/kindergarten/${id}/report-info-update/manual-address`,
      });

      if (result) {
        setNewAddress(result.roadAddr);
        toggleCheck('address', true);
      }
    } catch (error) {
      console.error('[handleManualAddress] Error:', error);
    }
  };

  const getImagePath = (key: CheckedKey): string => {
    const pathMap: Record<CheckedKey, string> = {
      closed: `kindergarten/${id}/reporting/closure-status`,
      price: `kindergarten/${id}/reporting/price`,
      phone: `kindergarten/${id}/reporting/phone-number`,
      time: `kindergarten/${id}/reporting/business-hours`,
      address: '',
    };
    return pathMap[key];
  };

  const extractPathFromUrl = (urlOrPath: string): string => {
    try {
      const url = new URL(urlOrPath);
      // pathname에서 앞의 '/' 제거
      return url.pathname.startsWith('/') ? url.pathname.slice(1) : url.pathname;
    } catch {
      // URL이 아닌 경우 (이미 경로 형식) 그대로 반환
      return urlOrPath;
    }
  };

  const handleSubmit = async () => {
    if (!id || !isFormValid) return;

    try {
      // 이미지 이동 작업 수집 및 새로운 key 수집
      const movedKeys: {
        businessChange?: string[];
        priceChange?: string[];
        phoneChange?: string[];
        hoursChange?: string[];
      } = {};

      if (files.closed.length > 0) {
        const results = await Promise.all(
          files.closed.map((asset) => moveImageAsync({ key: asset.key, path: getImagePath('closed') }))
        );
        movedKeys.businessChange = results
          .map((res) => res.data)
          .filter((key): key is string => !!key)
          .map(extractPathFromUrl);
      }

      if (files.price.length > 0) {
        const results = await Promise.all(
          files.price.map((asset) => moveImageAsync({ key: asset.key, path: getImagePath('price') }))
        );
        movedKeys.priceChange = results
          .map((res) => res.data)
          .filter((key): key is string => !!key)
          .map(extractPathFromUrl);
      }

      if (files.phone.length > 0) {
        const results = await Promise.all(
          files.phone.map((asset) => moveImageAsync({ key: asset.key, path: getImagePath('phone') }))
        );
        movedKeys.phoneChange = results
          .map((res) => res.data)
          .filter((key): key is string => !!key)
          .map(extractPathFromUrl);
      }

      if (files.time.length > 0) {
        const results = await Promise.all(
          files.time.map((asset) => moveImageAsync({ key: asset.key, path: getImagePath('time') }))
        );
        movedKeys.hoursChange = results
          .map((res) => res.data)
          .filter((key): key is string => !!key)
          .map(extractPathFromUrl);
      }

      // 이동된 key와 주소를 포함한 최종 파라미터 생성
      const finalParams = {
        ...movedKeys,
        ...(newAddress?.trim() && { address: newAddress }),
      };

      // 실제 API 호출
      reportingMutate(finalParams);
    } catch (error) {
      console.error('[handleSubmit] Image move error:', error);
      toast({
        title: '이미지 이동에 실패했어요',
        description: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
        type: 'default',
        shape: 'square',
        position: 'bottom-above-nav',
      });
    }
  };

  const renderOptionContent = (key: CheckedKey) => {
    if (PHOTO_UPLOAD_KEYS.includes(key)) {
      return (
        <div className='mt-5 px-4'>
          <PhotoUploader
            maxCount={MAX_UPLOAD_COUNT}
            onChange={(files) => setFiles(key as 'closed' | 'price' | 'phone' | 'time', files)}
          />
        </div>
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
        <Header withSpacing={false}>
          <Header.LeftSection>
            <Header.BackButton />
          </Header.LeftSection>
          <Header.Title>정보 수정 제보하기</Header.Title>
        </Header>
      </div>

      <div>
        <div className='h-[calc(100vh-77px)]'>
          <div className='label-medium text-text-secondary bg-neutral-50 px-4 pt-[10px] pb-3'>
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

      <div className='fixed right-0 bottom-0 left-0 z-10 flex w-full items-center gap-1 bg-white p-4'>
        <ActionButton disabled={!isFormValid || isPending} onClick={handleSubmit}>
          정보 수정 제보하기
        </ActionButton>
      </div>
    </>
  );
}

export { ReportingKindergartenUpdate };
