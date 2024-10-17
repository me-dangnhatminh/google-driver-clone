import StorageApi, { ItemLabel, Pagination } from "@api/storage.api";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import * as apiV2 from "@api/storage.api-v2";
const StorageApiV2 = apiV2.StorageApi;

export const useStorage = (id: string) => {
  return useQuery({
    queryKey: ["storage", id],
    queryFn: () => {
      return StorageApiV2.getStorage({ id });
    },
  });
};

export const useFolder = (id: string, options?: { enabled?: boolean }) => {
  const data = useQuery({
    queryKey: ["folder", id],
    queryFn: () => StorageApiV2.getFolder({ id }),
    enabled: options?.enabled,
  });

  const folderContent = useFolderContent({ id }, { enabled: false });
  const folderCreate = useCreateFolder({ parentId: id });
  const folderUpdate = useUpdateFolder({ id });
  const folderDelete = useDeleteFolder({ id });
  const fileUpload = useUploadFile({ parentId: id });
  const filesUpload = useUploadFiles({ parentId: id });

  return {
    ...data,
    folderCreate,
    folderUpdate,
    folderDelete,
    folderContent,
    fileUpload,
    filesUpload,
  };
};

export const useFolderContent = (
  props: {
    id: string;
    limit?: number;
    offset?: string;
    filter?: Record<string, unknown>;
    sort?: Record<string, string>;
  },
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: ["folder", props.id, "content"],
    queryFn: () => StorageApiV2.folderContent(props),
    enabled: options?.enabled,
  });
};

export const useCreateFolder = (props: { parentId: string }) => {
  const queryClient = useQueryClient();
  const { parentId } = props;
  return useMutation({
    mutationKey: ["folder", parentId, "create"],
    throwOnError: false,
    mutationFn: (data: Omit<apiV2.FolderCreateParams, "parentId">) => {
      return StorageApiV2.createFolder({ ...data, parentId });
    },
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ["folder", parentId, "content"] });
    },
  });
};

export const useUploadFile = (props: { parentId: string }) => {
  const { parentId } = props;
  const mutation = useMutation({
    mutationKey: ["folder", parentId, "file", "upload"],
    throwOnError: (err) => {
      if (err instanceof Error && err.name === "CanceledError") return false;
      return true;
    },
    mutationFn(req: {
      data: { file: File };
      onProgress?: (progress: number) => void;
      signal?: AbortSignal;
    }) {
      const { file } = req.data;

      return StorageApi.uploadFile(
        { file, parentId },
        {
          signal: req.signal,
          onUploadProgress(event) {
            const progress = event.progress;
            if (!progress) return req.onProgress?.(0);
            req.onProgress?.(Math.ceil(progress * 100));
          },
        }
      );
    },
    onMutate: (values) => values.onProgress?.(0),
    onSuccess: (_data, values) => values.onProgress?.(100),
  });
  return mutation;
};

export const useUploadFiles = (props: { parentId: string }) => {
  const { parentId } = props;
  const mutation = useMutation({
    mutationKey: ["folder", parentId, "files", "upload"],
    throwOnError: (err) => {
      if (err instanceof Error && err.name === "CanceledError") return false;
      return true;
    },
    mutationFn(req: {
      data: { files: File[] };
      onProgress?: (progress: number) => void;
      signal?: AbortSignal;
    }) {
      const { files } = req.data;
      return StorageApi.uploadFiles(
        { files, parentId },
        {
          signal: req.signal,
          onUploadProgress(event) {
            const progress = event.progress;
            if (!progress) return req.onProgress?.(0);
            req.onProgress?.(Math.ceil(progress * 100));
          },
        }
      );
    },
    onMutate: (values) => values.onProgress?.(0),
    onSuccess: (_data, values) => values.onProgress?.(100),
  });
  return mutation;
};

export const useUpdateFolder = (props: { id: string }) => {
  const { id } = props;
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["folder", id, "update"],
    throwOnError: false,
    mutationFn: (data: Omit<apiV2.FolderUpdateParams, "id">) => {
      return StorageApiV2.updateFolder({ ...data, id });
    },
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ["folder", id] });
    },
  });
};

export const useDeleteFolder = (props: { id: string }) => {
  const { id } = props;
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["folder", id, "delete"],
    throwOnError: false,
    mutationFn: () => {
      return StorageApiV2.deleteFolder({ id });
    },
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ["folder", id] });
    },
  });
};

// ====== OLD HOOKS ======

export const useFolderInfinite = (refId?: string, label?: ItemLabel) => {
  return useInfiniteQuery({
    queryKey: ["folder", refId, label, "infinite"],
    queryFn: ({ pageParam }: { pageParam: Pagination }) => {
      return StorageApi.getFolder({ id: refId, label, pagination: pageParam });
    },
    initialPageParam: { folderCursor: undefined, fileCursor: undefined },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
};

// export const useUpdateFile = (id: string) => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationKey: ["
//     throwOnError: false,
//     mutationFn: StorageApi.updateFile,
//     onSuccess: () => {
//       queryClient.refetchQueries({ queryKey: ["folder", refId] });
//     },
//   });
// };

// export const useUpdateFolder = (refId?: string) => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationKey: ["updateFolder", refId],
//     throwOnError: false,
//     mutationFn: StorageApi.updateFolder,
//     onSuccess: () => {
//       queryClient.refetchQueries({ queryKey: ["folder", refId] });
//     },
//   });
// };

export const useHardDelete = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["hardDelete"],
    throwOnError: false,
    mutationFn: StorageApi.hardDelete,
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ["folder"] });
      queryClient.refetchQueries({ queryKey: ["storage"] });
    },
  });
};

export const useDownloadFile = () => {
  return useMutation({
    mutationKey: ["downloadFile"],
    throwOnError: false,
    mutationFn: (req: {
      id: string;
      name: string;
      signal?: AbortSignal;
      onProgress?: (progress: number) => void;
    }) => {
      return StorageApi.downloadFile(req, {
        signal: req.signal,
        onDownloadProgress(event) {
          const progress = event.progress;
          if (!progress) return req.onProgress?.(0);
          req.onProgress?.(Math.ceil(progress * 100));
        },
      });
    },
    onMutate: (values) => values.onProgress?.(0),
    onSuccess: (_data, values) => {
      values.onProgress?.(100);
    },
  });
};

export const useDownloadFolder = () => {
  return useMutation({
    mutationKey: ["downloadFolder"],
    throwOnError: (err) => {
      if (err instanceof Error && err.name === "CanceledError") return false;
      return true;
    },
    mutationFn: (req: {
      id: string;
      signal?: AbortSignal;
      onProgress?: (progress: number) => void;
    }) => {
      return StorageApi.downloadFolder(req, {
        signal: req.signal,
        onDownloadProgress(event) {
          const progress = event.progress;
          if (!progress) return req.onProgress?.(0);
          req.onProgress?.(Math.ceil(progress * 100));
        },
      });
    },
    onMutate: (values) => values.onProgress?.(0),
    onSuccess: (_data, values) => values.onProgress?.(100),
  });
};

export const useDownloadThumbnail = () => {
  return useMutation({
    mutationKey: ["downloadThumbnail"],
    throwOnError: false,
    mutationFn: StorageApi.downloadThumbnail,
  });
};
