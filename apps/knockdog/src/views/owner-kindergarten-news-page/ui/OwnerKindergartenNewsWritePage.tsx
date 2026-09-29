'use client';

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
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
  clearOwnerKindergartenNewsDraft,
  loadOwnerKindergartenNewsDraft,
  saveOwnerKindergartenNewsDraft,
  type OwnerKindergartenNewsDraftImage,
} from '@views/owner-kindergarten-news-page/lib/ownerKindergartenNewsDraft';
import {
  createSchoolNews,
  NewsImageUploadError,
  saveSchoolNewsDraft,
  toKeptNewsImage,
  toNewsImageSource,
  updateSchoolNews,
  type NewsImageSource,
} from '@views/owner-kindergarten-news-page/lib/uploadOwnerNewsImages';
import { OWNER_KINDERGARTEN_NEWS_PAGE_SIZE } from '@views/owner-kindergarten-news-page/model/ownerKindergartenNews';
import { OwnerKindergartenNewsWriteSettingsSheet } from '@views/owner-kindergarten-news-page/ui/OwnerKindergartenNewsWriteSettingsSheet';
import { openOwnerKindergartenNewsImageAlert } from '@views/owner-kindergarten-news-page/ui/OwnerKindergartenNewsImageAlertDialog';

import { useOwnerHomeQuery } from '@entities/owner-home';
import {
  SCHOOL_NEWS_QUERY_KEY,
  deleteSchoolNewsDraft,
  parseSchoolId,
  schoolNewsDraftQueryKey,
  useSchoolNewsDraftQuery,
  useSchoolNewsInfiniteQuery,
  useSchoolNewsItem,
  type SchoolNewsImage,
} from '@entities/school-news';
import { useUserStore } from '@entities/user';

import { route } from '@shared/constants/route';
import { useNativeBackHandler, useStackNavigation } from '@shared/lib/bridge';
import { DelayedLoadingSpinner } from '@shared/ui/loading-spinner';
import { MiniPhotoBox } from '@shared/ui/photo-uploader';
import { useImagePicker } from '@shared/lib/media';
import { toast } from '@shared/ui/toast';
import { Header } from '@widgets/Header';

const TITLE_MAX = ownerKindergartenNewsContent.write.titleMaxLength;
const MAX_PHOTO_COUNT = ownerKindergartenNewsContent.write.maxPhotoCount;
/** schoolId를 아직 모르면 로컬 드래프트 키 */
const BANNER_KINDERGARTEN_KEY = 'default';

function unsourcedNewsImage(previewUrl: string): NewsImageSource {
  return {
    previewUrl,
    fileName: 'image.jpg',
    contentType: 'image/jpeg',
    size: 0,
  };
}

function toDraftNewsImage(image: OwnerKindergartenNewsDraftImage): NewsImageSource {
  return {
    previewUrl: image.previewUrl,
    fileName: image.fileName || 'image.jpg',
    contentType: 'image/jpeg',
    size: 0,
    imageId: image.imageId,
    tempKey: image.tempKey,
  };
}

function sourcesFromDraft(imageUrls: string[], images?: OwnerKindergartenNewsDraftImage[]) {
  if (images && images.length > 0) return images.map(toDraftNewsImage);
  return imageUrls.map(unsourcedNewsImage);
}

function sourcesFromServerDraft(images: SchoolNewsImage[]): NewsImageSource[] {
  return images.map((image) => ({
    previewUrl: image.url,
    fileName: image.originalFilename || 'image.jpg',
    contentType: 'image/jpeg',
    size: 0,
    ...(image.imageId != null ? { imageId: image.imageId } : {}),
    ...(image.tempKey ? { tempKey: image.tempKey } : {}),
  }));
}

function collectComposerImages(urls: string[], sources: NewsImageSource[]) {
  if (sources.length === urls.length) return sources;
  return urls.map((url, index) => sources[index] ?? unsourcedNewsImage(url));
}

type ComposerMode = 'write' | 'edit';

interface OwnerKindergartenNewsComposerProps {
  mode: ComposerMode;
  newsId?: string;
}

