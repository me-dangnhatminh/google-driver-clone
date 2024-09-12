import React from "react";
import { File, Folder } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";
import FileUtils from "@/lib/file.utils";

import { useNavigate, useSearchParams } from "react-router-dom";
import { FileRef, FolderContent, FolderInfo, ItemLabel } from "@api";
import { RoutesPath } from "@constants";
import ItemAction from "./item-action";
import { useFolderInfinite } from "@hooks";
import { cn } from "@/lib/utils";
import { EmptyBackgroup, FolderaArchivied, Loading } from "./helper-component";

type FileItem = FileRef & { viewAs: "file" };
type FolderItem = FolderInfo & { viewAs: "folder" };
export type ItemType = FileItem | FolderItem;

export type ListViewProps = { folderId?: string; label?: ItemLabel };
function ListView(props: ListViewProps) {
  const containerRef = React.useRef<HTMLTableSectionElement>(null);
  const [folder, setFolder] = React.useState<FolderContent>();

  const [URLSearchParams] = useSearchParams();
  const folderId = props.folderId;
  const label = props.label;

  const fetchFolder = useFolderInfinite(folderId, label);

  React.useEffect(() => {
    if (fetchFolder.isPending) return;
    const data = fetchFolder.data?.pages.reduce((acc, page) => {
      acc["content"] = acc["content"] || { files: [], folders: [] };
      const content = page.content;
      const files = content?.files ?? [];
      const folders = content?.folders ?? [];
      acc["content"].files.push(...files);
      acc["content"].folders.push(...folders);
      return acc;
    }, {} as FolderContent);
    setFolder(data);
  }, [fetchFolder.isPending, fetchFolder.data]);

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    if (!fetchFolder.hasNextPage || fetchFolder.isFetching) return;
    let isFetching = false;
    if (!isFetching && container.scrollHeight <= container.clientHeight) {
      isFetching = true;
      fetchFolder.fetchNextPage();
      return;
    }
    const heighBuffer = 100;
    container.addEventListener("scroll", () => {
      const isBottom =
        container.scrollHeight - container.scrollTop <=
        container.clientHeight + heighBuffer;
      if (isBottom && !isFetching) {
        isFetching = true;
        fetchFolder.fetchNextPage();
        container.removeEventListener("scroll", () => {});
      }
    });
    return () => container.removeEventListener("scroll", () => {});
  }, [containerRef, fetchFolder]);

  const isArchived = Boolean(folder?.archivedAt);
  const highlights = URLSearchParams.get("highlights");
  const content = React.useMemo(() => {
    if (!folder) return [];
    const content = folder.content;
    const files = content?.files ?? [];
    const folders = content?.folders ?? [];
    const _files = files.map((f) => ({ ...f, viewAs: "file" }));
    const _folders = folders.map((f) => ({ ...f, viewAs: "folder" }));
    return [..._files, ..._folders] as ItemType[];
  }, [folder]);

  React.useLayoutEffect(() => {
    if (!highlights || fetchFolder.isPending) return;
    const row = document.getElementById(highlights);
    if (!row) return;
    row.scrollIntoView({ behavior: "smooth", block: "center" });
    row.classList.add("animate-bounce");
    setTimeout(() => {
      row.classList.remove("animate-bounce");
    }, 2000);
    return () => {
      row.classList.remove("animate-bounce");
    };
  }, [highlights, fetchFolder.isPending]);

  if (fetchFolder.isPending) return <Loading />;
  if (isArchived) return <FolderaArchivied folderId={folderId} />;
  if (content.length === 0) return <EmptyBackgroup />;
  return (
    <div className="w-full h-full overflow-hidden">
      <div
        ref={containerRef}
        className="relative w-full h-full overflow-y-auto"
      >
        <Table className={cn(bgColor, "w-full h-full")}>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Created at</TableHead>
              <TableHead>File size</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-200 dark:divide-gray-700">
            {content.map((item, idx) => (
              <ListItem key={idx} item={item} folderId={folderId} />
            ))}
            {fetchFolder.isFetchingNextPage && (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  <Loading />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default ListView;

const bgColor = cn("bg-slate-100 dark:bg-slate-800");
const dateFormator = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "2-digit",
});

type ListItemProps = {
  folderId?: string;
  item: ItemType;
};
const ListItem = (props: ListItemProps) => {
  const rowRef = React.useRef<HTMLTableRowElement>(null);

  const navigate = useNavigate();
  const { item } = props;
  const isFolder = item.viewAs === "folder";

  const toFolder = () => {
    if (!isFolder) return;
    const path = RoutesPath.FOLDERS.replace(":folderId", item.id);
    navigate(path);
  };

  const hanldeUpdated = (
    label: "rename" | "archive" | "unarchive" | "pin" | "unpin"
  ) => {
    if (label === "archive" || label === "unarchive") {
      const row = rowRef.current;
      row?.classList.add("hidden");
    }
  };

  const itemSize = isFolder ? "-" : FileUtils.formatBytes(Number(item.size));
  const ItemElm = isFolder ? Folder : File;
  const owner = item.owner;
  const fullName =
    owner?.fullName == "" ? "Unknown" : owner?.fullName || "Unknown";
  const avaPlac = owner?.avatarURI == "" ? "Unknown" : fullName[0];

  const classes = {
    item: `w-4 h-4 ${isFolder ? "text-gray-500" : "text-blue-500"}`,
  } as const;

  return (
    <TableRow id={item.id} ref={rowRef} className="group cursor-pointer">
      <TableCell onDoubleClick={toFolder}>
        <div className="flex items-center space-x-2 font-medium">
          <ItemElm className={classes.item} />
          <p className="max-w-52 truncate">{item.name}</p>
        </div>
      </TableCell>
      <TableCell className="flex items-center space-x-2">
        <Avatar className="w-6 h-6">
          <AvatarImage src={owner?.avatarURI ?? ""} alt={fullName} />
          <AvatarFallback
            className="bg-gray-500 text-white"
            children={avaPlac}
          />
        </Avatar>
        <span className="opacity-75">{fullName}</span>
      </TableCell>
      <TableCell>{dateFormator.format(new Date(item.createdAt))}</TableCell>
      <TableCell>{itemSize}</TableCell>
      <TableCell className="flex justify-end group items-center space-x-2">
        <ItemAction
          item={item}
          folderId={props.folderId}
          onUpdated={hanldeUpdated}
        />
      </TableCell>
    </TableRow>
  );
};
