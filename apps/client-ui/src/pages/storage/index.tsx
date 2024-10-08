/* eslint-disable @typescript-eslint/no-namespace */
import { useLocation, useParams } from "react-router-dom";

import DefaultLayout from "@layouts/default.layout";
import Navbar from "./navbar";
import Sidebar from "./sidebar";
import { Toaster } from "sonner";
import { ItemLabel } from "@api";
import { RoutesPath } from "@constants";
import { useAuth0 } from "@auth0/auth0-react";

import DocModal from "./doc-modal";

import StoragePage from "./storage.page";

export default function Index() {
  const params = useParams<{ label?: string; folderId?: string }>();

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
  }

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
