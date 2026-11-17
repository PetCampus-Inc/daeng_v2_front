import { RESERVATION_EMPTY, type ReservationEmpty } from '@views/guardian-reservation-page/lib/guardianReservationMain';

const RESERVATION_EMPTY_COPY: Record<ReservationEmpty, { imageSrc: string; title: string; body: string }> = {
  [RESERVATION_EMPTY.noPass]: {
    imageSrc: '/images/img_empty_ticket_list.svg',
    title: '사용할 수 있는 이용권이 없어요',
    body: '이용권 충전은 유치원에 문의해 주세요.',
  },
  [RESERVATION_EMPTY.pending]: {
    imageSrc: '/images/img_waiting_kindergarten.png',
    title: '연결 신청을 완료했어요',
    body: '원장님이 확인 중이에요.\n연결이 완료되면 알려드릴게요.',
  },
  [RESERVATION_EMPTY.unlinked]: {
    imageSrc: '/images/img_empty_kindergarten.png',
    title: '아직 연결된 유치원이 없어요',
    body: '다니는 유치원에 똑독을 알려보세요!',
  },
};

export { RESERVATION_EMPTY_COPY };