function showWriteSuccessToast() {
  const { submitSuccessToast } = ownerKindergartenNewsContent.write;

  toast({
    type: 'success',
    nativeTitle: submitSuccessToast.nativeTitle,
    titleParts: [
      { text: '새로운 소식', accent: true },
      { text: '을 등록했어요' },
    ],
    title: (
      <>
        <span className='text-text-accent'>새로운 소식</span>
        <span className='text-text-primary-inverse'>을 등록했어요</span>
      </>
    ),
  });
}

function showEditSuccessToast() {
  const { submitSuccessToast } = ownerKindergartenNewsContent.edit;

  toast({
    type: 'success',
    nativeTitle: submitSuccessToast.nativeTitle,
    titleParts: [
      { text: '소식', accent: true },
      { text: '을 수정했어요' },
    ],
    title: (
      <>
        <span className='text-text-accent'>소식</span>
        <span className='text-text-primary-inverse'>을 수정했어요</span>
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
      { text: '작성 중인 소식', accent: true },
      { text: '을 임시저장했어요' },
    ],
    title: (
      <>
        <span className='text-text-accent'>작성 중인 소식</span>
        <span className='text-text-primary-inverse'>을 임시저장했어요</span>
      </>
    ),
  });
}

function showDraftSaveFailedToast() {
  const { draftSaveFailedToast } = ownerKindergartenNewsContent.write;

  toast({
    nativeTitle: draftSaveFailedToast.nativeTitle,
    titleParts: [
      { text: '임시저장', accent: true },
      { text: '하지 못했어요 다시 시도해 주세요' },
    ],
    title: (
      <>
        <span className='text-text-accent'>임시저장</span>
        <span className='text-text-primary-inverse'>하지 못했어요 다시 시도해 주세요</span>
      </>
    ),
  });
}

function showMaxPhotoCountToast() {
  const { imageUpload, maxPhotoCount } = ownerKindergartenNewsContent.write;

  toast({
    nativeTitle: imageUpload.maxCountToast.nativeTitle,
    titleParts: [
      { text: '사진은 한 번에 최대 ' },
      { text: `${maxPhotoCount}장`, accent: true },
      { text: '까지 올릴 수 있어요' },
    ],
    title: (
      <>
        <span className='text-text-primary-inverse'>사진은 한 번에 최대 </span>
        <span className='text-text-accent'>{maxPhotoCount}장</span>
        <span className='text-text-primary-inverse'>까지 올릴 수 있어요</span>
      </>
    ),
    duration: 3000,
  });
}

/**
 * 원장 유치원 소식 등록/수정 공통
 * - write: 제목·본문 입력 시 등록 활성, 소식 0건 배너
 * - edit: [수정] 버튼, 알림 토글 매 진입 OFF, 수정 성공 토스트
 */
