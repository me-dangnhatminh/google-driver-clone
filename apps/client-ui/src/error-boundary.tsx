import { Component, ErrorInfo, ReactElement, ReactNode } from "react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  errorElement?: ReactElement;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(_: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.handleRouterError(error, errorInfo);
  }

  public handleRouterError(error: Error, errorInfo: ErrorInfo) {}

  public render() {
    if (this.state.hasError) {
      return <div>Bou Something went wrong.</div>;
    }
    return this.props.children;
  }
}

export default ErrorBoundary;

const handleRouterError = (error: Error, errorInfo: ErrorInfo) => {};

// export function ErrorBoundary() {
//   const error = useRouteError();

//   if (isRouteErrorResponse(error)) {
//     const status = error.status;
//     if (status === 404) return <Navigate to="/404" replace />;
//     return <>Route Error: {status}</>;
//   }

//   return <>Unknown Error</>;
// }
// export default ErrorBoundary;
