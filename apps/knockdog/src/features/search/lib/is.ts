import type { FilterItemSuggestion, RegionSuggestion } from '@entities/kindergarten';

export const isRegionSuggestion = (
  suggestion: RegionSuggestion | FilterItemSuggestion
): suggestion is RegionSuggestion => {
  return suggestion.type === 'REGION';
};

export const isFilterItemSuggestion = (
  suggestion: RegionSuggestion | FilterItemSuggestion
): suggestion is FilterItemSuggestion => {
  return suggestion.type === 'FILTER_ITEM';
};
