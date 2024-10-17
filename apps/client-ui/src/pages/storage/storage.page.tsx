/* eslint-disable @typescript-eslint/no-namespace */
import { useMemo } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@components/ui/popover";
import { ChevronDown, LayoutPanelTop, TableProperties } from "lucide-react";
import { useFolder, useFolderContent, useStorage } from "@hooks";
import { ItemLabel } from "@api";

import DocActions from "./doc-actions";
import { useAuth0 } from "@auth0/auth0-react";
import { GridView } from "./folder-content/gird-view";

namespace StoragePage {
  export type Props = { folderId?: string; label?: ItemLabel };
  export type Layout = "list" | "grid";
  export type TitleProps = {
    folderId: string;
    layout: Layout;
    toggle?: () => void;
  };
}

const FolderContent = (props: { folderId: string }) => {
  const content = useFolderContent({ id: props.folderId });
  if (content.isLoading) return <div>Loading...</div>;
  const data = content.data;
  if (!data) return <div>No data</div>;
  const items = data.items;
  return <GridView items={items} />;
};

const FolderComponent = (props: { folderId: string }) => {
  const folder = useFolder(props.folderId);
  if (folder.isLoading) return <div>Loading...</div>;
  const data = folder.data;
  if (!data) return <div>No data</div>;
  return <FolderContent folderId={data.id} />;
};

const TitleBar = (props: {
  folderId: string;
  layout: { value: "list" | "grid"; toggle: () => void };
}) => {
  const folder = useFolder(props.folderId);
  if (folder.isLoading) return <div>Loading...</div>;
  const data = folder.data;
  if (!data) return <div>No data</div>;
  const folderName = data.name;
  const layout = props.layout.value;
  const LayoutIcon = layout === "list" ? TableProperties : LayoutPanelTop;
  return (
    <section className="flex justify-between items-center">
      <Popover>
        <PopoverTrigger>
          <div className="hover:bg-slate-400 px-4 py-1 transition rounded-full flex items-center space-x-2">
            <h2 className="text-xl capitalize">{folderName}</h2>
            <ChevronDown className="w-5 h-5" />
          </div>
        </PopoverTrigger>
        <PopoverContent className="p-0 mx-6">
          <DocActions folderId={props.folderId} />
        </PopoverContent>
      </Popover>
      <div
        role="button"
        className="p-2 hover:bg-slate-400 rounded-full transition"
        onClick={props.layout.toggle}
        children={<LayoutIcon className="w-5 h-5" />}
      />
    </section>
  );
};

const MyStoragePage = (props: { storageId: string }) => {
  const storage = useStorage(props.storageId);
  if (storage.isLoading) return <div>Loading...</div>;
  const data = storage.data;
  if (!data) return <div>No data</div>;

  return (
    <div className="w-full h-full px-6 pb-4 select-none">
      <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex flex-col space-y-4 p-2 rounded-lg">
        <TitleBar
          folderId={data.id}
          layout={{ value: "grid", toggle: () => {} }}
        />
        {<FolderComponent folderId={data.id} />}
      </div>
    </div>
  );
};

export const StoragePage = (props: StoragePage.Props) => {
  const { user } = useAuth0();
  const storageId: string | null = useMemo(() => {
    if (!user) return null;
    const metadata = user["custom_metadata"];
    if (!metadata) return null;
    return metadata["my-storage"];
  }, [user]);
  if (!storageId) return null;
  return <MyStoragePage storageId={storageId} />;
};

export default StoragePage;
