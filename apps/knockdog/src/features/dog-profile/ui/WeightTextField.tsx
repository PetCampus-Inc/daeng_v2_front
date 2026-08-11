import { TextField, TextFieldInput, IconButton } from '@knockdog/ui';
import { MAX_DOG_WEIGHT, normalizeDogWeight } from '../lib/weight';

interface WeightTextFieldProps {
  ref?: React.Ref<HTMLInputElement>;
  value?: string;
  onChange?: (value: string) => void;
}

function WeightTextField({ ref, value, onChange }: WeightTextFieldProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => onChange?.(normalizeDogWeight(e.target.value));

  const handleDelete = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onChange?.('');
  };

  return (
    <TextField label='몸무게 (kg)' required suffix={value && <IconButton icon='DeleteInput' onClick={handleDelete} />}>
      <TextFieldInput
        ref={ref}
        placeholder='숫자만 입력'
        value={value ?? ''}
        maxLength={String(MAX_DOG_WEIGHT).length}
        inputMode='numeric'
        pattern='[0-9]*'
        onChange={handleChange}
      />
    </TextField>
  );
}

export { WeightTextField };
