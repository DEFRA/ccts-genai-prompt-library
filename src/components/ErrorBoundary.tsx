import { Component, ErrorInfo, ReactNode } from 'react';
import { toast } from 'react-hot-toast';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    toast.error('Something went wrong');
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-2 text-center">
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            Something went wrong
          </h2>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="mt-2 text-blue-600 dark:text-blue-400 hover:underline"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
