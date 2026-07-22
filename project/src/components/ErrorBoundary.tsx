import React from 'react';

interface State {
  hasError: boolean;
  error?: Error | null;
}

export default class ErrorBoundary extends React.Component<React.PropsWithChildren<{}>, State> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: unknown) {
    // eslint-disable-next-line no-console
    console.error('Uncaught render error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#030712] dark:text-slate-100 flex items-center justify-center p-6">
          <div className="max-w-2xl rounded-lg border border-rose-400/10 bg-white/90 dark:bg-[#071018]/80 p-6 text-center">
            <h2 className="mb-2 text-lg font-bold text-white">Something went wrong</h2>
            <p className="mb-4 text-sm text-slate-300">An unexpected error occurred while rendering the app. Navigation is still available below.</p>
            <details className="text-xs text-slate-400 whitespace-pre-wrap">{this.state.error?.stack ?? String(this.state.error)}</details>
          </div>
        </div>
      );
    }

    return this.props.children as React.ReactElement;
  }
}
