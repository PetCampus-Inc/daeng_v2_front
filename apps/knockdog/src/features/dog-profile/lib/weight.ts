const MIN_DOG_WEIGHT = 1;
const MAX_DOG_WEIGHT = 99;

function normalizeDogWeight(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 2);
  const numericValue = Number(digits);

  if (!digits || numericValue < MIN_DOG_WEIGHT || numericValue > MAX_DOG_WEIGHT) return '';

  return String(numericValue);
}

function isValidDogWeight(value: number | string | undefined) {
  const numericValue = typeof value === 'number' ? value : Number(value);

  return (
    Number.isInteger(numericValue) &&
    numericValue >= MIN_DOG_WEIGHT &&
    numericValue <= MAX_DOG_WEIGHT
  );
}

export { MAX_DOG_WEIGHT, isValidDogWeight, normalizeDogWeight };
