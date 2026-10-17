import { Component, ReactNode, ErrorInfo, cloneElement, isValidElement, type ReactElement } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode | ((error: Error, errorInfo: ErrorInfo) => ReactNode);
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

function toError(error: unknown): Error {
  if (error instanceof Error) return error;
  if (typeof error === 'string' && error.trim()) return new Error(error);
  if (error != null && typeof error === 'object' && 'message' in error) {
    const message = (error as { message: unknown }).message;
    if (typeof message === 'string' && message.trim()) return new Error(message);
  }
  return new Error('An unexpected error occurred');
}

export class RouteErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: unknown): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error: toError(error),
    };
  }

  componentDidCatch(error: unknown, errorInfo: ErrorInfo): void {
    const normalized = toError(error);

    console.error('RouteErrorBoundary caught error:', normalized, errorInfo);

    this.props.onError?.(normalized, errorInfo);

    this.setState({
      errorInfo,
    });
  }

  render(): ReactNode {
    if (this.state.hasError) {
      const { fallback } = this.props;
      const error = this.state.error ?? toError(null);
      const errorInfo = this.state.errorInfo ?? { componentStack: '' };

      if (typeof fallback === 'function') {
        return fallback(error, errorInfo);
      }

      if (isValidElement(fallback)) {
        return cloneElement(fallback as ReactElement<{ error?: Error; onReset?: () => void }>, {
          error,
          onReset: this.reset,
        });
      }

      if (fallback) {
        return fallback;
      }

      return (
        <div role="alert" aria-live="assertive" style={{ padding: '2rem', textAlign: 'center' }}>
          <h1>Something went wrong</h1>
          <p>{error.message}</p>
          <button type="button" onClick={this.reset}>
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }

  reset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };
}
