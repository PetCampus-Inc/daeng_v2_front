import type { Meta, StoryObj } from '@storybook/react';
import { Sheet } from './Sheet';
import { useState } from 'react';
import { FilterSheet } from './FilterSheet';
import { ActionSheet } from './ActionSheet';
import { ConfirmSheet } from './ConfirmSheet';
import { Button } from '../../button';

const meta: Meta = {
  title: 'Components/Sheet',
  component: Sheet,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          '모달형 시트 컴포넌트 입니다. 필터, 액션, 확인 등 다양한 용도로 사용할 수 있습니다.',
      },
    },
  },
  argTypes: {
    side: {
      control: 'select',
      options: ['top', 'bottom', 'left', 'right'],
      description: '시트가 열리는 방향을 설정합니다.',
    },
    showCloseButton: {
      control: 'boolean',
      description: '닫기 버튼을 표시합니다.',
    },
    open: {
      control: 'boolean',
      description: '시트의 열림/닫힘 상태',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
  },
} satisfies Meta;

export default meta;
// 공통 옵션
const filterOptions = [
  { label: '최신순', value: 'latest' },
  { label: '인기순', value: 'popular' },
  { label: '가격 낮은순', value: 'price_asc' },
  { label: '가격 높은순', value: 'price_desc' },
];

export const FilterSheetStory: StoryObj = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    const [selected, setSelected] = useState('latest');

    return (
      <div>
        <Button onClick={() => setIsOpen(true)}>필터 열기</Button>
        <FilterSheet
          open={isOpen}
          onOpenChange={setIsOpen}
          options={filterOptions}
          selectedOption={selected}
          onSelectOption={setSelected}
          title='정렬'
        />
      </div>
    );
  },
  name: 'FilterSheet',
};

// Uncontrolled FilterSheet Story
export const UncontrolledFilterSheetStory: StoryObj = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <div>
        <Button onClick={() => setIsOpen(true)}>필터 열기</Button>
        <FilterSheet
          open={isOpen}
          onOpenChange={setIsOpen}
          options={filterOptions}
          title='정렬'
        />
      </div>
    );
  },
  name: 'Uncontrolled FilterSheet',
};

export const ActionSheetStory: StoryObj = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <div>
        <Button onClick={() => setIsOpen(true)}>액션 시트 열기</Button>
        <ActionSheet
          open={isOpen}
          onOpenChange={setIsOpen}
          title='알림'
          description='정말 삭제하시겠습니까?'
          actionText='삭제'
          onAction={() => {
            alert('삭제되었습니다');
            setIsOpen(false);
          }}
        />
      </div>
    );
  },
  name: 'ActionSheet',
};

// ConfirmSheet Stories
export const ConfirmSheetStory: StoryObj = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <div>
        <Button onClick={() => setIsOpen(true)}>확인 시트 열기</Button>
        <ConfirmSheet
          open={isOpen}
          onOpenChange={setIsOpen}
          title='확인'
          description='변경사항을 저장하시겠습니까?'
          closeText='취소'
          confirmText='저장'
          onClose={() => {
            alert('취소되었습니다');
            setIsOpen(false);
          }}
          onConfirm={() => {
            alert('저장되었습니다');
            setIsOpen(false);
          }}
        />
      </div>
    );
  },
  name: 'ConfirmSheet',
};

// Side Variants Story
export const SideVariantsStory: StoryObj = {
  render: () => {
    const [isOpenTop, setIsOpenTop] = useState(false);
    const [isOpenBottom, setIsOpenBottom] = useState(false);
    const [isOpenLeft, setIsOpenLeft] = useState(false);
    const [isOpenRight, setIsOpenRight] = useState(false);

    return (
      <div className='flex gap-4'>
        <Button onClick={() => setIsOpenTop(true)}>Top</Button>
        <ActionSheet
          open={isOpenTop}
          onOpenChange={setIsOpenTop}
          side='top'
          title='Top Sheet'
          description='상단에서 열리는 시트입니다.'
        />

        <Button onClick={() => setIsOpenBottom(true)}>Bottom</Button>
        <ActionSheet
          open={isOpenBottom}
          onOpenChange={setIsOpenBottom}
          side='bottom'
          title='Bottom Sheet'
          description='하단에서 열리는 시트입니다.'
        />

        <Button onClick={() => setIsOpenLeft(true)}>Left</Button>
        <ActionSheet
          open={isOpenLeft}
          onOpenChange={setIsOpenLeft}
          side='left'
          title='Left Sheet'
          description='왼쪽에서 열리는 시트입니다.'
        />

        <Button onClick={() => setIsOpenRight(true)}>Right</Button>
        <ActionSheet
          open={isOpenRight}
          onOpenChange={setIsOpenRight}
          side='right'
          title='Right Sheet'
          description='오른쪽에서 열리는 시트입니다.'
        />
      </div>
    );
  },
  name: 'Side Variants',
};

// Custom Content Story
export const CustomContentStory: StoryObj = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <div>
        <Button onClick={() => setIsOpen(true)}>커스텀 시트 열기</Button>
        <ActionSheet
          open={isOpen}
          onOpenChange={setIsOpen}
          title='Custom Content'
        >
          <div className='flex flex-col gap-4 p-4'>
            <p>커스텀 컨텐츠를 넣을 수 있습니다.</p>
            <img
              src='/api/placeholder/400/200'
              alt='placeholder'
              className='rounded-lg'
            />
          </div>
        </ActionSheet>
      </div>
    );
  },
  name: 'Custom Content',
};
