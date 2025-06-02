export const ellipsisText = (
  text: string,
  maxLength: number = 7,
  suffix = '···'
) => {
  return text.length > maxLength ? text.slice(0, maxLength) + suffix : text;
};
