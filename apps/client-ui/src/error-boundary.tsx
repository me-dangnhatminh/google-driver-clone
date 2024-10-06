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

  public handleRouterError(_error: Error, _errorInfo: ErrorInfo) {}

  public render() {
    if (this.state.hasError) {
      return <div>Bou Something went wrong.</div>;
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
