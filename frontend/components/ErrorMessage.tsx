'use client';

import { AlertTriangle, XCircle, RefreshCw } from 'lucide-react';

interface ErrorMessageProps {
  title?: string;
  message: string;
  type?: 'error' | 'warning';
  onRetry?: () => void;
  fullScreen?: boolean;
}

export function ErrorMessage({ 
  title, 
  message, 
  type = 'error',
  onRetry,
  fullScreen = false 
}: ErrorMessageProps) {
  const Icon = type === 'error' ? XCircle : AlertTriangle;
  const colorClass = type === 'error' ? 'text-danger-400' : 'text-warning-400';
  const bgClass = type === 'error' ? 'bg-danger-500/10' : 'bg-warning-500/10';
  const borderClass = type === 'error' ? 'border-danger-500/30' : 'border-warning-500/30';

  const content = (
    <div className={`card border ${borderClass} ${bgClass} p-6 rounded-xl shadow-lg`}>
      <div className="text-center">
        <Icon className={`w-16 h-16 mx-auto mb-4 ${colorClass} animate-pulse`} />
        {title && (
          <h2 className="text-2xl font-bold mb-2 text-slate-100">{title}</h2>
        )}
        <p className="text-slate-400 mb-6">{message}</p>
        {onRetry && (
          <button 
            onClick={onRetry} 
            className="inline-flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-400 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        )}
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] px-4">
        <div className="max-w-md w-full">
          {content}
        </div>
      </div>
    );
  }

  return content;
}

export function InlineError({ message }: { message: string }) {
  return (
    <div className="flex items-center space-x-2 text-danger-400 text-sm bg-danger-500/10 border border-danger-500/30 rounded-lg p-3">
      <AlertTriangle className="w-4 h-4 flex-shrink-0" />
      <span>{message}</span>
    </div>
  );
}
