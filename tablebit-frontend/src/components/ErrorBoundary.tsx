import React, { Component, type ErrorInfo, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, RotateCcw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(
      JSON.stringify({
        type: 'REACT_ERROR',
        name: error.name,
        message: error.message,
        stack: error.stack?.split('\n').slice(0, 5).join('\n'),
        componentStack: errorInfo.componentStack?.split('\n').slice(0, 5).join('\n'),
        url: window.location.href,
        timestamp: new Date().toISOString(),
      })
    );
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = "/";
  };

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="flex flex-col items-center justify-center min-h-[300px] rounded-xl border border-border bg-card p-8 text-center">
          <AlertTriangle className="h-12 w-12 text-destructive/50 mb-4" />
          <h3 className="font-display text-lg font-semibold mb-2">Algo salió mal</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm">
            Ha ocurrido un error inesperado. Por favor intenta nuevamente.
          </p>
          <div className="flex gap-3">
            <Button onClick={this.handleReload} variant="outline">
              <RotateCcw className="h-4 w-4 mr-2" />
              Reintentar
            </Button>
            <Button onClick={this.handleReset}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Volver al inicio
            </Button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
