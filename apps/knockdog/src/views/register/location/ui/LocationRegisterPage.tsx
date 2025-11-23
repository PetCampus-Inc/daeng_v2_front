'use client';

import { Controller, useForm, useWatch } from 'react-hook-form';

import { ActionButton, Divider } from '@knockdog/ui';

import { LocationField } from '@features/location-field';
import {
  USER_ADDRESS_TYPE,
  USER_ADDRESS_TYPE_KR,
  UserAddress,
  UserAddressType,
  useUserRegisterMutation,
  useUserStore,
} from '@entities/user';
import { useStackNavigation } from '@shared/lib/bridge';
import { useSocialUserStore } from '@entities/social-user';
import { route } from '@shared/constants/route';

type LocationFormState = Record<UserAddressType, Omit<UserAddress, 'id'>>;

function LocationRegisterPage() {
  const { control, handleSubmit: submit } = useForm<LocationFormState>();
  const { push } = useStackNavigation();
  const { mutateAsync: registerUserMutateAsync } = useUserRegisterMutation();

  const socialUser = useSocialUserStore((state) => state.socialUser);
  const setUser = useUserStore((state) => state.setUser);

  const hasHomeAddress = !!useWatch({ control, name: USER_ADDRESS_TYPE.HOME });

  const handleSubmit = async (data: LocationFormState) => {
    if (!socialUser) return;

    // TODO: 집 주소 입력 안 했을 경우 처리
    if (!data.HOME) console.log('no home');

    const addresses = Object.values(data)
      .filter((address): address is Omit<UserAddress, 'id'> => address !== undefined)
      .map((address) => {
        const alias = address.alias || USER_ADDRESS_TYPE_KR[address.type as UserAddressType];

        return {
          ...address,
          alias,
          addressType: address.type as UserAddressType,
        };
      });

    const { data: user } = await registerUserMutateAsync({
      nickname: socialUser.name,
      profileImage: socialUser.picture,
      addresses,
    });

    setUser(user);

    push({ pathname: route.register.pet.root });
  };

  return (
    <div className='flex h-full flex-col'>
      <p className='h1-extrabold'>
        강아지 유치원,
        <br />
        어디 기준으로 찾아볼까요?
      </p>

      <form id='location-form' className='mt-10 flex flex-1 flex-col overflow-hidden' onSubmit={submit(handleSubmit)}>
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

      <ActionButton
        variant='secondaryFill'
        size='large'
        className='w-full'
        form='location-form'
        type='submit'
        disabled={!hasHomeAddress}
      >
        다음으로
      </ActionButton>
    </div>
  );
}

export { LocationRegisterPage };
