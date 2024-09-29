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
  if (typeof bytes !== 'string') {
    throw new Error(`"bytes" must be a string, but got ${typeof bytes}`);
  }
  bytes = bytes.toUpperCase();
  const reg = /(\d+)([KMGTPEZY]?B)/;
  const v = reg.exec(bytes);
  if (!v) {
    const msg = `"bytes" must be a /(\d+)([KMGTPEZY]?B)/ like "1GB", but got ${bytes}`;
    throw new Error(msg);
  }
  const [_, size, unit] = v;
  return parseFloat(size) * MAP[unit];
};
