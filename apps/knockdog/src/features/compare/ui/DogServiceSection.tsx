import { ComparisonTable } from './ComparisonTable';
import { Title } from '@widgets/comparisons-tab/ui/Title';

interface DogServiceSectionProps {
  leftService?: string[];
  rightService?: string[];
}

function DogServiceSection({ leftService = [], rightService = [] }: DogServiceSectionProps) {
  return (
    <div className='w-full'>
      <Title>강아지 서비스 비교</Title>
      <div className='flex flex-col gap-5'>
        <ComparisonTable title='단독 제공' cols={[leftService, rightService]} />
        <ComparisonTable title='공통' cols={[leftService]} />
        <ComparisonTable title='미제공' cols={[leftService]} />
      </div>
    </div>
  );
}

export { DogServiceSection };
