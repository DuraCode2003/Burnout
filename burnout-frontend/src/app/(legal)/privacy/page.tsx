'use client';

import { motion } from 'framer-motion';

const sections = [
  {
    icon: '🔒',
    title: 'Information We Collect',
    content: `We collect information you provide directly when you register and use the Platform, including:`,
    bullets: [
      'Account details: name, university email address, department',
      'Wellbeing data: daily mood check-ins, stress levels, burnout scores',
      'Usage data: features used, session duration, interaction patterns',
      'AI conversation data: messages exchanged with Luma (encrypted and anonymized)',
      'Device information: browser type, operating system, IP address',
    ],
  },
  {
    icon: '🧠',
    title: 'How We Use Your Information',
    content: `We use collected information for the following purposes:`,
    bullets: [
      'Providing and personalizing your wellbeing dashboard and insights',
      'Generating burnout risk assessments and trend analysis',
      'Powering Luma AI responses with relevant context about your wellbeing',
      'Sending proactive wellness alerts to you and (where applicable) designated counselors',
      'Improving the Platform through aggregated, anonymized analytics',
      'Complying with legal obligations and university data-sharing agreements',
    ],
  },
  {
    icon: '🤝',
    title: 'How We Share Your Information',
    content: `We do not sell your personal data. We may share information in these limited circumstances:`,
    bullets: [
      'With your university\u2019s designated counselors when your burnout risk reaches HIGH \u2014 you will always be informed',
      'With trusted service providers who operate under strict data processing agreements',
      'In aggregated, anonymized form for research and platform improvement',
      'When required by law, court order, or to protect the safety of users',
    ],
  },
  {
    icon: '🛡️',
    title: 'Data Security',
    content: `We take the security of your sensitive wellbeing data seriously:`,
    bullets: [
      'All data is encrypted in transit using TLS 1.3',
      'Wellbeing and mood data is encrypted at rest using AES-256',
      'Authentication uses JWT tokens with secure cookie storage',
      'Regular security audits and penetration testing',
      'Access to identifiable data is strictly role-based and logged',
    ],
  },
  {
    icon: '⏱️',
    title: 'Data Retention',
    content: `We retain your data only as long as necessary:`,
    bullets: [
      'Active account data is retained for the duration of your enrollment',
      'Check-in and mood data is kept for up to 2 years to support trend analysis',
      'AI conversation logs are retained for 90 days then permanently deleted',
      'You may request deletion of your account and all associated data at any time',
    ],
  },
  {
    icon: '✅',
    title: 'Your Rights',
    content: `Depending on your location, you may have the following rights regarding your data:`,
    bullets: [
      'Right to access — request a copy of all data we hold about you',
      'Right to rectification — correct inaccurate personal information',
      'Right to erasure — request deletion of your account and data',
      'Right to portability — receive your data in a machine-readable format',
      'Right to object — opt out of certain processing activities',
      'Right to restrict processing — limit how we use your data',
    ],
  },
  {
    icon: '🍪',
    title: 'Cookies & Local Storage',
    content: `We use cookies and browser local storage for the following purposes:`,
    bullets: [
      'Authentication tokens to keep you logged in securely',
      'Session preferences and UI state',
      'Chat history persistence (stored locally on your device only)',
      'We do not use third-party tracking or advertising cookies',
    ],
  },
  {
    icon: '👶',
    title: 'Children\'s Privacy',
    content: `Burnout Tracker is not intended for users under the age of 16. We do not knowingly collect personal data from children. If you believe a minor has registered, please contact us immediately so we can remove the account.`,
    bullets: [],
  },
  {
    icon: '🔄',
    title: 'Changes to This Policy',
    content: `We may update this Privacy Policy periodically. When we make significant changes, we will notify you via email or in-app notification at least 14 days before the changes take effect. Your continued use after the effective date constitutes acceptance.`,
    bullets: [],
  },
  {
    icon: '📬',
    title: 'Contact & Data Requests',
    content: `To exercise your rights or ask questions about this Privacy Policy, please use the Help & Support feature within the app. For urgent data concerns, your university's data protection officer is your primary point of contact.`,
    bullets: [],
  },
];

export default function PrivacyPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="mb-12 pb-8 border-b border-white/5">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest text-teal-400">Last updated: April 2025</span>
        </div>
        <h1 className="text-4xl font-black font-sora text-white tracking-tight mb-4">Privacy Policy</h1>
        <p className="text-text-secondary leading-relaxed max-w-2xl">
          Your wellbeing data is among the most sensitive information we handle. This policy explains exactly 
          what we collect, why we collect it, and how we protect it. We believe in full transparency.
        </p>
      </div>

      {/* Summary Banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-10 p-5 rounded-2xl bg-teal-500/5 border border-teal-500/20 flex items-start gap-4"
      >
        <span className="text-2xl mt-0.5">🔐</span>
        <div>
          <h2 className="text-sm font-black text-teal-300 mb-1">Our Privacy Promise</h2>
          <p className="text-xs text-text-secondary leading-relaxed">
            We will never sell your personal data. Your wellbeing data is encrypted, access-controlled, and used only to help you — not for advertising or commercial profiling.
          </p>
        </div>
      </motion.div>

      {/* Sections */}
      <div className="space-y-6">
        {sections.map((section, index) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04 }}
            className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.03] transition-colors group"
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="text-xl">{section.icon}</span>
              <h2 className="text-base font-bold font-sora text-white group-hover:text-teal-300 transition-colors">
                {section.title}
              </h2>
            </div>
            <p className="text-sm text-text-secondary leading-relaxed mb-3">
              {section.content}
            </p>
            {section.bullets.length > 0 && (
              <ul className="space-y-2">
                {section.bullets.map((bullet) => (
                  <li key={bullet} className="flex items-start gap-2.5 text-sm text-text-secondary">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500/60 mt-1.5 flex-shrink-0" />
                    {bullet}
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        ))}
      </div>

      {/* GDPR Note */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-12 p-6 rounded-2xl bg-teal-500/5 border border-teal-500/20 text-center"
      >
        <p className="text-sm text-text-secondary">
          This Privacy Policy is compliant with GDPR, PDPA, and applicable university data protection regulations.
        </p>
        <p className="text-xs text-text-secondary/50 mt-2">
          To exercise your data rights, use the Help & Support feature within the app.
        </p>
      </motion.div>
    </motion.div>
  );
}
