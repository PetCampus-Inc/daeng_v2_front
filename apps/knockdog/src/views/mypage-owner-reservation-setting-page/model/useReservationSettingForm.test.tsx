// @vitest-environment jsdom
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider, onlineManager } from '@tanstack/react-query';
import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { toReservationSetting } from '@entities/owner-reservation-setting';
import { api, ApiError } from '@shared/api';

import { useReservationSettingForm } from './useReservationSettingForm';

vi.mock('@entities/user', () => ({
  useUserStore: (select: (state: { user: { userId: string } }) => unknown) =>
    select({ user: { userId: 'owner-test' } }),
}));
vi.mock('@shared/lib/bridge', () => ({ useStackNavigation: () => ({ back: vi.fn() }) }));
vi.mock('@shared/lib/sync-webview-query', () => ({ syncWebViewQuery: { invalidate: vi.fn() } }));

const SAVED_DTO = {
  weekdayStartTime: '09:00',
  weekdayEndTime: '12:00',
  weekendStartTime: '09:00',
  weekendEndTime: '12:00',
  dailyCapacity: 8,
  operatingInfo: {
    weekdayOpenTime: '09:00',
    weekdayCloseTime: '18:00',
    weekendOpenTime: '09:00',
    weekendCloseTime: '18:00',
    closedDays: [],
  },
};

const renderForm = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return renderHook(() => useReservationSettingForm(toReservationSetting(SAVED_DTO)), { wrapper });
};

afterEach(() => {
  cleanup();
  onlineManager.setOnline(true);
  vi.restoreAllMocks();
});

describe('예약설정 저장 실패와 복구', () => {
  it('오프라인 저장은 대기하지 않고 실패하며 입력을 유지하고 재연결 뒤 다시 저장할 수 있다', async () => {
    const put = vi.spyOn(api, 'put').mockReturnValue({
      json: async () => ({ data: { ...SAVED_DTO, dailyCapacity: 10 } }),
    } as unknown as ReturnType<typeof api.put>);
    onlineManager.setOnline(false);
    const connection = vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);
    const { result } = renderForm();
    act(() => result.current.handleCapacityChange('10'));

    let saveResult: unknown;
    await act(async () => {
      saveResult = await result.current.handleSave();
    });

    expect(saveResult).toEqual(expect.any(String));
    expect(saveResult).not.toBe('saved');
    expect(put).not.toHaveBeenCalled();
    expect(result.current.values.dailyCapacity).toBe('10');
    expect(result.current.isDirty).toBe(true);
    expect(result.current.isSaveEnabled).toBe(true);
    expect(result.current.isSaving).toBe(false);

    connection.mockReturnValue(true);
    onlineManager.setOnline(true);
    expect(put).not.toHaveBeenCalled();
    await act(async () => {
      saveResult = await result.current.handleSave();
    });

    expect(saveResult).toBe('saved');
    expect(put).toHaveBeenCalledTimes(1);
    expect(result.current.isDirty).toBe(false);
    expect(result.current.isSaveEnabled).toBe(false);
  });

  it('온라인으로 표시되더라도 통신에 실패하면 공통 실패 안내를 반환하고 재시도할 수 있다', async () => {
    vi.spyOn(api, 'put').mockReturnValue({
      json: async () => {
        throw new TypeError('Failed to fetch');
      },
    } as unknown as ReturnType<typeof api.put>);
    const { result } = renderForm();
    act(() => result.current.handleCapacityChange('10'));

    let saveResult: unknown;
    await act(async () => {
      saveResult = await result.current.handleSave();
    });

    expect(saveResult).toEqual(expect.any(String));
    expect(saveResult).not.toBe('saved');
    expect(result.current.isSaveEnabled).toBe(true);
    expect(result.current.values.dailyCapacity).toBe('10');
  });

  it('운영시간을 벗어나 저장이 거절되면 실패로 안내하고 입력값을 유지한다', async () => {
    const error = new ApiError(400, 'RESERVATION_SETTING-400-2', '운영시간 범위 오류');
    vi.spyOn(api, 'put').mockReturnValue({
      json: async () => {
        throw error;
      },
    } as unknown as ReturnType<typeof api.put>);
    const { result } = renderForm();
    act(() => result.current.handleCapacityChange('10'));

    let saveResult: unknown;
    await act(async () => {
      saveResult = await result.current.handleSave();
    });

    expect(saveResult).toEqual(expect.any(String));
    expect(saveResult).not.toBe('saved');
    expect(result.current.isDirty).toBe(true);
    expect(result.current.isSaveEnabled).toBe(true);
  });

  it('저장 중에는 중복 저장을 막고 요청 이후 수정한 값은 미저장으로 남긴다', async () => {
    let resolveSave!: (value: unknown) => void;
    vi.spyOn(api, 'put').mockReturnValue({
      json: () =>
        new Promise<unknown>((resolve) => {
          resolveSave = resolve;
        }),
    } as unknown as ReturnType<typeof api.put>);
    const { result } = renderForm();
    act(() => result.current.handleCapacityChange('10'));
    let saving: ReturnType<typeof result.current.handleSave>;
    act(() => {
      saving = result.current.handleSave();
    });
    await waitFor(() => expect(result.current.isSaving).toBe(true));
    expect(result.current.isSaveEnabled).toBe(false);
    act(() => result.current.handleCapacityChange('12'));

    await act(async () => {
      resolveSave({ data: { ...SAVED_DTO, dailyCapacity: 10 } });
      await saving;
    });

    expect(result.current.values.dailyCapacity).toBe('12');
    expect(result.current.isDirty).toBe(true);
    expect(result.current.isSaveEnabled).toBe(true);
  });
});
