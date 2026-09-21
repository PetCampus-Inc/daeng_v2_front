'use client';

import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import { useSearchParams } from 'next/navigation';
import { overlay } from 'overlay-kit';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Icon,
} from '@knockdog/ui';

import { ownerKindergartenNewsContent } from '@views/owner-kindergarten-news-page/config/ownerKindergartenNewsContent';
import {
  dismissOwnerKindergartenNewsSettingsBanner,
  isOwnerKindergartenNewsSettingsBannerDismissed,
} from '@views/owner-kindergarten-news-page/lib/ownerKindergartenNewsSettingsBanner';
import {
  createOwnerKindergartenNewsItem,
  getOwnerKindergartenNewsCount,
  subscribeOwnerKindergartenNews,
} from '@views/owner-kindergarten-news-page/model/ownerKindergartenNewsStore';
import { OwnerKindergartenNewsWriteSettingsSheet } from '@views/owner-kindergarten-news-page/ui/OwnerKindergartenNewsWriteSettingsSheet';
import { route } from '@shared/constants/route';
import { useNativeBackHandler, useStackNavigation } from '@shared/lib/bridge';
import { useImagePicker } from '@shared/lib/media';
import { toast } from '@shared/ui/toast';
import { Header } from '@widgets/Header';

const TITLE_MAX = ownerKindergartenNewsContent.write.titleMaxLength;
/** 배너 유치원 키 — schoolId 연동 전 mock 기본값 */
const BANNER_KINDERGARTEN_KEY = 'default';

function showWriteSuccessToast() {
  const { submitSuccessToast } = ownerKindergartenNewsContent.write;

  toast({
    type: 'success',
    nativeTitle: submitSuccessToast.nativeTitle,
    titleParts: [
      { text: '새로운 ' },
      { text: '소식', accent: true },
      { text: '을 등록했어요' },
    ],
    title: (
      <>
        <span className='text-text-primary-inverse'>새로운 </span>
        <span className='text-text-accent'>소식</span>
        <span className='text-text-primary-inverse'>을 등록했어요</span>
      </>
    ),
  });
}

function showDraftSaveToast() {
  const { draftSaveToast } = ownerKindergartenNewsContent.write;

  toast({
    type: 'success',
    nativeTitle: draftSaveToast.nativeTitle,
    titleParts: [
      { text: '작성 중인 ' },
      { text: '소식', accent: true },
      { text: '을 임시저장했어요' },
    ],
    title: (
      <>
        <span className='text-text-primary-inverse'>작성 중인 </span>
        <span className='text-text-accent'>소식</span>
        <span className='text-text-primary-inverse'>을 임시저장했어요</span>
      </>
    ),
  });
}

/**
 * 원장 유치원 소식 등록
 * - 제목·본문 입력 시 등록 활성 (제목 최대 30자, 줄바꿈 불가)
 * - 소식 0건 + 배너 미숨김 시 공지 알림 배지 노출
 * - 설정/배너 설정 탭 → 글쓰기 설정 시트 + 배너 영구 숨김
 */
