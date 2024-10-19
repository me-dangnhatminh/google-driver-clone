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
import { useParams } from "react-router-dom";

import StorageApi from "@api/storage.api-v2";

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
  const params = useParams<StoragePage.Props>();

  const storage = useStorage(props.storageId);
  if (storage.isLoading) return <div>Loading...</div>;
  const data = storage.data;
  if (!data) return <div>No data</div>;

  const folderId = params.folderId ?? data.id;

  return (
    <div className="w-full h-full px-6 pb-4 select-none">
      <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex flex-col space-y-4 p-2 rounded-lg">
        <TitleBar
          folderId={folderId}
          layout={{ value: "grid", toggle: () => {} }}
        />
        {<FolderComponent folderId={folderId} />}
      </div>
    </div>
  );
};

export const StoragePage = () => {
  const { user } = useAuth0();
  const storageId: string | null = useMemo(() => {
    if (!user) return null;
    const metadata = user["custom_metadata"] ?? {};
    if (metadata["my-storage"]) return metadata["my-storage"];
    return localStorage.getItem("my-storage");
  }, [user]);

  if (!storageId) {
    StorageApi.myStorage().then((storage) => {
      localStorage.setItem("my-storage", storage.id);
    });
    return null;
  }
  return <MyStoragePage storageId={storageId} />;
};

export default StoragePage;
