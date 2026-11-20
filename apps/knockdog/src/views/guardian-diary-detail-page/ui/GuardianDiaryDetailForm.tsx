'use client';

import { Edit, Trash } from '@knockdog/icons';
import {
  ActionButton,
  AiWrittenBadge,
  DiaryEditText,
  DiaryImageCarousel,
  DiaryTopBar,
} from '@knockdog/ui';

import { ConfirmDialog } from '@shared/ui/confirm-dialog';
import { DIARY_DELETE_CANCEL, DIARY_DELETE_LINES, DIARY_DELETE_TITLE } from '../lib/diaryDetail';

import { BottomCta } from '@shared/ui/bottom-cta';

interface GuardianDiaryDetailFormProps {
  dateLabel: string;
  photos: string[];
  body: string;
  isEditing: boolean;
  isMenuOpen: boolean;
  isDeleteOpen: boolean;
  onBack: () => void;
  onMenu: () => void;
  onCloseMenu: () => void;
  onEdit: () => void;
  onBodyChange: (body: string) => void;
  onSave: () => void;
  onAskDelete: () => void;
  onCancelDelete: () => void;
  onDelete: () => void;
}

function GuardianDiaryDetailForm({
  dateLabel,
  photos,
  body,
  isEditing,
  isMenuOpen,
  isDeleteOpen,
  onBack,
  onMenu,
  onCloseMenu,
  onEdit,
  onBodyChange,
  onSave,
  onAskDelete,
  onCancelDelete,
  onDelete,
}: GuardianDiaryDetailFormProps) {
  return (
    <div className='bg-bg-0 relative flex h-full min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden'>
      <DiaryTopBar mode='menu' title='일기장' onBack={onBack} onMenu={onMenu} />
      {isMenuOpen ? (
        <>
          <button type='button' aria-label='메뉴 닫기' className='fixed inset-0 z-10' onClick={onCloseMenu} />
          <div className='border-line-200 bg-bg-0 radius-r2 p-x3 gap-x4 absolute top-[66px] right-[16px] z-20 flex w-[120px] flex-col border'>
            <button type='button' className='body2-semibold text-text-primary flex items-center justify-between' onClick={onEdit}>
              수정하기
              <Edit className='text-fill-secondary-500 size-4' />
            </button>
            <button type='button' className='body2-semibold text-error flex items-center justify-between' onClick={onAskDelete}>
              삭제하기
              <Trash className='text-error size-4' />
            </button>
          </div>
        </>
      ) : null}
      <div className='px-x4 pt-x5 gap-x4 flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-x-hidden overflow-y-auto'>
        <p className='label-medium text-text-primary'>{dateLabel}</p>
        <DiaryImageCarousel
          images={photos.map((photo, index) => (
            <img key={`${index}-${photo}`} src={photo} alt='' className='size-full object-cover' />
          ))}
        />
        {isEditing ? (
          <DiaryEditText body={body} isEditing onBodyChange={onBodyChange} />
        ) : (
          <p className='body1-regular text-text-primary px-x2 py-x4 whitespace-pre-line'>{body}</p>
        )}
      </div>
      {!isEditing && body && (
        <div className='px-x6 pt-x3 pb-x2 flex shrink-0 justify-end'>
          <AiWrittenBadge />
        </div>
      )}
      {isEditing ? (
        <BottomCta className='bg-bg-0 p-x4 shrink-0'>
          <ActionButton type='button' variant='primaryFill' size='large' onClick={onSave}>
            저장하기
          </ActionButton>
        </BottomCta>
      ) : null}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        title={DIARY_DELETE_TITLE}
        description={DIARY_DELETE_LINES.join('\n')}
        cancelLabel={DIARY_DELETE_CANCEL}
        confirmLabel='삭제하기'
        onClose={onCancelDelete}
        onConfirm={() => {
          onCancelDelete();
          onDelete();
        }}
      />
    </div>
  );
}

export { GuardianDiaryDetailForm };
export type { GuardianDiaryDetailFormProps };
