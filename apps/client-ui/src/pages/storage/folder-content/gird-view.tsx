import React from "react";
import { cn } from "@/lib/utils";
import { Input } from "@components/ui/input";
import { FolderIcon } from "lucide-react";
import ItemActions, { ItemActionsRef } from "./item-action";
import { useFolder } from "@hooks/storage.hook";
import { toast } from "sonner";

export const GridView = (props: { items: CardItemProps["item"][] }) => {
  const { items } = props;

  const girdClass = `grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6`;
  return (
    <div className="w-full h-full overflow-y-auto scroll-mx-0 px-4 pb-4 space-y-2 select-auto">
      <div className="space-y-2" hidden={items.length === 0}>
        <div className={girdClass}>
          {items.map((item, idx) => (
            <CardItem key={idx} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
};

export type CardItemProps = {
  item: {
    id: string;
    kind?: "folder" | "file";
    name: string;
    ownerId?: string;
    parentId?: string;
    size?: number;
    createdAt?: string;
    modifiedAt?: string;
    archivedAt?: string;
    pinnedAt?: string;
    thunbnail?: string;
  };
};

export const CardItem = (props: CardItemProps) => {
  const { item } = props;
  const [action, setAction] = React.useState<string | null>(null);
  const actionRef = React.useRef<ItemActionsRef>(null);

  const folder = useFolder(item.id, { enabled: false });

  const update = folder.folderUpdate;
  const deleteF = folder.folderDelete;

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
          const newName = e.target.value.trim();
          if (newName !== item.name) {
            update.mutate(
              { name: newName },
              {
                onSuccess: () => toast.success("Renamed successfully"),
                onError: (err) => {
                  toast.error(`Failed to rename: ${err.message}`);
                },
                onSettled: () => {
                  actionRef.current?.setLoading(false);
                  setAction(null);
                },
              }
            );
          } else {
            actionRef.current?.setLoading(false);
            setAction(null);
          }
        }}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onKeyDown={(e: any) => {
          if (e.key === "Enter") {
            e.stopPropagation();
            e.preventDefault();
            e.target.blur();
          }
        }}
      />
    ) : (
      <h2 className="text-sm font-semibold truncate">{item.name}</h2>
    );

  return (
    <div
      className={cn(
        "bg-white dark:bg-neutral-800 rounded-lg p-2 shadow-sm space-y-1 cursor-pointer",
        "hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 ease-in-out"
      )}
    >
      <div
        className="flex items-center justify-between space-x-2"
        onDoubleClick={(e) => e.stopPropagation()}
      >
        <FolderIcon className="w-7 h-5" />
        <div className="w-full overflow-hidden rounded-sm">{TitleELem}</div>

        <ItemActions
          ref={actionRef}
          closeOnAction={true}
          onAction={(a) => {
            setAction(a);
            actionRef.current?.setLoading(true);
          }}
          onDelete={() => {
            deleteF.mutate(undefined, {
              onSuccess: () => toast.success("Deleted successfully"),
              onError: (err) => {
                toast.error(`Failed to delete: ${err.message}`);
              },
              onSettled: () => actionRef.current?.setLoading(false),
            });
          }}
          onPin={() => {
            update.mutate(
              { pinned: true },
              {
                onSuccess: () => toast.success("Pinned successfully"),
                onError: (err) => {
                  toast.error(`Failed to pin: ${err.message}`);
                },
                onSettled: () => actionRef.current?.setLoading(false),
              }
            );
          }}
          onUnpin={() => {
            update.mutate(
              { pinned: false },
              {
                onSuccess: () => toast.success("Unpinned successfully"),
                onError: (err) => {
                  toast.error(`Failed to unpin: ${err.message}`);
                },
                onSettled: () => actionRef.current?.setLoading(false),
              }
            );
          }}
          onArchive={() => {
            update.mutate(
              { archived: true },
              {
                onSuccess: () => toast.success("Archived successfully"),
                onError: (err) => {
                  toast.error(`Failed to archive: ${err.message}`);
                },
                onSettled: () => actionRef.current?.setLoading(false),
              }
            );
          }}
          onRestore={() => {
            update.mutate(
              { archived: false },
              {
                onSuccess: () => toast.success("Restored successfully"),
                onError: (err) => {
                  toast.error(`Failed to restore: ${err.message}`);
                },
                onSettled: () => actionRef.current?.setLoading(false),
              }
            );
          }}
          exclude={{
            pin: !!item.pinnedAt,
            unpin: !item.pinnedAt,
            archive: !!item.archivedAt,
            restore: !item.archivedAt,
            delete: !item.archivedAt,
          }}
        />
      </div>
      <div
        hidden={!item.thunbnail}
        className="bg-white rounded-lg overflow-hidden aspect-square"
      >
        <img
          loading="lazy"
          alt={`Thumbnail of ${item.name}`}
          src={item.thunbnail}
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
};
