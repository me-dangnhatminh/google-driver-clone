import React, { createElement } from "react";
import {
  ArchiveRestore,
  Download,
  Loader,
  MoreVertical,
  OctagonXIcon,
  Pencil,
  Star,
  Trash,
  UserPlus,
} from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@components/ui/dialog";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@components/ui/popover";
import { Separator } from "@components/ui/separator";
import { Button, ButtonProps } from "@components/ui/button";
import { Input } from "@components/ui/input";

import { ItemType } from "./list-view";
import { useForm } from "react-hook-form";
import { ExternalToast, toast } from "sonner";
import {
  useDownloadFile,
  useDownloadFolder,
  useHardDelete,
  useUpdateFile,
  useUpdateFolder,
} from "@hooks";
import { cn } from "@/lib/utils";

export const ItemAction = (props: {
  onUpdated?: (
    label: "rename" | "archive" | "unarchive" | "pin" | "unpin",
    item: ItemType
  ) => void;
  folderId?: string;
  item: ItemType;
}) => {
  const { item } = props;
  const [open, setOpen] = React.useState(false);
  const modalRef = React.useRef<RenameModalRef>(null);
  const [isLoading, setLoading] = React.useState(false);

  const fileDownload = useDownloadFile();
  const folderDownload = useDownloadFolder();

  const updateFile = useUpdateFile(props.folderId);
  const updateFolder = useUpdateFolder(props.folderId);
  const hardDelete = useHardDelete();

  const fetch = item.viewAs === "file" ? updateFile : updateFolder;
  const fetchDownload = item.viewAs === "file" ? fileDownload : folderDownload;

  const eraseForever = () => {
    if (isLoading || !item.archivedAt) return;
    setLoading(true);
    const deleting = hardDelete
      .mutateAsync({ id: item.id, type: item.viewAs })
      .finally(() => setLoading(false));
    toast.promise(deleting, { success: "Deleted!", error: "Error deleting" });
  };

  const rename = (name: string) => {
    modalRef.current?.close();
    if (isLoading) return;
    if (name === item.name) return;
    setLoading(true);
    name = name.trim();
    const updating = fetch
      .mutateAsync({ id: item.id, label: "rename", name })
      .then(() => props.onUpdated?.("rename", item))
      .finally(() => setLoading(false));
    toast.promise(updating, { success: "Renamed!", error: "Error renaming" });
  };

  const archive = () => {
    if (isLoading) return;
    setLoading(true);
    const updating = fetch
      .mutateAsync({ id: item.id, label: "archive" })
      .finally(() => setLoading(false));
    toast.promise(updating, { success: "Archived!", error: "Error archiving" });
  };

  const unarchive = () => {
    if (isLoading) return;
    setLoading(true);
    const updating = fetch
      .mutateAsync({ id: item.id, label: "unarchive" })
      .then(() => props.onUpdated?.("unarchive", item))
      .finally(() => setLoading(false));
    toast.promise(updating, { success: "Restored!", error: "Error restoring" });
  };

  const handleDownload = () => {
    if (isLoading) return;
    setLoading(true);

    const controller = new AbortController();
    const toastOpts: ExternalToast = {
      id: item.id,
      closeButton: true,
      onDismiss: () => controller.abort(),
    };

    fetchDownload
      .mutateAsync(
        {
          id: item.id,
          name: item.name,
          signal: controller.signal,
          onProgress: (progress) => {
            toast.message(`Downloading ${item.name}: ${progress}%`, toastOpts);
          },
        },
        {
          onSettled: () => toast.dismiss(toastOpts.id),
          onSuccess: (res) => {
            const link = document.createElement("a");
            link.href = window.URL.createObjectURL(res.data);
            link.setAttribute("download", res.name);
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success(`Downloaded ${item.name}`, toastOpts);
            window.URL.revokeObjectURL(link.href);
          },
        }
      )
      .finally(() => setLoading(false));
  };

  const share = () => {};

  const pinStar = () => {
    if (isLoading) return;
    setLoading(true);
    const updating = fetch
      .mutateAsync({ id: item.id, label: "pin" })
      .then(() => props.onUpdated?.("pin", item))
      .finally(() => setLoading(false));
    toast.promise(updating, { success: "Pinned!", error: "Error pinning" });
  };

  const unpinStart = () => {
    if (isLoading) return;
    setLoading(true);
    const updating = fetch
      .mutateAsync({ id: item.id, label: "unpin" })
      .then(() => props.onUpdated?.("unpin", item))
      .finally(() => setLoading(false));
    toast.promise(updating, { success: "Unpinned!", error: "Error unpinning" });
  };

  const toggleStar = () => {
    if (item.pinnedAt) unpinStart();
    else pinStar();
  };

  const toggleArchive = () => {
    if (item.archivedAt) unarchive();
    else archive();
  };

  const PinElem = item.pinnedAt ? PinnedElem : UnpinElem;
  const TrashElem = item.archivedAt ? RestoreElem : ArchiveElem;

  const buttonC = `p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full`;
  const popoverIC = `flex items-center hover:bg-secondary transition py-2 px-4 space-x-2 text-sm`;

  return (
    <div role="button" className="flex items-center space-x-1">
      <RenameModal ref={modalRef} onRename={rename} name={item.name} />
      <div
        role="button"
        className={buttonC}
        children={isLoading ? LoadingElem : TrashElem}
        onClick={toggleArchive}
      />
      <div
        role="button"
        className={buttonC}
        onClick={toggleStar}
        children={isLoading ? LoadingElem : PinElem}
      />

      <div
        role="button"
        className={cn(buttonC, item.archivedAt ? "" : "hidden")}
        onClick={eraseForever}
        children={isLoading ? LoadingElem : HardRemoveElem}
      />

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger className="flex justify-start" asChild>
          <div
            role="button"
            className={cn(buttonC, item.archivedAt ? "hidden" : "")}
            children={<MoreVertical className="h-4 w-4" />}
          />
        </PopoverTrigger>
        <PopoverContent className="px-0 py-2 mx-2">
          <div className={popoverIC} role="button" onClick={handleDownload}>
            <Download className="w-4 h-4" onClick={handleDownload} />
            <span>Download</span>
          </div>

          <div
            className={popoverIC}
            role="button"
            onClick={() => modalRef.current?.open()}
          >
            <Pencil className="w-4 h-4" />
            <span>Rename</span>
          </div>

          <Separator />

          <div className={popoverIC} role="button" onClick={share}>
            <UserPlus className="w-4 h-4" />
            <span>Share</span>
          </div>

          <div className={popoverIC} role="button" onClick={archive}>
            <Trash className="w-4 h-4" />
            <span>Move to trash</span>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

const itemC = "w-4 h-4 opacity-50";
const LoadingElem = createElement(Loader, {
  className: cn(itemC, "animate-spin text-muted-foreground"),
});
const PinnedElem = createElement(Star, {
  className: cn(itemC, "fill-yellow-400 text-yellow-400 opacity-100"),
});
const UnpinElem = createElement(Star, { className: itemC });
const ArchiveElem = createElement(Trash, { className: itemC });
const RestoreElem = createElement(ArchiveRestore, { className: itemC });
const HardRemoveElem = createElement(OctagonXIcon, {
  className: cn("w-4 h-4", "text-red-500"),
});
export default ItemAction;

type RenameModalProps = {
  name: string;
  onRename: (name: string) => void;
};
type RenameModalRef = {
  close: () => void;
  open: () => void;
  toggle: () => void;
};
const RenameModal = React.forwardRef<RenameModalRef, RenameModalProps>(
  ({ name, onRename }, ref) => {
    const form = useForm<{ name: string }>({ defaultValues: { name } });

    const [isOpen, setOpen] = React.useState(false);

    const close = () => setOpen(false);
    const open = () => setOpen(true);
    const toggle = () => setOpen((prev) => !prev);

    React.useImperativeHandle(ref, () => ({ close, open, toggle }));

    const title = "Rename folder";
    const placeholder = "Folder name";

    return (
      <Dialog open={isOpen} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle children={title} />
          </DialogHeader>

          <div className="flex flex-col space-y-2">
            <Form {...form}>
              <form
                className="space-y-2"
                onSubmit={form.handleSubmit(({ name }) => onRename(name))}
              >
                <FormField
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input placeholder={placeholder} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end items-center space-x-2">
                  <IButton onClick={close} children="Cancel" type="button" />
                  <IButton type="submit" variant="outline" children="Rename" />
                </div>
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
);

// "I" is Internal
const IButton = (props: ButtonProps) => (
  <Button variant="ghost" size="sm" {...props} />
);
