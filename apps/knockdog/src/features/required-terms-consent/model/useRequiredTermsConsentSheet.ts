'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  usePostUserAgreementsMutation,
  useUserAgreementsStatusQuery,
  useUserStore,
} from '@entities/user';
import { consumePostSignUpRedirect } from '@shared/lib/auth/postSignUpRedirect';
import { useStackNavigation } from '@shared/lib/bridge';
import { isNativeWebView } from '@shared/lib/device';
import { toast } from '@shared/ui/toast';

import {
  requiredTermsConsentContent,
  type RequiredTermsConsentItemId,
} from '../config/requiredTermsConsentContent';

type CheckedTermsState = Record<RequiredTermsConsentItemId, boolean>;

declare global {
  interface Window {
    __knockdogNativeTabFocused?: boolean;
  }
}

const requiredTermIds = requiredTermsConsentContent.items.map((item) => item.id);

const initialCheckedTermsState = (): CheckedTermsState =>
  Object.fromEntries(requiredTermIds.map((id) => [id, false])) as CheckedTermsState;

/** 스택 화면(권한 안내 등)이 탭 WebView를 덮는 동안 약관 시트를 열지 않는다. */
function useIsNativeTabFocused() {
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!isNativeWebView()) {
      setIsFocused(true);
      return;
    }

    const handleFocus = () => setIsFocused(true);
    const handleBlur = () => setIsFocused(false);

    window.addEventListener('knockdog:native-tab-focus', handleFocus);
    window.addEventListener('knockdog:native-tab-blur', handleBlur);
    setIsFocused(window.__knockdogNativeTabFocused === true);

    return () => {
      window.removeEventListener('knockdog:native-tab-focus', handleFocus);
      window.removeEventListener('knockdog:native-tab-blur', handleBlur);
    };
  }, []);

  return isFocused;
}

function useRequiredTermsConsentSheet() {
  const { reset } = useStackNavigation();
  const userId = useUserStore((state) => state.user?.userId);
  const isNativeTabFocused = useIsNativeTabFocused();
  const agreementsStatusQuery = useUserAgreementsStatusQuery(userId);
  const { mutateAsync: submitAgreements, isPending: isSubmitting } = usePostUserAgreementsMutation();
  const [isOpen, setIsOpen] = useState(false);
  const [checkedTerms, setCheckedTerms] = useState<CheckedTermsState>(initialCheckedTermsState);
  const previousUserIdRef = useRef(userId);

  const hasAgreedRequiredTerms = agreementsStatusQuery.data?.data?.hasAgreedRequiredTerms === true;
  const shouldOpen =
    Boolean(userId) &&
    isNativeTabFocused &&
    agreementsStatusQuery.isSuccess &&
    !agreementsStatusQuery.isError &&
    !hasAgreedRequiredTerms;

  useEffect(() => {
    if (previousUserIdRef.current !== userId) {
      previousUserIdRef.current = userId;
      setIsOpen(false);
      setCheckedTerms(initialCheckedTermsState());
    }

    if (!shouldOpen) {
      setIsOpen(false);
      return;
    }
    setIsOpen(true);
  }, [shouldOpen, userId]);

  const isAllChecked = useMemo(
    () => requiredTermsConsentContent.items.every((item) => checkedTerms[item.id]),
    [checkedTerms]
  );

  const handleMasterCheckedChange = useCallback((checked: boolean) => {
    setCheckedTerms(
      Object.fromEntries(requiredTermsConsentContent.items.map((item) => [item.id, checked])) as CheckedTermsState
    );
  }, []);

  const handleItemCheckedChange = useCallback((id: RequiredTermsConsentItemId, checked: boolean) => {
    setCheckedTerms((prev) => ({ ...prev, [id]: checked }));
  }, []);

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (open) {
        setIsOpen(true);
        return;
      }

      if (hasAgreedRequiredTerms) {
        setIsOpen(false);
      }
    },
    [hasAgreedRequiredTerms]
  );

  const handleSubmit = useCallback(async () => {
    if (!isAllChecked || isSubmitting) return;

    const agreedTerms = requiredTermsConsentContent.items
      .filter((item) => checkedTerms[item.id])
      .map((item) => item.id);

    if (agreedTerms.length !== requiredTermsConsentContent.items.length) return;

    try {
      await submitAgreements({ agreedTerms });
      setIsOpen(false);

      const redirectTo = consumePostSignUpRedirect();
      if (redirectTo) {
        try {
          await reset(redirectTo);
        } catch {
          toast({
            title: '다음 화면으로 이동하지 못했어요. 다시 시도해 주세요.',
            shape: 'square',
            position: 'top',
          });
        }
      }
    } catch (error) {
      console.error('[useRequiredTermsConsentSheet] 약관 동의 실패:', error);
      toast({
        title: '약관 동의에 실패했어요. 잠시 후 다시 시도해 주세요.',
        shape: 'square',
        position: 'top',
      });
    }
  }, [checkedTerms, isAllChecked, isSubmitting, reset, submitAgreements]);

  return {
    isOpen,
    checkedTerms,
    isAllChecked,
    isSubmitting,
    handleMasterCheckedChange,
    handleItemCheckedChange,
    handleOpenChange,
    handleSubmit,
  };
}

export { useRequiredTermsConsentSheet };
