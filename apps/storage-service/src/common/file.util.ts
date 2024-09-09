export const fileUtil = Object.freeze({
  formatName: (name: string, slash = '-') =>
    name.replace(/[<>:"/\\|?*]/g, slash), // for windows
  encodeName: (name: string) => encodeURIComponent(name),
  decodeName: (name: string) => decodeURIComponent(name),
  formatAndEncode: (name: string) =>
    encodeURIComponent(fileUtil.formatName(name)),
  isImg: (type: string) => type.startsWith('image'),
});

export default fileUtil;
