import type { Meta, StoryObj } from '@storybook/nextjs';
import { Textarea, TextareaInput } from './Textarea';
import { useState, useCallback } from 'react';

const meta: Meta<typeof Textarea> = {
  title: 'Components/Textarea',
  component: Textarea,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'secondary'],
      table: {
        type: {
          summary: 'default | secondary',
        },
        defaultValue: { summary: 'default' },
      },
    },
    asChild: {
      table: {
        type: {
          summary: 'boolean',
        },
        defaultValue: { summary: 'false' },
      },
    },
    value: {
      type: 'string',
    },
    onValueChange: {
      table: {
        type: {
          summary: '(value: string) => void',
        },
      },
    },
    name: {
      type: 'string',
    },
    rows: {
      type: 'number',
      table: {
        type: {
          summary: 'number',
        },
        defaultValue: { summary: 'undefined' },
      },
    },
    cols: {
      type: 'number',
      table: {
        type: {
          summary: 'number',
        },
        defaultValue: { summary: 'undefined' },
      },
    },
    maxLength: {
      type: 'number',
      table: {
        type: {
          summary: 'number',
        },
        defaultValue: { summary: 'undefined' },
      },
    },
    minLength: {
      type: 'number',
      table: {
        type: {
          summary: 'number',
        },
        defaultValue: { summary: 'undefined' },
      },
    },
    placeholder: {
      type: 'string',
      table: {
        type: {
          summary: 'string',
        },
        defaultValue: { summary: 'undefined' },
      },
    },
    wrap: {
      control: { type: 'select' },
      options: ['soft', 'hard'],
      table: {
        type: {
          summary: 'soft | hard',
        },
        defaultValue: { summary: 'soft' },
      },
    },
    disabled: {
      table: {
        type: {
          summary: 'boolean',
        },
        defaultValue: { summary: 'false' },
      },
    },
    required: {
      table: {
        type: {
          summary: 'boolean',
        },
        defaultValue: { summary: 'false' },
      },
    },
    invalid: {
      table: {
        type: {
          summary: 'boolean',
        },
        defaultValue: { summary: 'false' },
      },
    },
    valid: {
      table: {
        type: {
          summary: 'boolean',
        },
        defaultValue: { summary: 'false' },
      },
    },
    errorMessage: {
      table: {
        type: {
          summary: 'ReactNode',
        },
      },
    },
    successMessage: {
      table: {
        type: {
          summary: 'ReactNode',
        },
      },
    },
    description: {
      table: {
        type: {
          summary: 'ReactNode',
        },
      },
    },
    indicator: {
      table: {
        type: {
          summary: 'ReactNode',
        },
      },
    },
    label: {
      table: {
        type: {
          summary: 'ReactNode',
        },
      },
    },
  },
  decorators: [
    (Story) => (
      <div className='min-w-[400px]'>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Textarea>
      <TextareaInput placeholder='기본 텍스트 영역' />
    </Textarea>
  ),
};

export const Secondary: Story = {
  render: () => (
    <Textarea variant='secondary'>
      <TextareaInput placeholder='보조 스타일 텍스트 영역' />
    </Textarea>
  ),
};

export const WithLabel: Story = {
  render: () => (
    <Textarea label='메모'>
      <TextareaInput placeholder='메모를 입력하세요' />
    </Textarea>
  ),
};

export const WithLabelSecondary: Story = {
  render: () => (
    <Textarea label='메모' variant='secondary'>
      <TextareaInput placeholder='메모를 입력하세요' />
    </Textarea>
  ),
};

export const WithIndicator: Story = {
  render: () => (
    <Textarea label='메모' indicator='(선택)'>
      <TextareaInput placeholder='메모를 입력하세요' />
    </Textarea>
  ),
};

export const WithRows: Story = {
  render: () => (
    <Textarea label='긴 메모'>
      <TextareaInput placeholder='긴 메모를 입력하세요' rows={6} />
    </Textarea>
  ),
};

export const WithMaxLength: Story = {
  render: () => (
    <Textarea label='짧은 메모' description='최대 100자까지 입력 가능합니다.'>
      <TextareaInput placeholder='짧은 메모를 입력하세요' maxLength={100} rows={3} />
    </Textarea>
  ),
};

export const Disabled: Story = {
  render: () => (
    <Textarea label='메모' disabled>
      <TextareaInput placeholder='메모를 입력하세요' />
    </Textarea>
  ),
};

