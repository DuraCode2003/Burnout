'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { motion } from 'framer-motion';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
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
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/dashboard';
  };

  public render() {
    const { hasError, error } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
      if (fallback) {
        return fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-bg-primary p-6">
          <motion.div
            className="max-w-md w-full card-glow p-8 text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* Error Icon */}
            <motion.div
              className="w-20 h-20 mx-auto mb-6 rounded-full bg-danger/10 flex items-center justify-center"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
            >
              <svg
                className="w-10 h-10 text-danger"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </motion.div>

            {/* Title */}
            <motion.h2
              className="text-2xl font-bold font-sora text-text-primary mb-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Oops! Something went wrong
            </motion.h2>

            {/* Description */}
            <motion.p
              className="text-text-secondary mb-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              We encountered an unexpected error. Don't worry, our team has been notified.
            </motion.p>

            {/* Error Details (dev only) */}
            {process.env.NODE_ENV === 'development' && error && (
              <motion.div
                className="mb-6 p-4 rounded-xl bg-bg-surface border border-border-subtle text-left"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ delay: 0.5 }}
              >
                <p className="text-xs text-danger font-mono break-words">
                  {error.message}
                </p>
              </motion.div>
            )}

            {/* Action Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row gap-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <button
                onClick={this.handleRetry}
                className="flex-1 py-3 px-6 rounded-xl font-medium font-sora text-white bg-gradient-accent hover:shadow-glow-indigo-lg transition-shadow"
              >
                Try Again
              </button>
              <button
                onClick={this.handleGoHome}
                className="flex-1 py-3 px-6 rounded-xl font-medium font-sora text-text-secondary bg-bg-surface border border-border-subtle hover:border-border-default transition-colors"
              >
                Go Home
              </button>
            </motion.div>

            {/* Help Text */}
            <motion.p
              className="mt-6 text-xs text-text-muted"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              If the problem persists, please contact support.
            </motion.p>
          </motion.div>
        </div>
      );
    }

    return children;
  }
}

export default ErrorBoundary;
