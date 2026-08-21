import { Controller, Control } from 'react-hook-form';

import { Divider } from '@knockdog/ui';
import { cn } from '@knockdog/ui/lib';
import { LocationField } from '@features/location-field';
import { USER_ADDRESS_TYPE, UserAddress, UserAddressType } from '@entities/user';

type LocationFormState = Record<UserAddressType, Omit<UserAddress, 'id'>>;

interface AddressRegisterProps extends Omit<React.ComponentProps<'form'>, 'children'> {
  control: Control<LocationFormState>;
  addressIds?: Partial<Record<UserAddressType, string>>;
  onAdd?: (type: UserAddressType, address: Omit<UserAddress, 'id'>) => void;
  onUpdate?: (type: UserAddressType, address: Omit<UserAddress, 'id'>) => void;
  onDelete?: (type: UserAddressType) => void;
}

function AddressRegister({
  className,
  control,
  addressIds,
  onAdd,
  onUpdate,
  onDelete,
  ...props
}: AddressRegisterProps) {
  return (
    <form className={cn('flex flex-1 flex-col overflow-hidden', className)} {...props}>
      {Object.values(USER_ADDRESS_TYPE).map((type, index) => (
        <Controller
          key={type}
          control={control}
          name={type}
          render={({ field }) => {
            const isRequired = type === USER_ADDRESS_TYPE.HOME;
            return (
              <>
                <LocationField
                  key={type}
                  type={type}
                  value={field.value}
                  addressId={addressIds?.[type]}
                  required={isRequired}
                  optional={!isRequired}
                  onChange={field.onChange}
                  onAdd={onAdd ? (address) => onAdd(type, address) : undefined}
                  onUpdate={onUpdate ? (address) => onUpdate(type, address) : undefined}
                  onDelete={onDelete ? () => onDelete(type) : undefined}
                />
                {index < Object.values(USER_ADDRESS_TYPE).length - 1 && <Divider />}
              </>
            );
          }}
        />
      ))}
    </form>
  );
}

export { AddressRegister };