export const WithError: Story = {
  render: () => (
    <Textarea label='메모' invalid errorMessage='메모를 입력해주세요'>
      <TextareaInput placeholder='메모를 입력하세요' />
    </Textarea>
  ),
};

export const WithErrorSecondary: Story = {
  render: () => (
    <Textarea label='메모' invalid errorMessage='메모를 입력해주세요' variant='secondary'>
      <TextareaInput placeholder='메모를 입력하세요' />
    </Textarea>
  ),
};

export const WithSuccess: Story = {
  render: () => (
    <Textarea label='메모' valid successMessage='메모가 성공적으로 저장되었습니다'>
      <TextareaInput placeholder='메모를 입력하세요' />
    </Textarea>
  ),
};

export const WithSuccessSecondary: Story = {
  render: () => (
    <Textarea label='메모' valid successMessage='메모가 성공적으로 저장되었습니다' variant='secondary'>
      <TextareaInput placeholder='메모를 입력하세요' />
    </Textarea>
  ),
};

export const WithDescription: Story = {
  render: () => (
    <Textarea label='자기소개' description='자신에 대해 자유롭게 작성해주세요'>
      <TextareaInput placeholder='자기소개를 입력하세요' rows={4} />
    </Textarea>
  ),
};

export const Required: Story = {
  render: () => (
    <Textarea label='필수 메모' required description='이 항목은 필수입니다'>
      <TextareaInput placeholder='필수 메모를 입력하세요' />
    </Textarea>
  ),
};

export const WithWrap: Story = {
  render: () => (
    <Textarea label='긴 텍스트' description='hard wrap으로 줄바꿈이 적용됩니다'>
      <TextareaInput placeholder='긴 텍스트를 입력하세요' rows={4} wrap='hard' />
    </Textarea>
  ),
};

export const WithScroll: Story = {
  render: () => (
    <Textarea label='긴 메모' description='높이가 제한되어 있어 스크롤이 생깁니다'>
      <TextareaInput placeholder='긴 메모를 입력하세요' rows={8} style={{ maxHeight: '200px', overflowY: 'auto' }} />
    </Textarea>
  ),
};

export const WithScrollAndContent: Story = {
  render: () => (
    <Textarea label='긴 내용' description='미리 긴 내용이 들어있는 상태에서 스크롤 확인'>
      <TextareaInput
        defaultValue={`안녕하세요! 이것은 매우 긴 텍스트입니다.

여러 줄에 걸쳐서 작성된 내용으로, textarea의 높이를 초과하게 됩니다.

이렇게 되면 자동으로 스크롤바가 나타나서 사용자가 전체 내용을 볼 수 있게 됩니다.

스크롤은 세로 방향으로만 나타나며, 가로 방향은 자동으로 줄바꿈이 됩니다.

이런 방식으로 긴 내용을 입력할 때도 깔끔하게 표시할 수 있습니다.

추가로 더 많은 내용을 입력해보세요. 이 텍스트는 계속 길어질 수 있습니다.

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.

Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.

Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`}
        rows={8}
        style={{ maxHeight: '200px', overflowY: 'auto' }}
      />
    </Textarea>
  ),
};

export const WithScrollCSS: Story = {
  render: () => (
    <Textarea label='CSS 클래스로 스크롤' description='Tailwind CSS 클래스를 사용한 스크롤 예시'>
      <TextareaInput placeholder='긴 내용을 입력하세요' rows={6} className='max-h-48 overflow-y-auto' />
    </Textarea>
  ),
};

export const WithScrollAndError: Story = {
  render: () => (
    <Textarea
      label='스크롤 + 에러 상태'
      description='스크롤이 있는 상태에서 에러 메시지 표시'
      invalid
      errorMessage='내용이 너무 길어서 에러가 발생했습니다'
    >
      <TextareaInput
        defaultValue={`이것은 에러 상태의 긴 텍스트입니다.

여러 줄에 걸쳐서 작성된 내용으로, textarea의 높이를 초과하게 됩니다.

이렇게 되면 자동으로 스크롤바가 나타나서 사용자가 전체 내용을 볼 수 있게 됩니다.

스크롤은 세로 방향으로만 나타나며, 가로 방향은 자동으로 줄바꿈이 됩니다.

이런 방식으로 긴 내용을 입력할 때도 깔끔하게 표시할 수 있습니다.

추가로 더 많은 내용을 입력해보세요. 이 텍스트는 계속 길어질 수 있습니다.

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.

Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.

Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`}
        rows={6}
        style={{ maxHeight: '180px', overflowY: 'auto' }}
      />
    </Textarea>
  ),
};

