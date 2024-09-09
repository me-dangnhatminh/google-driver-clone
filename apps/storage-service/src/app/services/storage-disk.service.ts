import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import * as fs from 'fs-extra';
import Decimal from 'decimal.js';
import * as JSZip from 'jszip';
import { fileUtil } from 'src/common';

@Injectable()
export class StorageDiskService {
  private readonly logger = new Logger(StorageDiskService.name);

  // configs
  private readonly rootDir: string;
  private readonly folderDefaultName = 'Untitled';
  private readonly fileDefaultName = 'Untitled';

  constructor(private readonly configService: ConfigService<any, true>) {
    const rootDirConfigPath = 'storage.disk.rootDir';
    let rootDir = this.configService.get<string>(rootDirConfigPath) ?? 'data';
    if (!rootDir) throw new Error(`Config not found: ${rootDirConfigPath}`);

    if (!path.isAbsolute(rootDir)) rootDir = path.resolve(rootDir);
    else rootDir = path.normalize(rootDir);

    const isExists = fs.existsSync(rootDir);

    if (isExists) {
      const isDir = fs.statSync(rootDir).isDirectory();
      if (!isDir) throw new Error(`${rootDir} is not a directory`);
      try {
        fs.accessSync(rootDir, fs.constants.W_OK);
      } catch (error) {
        throw new Error(`${rootDir} is not writable`);
      }
    } else {
      fs.mkdirSync(rootDir, { recursive: true });
    }

    this.rootDir = rootDir;
    const msg = `Root dir: ${rootDir}\nStatus (exites/created): ${isExists ? 'exists' : 'created'}`;
    this.logger.log(msg);
  }

  filePath(name: string) {
    const fullPath = path.join(this.rootDir, name);
    const isExists = fs.existsSync(fullPath);
    return { fullPath, isExists };
  }

  saveFile(name: string, buffer: Buffer) {
    const { fullPath, isExists } = this.filePath(name);
    if (isExists) throw new Error(`File already exists: ${fullPath}`);
    fs.writeFileSync(fullPath, buffer);
  }

  async buildZipAsync(
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
  ) {
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
      let name = f.name === '' ? this.folderDefaultName : f.name;

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
    let rootName = folderName === '' ? this.folderDefaultName : folderName;
    rootName = fileUtil.formatAndEncode(rootName);
    const zip = new JSZip();
    Object.values(pathTree).forEach((foldername) =>
      zip.file(foldername, null, { dir: true }),
    );

    const promises = Object.entries(fileTree).map(([filepath, file]) => {
      const filePath = this.filePath(file.id);
      if (!filePath.isExists) throw new Error(`File not found: ${file.id}`);
      return zip.file(filepath, fs.readFileSync(filePath.fullPath));
    });

    await Promise.all(promises);

    return {
      zip,
      foldername: `${rootName}-${Date.now()}.zip`,
      totalSize: totalSize.toNumber(),
    };
  }
}

export type Zipped = Awaited<ReturnType<StorageDiskService['buildZipAsync']>>;
