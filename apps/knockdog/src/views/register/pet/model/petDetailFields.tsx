import { BreedSelector, YearSelector, GenderSelector, NeuteredSelector, WeightTextField } from '@features/dog-profile';

const petDetailFields = [
  {
    index: 0,
    name: 'breed',
    label: '견종',
    prefix: '을',
    rules: { required: true },
    component: <BreedSelector />,
  },
  {
    index: 1,
    name: 'birthYear',
    label: '생일',
    prefix: '을',
    rules: { required: true },
    component: <YearSelector />,
  },
  {
    index: 2,
    name: 'gender',
    label: '성별',
    prefix: '을',
    rules: { required: true },
    component: <GenderSelector />,
  },
  {
    index: 3,
    name: 'isNeutered',
    label: '중성화 여부',
    prefix: '를',
    rules: { required: true },
    component: <NeuteredSelector />,
  },
  {
    index: 4,
    name: 'weight',
    label: '몸무게',
    prefix: '를',
    rules: { required: true },
    component: <WeightTextField />,
  },
];

export { petDetailFields };
