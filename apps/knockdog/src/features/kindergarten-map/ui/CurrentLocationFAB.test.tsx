// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { CurrentLocationFAB } from './CurrentLocationFAB';

const { dispatch, getLocationPermission, requestLocationPermission, refetch, setBaseType, openSystemSetting } =
  vi.hoisted(() => ({
    dispatch: vi.fn(),
    getLocationPermission: vi.fn(),
    requestLocationPermission: vi.fn(),
    refetch: vi.fn(),
    setBaseType: vi.fn(),
    openSystemSetting: vi.fn(),
  }));

vi.mock('../model/useSearchMachine', () => ({
  useSearchMachine: () => ({ dispatch, liveState: { center: null } }),
}));

vi.mock('@shared/lib', () => ({
  getLocationPermission,
  requestLocationPermission,
  useGeolocationQuery: () => ({ refetch }),
  openSystemSetting,
}));

vi.mock('@shared/store', () => ({
  useBasePointType: () => ({ setBaseType }),
}));

afterEach(() => {
  cleanup();
  vi.resetAllMocks();
});

describe('현재 위치 권한 거부', () => {
  it.each([true, false])('재요청 가능 여부가 %s일 때 안내 시트를 열고 설정으로 이동하지 않는다', async (canAskAgain) => {
    getLocationPermission.mockResolvedValue('denied');
    requestLocationPermission.mockResolvedValue({ status: 'denied', canAskAgain });
    const onPermissionDenied = vi.fn();

    render(<CurrentLocationFAB onPermissionDenied={onPermissionDenied} />);
    fireEvent.click(screen.getByRole('button', { name: '현재 위치' }));

    await waitFor(() => expect(onPermissionDenied).toHaveBeenCalledOnce());
    expect(setBaseType).toHaveBeenCalledWith('CURRENT');
    expect(refetch).toHaveBeenCalledOnce();
    expect(openSystemSetting).not.toHaveBeenCalled();
    expect(dispatch).not.toHaveBeenCalled();
  });
});
