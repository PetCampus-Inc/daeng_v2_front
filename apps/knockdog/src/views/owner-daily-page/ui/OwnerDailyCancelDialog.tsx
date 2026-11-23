import { getDogNameSuffix } from '@knockdog/ui/lib';

import { OWNER_DAILY_CANCEL_CONTENT, type OwnerDailyCancelKind } from '@views/owner-daily-page/config/ownerDailyContent';

import type { AttendanceCheckinoutCandidate } from '@entities/owner-attendance-checkinout';

import { ConfirmDialog } from '@shared/ui/confirm-dialog';
import { ellipsisText } from '@shared/utils';

interface OwnerDailyCancelDialogProps {
  /** 무엇을 취소하는지. 제목·본문·확인 버튼 문구가 이에 맞게 바뀐다. */
  kind: OwnerDailyCancelKind;
  member: Pick<AttendanceCheckinoutCandidate, 'name'>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** `취소하기`를 눌렀을 때 취소 요청을 보낸다. 모달은 바로 닫힌다. */
  onCancel: () => Promise<void>;
}

/** 등원·결석·하원 취소 확인 모달. `{이름}의 {등원|결석|하원}을 취소할까요?` 제목을 보여 준다. */
const OwnerDailyCancelDialog = ({ kind, member, open, onOpenChange, onCancel }: OwnerDailyCancelDialogProps) => {
  const { target, description } = OWNER_DAILY_CANCEL_CONTENT[kind];

  /** 모달을 바로 닫고 취소 요청을 보낸다. 결과는 토스트로 알린다. */
  const handleConfirm = () => {
    onOpenChange(false);
    void onCancel();
  };

  return (
    <ConfirmDialog
      isOpen={open}
      title={
        <>
          <span className='text-text-accent'>{ellipsisText(member.name, 8)}</span>
          {getDogNameSuffix(member.name, '의')} {target}을 취소할까요?
        </>
      }
      description={description}
      cancelLabel='닫기'
      confirmLabel='취소하기'
      onClose={() => onOpenChange(false)}
      onConfirm={handleConfirm}
    />
  );
};

export { OwnerDailyCancelDialog };
