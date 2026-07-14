import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props { children: ReactNode }
interface State { hasError: boolean }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[app-error]', error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50 px-6 text-center">
        <div>
          <h1 className="text-lg font-bold text-slate-900">页面暂时出错了</h1>
          <p className="mt-2 text-sm text-slate-500">请刷新页面重试；如果问题持续，请记录视频和设备信息。</p>
          <button type="button" onClick={() => window.location.reload()} className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
            刷新页面
          </button>
        </div>
      </main>
    );
  }
}
