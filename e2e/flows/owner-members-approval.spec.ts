import { expect, test } from '../fixtures/test';
import { expectOwnerNav, gotoAuthed } from '../helpers/nav';

const API_PATTERN = /\/api\/v0\/owner\/members(\/[^/?]+\/approve|\/pending)?(\?.*)?$/;

test.describe('CF-OWNER-MEMBERS-APPROVAL', () => {
  test('승인 후 `이용권 충전하기`를 누르면 그 원생의 이용권 충전 화면이 열리고, 충전하지 않고 뒤로 가면 승인한 원생이 빠진 `신청` 탭으로 돌아온다', async ({
    page,
  }) => {
    // 실제 신청 데이터를 바꾸지 않도록 구성원 API를 가짜 응답으로 바꾼다
    let pendingRequests = [
      { memberId: 1, petId: 11, dogName: '가가', guardianName: '김가가', profileImageUrl: null, gender: 'MALE' },
      { memberId: 2, petId: 12, dogName: '나나', guardianName: '김나나', profileImageUrl: null, gender: 'FEMALE' },
    ];

    await page.route(API_PATTERN, async (route) => {
      const { pathname } = new URL(route.request().url());

      if (pathname.endsWith('/approve')) {
        const memberId = Number(pathname.split('/').at(-2));
        pendingRequests = pendingRequests.filter((request) => request.memberId !== memberId);
        return route.fulfill({ json: { data: {} } });
      }
      if (pathname.endsWith('/pending')) {
        return route.fulfill({
          json: { data: { pendingCount: pendingRequests.length, requests: pendingRequests } },
        });
      }

      return route.fulfill({
        json: {
          data: {
            totalStudentCount: 1,
            pendingCount: pendingRequests.length,
            counts: { all: 1, expiring: 0, expired: 0 },
            members: [],
          },
        },
      });
    });

    await gotoAuthed(page, '/owner/members?tab=pending');
    await expectOwnerNav(page);
    await expect(page.getByTestId('owner-members-pending-actions')).toHaveCount(2);

    await page.getByTestId('owner-members-approve-button').first().click();
    await expect(page.getByTestId('owner-members-approved-dialog')).toBeVisible();

    await page.getByTestId('owner-members-approved-charge').click();
    await expect(page).toHaveURL(/\/owner\/members\/11\/ticket-charge/);

    await page.goBack();

    await expect(page.getByTestId('member-count-tab-pending')).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByTestId('owner-members-pending-actions')).toHaveCount(1);
  });
});