function OwnerKindergartenNewsWritePageContent() {
  const { write } = ownerKindergartenNewsContent;
  const { back, replace } = useStackNavigation();
  const { pickImage } = useImagePicker();
  const searchParams = useSearchParams();
  const forceEmpty = searchParams.get('empty') === '1';
  const kindergartenKey = BANNER_KINDERGARTEN_KEY;

  const newsCount = useSyncExternalStore(
    subscribeOwnerKindergartenNews,
    getOwnerKindergartenNewsCount,
    getOwnerKindergartenNewsCount
  );
  const effectiveNewsCount = forceEmpty ? 0 : newsCount;

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [isTitleLimitVisible, setIsTitleLimitVisible] = useState(false);
  const isExitDialogOpenRef = useRef(false);
  const titleRef = useRef<HTMLInputElement>(null);

  const canSubmit = title.trim().length > 0 && body.trim().length > 0;
  const isDirty = title.length > 0 || body.length > 0 || imageUrls.length > 0;

  useEffect(() => {
    const dismissed = isOwnerKindergartenNewsSettingsBannerDismissed(kindergartenKey);
    setShowBanner(effectiveNewsCount === 0 && !dismissed);
  }, [effectiveNewsCount, kindergartenKey]);

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  const leaveToList = useCallback(() => {
    void back();
  }, [back]);

  const goToListAfterSubmit = useCallback(() => {
    // empty=1 목 목록으로 돌아가면 방금 등록한 소식이 안 보임 → 쿼리 없이 replace
    void replace({ pathname: route.owner.news.root });
  }, [replace]);

  const handleBack = useCallback(() => {
    if (isSubmitting) return;

    if (!isDirty) {
      leaveToList();
      return;
    }

    if (isExitDialogOpenRef.current) return;
    isExitDialogOpenRef.current = true;

    overlay.open(({ isOpen, close }) => (
      <AlertDialog
        open={isOpen}
        onOpenChange={(open) => {
          if (!open) {
            isExitDialogOpenRef.current = false;
            close();
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{write.unsavedExitTitle}</AlertDialogTitle>
            <AlertDialogDescription>{write.unsavedExitDescription}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{write.unsavedExitCancelLabel}</AlertDialogCancel>
            <AlertDialogAction onClick={leaveToList}>{write.unsavedExitConfirmLabel}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    ));
  }, [isDirty, isSubmitting, leaveToList, write]);

  useNativeBackHandler(handleBack);

  const openSettingsSheet = useCallback(() => {
    if (showBanner) {
      dismissOwnerKindergartenNewsSettingsBanner(kindergartenKey);
      setShowBanner(false);
    }

    overlay.open(({ isOpen, close }) => (
      <OwnerKindergartenNewsWriteSettingsSheet isOpen={isOpen} close={close} />
    ));
  }, [kindergartenKey, showBanner]);

  const handleTitleChange = (value: string) => {
    const next = value.replace(/\n/g, '').slice(0, TITLE_MAX);
    setTitle(next);
    setIsTitleLimitVisible(next.length >= TITLE_MAX);
  };

  const handlePickPhoto = async () => {
    try {
      const result = await pickImage({
        source: 'library',
        mediaTypes: 'images',
        allowsMultipleSelection: true,
        selectionLimit: 10,
        skipUpload: true,
      });

      if (result.cancelled || result.assets.length === 0) return;

      const urls = result.assets
        .map((asset) => asset.uri)
        .filter((uri): uri is string => Boolean(uri));

      setImageUrls((current) => [...current, ...urls]);
    } catch {
      // 취소/권한 거부 — no-op
    }
  };

  const handleDraftSave = () => {
    if (!isDirty) return;
    showDraftSaveToast();
  };

  const submitNews = useCallback(async () => {
    if (!canSubmit || isSubmitting) return;

    setIsSubmitting(true);
    try {
      createOwnerKindergartenNewsItem({
        isAnnouncement: false,
        guardianTotalCount: 0,
        title: title.trim(),
        body: body.trim(),
        thumbnailUrl: imageUrls[0] ?? null,
        imageUrls,
      });
      showWriteSuccessToast();
      goToListAfterSubmit();
    } catch {
      overlay.open(({ isOpen, close }) => (
        <AlertDialog
          open={isOpen}
          onOpenChange={(open) => {
            if (!open) close();
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{write.submitFailedTitle}</AlertDialogTitle>
              <AlertDialogDescription>{write.submitFailedDescription}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{write.submitFailedCloseLabel}</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  close();
                  void submitNews();
                }}
              >
                {write.submitFailedRetryLabel}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ));
    } finally {
      setIsSubmitting(false);
    }
  }, [body, canSubmit, goToListAfterSubmit, imageUrls, isSubmitting, title, write]);

  const titleLengthHint = useMemo(() => {
    if (!isTitleLimitVisible) return null;
    return write.titleMaxLengthGuide;
  }, [isTitleLimitVisible, write.titleMaxLengthGuide]);

  return (
    <div data-testid='owner-kindergarten-news-write-root' className='bg-bg-0 flex h-full flex-col'>
      <Header>
        <Header.LeftSection>
          <Header.BackButton onClick={handleBack} />
        </Header.LeftSection>
        <Header.RightSection className='gap-x-3'>
          <button
            type='button'
            className='label-semibold text-text-primary radius-r1 px-2 py-1'
            onClick={handleDraftSave}
          >
            {write.draftSaveLabel}
          </button>
          <button
            type='button'
            disabled={!canSubmit || isSubmitting}
            className={`label-semibold radius-r1 px-2 py-1 ${
              canSubmit
                ? 'bg-fill-primary-500 text-text-primary-inverse'
                : 'bg-fill-secondary-100 text-text-caption'
            } disabled:opacity-100`}
            onClick={() => {
              void submitNews();
            }}
          >
            {write.submitLabel}
          </button>
        </Header.RightSection>
      </Header>

      <main className='flex min-h-0 flex-1 flex-col'>
        <div className='flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-4 py-5'>
          <div className='relative flex flex-col gap-2'>
            <input
              ref={titleRef}
              type='text'
              value={title}
              maxLength={TITLE_MAX}
              placeholder={write.titlePlaceholder}
              className='h2-extrabold text-text-primary caret-text-accent placeholder:text-text-caption w-full bg-transparent outline-none'
              onChange={(event) => handleTitleChange(event.target.value)}
            />
            {titleLengthHint ? (
              <p className='caption1-regular text-text-accent'>{titleLengthHint}</p>
            ) : null}
          </div>

          <textarea
            value={body}
            placeholder={write.bodyPlaceholder}
            className='body1-regular text-text-primary caret-text-accent placeholder:text-text-caption min-h-40 w-full flex-1 resize-none bg-transparent outline-none'
            onChange={(event) => setBody(event.target.value)}
          />

          {imageUrls.length > 0 ? (
            <div className='flex flex-wrap gap-2'>
              {imageUrls.map((url, index) => (
                // eslint-disable-next-line @next/next/no-img-element -- 로컬/피커 uri
                <img
                  key={`${url}-${index}`}
                  src={url}
                  alt=''
                  className='radius-r2 size-20 object-cover'
                />
              ))}
            </div>
          ) : null}
        </div>

        <div className='border-line-200 relative shrink-0 border-t bg-white px-4 py-3 pb-[max(0.75rem,var(--safe-area-inset-bottom,0px))]'>
          {showBanner ? (
            <div className='bg-text-primary absolute right-4 -top-[26px] z-10 flex items-center gap-3 rounded-full px-4 py-2'>
              <span className='caption1-semibold text-text-primary-inverse whitespace-nowrap'>
                {write.bannerText}
              </span>
              <button
                type='button'
                className='caption1-regular text-text-primary-inverse underline underline-offset-2'
                onClick={openSettingsSheet}
              >
                {write.bannerSettingsLabel}
              </button>
            </div>
          ) : null}

          <div className='flex items-center justify-between'>
            <button
              type='button'
              className='flex items-center gap-2'
              onClick={() => {
                void handlePickPhoto();
              }}
            >
              <Icon icon='Gallery' className='text-fill-secondary-700 size-7' />
              <span className='body1-medium text-text-secondary'>{write.photoLabel}</span>
            </button>

            <button
              type='button'
              className='flex items-center gap-2'
              aria-label={write.settingsAriaLabel}
              onClick={openSettingsSheet}
            >
              <span className='body1-medium text-text-secondary'>{write.settingsLabel}</span>
              {/* eslint-disable-next-line @next/next/no-img-element -- 디자인 제공 설정 아이콘(뱃지 포함) */}
              <img
                src={write.settingsIconSrc}
                alt=''
                width={28}
                height={28}
                className='size-7'
                draggable={false}
              />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

function OwnerKindergartenNewsWritePage() {
  return (
    <Suspense fallback={null}>
      <OwnerKindergartenNewsWritePageContent />
    </Suspense>
  );
}

export { OwnerKindergartenNewsWritePage };
