interface DogServiceComparison {
  leftOnly: string[];
  rightOnly: string[];
  common: string[];
  unavailable: string[];
}

export function createDogServiceComparison(
  leftServices: string[],
  rightServices: string[],
  allServices: string[]
): DogServiceComparison {
  const leftSet = new Set(leftServices);
  const rightSet = new Set(rightServices);

  const leftOnly = allServices.filter((service) => leftSet.has(service) && !rightSet.has(service));
  const rightOnly = allServices.filter((service) => !leftSet.has(service) && rightSet.has(service));
  const common = allServices.filter((service) => leftSet.has(service) && rightSet.has(service));
  const unavailable = allServices.filter((service) => !leftSet.has(service) && !rightSet.has(service));

  return {
    leftOnly,
    rightOnly,
    common,
    unavailable,
  };
}
