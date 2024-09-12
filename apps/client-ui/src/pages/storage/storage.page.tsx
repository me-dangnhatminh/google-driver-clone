/* eslint-disable @typescript-eslint/no-namespace */
import React from "react";
import { useLocation, useParams } from "react-router-dom";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@components/ui/popover";
import { ChevronDown, LayoutPanelTop, TableProperties } from "lucide-react";
import { useFolder } from "@hooks";
import DefaultLayout from "@layouts/default.layout";
import Navbar from "./navbar";
import Sidebar from "./sidebar";
import { Toaster } from "sonner";
import { ItemLabel } from "@api";
import { RoutesPath } from "@constants";
import { useAuth0 } from "@auth0/auth0-react";

import DocActions from "./doc-actions";
import DocModal from "./doc-modal";
import ListView from "./list-view";
import GridView from "./gird-view";

namespace StoragePage {
  export type Props = { folderId?: string; label?: ItemLabel };
  export type Layout = "list" | "grid";
  export type TitleProps = {
    folderId?: string;
    layout: Layout;
    toggle?: () => void;
  };
}

const StoragePage = (props: StoragePage.Props) => {
  const [layout, setLayout] = React.useState<StoragePage.Layout>("list");
  const toggleLayout = () => setLayout((p) => (p === "list" ? "grid" : "list"));
  const ViewCom = layout === "grid" ? GridView : ListView;
  return (
    <div className="w-full h-full px-6 pb-4 select-none">
      <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex flex-col space-y-4 p-2 rounded-lg">
        <Title
          folderId={props.folderId}
          layout={layout}
          toggle={toggleLayout}
        />
        <ViewCom {...props} />
      </div>
    </div>
  );
};

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

export default function Index() {
  const params = useParams<{ folderId?: string }>();
  const { isAuthenticated: isAuth } = useAuth0();
  const location = useLocation();
  const pathname = location.pathname;
  const folderId = params.folderId;
  let label: ItemLabel | undefined;
  if (pathname.startsWith(RoutesPath.PINNED)) {
    label = "pinned";
  } else if (pathname.startsWith(RoutesPath.ARCHIVED)) {
    label = "archived";
  } else if (pathname.startsWith(RoutesPath.MY_STORAGE)) {
    label = "my";
  } else label = undefined;

  if (!isAuth) return null;
  return (
    <DefaultLayout
      modal={<DocModal folderId={folderId} />}
      toast={<Toaster />}
      header={<Navbar />}
      sidebar={<Sidebar folderId={folderId} />}
      main={<StoragePage folderId={folderId} label={label} />}
    />
  );
}
