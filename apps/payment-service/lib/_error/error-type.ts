const arrayToEnum = <T extends string, U extends [T, ...T[]]>(
  items: U,
): { [k in U[number]]: k } => {
  return items.reduce(
    (acc, item) => {
      acc[item] = item;
      return acc;
    },
    {} as { [key in T]: key },
  );
};

export const ErrorType = arrayToEnum([
  'unknown',
  'internal',
  'invalid_request',
]);

export type ErrorTypes = keyof typeof ErrorType;
