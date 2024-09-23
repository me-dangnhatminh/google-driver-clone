/* eslint-disable @typescript-eslint/no-namespace */
import { Api, FileRef, FolderContent, FolderInfo, ItemLabel } from "@api";
import { Input } from "@components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@components/ui/popover";
import { Separator } from "@components/ui/separator";
import { routesUtils } from "@constants";
import { useDownloadFile, useFolderInfinite, useUploadFile } from "@hooks";
import {
  ArchiveRestore,
  DownloadIcon,
  FolderIcon,
  MoreVertical,
  PencilIcon,
  PinIcon,
  Trash,
  TrashIcon,
} from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";
import { useHardDelete, useUpdateFile, useUpdateFolder } from "@hooks";
import { toast } from "sonner";
import { EmptyBackgroup, Loading } from "./helper-component";
import DropZone from "./drop-zone";

namespace GridView {
  export type File = FileRef;
  export type Folder = FolderInfo;
  export type Item = File | Folder;
  export type Action =
    | "download"
    | "rename"
    | "archive"
    | "unarchive"
    | "pin"
    | "unpin"
    | "erase";
  export type ActionProps = {
    item: Item;
    type: "file" | "folder";
    onAction?: (action: Action) => void;
    loading?: boolean;
  };
  export type Props = { folderId?: string; label?: ItemLabel };
}

function GridView(props: GridView.Props) {
  const [folder, setFolder] = React.useState<FolderContent>();

  const containerRef = React.useRef<HTMLDivElement>(null);
  const parent = useFolderInfinite(props.folderId, props.label);

  React.useEffect(() => {
    if (parent.isPending) return;
    const data = parent.data?.pages.reduce((acc, page) => {
      acc["content"] = acc["content"] || { files: [], folders: [] };
      const content = page.content;
      const files = content?.files ?? [];
      const folders = content?.folders ?? [];
      acc["content"].files.push(...files);
      acc["content"].folders.push(...folders);
      return acc;
    }, {} as FolderContent);
    setFolder(data);
  }, [parent.isPending, parent.data]);

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    if (!parent.hasNextPage || parent.isFetchingNextPage || parent.isFetching)
      return;

    if (container.scrollHeight <= container.clientHeight) {
      parent.fetchNextPage();
      return;
    }
    const heighBuffer = 100;
    let isFetching = false;
    container.addEventListener("scroll", () => {
      const isBottom =
        container.scrollHeight - container.scrollTop <=
        container.clientHeight + heighBuffer;
      if (isBottom && !isFetching) {
        isFetching = true;
        parent.fetchNextPage();
        container.removeEventListener("scroll", () => {});
      }
    });
    return () => container.removeEventListener("scroll", () => {});
  }, [containerRef, parent]);

  if (parent.isPending) return <Loading />;

  const folders = folder?.content.folders ?? [];
  const files = folder?.content.files ?? [];

  if (files.length === 0 && folders.length === 0) return <EmptyBackgroup />;
  const girdClass = `grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6`;

  return (
    <DropZone folderId={props.folderId}>
      <div
        ref={containerRef}
        className="w-full h-full overflow-y-auto scroll-mx-0 px-4 pb-4 space-y-2"
      >
        <div className="space-y-2" hidden={folders.length === 0}>
          <h2 className="font-semibold text-md">Folder</h2>
          <div className={girdClass}>
            {folders.map((folder, idx) => (
              <FolderCard key={idx} item={folder} />
            ))}
          </div>
        </div>

        <div className="space-y-2" hidden={files.length === 0}>
          <h2 className="font-semibold text-md">Files</h2>
          <div className={girdClass}>
            {files.map((file, idx) => (
              <FileCard key={idx} item={file} />
            ))}
          </div>
          {parent.isFetchingNextPage && <Loading />}
        </div>
      </div>
    </DropZone>
  );
}

