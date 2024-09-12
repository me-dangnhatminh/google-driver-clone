import { RoutesPath } from "@constants";
import React, { lazy } from "react";
import {
  createBrowserRouter,
  RouterProvider,
  useLocation,
  useOutlet,
  useRouteError,
} from "react-router-dom";
import * as Sentry from "@sentry/react";
import { useAuth0 } from "@auth0/auth0-react";

import { apiInstance } from "@api/api";
import NotFoundPage from "@pages/errors/page-not-found";

const sentryCreateBrowserRouter =
  Sentry.wrapCreateBrowserRouter(createBrowserRouter);

const PublicRoutes: Record<string, boolean> = {
  [RoutesPath.HOME]: true,
};

const Authenticated = () => {
  const location = useLocation();
  const outlet = useOutlet();
  const {
    getAccessTokenSilently: getToken,
    isAuthenticated: isAuth,
    loginWithRedirect,
    isLoading,
  } = useAuth0();

  const path = location.pathname;

  React.useEffect(() => {
    if (isLoading) return;
    if (!isAuth && !PublicRoutes[path]) {
      loginWithRedirect({ appState: { returnTo: path } });
    }
  }, [isAuth, isLoading, loginWithRedirect, path]);

  let interceptorNum: number | undefined;
  if (isAuth) {
    if (interceptorNum) apiInstance.interceptors.request.eject(interceptorNum);
    interceptorNum = apiInstance.interceptors.request.use((config) => {
      return getToken().then((token) => {
        config.headers.Authorization = `Bearer ${token}`;
        return config;
      });
    });
  }

  return outlet;
};

const HomePage = lazy(() => import("@pages/home/home.page"));

const StoragePage = lazy(() => import("@pages/storage/storage.page"));
const MeetingPage = lazy(() => import("@pages/meeting/meeting.page"));

const router = sentryCreateBrowserRouter([
  {
    ErrorBoundary: () => useRouteError(),
    children: [
      { path: RoutesPath.HOME, Component: HomePage },
      {
        Component: Authenticated,
        children: [
          { path: RoutesPath.STORAGE, Component: StoragePage },
          { path: RoutesPath.FOLDERS, Component: StoragePage },
          { path: RoutesPath.PINNED, Component: StoragePage },
          { path: RoutesPath.ARCHIVED, Component: StoragePage },
          { path: RoutesPath.MEETING, Component: MeetingPage },
          { path: RoutesPath.MEETING_ROOM, Component: MeetingPage },
        ],
      },
      { path: "*", Component: NotFoundPage },
    ],
  },
]);

export function RootRouter() {
  return <RouterProvider router={router} />;
}
export default RootRouter;
