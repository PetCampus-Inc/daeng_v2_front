'use client';

import { TextField, TextFieldInput, ActionButton } from '@knockdog/ui';
import { useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  MAX_RELATIONSHIP_TEXT_LENGTH,
  normalizeRelationshipText,
  RelationshipSelector,
} from '@features/dog-profile';
import { RELATIONSHIP, type Relationship, RELATIONSHIP_LABEL, usePetRegisterMutation } from '@entities/pet';
import { route } from '@shared/constants/route';
import { useStackNavigation } from '@shared/lib/bridge';

function PetRelationshipPage() {
  const { push } = useStackNavigation();

  const searchParams = useSearchParams();
  const petName = searchParams.get('petName') as string;
  const profileImage = searchParams.get('profileImage') as string;

  const [relationship, setRelationship] = useState<Relationship | null>(null);
  const [customRelationship, setCustomRelationship] = useState<string>('');

  const { mutateAsync: registerPetMutateAsync } = usePetRegisterMutation();

  const handleNext = async () => {
    if (!relationship || !petName) return;

    const relationshipValue = relationship === RELATIONSHIP.ETC ? customRelationship : RELATIONSHIP_LABEL[relationship];

    const { data } = await registerPetMutateAsync({
      name: petName,
      relationship,
      relationshipText: relationshipValue,
      profileImage,
    });

    push({ pathname: route.register.pet.detail.root, query: { petName, petId: data.id } });
  };

  const isValid = useMemo(() => {
    if (!relationship) return false;
    if (relationship === RELATIONSHIP.ETC) return !!customRelationship;

    return true;
  }, [relationship, customRelationship]);

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

          <RelationshipSelector className='w-full' value={relationship} autoFocus onChange={setRelationship} />
        </div>

        <AnimatePresence>
          {relationship === RELATIONSHIP.ETC && (
            <motion.div
              className='mt-x4'
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.3 }}
              >
                <div className='flex flex-col gap-2 p-4'>
                  <div className='gap-x0_5 flex items-center'>
                    <span className='body2-bold text-text-primary'>관계(직접 입력)</span>
                    <span className='body2-bold text-text-accent'>*</span>
                  </div>
                  <TextField>
                    <TextFieldInput
                      placeholder='5자 이내 한글로 입력해 주세요'
                      value={customRelationship}
                      maxLength={MAX_RELATIONSHIP_TEXT_LENGTH}
                      onChange={(e) => {
                        if ((e.nativeEvent as InputEvent).isComposing) {
                          setCustomRelationship(e.target.value);
                          return;
                        }
                        setCustomRelationship(normalizeRelationshipText(e.target.value));
                      }}
                      onCompositionEnd={(e) => setCustomRelationship(normalizeRelationshipText(e.currentTarget.value))}
                    />
                  </TextField>
                </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <ActionButton variant='secondaryFill' className='w-full' size='large' disabled={!isValid} onClick={handleNext}>
        다음
      </ActionButton>
    </div>
  );
}

export { PetRelationshipPage };
