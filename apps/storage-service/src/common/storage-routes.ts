const BASE = '/storage';
const STORAGE_DETAIL = `${BASE}`;

const FILE_DOWNLOAD = `${BASE}/files/:key/download`;
const FILE_UPLOAD = `${BASE}/folders/:key/files/upload`;
const FILE_UPLOADS = `${BASE}/folders/:key/files/uploads`;
const FILE_UPDATE = `${BASE}/files/:key`;

const FOLDER_DETAIL = `${BASE}/folders/:key`;
const FOLDER_CREATE = `${BASE}/folders/:key`;
const FOLDER_DOWNLOAD = `${BASE}/folders/:key/download`;
const FOLDER_UPDATE = `${BASE}/folders/:key`;
const FOLDER_UPLOAD = `${BASE}/folders/:key/upload`;

const DELETE_ITEM = `${BASE}/items/:key`;

const GET_CONTENT = `${BASE}/content`;

export const StorageRoutes = {
  BASE,
  STORAGE_DETAIL,
  FILE_DOWNLOAD,
  FILE_UPLOAD,
  FILE_UPLOADS,
  FILE_UPDATE,
  FOLDER_DETAIL,
  FOLDER_CREATE,
  FOLDER_DOWNLOAD,
  FOLDER_UPDATE,
  FOLDER_UPLOAD,
  DELETE_ITEM,
  GET_CONTENT,
} as const;