interface FormValues {
  memo: string;
  description: string;
}

export const Form = () => {
  const [formValues, setFormValues] = useState<FormValues>({
    memo: '',
    description: '',
  });
  const [variant, setVariant] = useState<'default' | 'secondary'>('default');

  const [fieldStates, setFieldStates] = useState<
    Record<
      keyof FormValues,
      {
        isInvalid: boolean;
        isValid: boolean;
        message: string | null;
      }
    >
  >({
    memo: { isInvalid: false, isValid: false, message: null },
    description: { isInvalid: false, isValid: false, message: null },
  });

  const validateForm = useCallback((): boolean => {
    let isFormValid = true;
    const newFieldStates = { ...fieldStates };

    if (!formValues.memo) {
      newFieldStates.memo = {
        isInvalid: true,
        isValid: false,
        message: '메모를 입력해주세요',
      };
      isFormValid = false;
    } else if (formValues.memo.length < 10) {
      newFieldStates.memo = {
        isInvalid: true,
        isValid: false,
        message: '메모는 10자 이상 입력해주세요',
      };
      isFormValid = false;
    } else {
      newFieldStates.memo = {
        isInvalid: false,
        isValid: true,
        message: '좋은 메모입니다',
      };
    }

    if (!formValues.description) {
      newFieldStates.description = {
        isInvalid: true,
        isValid: false,
        message: '설명을 입력해주세요',
      };
      isFormValid = false;
    } else if (formValues.description.length < 20) {
      newFieldStates.description = {
        isInvalid: true,
        isValid: false,
        message: '설명은 20자 이상 입력해주세요',
      };
      isFormValid = false;
    } else {
      newFieldStates.description = {
        isInvalid: false,
        isValid: true,
        message: '상세한 설명입니다',
      };
    }

    setFieldStates(newFieldStates);
    return isFormValid;
  }, [formValues, fieldStates]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      if (validateForm()) {
        window.alert(JSON.stringify(formValues, null, 2));
      }
    },
    [formValues, validateForm]
  );

  const handleInvalid = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      validateForm();
    },
    [validateForm]
  );

  const handleMemoChange = useCallback((value: string) => {
    setFormValues((prev) => ({ ...prev, memo: value }));
    setFieldStates((prev) => ({
      ...prev,
      memo: { isInvalid: false, isValid: false, message: null },
    }));
  }, []);

  const handleDescriptionChange = useCallback((value: string) => {
    setFormValues((prev) => ({ ...prev, description: value }));
    setFieldStates((prev) => ({
      ...prev,
      description: { isInvalid: false, isValid: false, message: null },
    }));
  }, []);

  return (
    <form onSubmit={handleSubmit} onInvalid={handleInvalid} noValidate className='flex w-[500px] flex-col gap-4'>
      <div className='mb-4'>
        <label className='text-sm font-medium'>Variant 선택:</label>
        <select
          value={variant}
          onChange={(e) => setVariant(e.target.value as 'default' | 'secondary')}
          className='ml-2 rounded border px-2 py-1'
        >
          <option value='default'>Default</option>
          <option value='secondary'>Secondary</option>
        </select>
      </div>

      <Textarea
        label='메모'
        required
        description='10자 이상 입력해주세요'
        value={formValues.memo}
        onValueChange={(value) => handleMemoChange(value)}
        invalid={fieldStates.memo.isInvalid}
        valid={fieldStates.memo.isValid}
        errorMessage={fieldStates.memo.isInvalid ? fieldStates.memo.message : undefined}
        successMessage={fieldStates.memo.isValid ? fieldStates.memo.message : undefined}
        variant={variant}
      >
        <TextareaInput placeholder='메모를 입력하세요' rows={3} maxLength={200} />
      </Textarea>

      <Textarea
        label='상세 설명'
        required
        description='20자 이상 입력해주세요'
        value={formValues.description}
        onValueChange={(value) => handleDescriptionChange(value)}
        invalid={fieldStates.description.isInvalid}
        valid={fieldStates.description.isValid}
        errorMessage={fieldStates.description.isInvalid ? fieldStates.description.message : undefined}
        successMessage={fieldStates.description.isValid ? fieldStates.description.message : undefined}
        variant={variant}
      >
        <TextareaInput placeholder='상세 설명을 입력하세요' rows={4} maxLength={500} />
      </Textarea>

      <button type='submit' className='mt-4 w-full rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600'>
        제출
      </button>
    </form>
  );
};
