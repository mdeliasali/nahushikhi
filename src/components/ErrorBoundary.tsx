import { Component, ErrorInfo, ReactNode } from 'react';
import { RotateCcw, AlertTriangle } from 'lucide-react';
import { Button } from './ui/button';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
          <div className="glass-card rounded-[2rem] p-8 max-w-md w-full text-center space-y-6 shadow-elevated">
            <div className="h-20 w-20 bg-rose-100 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <AlertTriangle className="h-10 w-10 text-rose-600" />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-2xl font-black text-foreground">ওহ! কিছু সমস্যা হয়েছে</h1>
              <p className="text-sm font-medium text-muted-foreground whitespace-pre-wrap">
                কিছু একটা সমস্যা হয়েছে। পুনরায় চেষ্টা করুন।
              </p>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="text-left text-xs bg-rose-50 text-rose-900 p-4 rounded-xl overflow-auto max-h-32">
                <code>{this.state.error.message}</code>
              </div>
            )}

            <Button 
              onClick={() => {
                this.setState({ hasError: false, error: undefined });
                window.location.reload();
              }}
              className="w-full h-14 rounded-2xl bg-foreground text-background font-black hover:bg-foreground/90 transition-transform active:scale-95 text-lg"
            >
              <RotateCcw className="mr-2 h-5 w-5" />
              পুনরায় চেষ্টা করুন
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
