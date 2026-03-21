import type { Metadata } from 'next';
import { DM_Sans, Sora } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
});

const sora = Sora({
  subsets: ['latin'],
  variable: '--font-sora',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: 'Burnout Tracker - Student Wellbeing System',
  description: 'A proactive student wellbeing system for universities. Track your mood, manage stress, and prevent burnout.',
  keywords: ['burnout', 'mental health', 'student wellbeing', 'mood tracker', 'stress management'],
  authors: [{ name: 'Burnout Tracker Team' }],
  openGraph: {
    title: 'Burnout Tracker - Student Wellbeing System',
    description: 'Track your mood, manage stress, and prevent burnout',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${dmSans.variable} ${sora.variable}`}>
      <body className="font-dm-sans bg-bg-primary text-text-primary antialiased">
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1a2235',
                color: '#f1f5f9',
                border: '1px solid rgba(148, 163, 184, 0.2)',
                borderRadius: '12px',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.4)',
                padding: '16px 20px',
                fontSize: '14px',
                fontWeight: '500',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#0a0e1a',
                },
                style: {
                  borderLeft: '4px solid #10b981',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#0a0e1a',
                },
                style: {
                  borderLeft: '4px solid #ef4444',
                },
              },
              loading: {
                iconTheme: {
                  primary: '#6366f1',
                  secondary: '#0a0e1a',
                },
                style: {
                  borderLeft: '4px solid #6366f1',
                },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
