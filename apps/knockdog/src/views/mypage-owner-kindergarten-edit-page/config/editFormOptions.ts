import { ownerMypageContent } from '@features/role-conversion';
import { CLOSED_DAYS } from '@entities/compare';
import { FILTER_CONFIG } from '@entities/kindergarten';
import type { OptionItem } from '@shared/ui/option-select-sheet';

function createTimeOptions(stepMinutes = 30): OptionItem[] {
  const options: OptionItem[] = [];

  for (let minutes = 0; minutes < 24 * 60; minutes += stepMinutes) {
    const hours = String(Math.floor(minutes / 60)).padStart(2, '0');
    const mins = String(minutes % 60).padStart(2, '0');
    const label = `${hours}:${mins}`;
    options.push({ value: label, label });
  }

  return options;
}

const TIME_OPTIONS = createTimeOptions();

const CLOSED_DAY_OPTIONS: OptionItem[] = Object.entries(CLOSED_DAYS)
  .filter(([value]) => value !== 'WEEKEND')
  .map(([value, label]) => ({
    value,
    label,
  }));

const SECTION = {
  BASIC: 'basic',
  HOURS: 'hours',
  SNS: 'sns',
  DETAILS: 'details',
} as const;

type SectionId = (typeof SECTION)[keyof typeof SECTION];

const SECTION_TABS: { id: SectionId; label: string }[] = [
  { id: SECTION.BASIC, label: ownerMypageContent.kindergartenEditBasicSectionTitle },
  { id: SECTION.HOURS, label: ownerMypageContent.kindergartenEditHoursSectionTitle },
  { id: SECTION.SNS, label: ownerMypageContent.kindergartenEditSnsSectionTitle },
  { id: SECTION.DETAILS, label: ownerMypageContent.kindergartenEditDetailsSectionTitle },
];

const BREED_OPTIONS = FILTER_CONFIG['견종 조건'];
const DOG_SERVICE_OPTIONS = FILTER_CONFIG['강아지 서비스'].filter(
  (code) => code !== 'SPLIT_CLASS'
);
const SAFETY_OPTIONS = FILTER_CONFIG['강아지 안전 ∙ 시설'];
const AMENITY_OPTIONS = FILTER_CONFIG['방문객 편의 ∙ 시설'];

export {
  AMENITY_OPTIONS,
  BREED_OPTIONS,
  CLOSED_DAY_OPTIONS,
  DOG_SERVICE_OPTIONS,
  SAFETY_OPTIONS,
  SECTION,
  SECTION_TABS,
  TIME_OPTIONS,
  type SectionId,
};
