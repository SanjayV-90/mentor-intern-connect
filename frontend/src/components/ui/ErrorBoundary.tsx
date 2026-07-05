import React, { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Card, CardContent } from './card';
import { Button } from './button';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught runtime error:', error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <Card className="glass-card border-rose-500/30 bg-slate-900/80 p-6 my-4 animate-fade-in">
          <CardContent className="flex flex-col items-center justify-center text-center p-6 space-y-4">
            <div className="h-12 w-12 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white">
                {this.props.fallbackTitle || 'Something Went Wrong'}
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-md">
                {this.props.fallbackMessage ||
                  'An unexpected runtime error occurred while rendering this section.'}
              </p>
              {this.state.error && (
                <div className="mt-3 p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-left font-mono text-[11px] text-rose-300 max-w-lg overflow-x-auto">
                  {this.state.error.message || 'Unknown render error'}
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <Button
                onClick={this.handleRetry}
                variant="outline"
                className="border-slate-700 bg-slate-800 hover:bg-slate-700 text-white text-xs h-9"
              >
                <RefreshCw className="mr-2 h-3.5 w-3.5" /> Try Again
              </Button>
              <Button
                onClick={() => window.location.reload()}
                className="bg-blue-600 hover:bg-blue-500 text-white text-xs h-9"
              >
                Reload Page
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}
