'use client';

import { useState } from 'react';
import { Icon } from '@knockdog/ui';
import { cn } from '@knockdog/ui/lib';

import { Header } from '@widgets/Header';
// @TODO: 스택 컴포넌트로 구현하는 화면이여야함

const EDIT_TOOL = {
  size: 'size',
  bold: 'bold',
  italic: 'italic',
  underline: 'underline',
  indentation: 'indentation',
  trash: 'trash',
};
export default function Page() {
  const [memo, setMemo] = useState(
    '우리 뽀삐는 말이에요 우리 뽀삐는 말이에요 우리우리 뽀삐는 말이에요 우리 뽀삐는 말이에요 우리우리 뽀삐는 말이에요 우리 뽀삐는 말이에요 우리우리 뽀삐는 말이에요 우리 뽀삐는 말이에요 우리는 말이에요 우에요 우리 뽀삐는 말이에요 뽀삐는 말뽀삐는 말말우리 우리 뽀삐는 말이에요 우리 뽀삐는 말이에요 우리우리 뽀삐는 말이에요 우리 뽀삐는 말이에요 우리우리 뽀삐는 말이에요 우리 뽀삐는 말이에요 우리우리 뽀삐는 말이에요 우리 뽀삐는 말이에요 우리는 말이에요 우에요 우리 뽀삐는 말이에요 뽀삐는 말뽀삐는 말말우리에요 우리 뽀삐는 말이에요 우리우리 뽀삐는 말이에요 우리 뽀삐는 말이에요 우리는 말이에요 우리우리 뽀삐는 말이에요 우리 뽀삐는 말이에요 우리우리 뽀삐는 말이에요 우리 뽀삐는 말이에요 우리우리 뽀삐는 말이에요 우리 뽀삐는 말이에요 우리는 말이에요 우에요 우리 뽀삐는 말이에요 뽀삐는 말뽀삐는 말말말말맒뽀지왠ㅇㅎ말말우리ㅇ 우리 뽀삐는 말이에요 우리 뽀삐는 말이에요 우리우리 뽀삐는 말이에요 우리 뽀삐는 말이에요 우리우리 뽀삐는 말이에요 우리 뽀삐는 말이에요 우리우리 뽀삐는 말이에요 우리 뽀삐는 말이에요 우리는 말이에요 우에요 우리 뽀삐는 말이에요 뽀삐는 말뽀삐는 말말우리 우리 뽀삐는 말이에요 우리 뽀삐는 말이에요 우리우리 뽀삐는 말이에요 우리 뽀삐는 말이에요 우리우리 뽀삐는 말이에요 우리 뽀삐는 말이에요 우리우리 뽀삐는 말이에요 우리 뽀삐는 말이에요 우리는 말이에요 우에요 우리 뽀삐는 말이에요 뽀삐는 말뽀삐는 말말우리에요 우리 뽀삐는 말이에요 우리우리 뽀삐는 말이에요 우리 뽀삐는 말이에요 우리는 말이에요 우리우리 뽀삐는 말이에요 우리 뽀삐는 말이에요 우리우리 뽀삐는 말이에요 우리 뽀삐는 말이에요 우리우리 뽀삐는 말이에요 우리 뽀삐는 말이에요 우리는 말이에요 우에요 우리 뽀삐는 말이에요 뽀삐는 말뽀삐는 말말말말맒뽀지왠ㅇㅎ말말우리ㅇ'
  );

  const [isEditing, setIsEditing] = useState(true);
  // 편집모드 선택
  // selectedEditTool
  const [selectedEditTool, setSelectedEditTool] = useState(EDIT_TOOL.size);
  const [selectedBack, setSelectedBack] = useState(false);
  return (
    <>
      <Header className='border-b-line-100 border-b-1'>
        <Header.BackButton />

        <Header.Title>자유메모 작성</Header.Title>

        <Header.RightSection>
          {!isEditing ? (
            <button
              className='body2-bold text-text-tertiary flex items-center gap-1'
              onClick={() => setIsEditing(!isEditing)}
            >
              <span>편집</span>
            </button>
          ) : (
            <button
              className='body2-bold text-text-tertiary flex items-center gap-1'
              onClick={() => setIsEditing(false)}
            >
              <span>완료</span>
            </button>
          )}
        </Header.RightSection>
      </Header>

      <div className='relative mt-[65px] h-[calc(100vh-186px)] px-4'>
        <div className='body2-regular mb-7] sticky top-[65px] flex items-center justify-center bg-white py-3'>
          <span className='text-text-accent'>{memo.length}</span>
          <span>/2000</span>
        </div>

        {!isEditing ? (
          <div className='py-4'>
            {memo.split('').map((char, index) => (
              <span key={index}>{char}</span>
            ))}
          </div>
        ) : (
          <div className='h-[calc(100%-42px)] w-full py-4'>
            {/* textarea 높이의 경우 기획서 내용상. 키보드에 따라 조정해야하는데, AOS, IOS 기기 차이로 인한 오류 예산 되어 임시 코드 작성 추후 수정필요 */}
            <textarea
              className='h-full w-full resize-none'
              placeholder='메모를 작성해 주세요'
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
            />
          </div>
        )}
      </div>
      {/* 편집 모드 툴바 */}
      {isEditing && (
        <div className='flex justify-between bg-[#f8f8f8] px-4 py-3'>
          <div className='flex items-center gap-4'>
            <button
              className={cn(
                'rounded-sm p-[2px]',
                selectedEditTool === EDIT_TOOL.size
                  ? 'bg-fill-secondary-200 text-text-primary'
                  : 'text-text-tertiary'
              )}
              onClick={() => setSelectedEditTool(EDIT_TOOL.size)}
            >
              <Icon icon='Size' />
            </button>
            <button
              className={cn(
                'rounded-sm p-[2px]',
                selectedEditTool === EDIT_TOOL.bold
                  ? 'bg-fill-secondary-200 text-text-primary'
                  : 'text-text-tertiary'
              )}
              onClick={() => setSelectedEditTool(EDIT_TOOL.bold)}
            >
              <Icon icon='Bold' />
            </button>
            <button
              className={cn(
                'rounded-sm p-[2px]',
                selectedEditTool === EDIT_TOOL.italic
                  ? 'bg-fill-secondary-200 text-text-primary'
                  : 'text-text-tertiary'
              )}
              onClick={() => setSelectedEditTool(EDIT_TOOL.italic)}
            >
              <Icon icon='Italic' />
            </button>
            <button
              className={cn(
                'rounded-sm p-[2px]',
                selectedEditTool === EDIT_TOOL.underline
                  ? 'bg-fill-secondary-200 text-text-primary'
                  : 'text-text-tertiary'
              )}
              onClick={() => setSelectedEditTool(EDIT_TOOL.underline)}
            >
              <Icon icon='UnderBar' />
            </button>
            <button
              className={cn(
                'rounded-sm p-[2px]',
                selectedEditTool === EDIT_TOOL.indentation
                  ? 'bg-fill-secondary-200 text-text-primary'
                  : 'text-text-tertiary'
              )}
              onClick={() => setSelectedEditTool(EDIT_TOOL.indentation)}
            >
              <Icon icon='Indentation' />
            </button>
            <button
              className={cn(
                'rounded-sm p-[2px]',
                selectedEditTool === EDIT_TOOL.trash
                  ? 'bg-fill-secondary-200 text-text-primary'
                  : 'text-text-tertiary'
              )}
              onClick={() => setSelectedEditTool(EDIT_TOOL.trash)}
            >
              <Icon icon='Trash' />
            </button>
          </div>
          <div className='flex items-center gap-2'>
            <button
              className={cn(
                'rounded-sm p-[2px]',
                selectedBack
                  ? 'bg-fill-secondary-200 text-text-primary'
                  : 'text-text-tertiary'
              )}
              onClick={() => setSelectedBack(!selectedBack)}
            >
              <Icon icon='Back' />
            </button>
            <button
              className={cn(
                'rounded-sm p-[2px]',
                !selectedBack ? 'text-text-primary' : 'text-text-tertiary'
              )}
              onClick={() => setSelectedBack(!selectedBack)}
            >
              <Icon icon='BackInverse' />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
