type DogNameParticle = '가' | '의' | '는' | '를' | '와' | '로';

const getDogNameSuffix = (dogName: string, particle: DogNameParticle) => {
  if (!dogName) return '';

  const code = dogName.charCodeAt(dogName.length - 1);
  const hasBatchim = code >= 0xac00 && code <= 0xd7a3 && (code - 0xac00) % 28 !== 0;

  return `${hasBatchim ? '이' : ''}${particle}`;
};

const formatDogName = (dogName: string, particle: DogNameParticle) =>
  `${dogName}${getDogNameSuffix(dogName, particle)}`;

export { formatDogName, getDogNameSuffix };
