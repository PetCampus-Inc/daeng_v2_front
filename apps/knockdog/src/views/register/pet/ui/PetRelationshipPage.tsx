'use client';

import { Relationship, RelationshipSelector } from '@features/dog-profile';
import { TextField, TextFieldInput, ActionButton } from '@knockdog/ui';
import { useStackNavigation } from '@shared/lib/bridge';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';

function PetRelationshipPage() {
  const { push } = useStackNavigation();

  const searchParams = useSearchParams();
  const petName = searchParams.get('petName') as string;

  const [relation, setRelation] = useState<Relationship | null>(null);

  const handleNext = () => {
    push({ pathname: '/register/pet/detail', query: { petName, relation } });
  };

  return (
    <div className='flex h-full flex-col'>
      <div className='flex-1'>
        <h1 className='h1-extrabold'>
          {petName}와 어떤 <span className='text-text-accent'>관계</span>인가요?
        </h1>

        <div className='mt-10 grid grid-cols-2 items-end gap-2'>
          <TextField label='관계' required disabled>
            <TextFieldInput value={petName} />
          </TextField>

          <RelationshipSelector className='w-full' value={relation} onChange={setRelation} />
        </div>
      </div>

      <ActionButton variant='secondaryFill' className='w-full' size='large' disabled={!relation} onClick={handleNext}>
        다음
      </ActionButton>
    </div>
  );
}

export { PetRelationshipPage };
