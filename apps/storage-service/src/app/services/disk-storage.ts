import * as fs from 'fs';
import * as path from 'path';
import * as JSZip from 'jszip';
import Decimal from 'decimal.js';

import { fileUtil } from 'src/common';

const getDiskDest = () => {
  const DISK_DEST: string = process.env.STORAGE_FULLDEST;
  const FULL_PATH = path.resolve(DISK_DEST);
  if (!fs.existsSync(FULL_PATH)) {
    throw new Error(`Upload folder not exist: ${FULL_PATH}`);
  }
  return FULL_PATH;
};

const getFullPath = (id: string) => {
  const dist = getDiskDest();
  const _path = path.join(dist, id);
  if (!fs.existsSync(_path)) return null;
  return _path;
};
const getFullPathWithExt = (id: string, ext: string) => {
  const dist = getDiskDest();
  path.join(dist, `${id}.${ext}`);
};

const buildZip = async (
  folderName: string,
  flatFolders: {
    id: string;
    name: string;
    parentId: string | null;
    depth: number;
    files: {
      file: {
        size: number | bigint;
        id: string;
        name: string;
        contentType: string;
      };
    }[];
  }[],
) => {
  const totalSize = flatFolders.reduce((acc, f) => {
    return f.files.reduce((acc, ff) => {
      return acc.add(new Decimal(ff.file.size.toString()));
    }, acc);
  }, new Decimal(0));

  // Child is flat, need to convert to tree
  // =========================== Calculate pathTree ===========================
  type PathTree = Record<string, string>; // [id, path]
  const pathTree: PathTree = {};
  const pathUsed: Record<string, boolean> = {}; // [path, used]
  type FileSM = { id: string; name: string; contentType: string };
  type FileTree = Record<string, FileSM>;
  const fileTree: FileTree = {}; // for file

  flatFolders.forEach((f) => {
    const parentId = f.parentId ?? f.id;
    const pathParent = pathTree[parentId] ?? '';
    f.name = fileUtil.formatName(f.name);
    let name = f.name === '' ? 'Untitled' : f.name;

    for (let i = 0; pathUsed[`${pathParent}/${name}`]; i++) {
      name = `${f.name}(${i})`;
    }
    pathUsed[`${pathParent}/${name}`] = true;
    pathTree[f.id] = `${pathParent}/${name}`.replace(/^\//, ''); // remove leading slash

    f.files.forEach((ff) => {
      ff.file.name = fileUtil.formatName(ff.file.name, '_');
      let filename = ff.file.name === '' ? 'Untitled' : ff.file.name;
      for (let i = 0; fileTree[`${pathTree[f.id]}/${filename}`]; i++) {
        filename = `${ff.file.name}(${i})`;
      }
      const _ = `${pathTree[f.id]}/${filename}`.replace(/^\//, ''); // remove leading slash
      fileTree[_] = ff.file;
    });
  });

  // =========================== Create zip ===========================
  let rootName = folderName === '' ? 'Untitled' : folderName;
  rootName = fileUtil.formatAndEncode(rootName);
  const zip = new JSZip();
  Object.values(pathTree).forEach((foldername) =>
    zip.file(foldername, null, { dir: true }),
  );
  Object.entries(fileTree).forEach(([filepath, file]) => {
    const diskPath = getFullPath(file.id);
    if (!diskPath) throw new Error(`File not found: ${file.id}`);
    zip.file(filepath, fs.readFileSync(diskPath));
  });
  return {
    zip,
    foldername: `${rootName}-${Date.now()}.zip`,
    totalSize: totalSize.toNumber(),
  };
};
export type Zipped = Awaited<ReturnType<typeof buildZip>>;

export const diskStorage = Object.freeze({
  getFullPath,
  getFullPathWithExt,
  buildZip,
});

export default diskStorage;
