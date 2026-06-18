import React from 'react';
import { toast } from 'sonner';
import { Icon, IRMSLogo } from '@/components/irms-shared';
import { useIsMobile } from '@/hooks/use-media-query';

function Spinner() {

  return (

    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 0.75s linear infinite' }}>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="40 20" strokeLinecap="round" />

    </svg>

  );

}

export function ReportSuccess({ refCode, pinLocation, trackReport, onClose, navigate }: any) {

  const isMobile = useIsMobile();

  const [copied, setCopied] = React.useState(false);



  const handleCopy = () => {

    if (typeof navigator !== 'undefined') {

      navigator.clipboard.writeText(refCode).then(() => {

        setCopied(true);

        toast.success('Reference code copied to clipboard!');

        setTimeout(() => setCopied(false), 2500);

      });

    }

  };



  const handleShare = async () => {

    if (typeof navigator !== 'undefined' && navigator.share) {

      try {

        await navigator.share({

          title: 'IRMS Incident Report',

          text: `I submitted an incident report to IRMS. Reference: ${refCode}. Track it at irms.ng`,

          url: window.location.origin + '/track?ref=' + refCode,

        });

      } catch (_) {

        // user cancelled share

      }

    } else {

      handleCopy();

    }

  };



  return (

    <div style={{ maxWidth: 540, margin: '0 auto', padding: isMobile ? '40px 20px 36px' : '40px 28px 36px', textAlign: 'center', animation: 'fadeIn 0.4s ease-out' }}>

      {/* Animated success icon */}

      <div style={{

        width: 80, height: 80, borderRadius: '50%',

        background: 'var(--status-green-bg)', border: '2px solid var(--status-green-bd)',

        display: 'flex', alignItems: 'center', justifyContent: 'center',

        margin: '0 auto 24px', color: 'var(--status-green)',

        animation: 'scaleIn 0.4s ease-out 0.1s both',

      }}>

        <Icon.check style={{ width: 40, height: 40 }} />

      </div>



      <h2 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em', margin: '0 0 10px' }}>Report submitted</h2>

      <p style={{ fontSize: 14, color: 'var(--brand-muted)', margin: '0 0 8px', lineHeight: 1.6 }}>

        Verified agencies covering this location have been notified.

      </p>

      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 6, background: 'var(--status-green-bg)', border: '1px solid var(--status-green-bd)', marginBottom: 28 }}>

        <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--status-green)' }} />

        <span style={{ fontSize: 12, color: 'var(--status-green)', fontWeight: 600 }}>Estimated response: ~4 minutes</span>

      </div>



      {/* Reference code */}

      <div style={{ marginBottom: 28 }}>

        <div style={{ fontSize: 11, color: 'var(--brand-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>Your reference code</div>

        <div

          onClick={handleCopy}

          style={{

            display: 'inline-flex', alignItems: 'center', gap: 12, padding: '12px 20px',

            borderRadius: 999, background: 'var(--brand-cream)', border: `2px solid ${copied ? 'var(--status-green)' : 'var(--brand-divider)'}`,

            cursor: 'pointer', transition: 'border-color 0.2s',

          }}

        >

          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 700, color: 'var(--brand-ink)', letterSpacing: '0.04em' }}>{refCode}</span>

          <span style={{

            display: 'flex', alignItems: 'center', gap: 4, fontSize: 12,

            color: copied ? 'var(--status-green)' : 'var(--brand-muted)', fontWeight: 600,

            transition: 'color 0.2s',

          }}>

            {copied ? <Icon.check style={{ width: 14, height: 14 }} /> : (

              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">

                <rect x="9" y="9" width="13" height="13" rx="2" />

                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />

              </svg>

            )}

            {copied ? 'Copied!' : 'Copy'}

          </span>

        </div>

        <div style={{ fontSize: 12, color: 'var(--brand-muted)', marginTop: 8, lineHeight: 1.5 }}>

          Save this code to track your report from any device.

        </div>

      </div>



      {/* Action buttons */}

      <div style={{ display: 'flex', gap: 8, flexDirection: 'column' }}>

        {trackReport && (

          <button

            type="button"

            onClick={() => navigate('track', { ref: refCode })}

            style={{

              width: '100%', padding: '12px 20px', borderRadius: 9,

              background: 'var(--status-red)', color: 'white',

              fontWeight: 600, fontSize: 14, border: 'none', cursor: 'pointer',

              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,

              transition: 'background 0.15s',

            }}

            onMouseEnter={e => e.currentTarget.style.background = '#B23B33'}

            onMouseLeave={e => e.currentTarget.style.background = 'var(--status-red)'}

          >

            View report status <Icon.arrow />

          </button>

        )}

        <button

          type="button"

          onClick={handleShare}

          style={{

            width: '100%', padding: '11px 20px', borderRadius: 9,

            background: 'var(--brand-white)', color: 'var(--brand-ink)',

            fontWeight: 500, fontSize: 14, border: '1px solid var(--brand-divider)', cursor: 'pointer',

            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,

            transition: 'background 0.15s',

          }}

          onMouseEnter={e => e.currentTarget.style.background = 'var(--brand-cream)'}

          onMouseLeave={e => e.currentTarget.style.background = 'var(--brand-white)'}

        >

          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">

            <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />

            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />

          </svg>

          Share reference

        </button>

        <button

          type="button"

          onClick={() => { onClose(); }}

          style={{

            width: '100%', padding: '10px 20px', borderRadius: 9,

            background: 'transparent', color: 'var(--brand-muted)',

            fontWeight: 500, fontSize: 14, border: 'none', cursor: 'pointer',

            transition: 'color 0.15s',

          }}

          onMouseEnter={e => e.currentTarget.style.color = 'var(--brand-ink)'}

          onMouseLeave={e => e.currentTarget.style.color = 'var(--brand-muted)'}

        >

          Report another incident

        </button>

      </div>

    </div>

  );

}
