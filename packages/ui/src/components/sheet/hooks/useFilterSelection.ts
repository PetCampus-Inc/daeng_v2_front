import { useEffect, useState } from 'react';

interface UseFilterSelectionProps {
  externalSelectedOption?: string;
  defaultOption?: string;
  onSelectOption?: (selectedOption: string) => void;
}

export const useFilterSelection = ({
  externalSelectedOption,
  defaultOption,
  onSelectOption,
}: UseFilterSelectionProps) => {
  const [internalSelectedOption, setInternalSelectedOption] =
    useState(defaultOption);
  const isControlled = externalSelectedOption !== undefined;

  useEffect(() => {
    if (isControlled) {
      setInternalSelectedOption(externalSelectedOption);
    }
  }, [externalSelectedOption, isControlled]);

  const handleSelect = (value: string) => {
    if (!isControlled) {
      setInternalSelectedOption(value);
    }
    onSelectOption?.(value);
  };

  return {
    selectedValue: isControlled
      ? externalSelectedOption
      : internalSelectedOption,
    handleSelect,
  };
};
