import React, { ErrorInfo, ReactNode } from 'react';
import { ShieldAlert, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in React Component tree:', error, errorInfo);
  }

  public handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0F0F11] text-[#f1f5f9] flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#800020]/20 border border-[#800020]/40 flex items-center justify-center text-rose-400 mb-4 shadow-lg">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold font-fantasy text-white mb-2">
            Algo inesperado ocurrió
          </h2>
          <p className="text-sm text-[#94a3b8] max-w-md mb-6">
            Ocurrió una excepción temporal en la aplicación. Podés reiniciar la vista para continuar normalmente.
          </p>
          <button
            onClick={this.handleReset}
            className="px-5 py-2.5 bg-gradient-to-r from-[#800020] to-[#b91c1c] hover:from-[#950025] hover:to-[#dc2626] text-white text-sm font-semibold rounded-xl flex items-center gap-2 shadow-lg transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Recargar RolCerca</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

