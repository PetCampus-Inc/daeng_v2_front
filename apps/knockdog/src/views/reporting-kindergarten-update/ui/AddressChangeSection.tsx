import { IconButton, ActionButton, TextField, TextFieldInput } from '@knockdog/ui';

interface AddressChangeSectionProps {
  currentAddress: string | null;
  newAddress: string | null | undefined;
  onAddressChange: (address: string | null | undefined) => void;
  onMapSelect: () => void;
  onManualInput: () => void;
}

export function AddressChangeSection({
  currentAddress,
  newAddress,
  onAddressChange,
  onMapSelect,
  onManualInput,
}: AddressChangeSectionProps) {
  return (
    <div className='my-5 flex flex-col gap-3 px-4'>
      <div className='flex flex-col gap-2'>
        {currentAddress && (
          <TextField disabled className='w-full' label='현재 등록된 주소'>
            <TextFieldInput value={currentAddress} />
          </TextField>
        )}
        {newAddress && (
          <TextField
            className='w-full'
            label='변경할 주소'
            suffix={
              <IconButton
                icon='DeleteInput'
                onClick={() => onAddressChange('')}
                className='cursor-pointer text-neutral-700'
              />
            }
          >
            <TextFieldInput value={newAddress} readOnly />
          </TextField>
        )}
      </div>

      <div className='mt-5 flex gap-2'>
        <ActionButton className='flex-1' variant='secondaryLine' onClick={onMapSelect}>
          지도에서 선택
        </ActionButton>
        <ActionButton variant='secondaryLine' className='flex-1' onClick={onManualInput}>
          직접입력
        </ActionButton>
      </div>
    </div>
  );
}
