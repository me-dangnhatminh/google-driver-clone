export const arrayToEnum = <T extends string, U extends [T, ...T[]]>(
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

export const jsonStringifyReplacer = (_: string, value: any): any => {
  if (value instanceof Error) {
    return {
      message: value.message,
      stack: value.stack,
    };
  }
  return value;
};
