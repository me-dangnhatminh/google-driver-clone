// export type BaseEvent<T extends string, D = unknown> = {
//   type: T;
//   data: D;
// };

// export type FileAddedEvent = BaseEvent<
//   'file_added',
//   {
//     folderId: string;
//     file: {
//       id: string;
//       name: string;
//       size: number;
//       mimeType: string;
//       createdAt: Date;
//     };
//   }
// >;

// export type FileRemovedEvent = BaseEvent<
//   'file_removed',
//   {
//     folderId: string;
//     fileId: string;
//   }
// >;

// export type FileMovedEvent = BaseEvent<
//   'file_moved',
//   {
//     fromFolderId: string;
//     toFolderId: string;
//     fileId: string;
//   }
// >;