function OwnerKindergartenNewsComposer({ mode, newsId }: OwnerKindergartenNewsComposerProps) {
  const { write, edit } = ownerKindergartenNewsContent;
  const isEditMode = mode === 'edit';
  const { back, replace } = useStackNavigation();
  const { pickImage } = useImagePicker();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const forceEmpty = searchParams.get('empty') === '1';
  const userId = useUserStore((state) => state.user?.userId);
  const { data: ownerHome, isPending: isHomePending } = useOwnerHomeQuery({ userId });
  const schoolId = ownerHome?.school.schoolId ?? null;
  const parsedSchoolId = parseSchoolId(schoolId);
  const kindergartenKey = schoolId ?? BANNER_KINDERGARTEN_KEY;
  const newsQuery = useSchoolNewsInfiniteQuery({
    schoolId,
    size: OWNER_KINDERGARTEN_NEWS_PAGE_SIZE,
    enabled: !isEditMode && !forceEmpty,
  });
  const hasServerNews = (newsQuery.data?.pages ?? []).some((page) => page.items.length > 0);
  const { item: existingNews, isResolving: isExistingNewsResolving } = useSchoolNewsItem({
    schoolId,
    newsId,
    enabled: isEditMode && !isHomePending && Boolean(newsId),
  });
  const draftQuery = useSchoolNewsDraftQuery({
    schoolId,
    enabled: !isEditMode && !isHomePending,
  });

  const seedRef = useRef<{
    title: string;
    body: string;
    imageUrls: string[];
    sources: NewsImageSource[];
    isAnnouncement: boolean;
    notifyGuardiansOnUpload: boolean;
    hydrateKey: string | null;
  } | null>(null);

  if (!seedRef.current) {
    const draft =
      isEditMode && newsId ? loadOwnerKindergartenNewsDraft(kindergartenKey, newsId) : null;

    if (draft) {
      const sources = sourcesFromDraft(draft.imageUrls, draft.images);
      seedRef.current = {
        title: draft.title,
        body: draft.body,
        imageUrls: sources.map((source) => source.previewUrl),
        sources,
        isAnnouncement: draft.isAnnouncement,
        notifyGuardiansOnUpload: draft.notifyGuardiansOnUpload,
        hydrateKey: `${kindergartenKey}:${newsId ?? 'write'}`,
      };
    } else if (existingNews) {
      const sources = existingNews.images.map(toKeptNewsImage);
      seedRef.current = {
        title: existingNews.title,
        body: existingNews.body,
        imageUrls: sources.map((source) => source.previewUrl),
        sources,
        isAnnouncement: existingNews.isAnnouncement,
        notifyGuardiansOnUpload: false,
        hydrateKey: `${kindergartenKey}:${existingNews.id}`,
      };
    } else {
      seedRef.current = {
        title: '',
        body: '',
        imageUrls: [],
        sources: [],
        isAnnouncement: false,
        notifyGuardiansOnUpload: !isEditMode,
        hydrateKey: null,
      };
    }
  }

  const seed = seedRef.current;

  const [title, setTitle] = useState(seed.title);
  const [body, setBody] = useState(seed.body);
  const [imageUrls, setImageUrls] = useState<string[]>(seed.imageUrls);
  const imageSourcesRef = useRef<NewsImageSource[]>(seed.sources);
  const createAttemptRef = useRef<{ signature: string; idempotencyKey: string } | null>(null);
  const [isAnnouncement, setIsAnnouncement] = useState(seed.isAnnouncement);
  const [notifyGuardiansOnUpload, setNotifyGuardiansOnUpload] = useState(
    seed.notifyGuardiansOnUpload
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDraftSaving, setIsDraftSaving] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [isTitleLimitVisible, setIsTitleLimitVisible] = useState(false);
  const isExitDialogOpenRef = useRef(false);
  const isDraftSavingRef = useRef(false);
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const initialSnapshotRef = useRef({
    title: seed.title,
    body: seed.body,
    imageUrls: seed.imageUrls,
    isAnnouncement: seed.isAnnouncement,
    notifyGuardiansOnUpload: seed.notifyGuardiansOnUpload,
  });
  const hydratedKeyRef = useRef<string | null>(seed.hydrateKey);

  /** params/스토어 준비 후 드래프트 → 기존 소식 순 hydrate */
  useEffect(() => {
    const hydrateKey = isEditMode
      ? newsId
        ? `${kindergartenKey}:${newsId}`
        : null
      : `${kindergartenKey}:write`;

    if (!hydrateKey || hydratedKeyRef.current === hydrateKey) return;

    if (isEditMode) {
      if (!existingNews) return;

      const draft = loadOwnerKindergartenNewsDraft(kindergartenKey, existingNews.id);
      if (draft) {
        const sources = sourcesFromDraft(draft.imageUrls, draft.images);
        setTitle(draft.title);
        setBody(draft.body);
        setImageUrls(sources.map((source) => source.previewUrl));
        imageSourcesRef.current = sources;
        setIsAnnouncement(draft.isAnnouncement);
        setNotifyGuardiansOnUpload(draft.notifyGuardiansOnUpload);
        initialSnapshotRef.current = {
          title: draft.title,
          body: draft.body,
          imageUrls: sources.map((source) => source.previewUrl),
          isAnnouncement: draft.isAnnouncement,
          notifyGuardiansOnUpload: draft.notifyGuardiansOnUpload,
        };
      } else {
        const sources = existingNews.images.map(toKeptNewsImage);
        setTitle(existingNews.title);
        setBody(existingNews.body);
        setImageUrls(sources.map((source) => source.previewUrl));
        imageSourcesRef.current = sources;
        setIsAnnouncement(existingNews.isAnnouncement);
        setNotifyGuardiansOnUpload(false);
        initialSnapshotRef.current = {
          title: existingNews.title,
          body: existingNews.body,
          imageUrls: sources.map((source) => source.previewUrl),
          isAnnouncement: existingNews.isAnnouncement,
          notifyGuardiansOnUpload: false,
        };
      }

      hydratedKeyRef.current = hydrateKey;
      return;
    }

    if (isHomePending || draftQuery.isLoading) return;

    const draft = draftQuery.data;
    if (draft) {
      const sources = sourcesFromServerDraft(draft.images);
      const draftImageUrls = sources.map((source) => source.previewUrl);
      setTitle(draft.title);
      setBody(draft.body);
      setImageUrls(draftImageUrls);
      imageSourcesRef.current = sources;
      setIsAnnouncement(draft.isAnnouncement);
      setNotifyGuardiansOnUpload(draft.notifyGuardiansOnUpload);
      initialSnapshotRef.current = {
        title: draft.title,
        body: draft.body,
        imageUrls: draftImageUrls,
        isAnnouncement: draft.isAnnouncement,
        notifyGuardiansOnUpload: draft.notifyGuardiansOnUpload,
      };
    }
    hydratedKeyRef.current = hydrateKey;
  }, [
    draftQuery.data,
    draftQuery.isLoading,
    existingNews,
    isEditMode,
    isHomePending,
    kindergartenKey,
    newsId,
  ]);

  const canSubmit =
    title.trim().length > 0 && body.trim().length > 0 && parsedSchoolId != null && !isHomePending;
  const isDirty =
    title !== initialSnapshotRef.current.title ||
    body !== initialSnapshotRef.current.body ||
    isAnnouncement !== initialSnapshotRef.current.isAnnouncement ||
    notifyGuardiansOnUpload !== initialSnapshotRef.current.notifyGuardiansOnUpload ||
    imageUrls.length !== initialSnapshotRef.current.imageUrls.length ||
    imageUrls.some((url, index) => url !== initialSnapshotRef.current.imageUrls[index]);

  const submitLabel = isEditMode ? edit.submitLabel : write.submitLabel;
  const bannerText = isEditMode ? edit.bannerText : write.bannerText;
  const failedTitle = isEditMode ? edit.submitFailedTitle : write.submitFailedTitle;
  const failedDescription = isEditMode
    ? edit.submitFailedDescription
    : write.submitFailedDescription;
  const failedCloseLabel = isEditMode ? edit.submitFailedCloseLabel : write.submitFailedCloseLabel;
  const failedRetryLabel = isEditMode ? edit.submitFailedRetryLabel : write.submitFailedRetryLabel;

  useEffect(() => {
    const dismissed = isOwnerKindergartenNewsSettingsBannerDismissed(kindergartenKey);
    if (isEditMode) {
      setShowBanner(!dismissed);
      return;
    }
    if (forceEmpty) {
      setShowBanner(!dismissed);
      return;
    }
    if (newsQuery.isLoading) return;
    setShowBanner(!hasServerNews && !dismissed);
  }, [forceEmpty, hasServerNews, isEditMode, kindergartenKey, newsQuery.isLoading]);

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  useEffect(() => {
    const el = titleRef.current;
    if (!el) return;

    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 56)}px`;
  }, [title]);

  const leaveToList = useCallback(() => {
    void back();
  }, [back]);

  const goToDetailAfterSubmit = useCallback(
    (targetNewsId: string) => {
      void replace({
        pathname: route.owner.news.detail.root.replace('[id]', targetNewsId),
      });
    },
    [replace]
  );

  const handleBack = useCallback(() => {
    if (isSubmitting || isDraftSaving) return;

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
  }, [isDirty, isDraftSaving, isSubmitting, leaveToList, write]);

  useNativeBackHandler(handleBack);

  const openSettingsSheet = useCallback(() => {
    if (showBanner) {
      dismissOwnerKindergartenNewsSettingsBanner(kindergartenKey);
      setShowBanner(false);
    }

    overlay.open(({ isOpen, close }) => (
      <OwnerKindergartenNewsWriteSettingsSheet
        isOpen={isOpen}
        close={close}
        mode={mode}
        editingNewsId={newsId}
        isAnnouncement={isAnnouncement}
        notifyGuardiansOnUpload={notifyGuardiansOnUpload}
        onAnnouncementChange={setIsAnnouncement}
        onNotifyGuardiansChange={setNotifyGuardiansOnUpload}
      />
    ));
  }, [isAnnouncement, kindergartenKey, mode, newsId, notifyGuardiansOnUpload, showBanner]);

  const handleTitleChange = (value: string) => {
    const next = value.replace(/\n/g, '').slice(0, TITLE_MAX);
    setTitle(next);
    setIsTitleLimitVisible(next.length >= TITLE_MAX);
  };

  const handlePickPhoto = async () => {
    const { imageUpload } = write;

    try {
      const result = await pickImage({
        source: 'library',
        mediaTypes: 'images',
        allowsMultipleSelection: true,
        orderedSelection: true,
        selectionLimit: MAX_PHOTO_COUNT,
        skipUpload: true,
      });

      if (result.cancelled) return;

      if (result.exceededLimit) {
        showMaxPhotoCountToast();
      }

      if (result.assets.length === 0) {
        if (result.failure === 'network') {
          openOwnerKindergartenNewsImageAlert(
            imageUpload.networkFailedTitle,
            imageUpload.networkFailedDescription
          );
          return;
        }

        openOwnerKindergartenNewsImageAlert(
          imageUpload.noneValidTitle,
          imageUpload.noneValidDescription
        );
        return;
      }

      const sources = result.assets.map((asset, index) => toNewsImageSource(asset, index));
      imageSourcesRef.current = [...imageSourcesRef.current, ...sources];
      setImageUrls((current) => [...current, ...sources.map((source) => source.previewUrl)]);

      const invalidSpecCount = result.skipped?.invalidSpecCount ?? 0;
      const oversizedCount = result.skipped?.oversizedCount ?? 0;
      const unreadableCount = result.skipped?.unreadableCount ?? 0;
      const excludedCount = invalidSpecCount + oversizedCount + unreadableCount;

      if (excludedCount > 0) {
        const description =
          invalidSpecCount > 0 || oversizedCount > 0
            ? imageUpload.partialInvalidSpecDescription
            : imageUpload.partialUnreadableDescription;

        openOwnerKindergartenNewsImageAlert(
          imageUpload.partialExcludedTitle(excludedCount),
          description
        );
      }
    } catch (error) {
      if (error === 'NO_PERMISSION_LIBRARY' || error === 'NO_PERMISSION_CAMERA') return;

      openOwnerKindergartenNewsImageAlert(
        write.imageUpload.networkFailedTitle,
        write.imageUpload.networkFailedDescription
      );
    }
  };

  const handleRemoveImage = (index: number) => {
    imageSourcesRef.current = imageSourcesRef.current.filter((_, imageIndex) => imageIndex !== index);
    setImageUrls((current) => current.filter((_, imageIndex) => imageIndex !== index));
  };

  const handleDraftSave = async () => {
    if (!isDirty || isDraftSavingRef.current || isSubmitting) return;

    const images = collectComposerImages(imageUrls, imageSourcesRef.current);
    const savedSnapshot = {
      title,
      body,
      imageUrls: images.map((image) => image.previewUrl),
      isAnnouncement,
      notifyGuardiansOnUpload,
    };

    if (isEditMode) {
      try {
        saveOwnerKindergartenNewsDraft(kindergartenKey, {
          title,
          body,
          imageUrls: savedSnapshot.imageUrls,
          images: images.map((image) => ({
            previewUrl: image.previewUrl,
            fileName: image.fileName,
            ...(image.imageId != null ? { imageId: image.imageId } : {}),
            ...(image.tempKey ? { tempKey: image.tempKey } : {}),
          })),
          isAnnouncement,
          notifyGuardiansOnUpload,
          ...(newsId ? { newsId } : {}),
        });
        initialSnapshotRef.current = savedSnapshot;
        showDraftSaveToast();
      } catch {
        showDraftSaveFailedToast();
      }
      return;
    }

    if (parsedSchoolId == null) {
      showDraftSaveFailedToast();
      return;
    }

    isDraftSavingRef.current = true;
    setIsDraftSaving(true);
    try {
      await saveSchoolNewsDraft({
        schoolId: parsedSchoolId,
        title,
        body,
        notice: isAnnouncement,
        sendNotification: notifyGuardiansOnUpload,
        images,
      });
      await queryClient.invalidateQueries({ queryKey: schoolNewsDraftQueryKey(parsedSchoolId) });
      clearOwnerKindergartenNewsDraft(kindergartenKey);
      initialSnapshotRef.current = savedSnapshot;
      showDraftSaveToast();
    } catch (error) {
      if (error instanceof NewsImageUploadError) {
        openOwnerKindergartenNewsImageAlert(
          write.imageUpload.networkFailedTitle,
          write.imageUpload.networkFailedDescription
        );
        return;
      }
      showDraftSaveFailedToast();
    } finally {
      isDraftSavingRef.current = false;
      setIsDraftSaving(false);
    }
  };

  const submitNews = useCallback(async () => {
    if (!canSubmit || isSubmitting) return;

    setIsSubmitting(true);
    try {
      if (parsedSchoolId == null) throw new Error('schoolId required');

      const images = collectComposerImages(imageUrls, imageSourcesRef.current);
      const resolveIdempotencyKey = (payload: {
        title: string;
        body: string;
        notice: boolean;
        sendNotification: boolean;
        images: unknown[];
      }) => {
        const signature = JSON.stringify(payload);
        const previous = createAttemptRef.current;
        const idempotencyKey =
          previous?.signature === signature ? previous.idempotencyKey : crypto.randomUUID();
        createAttemptRef.current = { signature, idempotencyKey };
        return idempotencyKey;
      };

      if (isEditMode) {
        const parsedNewsId = parseSchoolId(newsId);
        if (!newsId || parsedNewsId == null) throw new Error('newsId required');

        await updateSchoolNews({
          schoolId: parsedSchoolId,
          newsId: parsedNewsId,
          title: title.trim(),
          body: body.trim(),
          notice: isAnnouncement,
          sendNotification: notifyGuardiansOnUpload,
          images,
          resolveIdempotencyKey,
        });
        await queryClient.invalidateQueries({ queryKey: [SCHOOL_NEWS_QUERY_KEY, parsedSchoolId] });
        clearOwnerKindergartenNewsDraft(kindergartenKey, newsId);
        showEditSuccessToast();
        goToDetailAfterSubmit(newsId);
      } else {
        const { newsId: createdNewsId } = await createSchoolNews({
          schoolId: parsedSchoolId,
          title: title.trim(),
          body: body.trim(),
          notice: isAnnouncement,
          sendNotification: notifyGuardiansOnUpload,
          images,
          resolveIdempotencyKey,
        });
        await queryClient.invalidateQueries({ queryKey: [SCHOOL_NEWS_QUERY_KEY, parsedSchoolId] });
        clearOwnerKindergartenNewsDraft(kindergartenKey);
        await deleteSchoolNewsDraft(parsedSchoolId).catch(() => undefined);
        await queryClient.invalidateQueries({ queryKey: schoolNewsDraftQueryKey(parsedSchoolId) });
        showWriteSuccessToast();
        goToDetailAfterSubmit(createdNewsId);
      }
    } catch (error) {
      if (error instanceof NewsImageUploadError) {
        openOwnerKindergartenNewsImageAlert(
          write.imageUpload.networkFailedTitle,
          write.imageUpload.networkFailedDescription
        );
        return;
      }
      overlay.open(({ isOpen, close }) => (
        <AlertDialog
          open={isOpen}
          onOpenChange={(open) => {
            if (!open) close();
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{failedTitle}</AlertDialogTitle>
              <AlertDialogDescription>{failedDescription}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{failedCloseLabel}</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  close();
                  void submitNews();
                }}
              >
                {failedRetryLabel}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ));
    } finally {
      setIsSubmitting(false);
    }
  }, [
    body,
    canSubmit,
    failedCloseLabel,
    failedDescription,
    failedRetryLabel,
    failedTitle,
    goToDetailAfterSubmit,
    imageUrls,
    isAnnouncement,
    isEditMode,
    isSubmitting,
    kindergartenKey,
    newsId,
    notifyGuardiansOnUpload,
    parsedSchoolId,
    queryClient,
    title,
    write.imageUpload.networkFailedDescription,
    write.imageUpload.networkFailedTitle,
  ]);

  const titleLengthHint = useMemo(() => {
    if (!isTitleLimitVisible) return null;
    return write.titleMaxLengthGuide;
  }, [isTitleLimitVisible, write.titleMaxLengthGuide]);

  if (isEditMode && !newsId) return null;

  if (!isEditMode && (isHomePending || draftQuery.isLoading)) {
    return (
      <div className='bg-bg-0 flex h-full flex-col'>
        <Header>
          <Header.LeftSection>
            <Header.BackButton onClick={leaveToList} />
          </Header.LeftSection>
        </Header>
        <DelayedLoadingSpinner isLoading layout='content' />
      </div>
    );
  }

  if (isEditMode && newsId && !existingNews) {
    return (
      <div className='bg-bg-0 flex h-full flex-col'>
        <Header>
          <Header.LeftSection>
            <Header.BackButton onClick={leaveToList} />
          </Header.LeftSection>
        </Header>
        {isHomePending || isExistingNewsResolving ? (
          <DelayedLoadingSpinner isLoading layout='content' />
        ) : (
          <main className='flex min-h-0 flex-1 items-center justify-center px-4'>
            <p className='body1-regular text-text-secondary text-center'>{edit.notFound}</p>
          </main>
        )}
      </div>
    );
  }

  return (
    <div
      data-testid={
        isEditMode ? 'owner-kindergarten-news-edit-root' : 'owner-kindergarten-news-write-root'
      }
      className='bg-bg-0 flex h-full flex-col'
    >
      <Header>
        <Header.LeftSection>
          <Header.BackButton onClick={handleBack} />
        </Header.LeftSection>
        <Header.RightSection className='gap-x-3'>
          <button
            type='button'
            className='label-semibold text-text-primary radius-r1 px-2 py-1'
            onClick={() => {
              handleDraftSave().catch(() => undefined);
            }}
          >
            {write.draftSaveLabel}
          </button>
          <button
            type='button'
            disabled={!canSubmit || isSubmitting}
            className={`label-semibold radius-r1 px-2 py-1 ${
              canSubmit
                ? 'bg-fill-primary-50 text-text-accent'
                : 'bg-fill-secondary-100 text-text-caption'
            } disabled:opacity-100`}
            onClick={() => {
              void submitNews();
            }}
          >
            {submitLabel}
          </button>
        </Header.RightSection>
      </Header>

      <main className='flex min-h-0 flex-1 flex-col'>
        <div className='flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-4 py-5'>
          <div className='relative flex flex-col gap-2'>
            <textarea
              ref={titleRef}
              rows={1}
              value={title}
              maxLength={TITLE_MAX}
              placeholder={write.titlePlaceholder}
              className='h2-extrabold text-text-primary caret-text-accent placeholder:text-text-caption max-h-14 w-full resize-none overflow-hidden bg-transparent outline-none'
              onKeyDown={(event) => {
                if (event.key === 'Enter') event.preventDefault();
              }}
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
            <div className='scrollbar-hide flex gap-2 overflow-x-auto overflow-y-visible px-0.5 py-1'>
              {imageUrls.map((url, index) => (
                <MiniPhotoBox
                  key={`${url}-${index}`}
                  imageUrl={url}
                  onRemove={() => handleRemoveImage(index)}
                />
              ))}
            </div>
          ) : null}
        </div>

        <div className='border-line-200 relative shrink-0 border-t bg-white px-4 py-3 pb-[max(0.75rem,var(--safe-area-inset-bottom,0px))]'>
          {showBanner ? (
            <div className='bg-text-primary absolute right-4 -top-[26px] z-10 flex items-center gap-3 rounded-full px-4 py-2'>
              <span className='caption1-semibold text-text-primary-inverse whitespace-nowrap'>
                {bannerText}
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
      <OwnerKindergartenNewsComposer mode='write' />
    </Suspense>
  );
}

export { OwnerKindergartenNewsWritePage, OwnerKindergartenNewsComposer };
