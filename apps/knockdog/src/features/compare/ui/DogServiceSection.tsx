import { createDogServiceComparison } from '../lib/createDogServiceComparison';
import { TOTAL_SERVICE_MAP } from '../model/constants/dog-service';
import { ComparisonTable } from './ComparisonTable';
import { Title } from '@widgets/comparisons-tab/ui/Title';

interface DogServiceSectionProps {
  leftService?: string[];
  rightService?: string[];
}

function DogServiceSection({ leftService = [], rightService = [] }: DogServiceSectionProps) {
  const allServices = Object.keys(TOTAL_SERVICE_MAP);
  const {
    leftOnly = [],
    rightOnly = [],
    common = [],
    unavailable = [],
  } = createDogServiceComparison(leftService, rightService, allServices);
  return (
    <div className='w-full'>
      <Title>강아지 서비스 비교</Title>
      <div className='flex flex-col gap-5'>
        <ComparisonTable title='단독 제공' cols={[leftOnly, rightOnly]} />
        <ComparisonTable title='공통' cols={[common]} />
        <ComparisonTable title='미제공' cols={[unavailable]} />
      </div>
    </div>
  );
}

export { DogServiceSection };
