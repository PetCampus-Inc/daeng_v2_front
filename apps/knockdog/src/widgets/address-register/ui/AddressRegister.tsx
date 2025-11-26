import { Controller, useForm } from 'react-hook-form';

import { Divider } from '@knockdog/ui';
import { cn } from '@knockdog/ui/lib';
import { LocationField } from '@features/location-field';
import { USER_ADDRESS_TYPE, UserAddress, UserAddressType } from '@entities/user';

type LocationFormState = Record<UserAddressType, Omit<UserAddress, 'id'>>;

interface AddressRegisterProps extends Omit<React.ComponentProps<'form'>, 'onSubmit' | 'children'> {
  onSubmit?: (data: LocationFormState) => void;
}

function AddressRegister({ className, onSubmit, ...props }: AddressRegisterProps) {
  const { control, handleSubmit: submit } = useForm<LocationFormState>();

  const handleSubmit = (data: LocationFormState) => onSubmit?.(data);

  return (
    <form className={cn('flex flex-1 flex-col overflow-hidden', className)} onSubmit={submit(handleSubmit)} {...props}>
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
                  required={isRequired}
                  optional={!isRequired}
                  onChange={field.onChange}
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
