import type { Meta, StoryObj } from '@storybook/react';
import { TextField, TextFieldInput } from './TextField';
import { useState, useCallback } from 'react';
import { Icon } from '../icon';
import { ActionButton } from '../action-button';

const meta = {
  title: 'Components/TextField',
  component: TextField,
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
    prefix: {
      table: {
        type: {
          summary: 'ReactNode',
        },
      },
    },
    suffix: {
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
      <div className='min-w-[350px]'>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TextField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <TextField>
      <TextFieldInput placeholder='기본 입력' />
    </TextField>
  ),
};

export const Secondary: Story = {
  render: () => (
    <TextField variant='secondary'>
      <TextFieldInput placeholder='보조 스타일 입력' />
    </TextField>
  ),
};

export const WithLabel: Story = {
  render: () => (
    <TextField label='이름'>
      <TextFieldInput placeholder='이름을 입력하세요' />
    </TextField>
  ),
};

export const WithLabelSecondary: Story = {
  render: () => (
    <TextField label='이름' variant='secondary'>
      <TextFieldInput placeholder='이름을 입력하세요' />
    </TextField>
  ),
};

export const WithIndicator: Story = {
  render: () => (
    <TextField label='이름' indicator='(선택)'>
      <TextFieldInput placeholder='이름을 입력하세요' />
    </TextField>
  ),
};

export const WithPrefix: Story = {
  render: () => (
    <TextField label='검색' prefix={<Icon icon='Search' />}>
      <TextFieldInput placeholder='검색어를 입력하세요' />
    </TextField>
  ),
};

export const WithPrefixSecondary: Story = {
  render: () => (
    <TextField label='검색' prefix={<Icon icon='Search' />} variant='secondary'>
      <TextFieldInput placeholder='검색어를 입력하세요' />
    </TextField>
  ),
};

export const WithSuffix: Story = {
  render: () => (
    <TextField label='금액' suffix='원'>
      <TextFieldInput placeholder='금액을 입력하세요' />
    </TextField>
  ),
};

export const Disabled: Story = {
  render: () => (
    <TextField label='이름' disabled>
      <TextFieldInput placeholder='이름을 입력하세요' />
    </TextField>
  ),
};

export const WithError: Story = {
  render: () => (
    <TextField
      label='이메일'
      invalid
      errorMessage='올바른 이메일 형식이 아닙니다'
    >
      <TextFieldInput placeholder='이메일을 입력하세요' />
    </TextField>
  ),
};

export const WithErrorSecondary: Story = {
  render: () => (
    <TextField
      label='이메일'
      invalid
      errorMessage='올바른 이메일 형식이 아닙니다'
      variant='secondary'
    >
      <TextFieldInput placeholder='이메일을 입력하세요' />
    </TextField>
  ),
};

export const WithSuccess: Story = {
  render: () => (
    <TextField label='이메일' valid successMessage='사용 가능한 이메일입니다'>
      <TextFieldInput placeholder='이메일을 입력하세요' />
    </TextField>
  ),
};

export const WithSuccessSecondary: Story = {
  render: () => (
    <TextField
      label='이메일'
      valid
      successMessage='사용 가능한 이메일입니다'
      variant='secondary'
    >
      <TextFieldInput placeholder='이메일을 입력하세요' />
    </TextField>
  ),
};

export const WithDescription: Story = {
  render: () => (
    <TextField
      label='비밀번호'
      description='8자 이상의 영문, 숫자, 특수문자를 포함해주세요'
    >
      <TextFieldInput type='password' placeholder='비밀번호를 입력하세요' />
    </TextField>
  ),
};
interface FormValues {
  name: string;
  email: string;
}

export const Form = () => {
  const [formValues, setFormValues] = useState<FormValues>({
    name: '',
    email: '',
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
    name: { isInvalid: false, isValid: false, message: null },
    email: { isInvalid: false, isValid: false, message: null },
  });

  const validateForm = useCallback((): boolean => {
    let isFormValid = true;
    const newFieldStates = { ...fieldStates };

    if (!formValues.name) {
      newFieldStates.name = {
        isInvalid: true,
        isValid: false,
        message: '필수 입력 항목입니다',
      };
      isFormValid = false;
    } else {
      newFieldStates.name = {
        isInvalid: false,
        isValid: true,
        message: '사용 가능한 이름이에요',
      };
    }

    if (!formValues.email) {
      newFieldStates.email = {
        isInvalid: true,
        isValid: false,
        message: '필수 입력 항목입니다',
      };
      isFormValid = false;
    } else if (!formValues.email.includes('@')) {
      newFieldStates.email = {
        isInvalid: true,
        isValid: false,
        message: '올바른 이메일 형식이 아니에요',
      };
      isFormValid = false;
    } else {
      newFieldStates.email = {
        isInvalid: false,
        isValid: true,
        message: '사용 가능한 이메일이에요',
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

  const handleNameChange = useCallback((value: string) => {
    setFormValues((prev) => ({ ...prev, name: value }));
    setFieldStates((prev) => ({
      ...prev,
      name: { isInvalid: false, isValid: false, message: null },
    }));
  }, []);

  const handleEmailChange = useCallback((value: string) => {
    setFormValues((prev) => ({ ...prev, email: value }));
    setFieldStates((prev) => ({
      ...prev,
      email: { isInvalid: false, isValid: false, message: null },
    }));
  }, []);

  return (
    <form
      onSubmit={handleSubmit}
      onInvalid={handleInvalid}
      noValidate
      className='flex w-[400px] flex-col gap-4'
    >
      <div className='mb-4'>
        <label className='text-sm font-medium'>Variant 선택:</label>
        <select
          value={variant}
          onChange={(e) =>
            setVariant(e.target.value as 'default' | 'secondary')
          }
          className='ml-2 rounded border px-2 py-1'
        >
          <option value='default'>Default</option>
          <option value='secondary'>Secondary</option>
        </select>
      </div>

      <TextField
        label='이름'
        required
        description='이름을 써주세요'
        value={formValues.name}
        onValueChange={(value) => handleNameChange(value)}
        invalid={fieldStates.name.isInvalid}
        valid={fieldStates.name.isValid}
        errorMessage={
          fieldStates.name.isInvalid ? fieldStates.name.message : undefined
        }
        successMessage={
          fieldStates.name.isValid ? fieldStates.name.message : undefined
        }
        variant={variant}
      >
        <TextFieldInput placeholder='댕댕이' />
      </TextField>

      <TextField
        label='이메일'
        required
        description='이메일을 써주세요'
        value={formValues.email}
        onValueChange={(value) => handleEmailChange(value)}
        invalid={fieldStates.email.isInvalid}
        valid={fieldStates.email.isValid}
        errorMessage={
          fieldStates.email.isInvalid ? fieldStates.email.message : undefined
        }
        successMessage={
          fieldStates.email.isValid ? fieldStates.email.message : undefined
        }
        variant={variant}
      >
        <TextFieldInput placeholder='daeng@knockdog.com' />
      </TextField>

      <ActionButton type='submit' className='mt-4 w-full'>
        제출
      </ActionButton>
    </form>
  );
};
