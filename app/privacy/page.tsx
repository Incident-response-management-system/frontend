"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { IRMSLogo, Icon } from '@/components/irms-shared';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useIsMobile } from '@/hooks/use-media-query';

export default function PrivacyPage() {
  const router = useRouter();
  const isMobile = useIsMobile();

  return (
    <div style={{ background: 'var(--brand-cream)', minHeight: '100vh', color: 'var(--brand-ink)' }}>
      {/* Nav */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: isMobile ? '16px 16px' : '18px 40px',
        borderBottom: '1px solid var(--brand-hairline)',
        background: 'var(--surface-overlay)', backdropFilter: 'blur(14px) saturate(140%)',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button
            onClick={() => router.back()}
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--brand-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <Icon.back style={{ width: 16, height: 16 }} />
            {!isMobile && 'Back'}
          </button>
          <button onClick={() => router.push('/landing')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            <IRMSLogo size={14} color="var(--brand-ink)" />
          </button>
        </div>
        <ThemeToggle />
      </nav>

      {/* Content */}
      <div style={{ maxWidth: 720, margin: '0 auto', padding: isMobile ? '48px 20px 80px' : '72px 32px 100px' }}>
        <div style={{ fontSize: 11, color: 'var(--brand-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 12 }}>Legal</div>
        <h1 style={{ fontSize: isMobile ? 30 : 40, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.1, margin: '0 0 12px' }}>Privacy Policy</h1>
        <p style={{ fontSize: 13, color: 'var(--brand-muted)', margin: '0 0 48px' }}>Last updated: June 2026 · Effective from first public deployment</p>

        {[
          {
            heading: '1. Who we are',
            body: `IRMS (Incident Response Management System) is a civic emergency coordination platform developed and operated in partnership with state emergency services in Ogun State, Nigeria. We operate under applicable Nigerian data protection law, including the Nigeria Data Protection Regulation (NDPR) and the Nigeria Data Protection Act 2023.\n\nFor data protection enquiries, contact: privacy@irms.ng`,
          },
          {
            heading: '2. What data we collect',
            body: `We collect only what is necessary to coordinate emergency response:\n\n• Incident reports — the location, description, and media you submit when reporting an incident. Location data is the most sensitive field we hold.\n• Reporter identity — if you create a citizen account we store your email address and a hashed password. Anonymous reporting is always available without an account.\n• Session identifiers — a random browser session ID (stored in localStorage) that links anonymous reports to the same device so you can track them later.\n• Agency accounts — for registered response agencies we store organisation name, type, email, phone number, and service-area coordinates.\n• Usage logs — standard server logs (IP address, timestamp, endpoint) retained for up to 90 days for security purposes only.`,
          },
          {
            heading: '3. How we use your data',
            body: `We use your data exclusively to:\n\n• Dispatch the right agency to the right location in the shortest time.\n• Let you track the status of a report you submitted.\n• Allow agencies to manage their open caseload.\n• Detect and prevent abuse of the reporting system.\n\nWe do not profile users, run targeted advertising, or sell data to third parties under any circumstances.`,
          },
          {
            heading: '4. Location data',
            body: `Location is the core of what IRMS does. When you report an incident, the coordinates you pin on the map are stored and shared with response agencies in the relevant area. We do not track your device location in the background. Location is only captured at the moment of deliberate report submission, or when you explicitly click "Detect my location" in a form.\n\nAgency service-area locations are used solely to match incidents to the correct responders.`,
          },
          {
            heading: '5. Who can see your data',
            body: `• Response agencies — see the location, description, and type of incidents in their designated service area. They cannot see your email address or account details.\n• IRMS administrators — can access all data for operational oversight, fraud prevention, and legal compliance.\n• Third parties — we do not share personal data with third parties except where required by Nigerian law, court order, or to prevent imminent harm to life.\n• Infrastructure — our hosting provider processes data as a data processor under a data processing agreement. All data is stored in servers within Nigeria or a jurisdiction with adequate protection standards.`,
          },
          {
            heading: '6. Data retention',
            body: `• Incident reports — retained for 5 years from submission for public safety record-keeping.\n• Citizen accounts — retained until you request deletion; anonymised after 2 years of inactivity.\n• Anonymous session IDs — expire after 12 months of inactivity.\n• Server logs — deleted after 90 days.\n• Agency accounts — retained for the duration of the agency's partnership and 2 years thereafter.`,
          },
          {
            heading: '7. Your rights under the NDPA 2023',
            body: `You have the right to:\n\n• Access — request a copy of personal data we hold about you.\n• Rectification — ask us to correct inaccurate data.\n• Erasure — request deletion of your account and associated personal data (incident content may be retained in anonymised form for public safety records).\n• Portability — receive your data in a structured, machine-readable format.\n• Objection — object to processing where we rely on legitimate interest.\n• Lodge a complaint — with the Nigeria Data Protection Commission (NDPC) at ndpc.gov.ng.\n\nTo exercise any right, email privacy@irms.ng with the subject line "Data Rights Request".`,
          },
          {
            heading: '8. Cookies and storage',
            body: `IRMS uses:\n\n• Cookies — to store authentication tokens (agency_token, citizen_token) that keep you signed in. These are HttpOnly-equivalent session cookies with a 7-day lifetime.\n• localStorage — to store your anonymous reporter session ID and recent report references for tracking convenience.\n\nWe do not use advertising cookies, tracking pixels, or any third-party analytics scripts.`,
          },
          {
            heading: '9. Security',
            body: `We apply industry-standard security practices including HTTPS-only communication, hashed password storage (bcrypt), JWT-based authentication with refresh token rotation, and geo-fenced data access controls. No system is perfectly secure — if you believe you have found a security vulnerability, please report it responsibly to security@irms.ng.`,
          },
          {
            heading: '10. Children',
            body: `IRMS is a public safety service open to all ages. We do not knowingly collect personal data from children under 13 beyond what is necessary to submit an emergency incident report. If you believe a child has submitted personal data inappropriately, contact privacy@irms.ng and we will delete it promptly.`,
          },
          {
            heading: '11. Changes to this policy',
            body: `We may update this policy as the service evolves. Material changes will be announced on the platform at least 14 days before taking effect. Continued use of IRMS after the effective date constitutes acceptance of the revised policy.`,
          },
        ].map((section) => (
          <div key={section.heading} style={{ marginBottom: 40 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 12px', letterSpacing: '-0.01em' }}>{section.heading}</h2>
            <div style={{ fontSize: 14, color: 'var(--brand-ink)', lineHeight: 1.75 }}>
              {section.body.split('\n').map((line, i) => (
                <React.Fragment key={i}>
                  {line}
                  {i < section.body.split('\n').length - 1 && <br />}
                </React.Fragment>
              ))}
            </div>
          </div>
        ))}

        <div style={{ marginTop: 56, padding: '24px', background: 'var(--brand-white)', border: '1px solid var(--brand-hairline)', borderRadius: 10 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Contact</div>
          <div style={{ fontSize: 13, color: 'var(--brand-muted)', lineHeight: 1.6 }}>
            IRMS Data Protection<br />
            Email: privacy@irms.ng<br />
            For urgent safety matters: use the in-app emergency report form.
          </div>
        </div>
      </div>
    </div>
  );
}
