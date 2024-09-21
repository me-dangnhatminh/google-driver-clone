/* eslint-disable @typescript-eslint/no-unused-vars */
const MAP = {
  KB: 1 / 1024 / 1024,
  MB: 1 / 1024,
  GB: 1,
  TB: 1024,
  PB: 1024 * 1024,
  EB: 1024 * 1024 * 1024,
};

export const toGB = (bytes: string) => {
  bytes = bytes.toUpperCase();
  const reg = /(\d+)([KMGTPEZY]?B)/;
  const v = reg.exec(bytes);
  if (!v) {
    throw new Error('Invalid size');
  }
  const [_, size, unit] = v;
  return parseFloat(size) * MAP[unit];
};
