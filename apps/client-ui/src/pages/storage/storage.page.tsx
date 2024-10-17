/* eslint-disable @typescript-eslint/no-namespace */
import React, { useMemo } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@components/ui/popover";
import { ChevronDown, LayoutPanelTop, TableProperties } from "lucide-react";
import { useFolder, useFolderContent, useStorage } from "@hooks";
import { ItemLabel } from "@api";

import DocActions from "./doc-actions";
import ListView from "./list-view";
import GridView from "./gird-view";
import FilterBar from "./filter-bar";
import { useAuth0 } from "@auth0/auth0-react";

namespace StoragePage {
  export type Props = { folderId?: string; label?: ItemLabel };
  export type Layout = "list" | "grid";
  export type TitleProps = {
    folderId: string;
    layout: Layout;
    toggle?: () => void;
  };
}

function Title(props: StoragePage.TitleProps) {
  const folder = useFolder(props.folderId);

  const folderName = folder.data?.name ?? "Loading...";
  const LayoutIcon = props.layout === "list" ? TableProperties : LayoutPanelTop;
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
        onClick={props.toggle}
        children={<LayoutIcon className="w-5 h-5" />}
      />
    </section>
  );
}

const FolderContent = (props: { folderId: string }) => {
  const content = useFolderContent({ id: props.folderId });

  if (content.isLoading) return <div>Loading...</div>;
  const data = content.data;
  if (!data) return <div>No data</div>;
  const items = data.items;
  if (items.length === 0)
    return (
      <div>
        <button className="bg-slate-400 text-white px-4 py-2 rounded-lg">
          Create Folder
        </button>
      </div>
    );
};

const FolderComponent = (props: { folderId: string }) => {
  const folder = useFolder(props.folderId);
  if (folder.isLoading) return <div>Loading...</div>;
  const data = folder.data;
  if (!data) return <div>No data</div>;
  return <FolderContent folderId={data.id} />;
};

const MyStoragePage = (props: { storageId: string }) => {
  const storage = useStorage(props.storageId);
  if (storage.isLoading) return <div>Loading...</div>;
  const data = storage.data;
  if (!data) return <div>No data</div>;

  return (
    <div className="w-full h-full px-6 pb-4 select-none">
      <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex flex-col space-y-4 p-2 rounded-lg">
        {<FolderComponent folderId={data?.id} />}
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
// const [layout, setLayout] = React.useState<StoragePage.Layout>("grid");
// const toggleLayout = () => setLayout((p) => (p === "list" ? "grid" : "list"));
// const ViewCom = layout === "grid" ? GridView : ListView;
// return (
//   <div className="w-full h-full px-6 pb-4 select-none">
//     <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex flex-col space-y-4 p-2 rounded-lg">
//       <Title
//         folderId={props.folderId}
//         layout={layout}
//         toggle={toggleLayout}
//       />
//       <FilterBar />
//       <ViewCom {...props} />
//     </div>
//   </div>
// );

export default StoragePage;