const FileCard = (props: { item: GridView.File }) => {
  const item = props.item;
  const thumbnailRef = React.useRef<HTMLImageElement>(null);
  const [action, setAction] = React.useState<GridView.Action>();

  const thumbnailDownload = useDownloadFile(); // FIXME: downloadThumbnail err, and dont save to cache

  React.useEffect(() => {
    if (!thumbnailRef.current) return;
    if (
      !item.thumbnail ||
      thumbnailDownload.isPending ||
      thumbnailDownload.isError ||
      thumbnailDownload.isSuccess
    )
      return;
    const img = thumbnailRef.current;
    const url = item.thumbnail;
    if (!url) return;
    thumbnailDownload
      .mutateAsync({ id: item.id, name: item.name })
      .then((res) => {
        const objectURL = window.URL.createObjectURL(new Blob([res.data]));
        img.src = objectURL;
        img.classList.remove("hidden");
      });
  }, [thumbnailDownload, item.thumbnail, item]);

  const update = useUpdateFile();
  const hardDelete = useHardDelete();

  const rename = (name: string) => {
    const updating = update.mutateAsync({
      name: name,
      id: item.id,
      label: "rename",
    });
    toast.promise(updating, { success: "Renamed!", error: "Error renaming" });
    return updating;
  };

  const pin = () => {
    const updating = update.mutateAsync({ id: item.id, label: "pin" });
    toast.promise(updating, { success: "Pinned!", error: "Error pinning" });
    return updating;
  };

  const unpin = () => {
    const updating = update.mutateAsync({ id: item.id, label: "unpin" });
    toast.promise(updating, { success: "Unpinned!", error: "Error unpinning" });
    return updating;
  };

  const archive = () => {
    const updating = update.mutateAsync({ id: item.id, label: "archive" });
    toast.promise(updating, { success: "Archived!", error: "Error archiving" });
    return updating;
  };

  const unarchive = () => {
    const updating = update.mutateAsync({ id: item.id, label: "unarchive" });
    toast.promise(updating, {
      success: "Restored!",
      error: "Error restoring",
    });
    return updating;
  };

  const erase = () => {
    const deleting = hardDelete.mutateAsync({ id: item.id, type: "folder" });
    toast.promise(deleting, { success: "Deleted!", error: "Error deleting" });
    return deleting;
  };

  const handleAction = (action: GridView.Action) => {
    setAction(action);
    let acc: Promise<unknown> = Promise.resolve();
    switch (action) {
      case "rename":
        return;
      case "archive":
        acc = archive();
        break;
      case "unarchive":
        acc = unarchive();
        break;
      case "pin":
        acc = pin();
        break;
      case "unpin":
        acc = unpin();
        break;
      case "erase":
        acc = erase();
        break;
    }
    return acc.finally(() => setAction(undefined));
  };

  const TitleELem =
    action === "rename" ? (
      <Input
        type="text"
        className="w-full h-8 text-sm font-semibold truncate rounded-sm outline-none"
        defaultValue={item.name}
        onClick={(e) => e.stopPropagation()}
        onDoubleClick={(e) => e.stopPropagation()}
        autoFocus
        onBlur={(e) => {
          e.stopPropagation();
          e.preventDefault();
          rename(e.target.value);
        }}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onKeyDown={(e: any) => {
          if (e.key === "Enter") {
            e.stopPropagation();
            e.preventDefault();
            rename(`${e.target.value}`.trim());
          }
        }}
      />
    ) : (
      <h2 className="text-sm font-semibold truncate">{item.name}</h2>
    );

  return (
    <div
      className="
        bg-white dark:bg-neutral-800 rounded-lg p-2 shadow-sm space-y-1 cursor-pointer
        hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 ease-in-out
        "
    >
      <div
        className="flex items-center justify-between space-x-2"
        onDoubleClick={(e) => e.stopPropagation()}
      >
        <FolderIcon className="w-7 h-5" />
        <div className="w-full overflow-hidden rounded-sm">{TitleELem}</div>
        <ItemActions
          loading={!!action}
          onAction={handleAction}
          item={item}
          type="folder"
        />
      </div>
      <div className="bg-white rounded-lg overflow-hidden aspect-square">
        <img
          ref={thumbnailRef}
          loading="lazy"
          alt={item.name}
          className="w-full h-full object-cover hidden"
        />
      </div>
    </div>
  );
};

