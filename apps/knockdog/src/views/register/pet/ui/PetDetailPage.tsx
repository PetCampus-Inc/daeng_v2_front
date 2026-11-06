'use client';

import { cloneElement } from 'react';
import { Controller } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { ActionButton, ProgressBar } from '@knockdog/ui';
import { Header } from '@widgets/Header';
import { PetDetailForm, usePetDetail } from '../model/usePetDetail';
import { petDetailFields } from '../model/petDetailFields';

function PetDetailPage() {
  const {
    step,
    petName,
    currentField,
    inputRefs,
    control,
    isValid,
    handleNext,
    handleSkip,
    handleFormSubmit,
    handleAnimationComplete,
  } = usePetDetail();

  return (
    <div className='flex h-full flex-col'>
      <Header>
        <Header.BackButton />
        <Header.Title>프로필 등록</Header.Title>
        <Header.RightSection>
          <button className='label-semibold text-text-primary px-2 py-1' onClick={handleSkip}>
            건너뛰기
          </button>
        </Header.RightSection>
      </Header>

      <div className='relative flex-1 overflow-hidden px-4 pt-12 pb-5'>
        <div className='flex h-full flex-col'>
          <ProgressBar
            totalSteps={petDetailFields.length}
            value={step + 1}
            className='absolute -top-10 left-0 w-full'
          />

          {/* 타이틀 */}
          <h1 className='h1-extrabold'>
            {petName}의 <span className='text-text-accent'>{currentField?.label}</span>
            {currentField?.prefix}
            <br />
            알려주세요
          </h1>

          {/* 필드 */}
          <div className='mb-5 flex-1 overflow-y-auto pt-10'>
            <AnimatePresence>
              <form id='pet-detail-form' className='flex flex-col gap-8 pb-5' onSubmit={handleFormSubmit}>
                {petDetailFields
                  .slice()
                  .reverse()
                  .map(({ index, name, component, rules }) => {
                    if (index > step) return null;

                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        transition={{ duration: 0.3 }}
                        onAnimationComplete={handleAnimationComplete}
                      >
                        <Controller
                          key={name}
                          name={name as keyof PetDetailForm}
                          control={control}
                          rules={rules}
                          render={({ field }) => {
                            return cloneElement(component, {
                              ...field,
                              onComplete: handleNext,
                              ref: (el: HTMLInputElement | null) => (inputRefs.current[index] = el),
                            });
                          }}
                        />
                      </motion.div>
                    );
                  })}
              </form>
            </AnimatePresence>
          </div>

          {/* 완료 버튼 */}
          <ActionButton
            variant='secondaryFill'
            size='large'
            className='w-full'
            form='pet-detail-form'
            type='button'
            disabled={!isValid}
            onClick={handleNext}
          >
            완료
          </ActionButton>
        </div>
      </div>
    </div>
  );
}

export { PetDetailPage };
