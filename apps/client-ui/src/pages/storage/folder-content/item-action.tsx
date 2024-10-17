import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@components/ui/popover";
import { Spinner } from "@components/spinner";
import { Separator } from "@components/ui/separator";
import {
  ArchiveRestore,
  DownloadIcon,
  MoreVertical,
  PencilIcon,
  PinIcon,
  Trash,
  TrashIcon,
} from "lucide-react";
import React, { forwardRef, useState } from "react";

export type ItemActionsRef = {
  setIsOpen: (open: boolean) => void;
  setLoading: (loading: boolean) => void;
  setDisabled: (disabled: boolean) => void;
  open: () => void;
  close: () => void;
  toggle: () => void;
};

export type Action =
  | "rename"
  | "download"
  | "pin"
  | "unpin"
  | "archive"
  | "restore"
  | "delete";
export const ItemActions = forwardRef<
  ItemActionsRef,
  {
    defaultLoading?: boolean;
    defaultOpen?: boolean;
    exclude?: { [key in Action]?: boolean };
    onAction?: (action: Action) => void;
    onRename?: () => void;
    onDownload?: () => void;
    onPin?: () => void;
    onUnpin?: () => void;
    onArchive?: () => void;
    onRestore?: () => void;
    onDelete?: () => void;
    closeOnAction?: boolean;
    defaultDisabled?: boolean;
  }
>((props, ref) => {
  const {
    defaultLoading = false,
    defaultOpen = false,
    defaultDisabled = false,
    closeOnAction = true,
    onAction,
    exclude = {},
  } = props;
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [loading, setLoading] = useState(defaultLoading);
  const [disabled, setDisabled] = useState(defaultDisabled);

  const toggle = () => setIsOpen((prev) => !prev);
  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  React.useImperativeHandle(ref, () => ({
    setIsOpen,
    setLoading,
    setDisabled,
    open,
    close,
    toggle,
  }));

  const btn = `w-full flex items-center space-x-2 py-1 px-2 hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer text-muted-foreground`;
  return (
    <Popover
      open={isOpen}
      defaultOpen={defaultOpen}
      modal={false}
      onOpenChange={(open) => setIsOpen(open)}
    >
      <PopoverTrigger
        onClick={() => {
          if (disabled) return;
          toggle();
        }}
        className="flex justify-start"
        asChild
      >
        <button
          disabled={loading}
          onDoubleClick={(e) => e.stopPropagation()}
          className="py-2 px-1 hover:bg-gray-400 dark:hover:bg-gray-300 rounded-sm text-muted-foreground"
          children={
            loading ? <Spinner /> : <MoreVertical className="w-4 h-4" />
          }
        />
      </PopoverTrigger>
      <PopoverContent
        onDoubleClick={(e) => e.stopPropagation()}
        className="px-0 py-0 mx-2 w-40"
      >
        <button
          className={cn(btn, exclude.rename && "hidden")}
          onClick={() => {
            onAction?.("rename");
            if (closeOnAction) close();
          }}
        >
          <PencilIcon className="w-4 h-4" />
          <span>Rename</span>
        </button>

        <button
          className={cn(btn, exclude.download && "hidden")}
          onClick={() => {
            onAction?.("download");
            props.onDownload?.();
            if (closeOnAction) close();
          }}
        >
          <DownloadIcon className="w-4 h-4" />
          <span>Download</span>
        </button>

        <button
          className={cn(btn, exclude.pin ? "hidden" : "")}
          onClick={() => {
            onAction?.("pin");
            props.onPin?.();
            if (closeOnAction) close();
          }}
        >
          <PinIcon className="w-4 h-4" />
          <span>Pin</span>
        </button>

        <button
          className={cn(
            btn,
            exclude.unpin ? "hidden" : "",
            "fill-yellow-400 text-yellow-400 opacity-100"
          )}
          onClick={() => {
            onAction?.("unpin");
            props.onUnpin?.();
            if (closeOnAction) close();
          }}
        >
          <PinIcon className="w-4 h-4" />
          <span>Unpin</span>
        </button>

        <Separator />

        <button
          className={cn(btn, exclude.archive && "hidden")}
          onClick={() => {
            onAction?.("archive");
            props.onArchive?.();
            if (closeOnAction) close();
          }}
        >
          <ArchiveRestore className="w-4 h-4" />
          <span>Archive</span>
        </button>

        <button
          className={cn(btn, exclude.restore && "hidden")}
          onClick={() => {
            onAction?.("restore");
            props.onRestore?.();
            if (closeOnAction) close();
          }}
        >
          <Trash className="w-4 h-4" />
          <span>Restore</span>
        </button>

        <button
          className={cn(btn, exclude.delete && "hidden", "text-red-500")}
          onClick={() => {
            onAction?.("delete");
            props.onDelete?.();
            if (closeOnAction) close();
          }}
        >
          <TrashIcon className="w-4 h-4" />
          <span>Delete</span>
        </button>
      </PopoverContent>
    </Popover>
  );
});
export default ItemActions;
