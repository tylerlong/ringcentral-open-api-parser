export const capitalizeFirstLetter = (s: string): string => {
  return s.charAt(0).toUpperCase() + s.slice(1);
};

export const lowerCaseFirstLetter = (s: string): string => {
  return s.charAt(0).toLocaleLowerCase() + s.slice(1);
};
