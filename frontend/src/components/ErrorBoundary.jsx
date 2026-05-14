import React from 'react';
import { AlertTriangle } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-danger/10 text-danger flex items-center justify-center">
            <AlertTriangle size={32} />
          </div>
          <h2 className="text-2xl font-bold text-text-bright">Something went wrong</h2>
          <p className="text-text-dim max-w-md">
            The page encountered an unexpected error. Please try refreshing or go back to the dashboard.
          </p>
          <div className="bg-surface/50 border border-white/5 p-4 rounded-xl text-left overflow-auto max-w-2xl w-full">
            <code className="text-xs text-danger/80">
              {this.state.error?.message || 'Unknown error'}
            </code>
          </div>
          <div className="flex gap-4 pt-4">
            <button 
              className="btn-ghost" 
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </button>
            <button 
              className="btn-primary" 
              onClick={() => {
                this.setState({ hasError: false });
                window.location.href = '/';
              }}
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