const FolderCard = (props: { item: GridView.Folder }) => {
  const item = props.item;
  const navigate = useNavigate();
  const [action, setAction] = React.useState<GridView.Action>();

  const update = useUpdateFolder();
  const hardDelete = useHardDelete();

  const url = routesUtils("FOLDERS")(item.id);

  const rename = (name: string) => {
    if (name === item.name) return setAction(undefined);
    const updating = update
      .mutateAsync({
        name: name,
        id: item.id,
        label: "rename",
      })
      .then(() => setAction(undefined));
    toast.promise(updating, { success: "Renamed!", error: "Error renaming" });
    return updating;
  };

  const pin = () => {
    const updating = update.mutateAsync({ id: item.id, label: "pin" });
    toast.promise(updating, { success: "Pinned!", error: "Error pinning" });
    return updating;
  };

  const unpin = () => {
    const updating = update.mutateAsync({ id: item.id, label: "unpin" });
    toast.promise(updating, { success: "Unpinned!", error: "Error unpinning" });
    return updating;
  };

  const archive = () => {
    const updating = update.mutateAsync({ id: item.id, label: "archive" });
    toast.promise(updating, { success: "Archived!", error: "Error archiving" });
    return updating;
  };

  const unarchive = () => {
    const updating = update.mutateAsync({ id: item.id, label: "unarchive" });
    toast.promise(updating, {
      success: "Restored!",
      error: "Error restoring",
    });
    return updating;
  };

  const erase = () => {
    const deleting = hardDelete.mutateAsync({ id: item.id, type: "folder" });
    toast.promise(deleting, { success: "Deleted!", error: "Error deleting" });
    return deleting;
  };

  const handleAction = (action: GridView.Action) => {
    setAction(action);
    switch (action) {
      case "rename":
        return;
      case "archive":
        return archive().finally(() => setAction(undefined));
      case "unarchive":
        return unarchive().finally(() => setAction(undefined));
      case "pin":
        return pin().finally(() => setAction(undefined));
      case "unpin":
        return unpin().finally(() => setAction(undefined));
      case "erase":
        return erase().finally(() => setAction(undefined));
    }
    setAction(undefined);
  };

  const TitleELem =
    action === "rename" ? (
      <Input
        type="text"
        className="w-full h-8 text-sm font-semibold truncate rounded-sm outline-none"
        defaultValue={item.name}
        onClick={(e) => e.stopPropagation()}
        onDoubleClick={(e) => e.stopPropagation()}
        autoFocus
        onBlur={(e) => {
          e.stopPropagation();
          rename(e.target.value);
        }}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onKeyDown={(e: any) => {
          if (e.key === "Enter") rename(`${e.target.value}`.trim());
        }}
      />
    ) : (
      <h2 className="text-sm font-semibold truncate">{item.name}</h2>
    );

  return (
    <div
      data-folder_id={item.id}
      className="
        select-none
        bg-white dark:bg-neutral-800 rounded-lg p-2 shadow-sm space-y-1 cursor-pointer
        hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 ease-in-out
        "
    >
      <div
        className="flex items-center justify-between space-x-2"
        onDoubleClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          navigate(url);
        }}
      >
        <FolderIcon className="w-7 h-5" />
        <div className="w-full overflow-hidden rounded-sm">{TitleELem}</div>
        <ItemActions
          loading={!!action}
          onAction={handleAction}
          item={item}
          type="folder"
        />
      </div>
    </div>
  );
};

export default GridView;

const ItemActions = (props: GridView.ActionProps) => {
  const [open, setOpen] = React.useState(false);
  const item = props.item;

  const handleClick = (action: GridView.Action) => {
    if (props.onAction) props.onAction(action);
    setOpen(false);
  };

  const archive = {
    label: item.archivedAt ? "Restore" : "Archive",
    action: () => handleClick(item.archivedAt ? "unarchive" : "archive"),
    Comp: item.archivedAt ? ArchiveRestore : TrashIcon,
  };

  const erase = {
    action: () => handleClick("erase"),
    isVisible: !!item.archivedAt,
  };

  const BtnIcon = props.loading ? Loading : MoreVertical;
  const btn = `w-full flex items-center space-x-2 py-1 px-2 hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer text-muted-foreground`;
  const noPinC = "w-4 h-4 fill-gray-400 text-gray-400 opacity-50";
  const pinnedC = "w-4 h-4 fill-yellow-400 text-yellow-400 opacity-100";
  const pin = {
    label: item.pinnedAt ? "Unpin" : "Pin",
    action: () => handleClick(item.pinnedAt ? "unpin" : "pin"),
    elem: <PinIcon className={item.pinnedAt ? pinnedC : noPinC} />,
  };
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className="flex justify-start" asChild>
        <button
          disabled={props.loading}
          onDoubleClick={(e) => e.stopPropagation()}
          className="py-2 px-1 hover:bg-gray-400 dark:hover:bg-gray-300 rounded-sm text-muted-foreground"
          children={<BtnIcon className="h-4 w-4" />}
        />
      </PopoverTrigger>
      <PopoverContent
        onDoubleClick={(e) => e.stopPropagation()}
        className="px-0 py-0 mx-2 w-40"
      >
        <button className={btn} onClick={() => handleClick("rename")}>
          <PencilIcon className="w-4 h-4" />
          <span>Rename</span>
        </button>

        <button className={btn} onClick={() => handleClick("download")}>
          <DownloadIcon className="w-4 h-4" />
          <span>Download</span>
        </button>

        <button className={btn} onClick={() => pin.action()}>
          {pin.elem}
          <span>{pin.label}</span>
        </button>

        <Separator />

        <button className={btn} onClick={() => archive.action()}>
          <archive.Comp className="w-4 h-4" />
          <span>{archive.label}</span>
        </button>

        <button
          className={`${btn} ${erase.isVisible ? " text-red-500 " : "hidden"}`}
          onClick={() => erase.action()}
        >
          <Trash className="w-4 h-4" />
          <span>Remove forever</span>
        </button>
      </PopoverContent>
    </Popover>
  );
};
