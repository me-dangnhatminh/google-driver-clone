const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
};

const nameFromDisposition = (disposition: string) => {
  const regex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
  const match = regex.exec(disposition);
  if (match && match[1]) return match[1].replace(/['"]/g, "");
  return null;
};

const FileUtils = {
  formatBytes,
  nameFromDisposition,
};
export default FileUtils;
