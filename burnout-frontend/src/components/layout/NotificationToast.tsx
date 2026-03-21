'use client';

import toast, { Toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

type ToastType = 'success' | 'error' | 'info' | 'loading';

interface NotificationToastProps {
  t: Toast;
  message: string;
  type?: ToastType;
  duration?: number;
}

const icons = {
  success: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  error: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  info: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  loading: (
    <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  ),
};

const colors = {
  success: {
    border: '#10b981',
    bg: 'rgba(16, 185, 129, 0.1)',
    text: '#10b981',
    icon: '#10b981',
  },
  error: {
    border: '#ef4444',
    bg: 'rgba(239, 68, 68, 0.1)',
    text: '#ef4444',
    icon: '#ef4444',
  },
  info: {
    border: '#6366f1',
    bg: 'rgba(99, 102, 241, 0.1)',
    text: '#6366f1',
    icon: '#6366f1',
  },
  loading: {
    border: '#6366f1',
    bg: 'rgba(99, 102, 241, 0.1)',
    text: '#6366f1',
    icon: '#6366f1',
  },
};

export function NotificationToast({ t, message, type = 'info' }: NotificationToastProps) {
  const color = colors[type];
  const icon = icons[type];

  return (
    <motion.div
      initial={{ opacity: 0, x: 400, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 400, scale: 0.9 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="min-w-[320px] max-w-md p-4 rounded-xl backdrop-blur-lg"
      style={{
        background: '#1a2235',
        border: `1px solid ${color.border}`,
        borderLeft: `4px solid ${color.border}`,
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.4)',
      }}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0" style={{ color: color.icon }}>
          {icon}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-text-primary break-words">
            {message}
          </p>
        </div>

        {type !== 'loading' && (
          <motion.button
            onClick={() => toast.dismiss(t.id)}
            className="flex-shrink-0 p-1 rounded-lg hover:bg-bg-elevated transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <svg className="w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </motion.button>
        )}
      </div>

      {type === 'loading' && (
        <motion.div
          className="mt-2 h-0.5 bg-bg-elevated rounded-full overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: color.border }}
            initial={{ width: '100%' }}
            animate={{ width: '0%' }}
            transition={{ duration: 4, ease: 'linear' }}
          />
        </motion.div>
      )}
    </motion.div>
  );
}

interface ToastOptions {
  duration?: number;
  position?: 'top-right' | 'top-center' | 'bottom-right' | 'bottom-center';
}

export const notify = {
  success: (message: string, options?: ToastOptions) => {
    return toast.custom(
      (t) => <NotificationToast t={t} message={message} type="success" />,
      { duration: options?.duration || 4000 }
    );
  },
  error: (message: string, options?: ToastOptions) => {
    return toast.custom(
      (t) => <NotificationToast t={t} message={message} type="error" />,
      { duration: options?.duration || 5000 }
    );
  },
  info: (message: string, options?: ToastOptions) => {
    return toast.custom(
      (t) => <NotificationToast t={t} message={message} type="info" />,
      { duration: options?.duration || 4000 }
    );
  },
  loading: (message: string, options?: ToastOptions) => {
    return toast.custom(
      (t) => <NotificationToast t={t} message={message} type="loading" />,
      { duration: options?.duration || 4000 }
    );
  },
  promise: <T,>(
    promise: Promise<T>,
    msgs: {
      loading: string;
      success: string;
      error: string;
    },
    options?: ToastOptions
  ) => {
    return toast.promise(
      promise,
      {
        loading: (t) => <NotificationToast t={t} message={msgs.loading} type="loading" />,
        success: (t) => <NotificationToast t={t} message={msgs.success} type="success" />,
        error: (t) => <NotificationToast t={t} message={msgs.error} type="error" />,
      },
      { duration: options?.duration || 4000 }
    );
  },
};

export default NotificationToast;
