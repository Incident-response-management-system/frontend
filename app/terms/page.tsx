"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { IRMSLogo, Icon } from '@/components/irms-shared';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useIsMobile } from '@/hooks/use-media-query';

export default function TermsPage() {
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
        <h1 style={{ fontSize: isMobile ? 30 : 40, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.1, margin: '0 0 12px' }}>Terms of Service</h1>
        <p style={{ fontSize: 13, color: 'var(--brand-muted)', margin: '0 0 48px' }}>Last updated: June 2026 · Effective from first public deployment</p>

        <div style={{ padding: '16px 20px', background: 'var(--brand-white)', border: '1px solid var(--brand-hairline)', borderRadius: 10, marginBottom: 40 }}>
          <p style={{ fontSize: 13, color: 'var(--brand-ink)', lineHeight: 1.7, margin: 0 }}>
            <strong>Plain English summary:</strong> IRMS is a public safety tool. Use it honestly to report real emergencies. Do not abuse it, impersonate others, or submit false reports. Agency accounts must represent real, registered organisations. We can suspend access for misuse.
          </p>
        </div>

        {[
          {
            heading: '1. Acceptance of terms',
            body: `By accessing or using IRMS — whether as a citizen reporter, a registered agency, or a visitor — you agree to these Terms of Service. If you do not agree, do not use the platform.\n\nThese terms are governed by the laws of the Federal Republic of Nigeria. Any dispute shall be subject to the jurisdiction of Nigerian courts.`,
          },
          {
            heading: '2. What IRMS is',
            body: `IRMS is a civic emergency coordination platform that enables members of the public to report incidents and enables authorised response agencies to receive and act on those reports. IRMS is a communication and coordination tool — it is not itself an emergency service.\n\nUsing IRMS does not guarantee a physical emergency response. Always contact official emergency numbers (112, 199, or your local equivalent) for life-threatening situations.`,
          },
          {
            heading: '3. Citizen reporters',
            body: `Anyone may submit an incident report without creating an account. By submitting a report you confirm that:\n\n• The incident described is real and, to your knowledge, accurate.\n• You are not submitting the report for entertainment, testing in production, or to harass an individual or agency.\n• You have the right to share any media (photos, videos) attached to the report.\n\nYou may create an optional citizen account using your email address to track reports and view your history. You are responsible for keeping your account credentials secure.`,
          },
          {
            heading: '4. Prohibited conduct',
            body: `The following are strictly prohibited and may result in immediate account suspension and referral to law enforcement:\n\n• Submitting false, fabricated, or grossly exaggerated incident reports.\n• Submitting reports designed to maliciously direct emergency resources away from genuine emergencies.\n• Attempting to access systems or data beyond your authorised scope.\n• Scraping, automated querying, or DDoS attacks against IRMS infrastructure.\n• Impersonating another person, agency, or authority.\n• Uploading media that is illegal, obscene, or unrelated to an incident.\n• Using IRMS to stalk, harass, or locate a specific individual.`,
          },
          {
            heading: '5. Agency accounts',
            body: `Response agencies may apply to join the IRMS network. By registering an agency account, the authorised representative confirms that:\n\n• The organisation is a real, legally constituted entity.\n• The information provided during registration (name, type, contact, location, service radius) is accurate.\n• The account will be used solely for legitimate incident response coordination.\n• The representative has authority to bind the organisation to these terms.\n\nAgency accounts require email verification and administrator review before activation. IRMS reserves the right to reject or revoke any agency registration without notice.`,
          },
          {
            heading: '6. Accuracy of information',
            body: `IRMS relies on user-submitted data. We do not independently verify the accuracy of incident reports before they are displayed to agencies. Agency responders exercise independent professional judgement in deciding how to respond.\n\nIRMS does not warrant that any incident shown on the platform is real, current, or accurately described. Agency responders should follow their own protocols for assessing and responding to reports.`,
          },
          {
            heading: '7. Intellectual property',
            body: `The IRMS platform, including its code, design, marks, and documentation, is the property of the IRMS project and its contributors. You may not copy, reproduce, or create derivative works without written permission.\n\nBy submitting an incident report or media, you grant IRMS a non-exclusive, royalty-free licence to store, display, and share that content with authorised response agencies and, in anonymised form, for public safety analysis and reporting.`,
          },
          {
            heading: '8. Availability and changes',
            body: `IRMS is provided on a best-effort basis. We do not guarantee uninterrupted availability. The platform may be taken offline for maintenance, updated, or modified at any time.\n\nWe may add, remove, or change features without prior notice during the pilot phase. We will make reasonable efforts to communicate material changes to registered users.`,
          },
          {
            heading: '9. Limitation of liability',
            body: `To the maximum extent permitted by Nigerian law, IRMS and its operators shall not be liable for:\n\n• Any failure of an emergency response that relied solely on IRMS.\n• Loss or damage arising from inaccurate or fraudulent reports submitted by third parties.\n• Disruption of service due to technical failure, natural events, or factors outside our control.\n• Indirect, incidental, or consequential damages of any kind.\n\nIRMS is a supplementary coordination tool. It does not replace, and must not be treated as a substitute for, official emergency services.`,
          },
          {
            heading: '10. Termination',
            body: `We may suspend or terminate your access to IRMS at any time for breach of these terms, misuse of the platform, or any other reason at our sole discretion. You may delete your citizen account at any time from the account settings page. Agency deactivation requests must be submitted to support@irms.ng.`,
          },
          {
            heading: '11. Changes to these terms',
            body: `We may update these terms as the platform evolves. We will notify registered users of material changes at least 14 days before the new terms take effect. Continued use of IRMS after the effective date constitutes your acceptance of the updated terms.`,
          },
          {
            heading: '12. Contact',
            body: `For legal enquiries: legal@irms.ng\nFor data protection matters: privacy@irms.ng\nFor technical support or abuse reports: support@irms.ng`,
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
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Legal contact</div>
          <div style={{ fontSize: 13, color: 'var(--brand-muted)', lineHeight: 1.6 }}>
            Email: legal@irms.ng<br />
            Support: support@irms.ng<br />
            Data protection: privacy@irms.ng
          </div>
        </div>
      </div>
    </div>
  );
}
