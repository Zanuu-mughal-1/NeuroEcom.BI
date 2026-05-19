import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ShieldAlert, RefreshCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      let errorMessage = "An unexpected error occurred.";
      let isFirestoreError = false;

      try {
        if (this.state.error?.message) {
          const parsed = JSON.parse(this.state.error.message);
          if (parsed.error) {
            errorMessage = parsed.error;
            isFirestoreError = true;
          }
        }
      } catch (e) {
        errorMessage = this.state.error?.message || errorMessage;
      }

      return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6 text-center">
          <div className="max-w-md w-full glass p-12 rounded-[40px] space-y-8">
            <div className="w-20 h-20 electric-gradient rounded-3xl flex items-center justify-center mx-auto">
              <ShieldAlert className="w-10 h-10 text-zinc-950" />
            </div>
            
            <div className="space-y-4">
              <h2 className="text-3xl font-bold uppercase italic">System Fault</h2>
              <p className="text-zinc-400 text-sm leading-relaxed">
                {isFirestoreError 
                  ? "The connection to our energy grid was interrupted. This usually happens during database initialization."
                  : errorMessage}
              </p>
              {isFirestoreError && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-[10px] font-mono break-all">
                  {errorMessage}
                </div>
              )}
            </div>

            <button 
              onClick={() => window.location.reload()}
              className="w-full py-4 electric-gradient text-zinc-950 font-bold uppercase tracking-widest text-sm rounded-full flex items-center justify-center gap-3 hover:scale-105 transition-transform"
            >
              <RefreshCcw className="w-4 h-4" />
              Reboot System
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
