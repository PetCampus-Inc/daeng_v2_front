'use client';

import { Header } from '@widgets/Header';
import { useState } from 'react';

export default function Page() {
  const [isEditing, setIsEditing] = useState(false);

  // 백신 접종증명서 제출 여부 3가지 'YES', 'NO', 'UNKNOWN'
  const [vaccination, setVaccination] = useState('YES');

  const vaccinationOptions = {
    YES: '예',
    UNKNOWN: '잘 모르겠어요',
    NO: '아니요',
  };

  const handleVaccinationClick = (option: keyof typeof vaccinationOptions) => {
    if (isEditing) {
      setVaccination(option);
    }
  };

  return (
    <>
      <Header className='border-b-line-100 border-b-1'>
        <Header.BackButton />

        <Header.Title>상담시 체크리스트</Header.Title>

        <Header.RightSection>
          {!isEditing ? (
            <button
              className='body2-bold text-text-tertiary flex items-center gap-1'
              onClick={() => setIsEditing(!isEditing)}
            >
              <span>편집</span>
            </button>
          ) : (
            <button
              className='body2-bold text-text-tertiary flex items-center gap-1'
              onClick={() => setIsEditing(false)}
            >
              <span>완료</span>
            </button>
          )}
        </Header.RightSection>
      </Header>
      <div className='mt-[65px] flex flex-col px-4 py-6'>
        <div className='pb-6'>
          <div className='label-semibold py-4'>등록요건</div>
          <div className='flex flex-col'>
            <div className='py-3'>
              <span className='mb-2 inline-block'>
                백신 접종증명서를 제출해야 하나요?
              </span>
              <div className='flex flex-wrap gap-2'>
                {Object.entries(vaccinationOptions).map(([key, label]) => (
                  <div
                    key={key}
                    className={`cursor-pointer rounded-lg px-2 px-4 py-1 py-[12px] ${
                      vaccination === key
                        ? 'bg-fill-primary-500 text-text-primary-inverse'
                        : 'bg-fill-secondary-200 text-text-secondary-inverse'
                    }`}
                    onClick={() =>
                      handleVaccinationClick(
                        key as keyof typeof vaccinationOptions
                      )
                    }
                  >
                    <span className='body2-bold'>{label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className='py-3'>
              <span className='mb-2 inline-block'>중성화가 필요한가요?</span>
              <div className='flex flex-wrap gap-2'>
                {Object.entries(vaccinationOptions).map(([key, label]) => (
                  <div
                    key={key}
                    className={`cursor-pointer rounded-lg px-2 px-4 py-1 py-[12px] ${
                      vaccination === key
                        ? 'bg-fill-primary-500 text-text-primary-inverse'
                        : 'bg-fill-secondary-200 text-text-secondary-inverse'
                    }`}
                    onClick={() =>
                      handleVaccinationClick(
                        key as keyof typeof vaccinationOptions
                      )
                    }
                  >
                    <span className='body2-bold'>{label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className='py-3'>
              <span className='mb-2 inline-block'>
                우리 아이 견종/체형이 등록 가능할까요?
              </span>
              <div className='flex flex-wrap gap-2'>
                {Object.entries(vaccinationOptions).map(([key, label]) => (
                  <div
                    key={key}
                    className={`cursor-pointer rounded-lg px-2 px-4 py-1 py-[12px] ${
                      vaccination === key
                        ? 'bg-fill-primary-500 text-text-primary-inverse'
                        : 'bg-fill-secondary-200 text-text-secondary-inverse'
                    }`}
                    onClick={() =>
                      handleVaccinationClick(
                        key as keyof typeof vaccinationOptions
                      )
                    }
                  >
                    <span className='body2-bold'>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className='pb-6'>
          <div className='label-semibold py-4'>강아지 맞춤 관리</div>
          <div className='flex flex-col'>
            <div className='py-3'>
              <span className='mb-2 inline-block'>
                견종/체형별로 분반해 관리해 주시나요?
              </span>
              <div className='flex flex-wrap gap-2'>
                {Object.entries(vaccinationOptions).map(([key, label]) => (
                  <div
                    key={key}
                    className={`cursor-pointer rounded-lg px-2 px-4 py-1 py-[12px] ${
                      vaccination === key
                        ? 'bg-fill-primary-500 text-text-primary-inverse'
                        : 'bg-fill-secondary-200 text-text-secondary-inverse'
                    }`}
                    onClick={() =>
                      handleVaccinationClick(
                        key as keyof typeof vaccinationOptions
                      )
                    }
                  >
                    <span className='body2-bold'>{label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className='py-3'>
              <span className='mb-2 inline-block'>
                강아지 성향을 진단해 주시나요?
              </span>
              <div className='flex flex-wrap gap-2'>
                {Object.entries(vaccinationOptions).map(([key, label]) => (
                  <div
                    key={key}
                    className={`cursor-pointer rounded-lg px-2 px-4 py-1 py-[12px] ${
                      vaccination === key
                        ? 'bg-fill-primary-500 text-text-primary-inverse'
                        : 'bg-fill-secondary-200 text-text-secondary-inverse'
                    }`}
                    onClick={() =>
                      handleVaccinationClick(
                        key as keyof typeof vaccinationOptions
                      )
                    }
                  >
                    <span className='body2-bold'>{label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className='py-3'>
              <span className='mb-2 inline-block'>
                일과표가 강아지 성향에 따라 조정되나요?
              </span>
              <div className='flex flex-wrap gap-2'>
                {Object.entries(vaccinationOptions).map(([key, label]) => (
                  <div
                    key={key}
                    className={`cursor-pointer rounded-lg px-2 px-4 py-1 py-[12px] ${
                      vaccination === key
                        ? 'bg-fill-primary-500 text-text-primary-inverse'
                        : 'bg-fill-secondary-200 text-text-secondary-inverse'
                    }`}
                    onClick={() =>
                      handleVaccinationClick(
                        key as keyof typeof vaccinationOptions
                      )
                    }
                  >
                    <span className='body2-bold'>{label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className='py-3'>
              <span className='mb-2 inline-block'>
                하루에 총 몇 마리까지 등원하나요?
              </span>
              <div className='flex items-center gap-2'>
                <div className='bg-fill-secondary-100 py[14px] h-[48px] w-[90px] rounded-lg px-4'>
                  <input
                    type='number'
                    className='h-full w-full bg-transparent text-center'
                  />
                </div>
                <span className='body2-bold'>마리</span>
              </div>
            </div>
          </div>
        </div>

        <div className='pb-6'>
          <div className='label-semibold py-4'>식사 및 프로그램</div>
          <div className='flex flex-col'>
            <div className='py-3'>
              <span className='mb-2 inline-block'>
                사료 및 식사량 맞춤 배급이 가능한가요?
              </span>
              <div className='flex flex-wrap gap-2'>
                {Object.entries(vaccinationOptions).map(([key, label]) => (
                  <div
                    key={key}
                    className={`cursor-pointer rounded-lg px-2 px-4 py-1 py-[12px] ${
                      vaccination === key
                        ? 'bg-fill-primary-500 text-text-primary-inverse'
                        : 'bg-fill-secondary-200 text-text-secondary-inverse'
                    }`}
                    onClick={() =>
                      handleVaccinationClick(
                        key as keyof typeof vaccinationOptions
                      )
                    }
                  >
                    <span className='body2-bold'>{label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className='py-3'>
              <span className='mb-2 inline-block'>
                하루 일과가 정해진 커리큘럼에 따라 운영하나요?
              </span>
              <div className='flex flex-wrap gap-2'>
                {Object.entries(vaccinationOptions).map(([key, label]) => (
                  <div
                    key={key}
                    className={`cursor-pointer rounded-lg px-2 px-4 py-1 py-[12px] ${
                      vaccination === key
                        ? 'bg-fill-primary-500 text-text-primary-inverse'
                        : 'bg-fill-secondary-200 text-text-secondary-inverse'
                    }`}
                    onClick={() =>
                      handleVaccinationClick(
                        key as keyof typeof vaccinationOptions
                      )
                    }
                  >
                    <span className='body2-bold'>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className='pb-6'>
          <div className='label-semibold py-4'>안전 관리</div>
          <div className='flex flex-col'>
            <div className='py-3'>
              <span className='mb-2 inline-block'>
                근처에 동물병원이 있나요?
              </span>
              <div className='flex flex-wrap gap-2'>
                {Object.entries(vaccinationOptions).map(([key, label]) => (
                  <div
                    key={key}
                    className={`cursor-pointer rounded-lg px-2 px-4 py-1 py-[12px] ${
                      vaccination === key
                        ? 'bg-fill-primary-500 text-text-primary-inverse'
                        : 'bg-fill-secondary-200 text-text-secondary-inverse'
                    }`}
                    onClick={() =>
                      handleVaccinationClick(
                        key as keyof typeof vaccinationOptions
                      )
                    }
                  >
                    <span className='body2-bold'>{label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className='py-3'>
              <span className='mb-2 inline-block'>
                사고 발생시 대응 규정이 충분히 마련되어 있나요?
              </span>
              <div className='flex flex-wrap gap-2'>
                {Object.entries(vaccinationOptions).map(([key, label]) => (
                  <div
                    key={key}
                    className={`cursor-pointer rounded-lg px-2 px-4 py-1 py-[12px] ${
                      vaccination === key
                        ? 'bg-fill-primary-500 text-text-primary-inverse'
                        : 'bg-fill-secondary-200 text-text-secondary-inverse'
                    }`}
                    onClick={() =>
                      handleVaccinationClick(
                        key as keyof typeof vaccinationOptions
                      )
                    }
                  >
                    <span className='body2-bold'>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className='pb-6'>
          <div className='label-semibold py-4'>이용 정책</div>
          <div className='flex flex-col'>
            <div className='py-3'>
              <span className='mb-2 inline-block'>1일 체험 등원 가능 여부</span>
              <div className='flex flex-wrap gap-2'>
                {Object.entries(vaccinationOptions).map(([key, label]) => (
                  <div
                    key={key}
                    className={`cursor-pointer rounded-lg px-2 px-4 py-1 py-[12px] ${
                      vaccination === key
                        ? 'bg-fill-primary-500 text-text-primary-inverse'
                        : 'bg-fill-secondary-200 text-text-secondary-inverse'
                    }`}
                    onClick={() =>
                      handleVaccinationClick(
                        key as keyof typeof vaccinationOptions
                      )
                    }
                  >
                    <span className='body2-bold'>{label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className='py-3'>
              <span className='mb-2 inline-block'>
                환불 및 결제 취소 규정이 명확히 정해져 있나요?
              </span>
              <div className='flex flex-wrap gap-2'>
                {Object.entries(vaccinationOptions).map(([key, label]) => (
                  <div
                    key={key}
                    className={`cursor-pointer rounded-lg px-2 px-4 py-1 py-[12px] ${
                      vaccination === key
                        ? 'bg-fill-primary-500 text-text-primary-inverse'
                        : 'bg-fill-secondary-200 text-text-secondary-inverse'
                    }`}
                    onClick={() =>
                      handleVaccinationClick(
                        key as keyof typeof vaccinationOptions
                      )
                    }
                  >
                    <span className='body2-bold'>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
