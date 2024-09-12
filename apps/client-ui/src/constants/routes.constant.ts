const BASE = "";
const HOME = "/";

const STORAGE = `${BASE}/storage`;
const FOLDERS = `${STORAGE}/folders/:folderId`;
const MY_STORAGE = `${STORAGE}/my`;
const PINNED = `${STORAGE}/pinned`;
const ARCHIVED = `${STORAGE}/archived`;

const MEETING = `${BASE}/meet`;
const MEETING_ROOM = `${MEETING}/:friendlyId`;

export const RoutesPath = {
  HOME,
  STORAGE,
  MY_STORAGE,
  FOLDERS,
  PINNED,
  ARCHIVED,
  MEETING,
  MEETING_ROOM,
} as const;
export type RoutesPathKey = keyof typeof RoutesPath;
export type RoutesPathValue = (typeof RoutesPath)[RoutesPathKey];

// ==================== UTILS ====================
const RoutePathUtils = {
  HOME: () => HOME,
  FOLDERS: (folderId: string) => FOLDERS.replace(":folderId", folderId),
  MY_STORAGE: () => MY_STORAGE,
  STORAGE: () => STORAGE,
  PINNED: () => PINNED,
  ARCHIVED: () => ARCHIVED,
  MEETING: () => MEETING,
  MEETING_ROOM: (fiendlyId: string) =>
    MEETING_ROOM.replace(":fiendlyId", fiendlyId),
} as const satisfies Record<RoutesPathKey, unknown>;
type RoutePathUtils = typeof RoutePathUtils;

export const routesUtils = <TKey extends RoutesPathKey>(
  key: TKey
): RoutePathUtils[TKey] => Object.freeze(RoutePathUtils[key]);
