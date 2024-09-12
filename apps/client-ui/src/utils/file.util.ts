export const fileUtil = Object.freeze({
  formatName: (name: string = "Untitled", slash = "-") => {
    return name.replace(/[<>:"/\\|?*]/g, slash);
  },
  encodeName: (name: string) => encodeURIComponent(name),
  decodeName: (name: string) => decodeURIComponent(name),
  formatAndEncode: (name: string = "Untitled") => {
    return encodeURIComponent(fileUtil.formatName(name));
  },
  isImg: (type: string) => type.startsWith("image"),
});

export default fileUtil;
