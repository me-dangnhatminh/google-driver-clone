export abstract class IDiskStorageService {
  abstract buildZipAsync(folderName: string, child: any): Promise<any>;
  abstract filePath(id: string): { isExists: boolean; fullPath: string };
}
