import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
  widgetName?: string;
  isWidget?: boolean;
  onReset?: () => void;
  navigate?: (path: string) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null,
    errorInfo: null,
    showDetails: false,
  };

  public static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  public handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  public toggleDetails = () => {
    this.setState((prev) => ({ showDetails: !prev.showDetails }));
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { isWidget, widgetName, fallbackTitle, fallbackMessage, navigate } = this.props;
      const { error, errorInfo, showDetails } = this.state;

      // Widget / Component Level Fallback (Compact)
      if (isWidget) {
        return (
          <div 
            className="my-4 p-5 bg-amber-50/70 rounded-2xl border border-amber-200/80 text-amber-900 shadow-2xs space-y-3"
            dir="rtl"
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-sm text-amber-950">
                  {fallbackTitle || `تعذر تحميل ${widgetName || 'هذا العنصر'}`}
                </h4>
                <p className="text-xs text-amber-800/90 mt-0.5 leading-relaxed">
                  {fallbackMessage || 'حدث خطأ مؤقت أثناء معالجة البيانات، يمكنك إعادة المحاولة الآن.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={this.handleReset}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-900 bg-amber-200/70 hover:bg-amber-200 px-3.5 py-1.5 rounded-xl transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>إعادة المحاولة</span>
              </button>
            </div>
          </div>
        );
      }

      // Page Level Fallback (Full View)
      return (
        <div 
          className="min-h-[60vh] flex items-center justify-center p-4 sm:p-8"
          dir="rtl"
        >
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xl space-y-6 text-center">
            <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-100 shadow-2xs">
              <AlertTriangle className="w-8 h-8 stroke-[1.8]" />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>استرداد تلقائي للأخطاء</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                {fallbackTitle || 'عذراً، حدث خطأ غير متوقع'}
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
                {fallbackMessage || 'واجهنا مشكلة تقنية أثناء عرض محتوى هذه الصفحة. تم عزل الخطأ لضمان استمرار عمل باقي أقسام المنصة.'}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={this.handleReset}
                className="inline-flex items-center justify-center gap-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-5 py-2.5 rounded-xl transition-all shadow-sm shadow-indigo-500/20 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>إعادة تحميل الصفحة</span>
              </button>

              <button
                onClick={() => {
                  this.handleReset();
                  if (navigate) {
                    navigate('/');
                  } else {
                    window.location.href = '/';
                  }
                }}
                className="inline-flex items-center justify-center gap-2 text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-5 py-2.5 rounded-xl transition-colors cursor-pointer"
              >
                <Home className="w-4 h-4" />
                <span>الرئيسية</span>
              </button>
            </div>

            {/* Expandable Technical Details */}
            {error && (
              <div className="pt-4 border-t border-slate-100 text-right">
                <button
                  onClick={this.toggleDetails}
                  className="w-full flex items-center justify-between text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors py-1 cursor-pointer"
                >
                  <span>تفاصيل الخطأ التقني (للمطورين)</span>
                  {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showDetails && (
                  <div className="mt-2 p-3 bg-slate-900 text-slate-100 rounded-xl text-left text-xs font-mono overflow-x-auto space-y-2 dir-ltr">
                    <p className="text-rose-400 font-bold">{error.toString()}</p>
                    {errorInfo?.componentStack && (
                      <pre className="text-[11px] text-slate-400 whitespace-pre-wrap">
                        {errorInfo.componentStack}
                      </pre>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
