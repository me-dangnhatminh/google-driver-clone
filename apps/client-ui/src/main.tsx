import "@assets/styles/index.css";
import React, { PropsWithChildren } from "react";
import ReactDOM from "react-dom/client";
import * as ReactQuery from "@tanstack/react-query";
import * as Sentry from "@sentry/react";
import * as Spinner from "@components/spinner";
import { Auth0Provider } from "@auth0/auth0-react";

import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { ThemeProvider } from "./contexts";
import RootRouter from "./root-router";
import { UnknownError } from "@pages/errors";

const Themed = (props: PropsWithChildren) => {
  return (
    <ThemeProvider
      defaultTheme="system"
      storageKey="theme-mode"
      children={props.children}
    />
  );
};

const Auth0Providered = (props: PropsWithChildren) => {
  return (
    <Auth0Provider
      domain={import.meta.env.VITE_AUTH0_DOMAIN}
      clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: import.meta.env.VITE_AUTH0_AUDIENCE,
        scope: "openid profile email",
      }}
      useRefreshTokens={true}
      cacheLocation="localstorage"
      children={props.children}
      onRedirectCallback={(appState) => {
        if (!appState || !appState.returnTo) return;
        window.location.assign(appState.returnTo);
      }}
    />
  );
};

export function App() {
  const [queryClient] = React.useState(
    new ReactQuery.QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          refetchOnWindowFocus: false,
          refetchOnMount: false,
          refetchOnReconnect: false,
          throwOnError(_error, query) {
            if (query.state.data === undefined) return true;
            return false;
          },
        },
        mutations: { retry: false, throwOnError: true },
      },
    })
  );
  return (
    <Sentry.ErrorBoundary fallback={<UnknownError />} showDialog>
      <React.Suspense fallback={<Spinner.SpinnerScreen />}>
        <ReactQuery.QueryClientProvider client={queryClient}>
          <ReactQueryDevtools initialIsOpen={false} />
          <Auth0Providered>
            <Themed>
              <RootRouter />
            </Themed>
          </Auth0Providered>
        </ReactQuery.QueryClientProvider>
      </React.Suspense>
    </Sentry.ErrorBoundary>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(<App />);
