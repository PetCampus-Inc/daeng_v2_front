import { TextField, TextFieldInput, IconButton } from '@knockdog/ui';

interface WeightTextFieldProps {
  ref?: React.Ref<HTMLInputElement>;
  value?: string;
  onChange?: (value: string) => void;
}

function WeightTextField({ ref, value, onChange }: WeightTextFieldProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => onChange?.(e.target.value);

  const handleDelete = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onChange?.('');
  };

  return (
    <TextField label='몸무게 (kg)' suffix={value && <IconButton icon='DeleteInput' onClick={handleDelete} />}>
      <TextFieldInput ref={ref} placeholder='소수점 한자리까지 입력 가능' value={value ?? ''} onChange={handleChange} />
    </TextField>
  );
}

export { WeightTextField };
