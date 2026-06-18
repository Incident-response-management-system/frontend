import React from 'react';

import { toast } from 'sonner';

import {
  IRMSLogo,
  Icon,
  StatusBadge,
  StatusStepper,
  TrackScreenSkeleton,
  IncidentStatus,
} from '@/components/irms-shared';

import { trackIncident } from '@/lib/incidents-api';

import { useIsMobile } from '@/hooks/use-media-query';
import { useAutoRefresh } from '@/hooks/use-auto-refresh';

import { ThemeToggle } from '../../ThemeToggle';

export function TrackScreen({ navigate, params }: any) {

  const isMobile = useIsMobile();

  const ref = (params?.ref || '').trim();

  const [incident, setIncident] = React.useState<any>(null);

  const [loading, setLoading] = React.useState(!!ref);

  const [error, setError] = React.useState<string | null>(null);

  const [lookupRef, setLookupRef] = React.useState('');

  const [recentReports, setRecentReports] = React.useState<string[]>([]);

  const [copied, setCopied] = React.useState(false);



  React.useEffect(() => {

    if (typeof window === 'undefined') return;

    try {

      setRecentReports(JSON.parse(localStorage.getItem('irms_recent_reports') || '[]'));

    } catch {

      setRecentReports([]);

    }

  }, []);



  React.useEffect(() => {

    if (!ref) {

      setLoading(false);

      setIncident(null);

      setError(null);

      return;

    }

    loadIncident(ref);

  }, [ref]);



  const loadIncident = async (reference: string) => {

    setLoading(true);

    setError(null);

    try {

      const data = await trackIncident(reference);

      setIncident(data);

    } catch (err: any) {

      setError(err.message || 'Failed to load incident');

    } finally {

      setLoading(false);

    }

  };



  const handleLookup = () => {

    const code = lookupRef.trim().toUpperCase();

    if (!code) return;

    navigate('track', { ref: code });

  };

  // Silently re-fetch the incident every 30 s while it's still active.
  useAutoRefresh(
    React.useCallback(() => {
      if (ref && incident && incident.status !== 'resolved' && incident.status !== 'closed') {
        loadIncident(ref);
      }
    }, [ref, incident?.status]),
    30_000,
  );

  if (!ref) {

    return (

      <div style={{ background: 'var(--brand-cream)', minHeight: '100vh', color: 'var(--brand-ink)' }}>

        <nav style={{

          display: 'flex', alignItems: 'center', justifyContent: 'space-between',

          padding: isMobile ? '16px 16px' : '18px 32px', borderBottom: '1px solid var(--brand-hairline)',

        }}>

          <button onClick={() => navigate('back')} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>

            <Icon.back />

            <IRMSLogo size={15} color="var(--brand-ink)" />

          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>

            <div style={{ fontSize: 12, color: 'var(--brand-muted)' }}>Track a report</div>

            <ThemeToggle />

          </div>

        </nav>



        <div style={{ maxWidth: 520, margin: '0 auto', padding: isMobile ? '48px 16px 60px' : '72px 32px 80px' }}>

          <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em', margin: '0 0 10px' }}>Track your report</h1>

          <p style={{ fontSize: 14, color: 'var(--brand-muted)', margin: '0 0 28px', lineHeight: 1.6 }}>

            Enter the reference code you received after submitting an incident (e.g. INC-2026-00149).

          </p>



          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--brand-ink)' }}>Reference code</label>

            <input

              type="text"

              value={lookupRef}

              onChange={e => setLookupRef(e.target.value.toUpperCase())}

              onKeyDown={e => { if (e.key === 'Enter') handleLookup(); }}

              placeholder="INC-2026-00149"

              style={{

                padding: '13px 16px', borderRadius: 9, border: '1px solid var(--brand-divider)',

                background: 'var(--brand-white)', fontSize: 15, fontFamily: 'var(--font-mono)',

                color: 'var(--brand-ink)', outline: 'none',

              }}

            />

            <button

              type="button"

              onClick={handleLookup}

              disabled={!lookupRef.trim()}

              style={{

                padding: '13px 24px', borderRadius: 9, border: 'none', fontWeight: 600, fontSize: 14,

                background: lookupRef.trim() ? 'var(--brand-ink)' : 'var(--brand-muted)',

                color: 'var(--brand-cream)', cursor: lookupRef.trim() ? 'pointer' : 'not-allowed',

              }}

            >

              Track incident

            </button>

          </div>



          {recentReports.length > 0 && (

            <div style={{ marginTop: 36 }}>

              <div style={{ fontSize: 11, color: 'var(--brand-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 12 }}>

                Recent reports on this device

              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>

                {recentReports.slice(0, 5).map(code => (

                  <button

                    key={code}

                    type="button"

                    onClick={() => navigate('track', { ref: code })}

                    style={{

                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',

                      padding: '12px 16px', borderRadius: 9, border: '1px solid var(--brand-hairline)',

                      background: 'var(--brand-white)', cursor: 'pointer', textAlign: 'left',

                    }}

                  >

                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 600 }}>{code}</span>

                    <span style={{ fontSize: 12, color: 'var(--brand-muted)' }}>View status →</span>

                  </button>

                ))}

              </div>

            </div>

          )}

        </div>

      </div>

    );

  }



  if (loading) return <TrackScreenSkeleton />;



  if (error || !incident) {

    return (

      <div style={{ background: 'var(--brand-cream)', minHeight: '100vh', color: 'var(--brand-ink)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

        <div style={{ textAlign: 'center', padding: 24 }}>

          <div style={{ fontSize: 32, marginBottom: 12 }}>❌</div>

          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>Incident not found</div>

          <div style={{ fontSize: 13, color: 'var(--brand-muted)', marginBottom: 20 }}>{error || 'Please check the reference code and try again.'}</div>

          <button onClick={() => navigate('track')} style={{ fontSize: 13, fontWeight: 600, color: 'var(--brand-ink)', textDecoration: 'underline', textUnderlineOffset: 3, background: 'none', border: 'none', cursor: 'pointer', marginRight: 16 }}>

            Try another code

          </button>

          <button onClick={() => navigate('landing')} style={{ fontSize: 13, fontWeight: 600, color: 'var(--brand-ink)', textDecoration: 'underline', textUnderlineOffset: 3, background: 'none', border: 'none', cursor: 'pointer' }}>

            Return to home

          </button>

        </div>

      </div>

    );

  }



  const status = incident.status as IncidentStatus;

  const trackUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/track?ref=${incident.reference}`
    : `/track?ref=${incident.reference}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(trackUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => toast.error('Could not copy link'));
  };

  const handleShare = () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({
        title: `Incident ${incident.reference}`,
        text: `Track incident ${incident.reference} on IRMS`,
        url: trackUrl,
      }).catch(() => {});
    } else {
      handleCopyLink();
    }
  };

  return (

    <div style={{ background: 'var(--brand-cream)', minHeight: '100vh', color: 'var(--brand-ink)' }}>

      {/* Nav */}

      <nav style={{

        display: 'flex', alignItems: 'center', justifyContent: 'space-between',

        padding: isMobile ? '16px 16px' : '18px 32px', borderBottom: '1px solid var(--brand-hairline)',

      }}>

        <button onClick={() => navigate('back')} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>

          <Icon.back />

          <IRMSLogo size={15} color="var(--brand-ink)" />

        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>

          <button

            type="button"

            onClick={handleCopyLink}

            title="Copy report link"

            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, border: '1px solid var(--brand-divider)', background: 'var(--brand-white)', color: 'var(--brand-ink)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}

          >

            {copied ? '✓ Copied' : (

              <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Copy link</>

            )}

          </button>

          <button

            type="button"

            onClick={handleShare}

            title="Share report"

            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, border: '1px solid var(--brand-divider)', background: 'var(--brand-white)', color: 'var(--brand-ink)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}

          >

            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg> Share

          </button>

          <ThemeToggle />

        </div>

      </nav>



      <div style={{ maxWidth: 720, margin: '0 auto', padding: isMobile ? '40px 16px 60px' : '60px 32px 80px' }}>

        {/* Reference code */}

        <div style={{ marginBottom: 40 }}>

          <div style={{ fontSize: 11, color: 'var(--brand-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 12 }}>Report reference</div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 18 }}>

            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 32, fontWeight: 700, letterSpacing: '-0.01em' }}>{incident.reference}</div>

            <StatusBadge status={status} />

          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--brand-muted)' }}>

              <Icon.pin style={{ width: 16, height: 16 }} />

              <span style={{ fontSize: 14 }}>{incident.location_name}</span>

            </div>

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 6, background: 'var(--status-red-bg)', border: '1px solid var(--status-red-bd)' }}>

              <Icon.person style={{ width: 14, height: 14, color: 'var(--status-red)' }} />

              <span style={{ fontSize: 12, color: 'var(--status-red)', fontWeight: 600 }}>{incident.incident_type_display}</span>

            </div>

          </div>

        </div>



        {/* Stepper card */}

        <div style={{

          background: 'var(--brand-white)', border: '1px solid var(--brand-hairline)',

          borderRadius: 16, padding: isMobile ? '28px 20px' : '36px 32px', marginBottom: 24,

        }}>

          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--brand-muted)', marginBottom: 28, letterSpacing: '0.02em' }}>STATUS TIMELINE</div>

          <div style={{ overflowX: 'auto' }}>

            <StatusStepper current={status} />

          </div>

        </div>



        {/* Assigned agency card */}

        {incident.responding_agency ? (

          <div style={{

            background: 'var(--brand-white)', border: '1px solid var(--status-blue-bd)',

            borderRadius: 16, padding: 24, marginBottom: 24,

            display: 'flex', alignItems: 'center', gap: isMobile ? 12 : 20,

          }}>

            <div style={{

              width: 52, height: 52, borderRadius: 12, flexShrink: 0,

              background: 'var(--status-blue-bg)', border: '1px solid var(--status-blue-bd)',

              display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--status-blue)',

            }}>

              <Icon.pin />

            </div>

            <div style={{ flex: 1, minWidth: 0 }}>

              <div style={{ fontSize: 11, color: 'var(--status-blue)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>Responding Agency</div>

              <div style={{ fontSize: 17, fontWeight: 600, marginBottom: 4 }}>{incident.responding_agency.name}</div>

              <div style={{ fontSize: 13, color: 'var(--brand-muted)' }}>{incident.responding_agency.type}</div>

            </div>

            <StatusBadge status={status} />

          </div>

        ) : (

          <div style={{

            background: 'var(--brand-white)', border: '1px solid var(--brand-hairline)',

            borderRadius: 16, padding: 24, marginBottom: 24,

            display: 'flex', alignItems: 'center', gap: 16,

          }}>

            <div style={{

              width: 52, height: 52, borderRadius: 12, flexShrink: 0,

              background: 'var(--brand-cream)', border: '1px solid var(--brand-divider)',

              display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-muted)',

            }}>

              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18M3 10.5V21M21 10.5V21M6 21V10.5M18 21V10.5M9 21v-6h6v6"/><path d="M3 10.5L12 3l9 7.5"/></svg>

            </div>

            <div>

              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>No agency assigned yet</div>

              <div style={{ fontSize: 13, color: 'var(--brand-muted)' }}>Your report is being reviewed</div>

            </div>

          </div>

        )}



        {/* Timeline card */}

        {incident.timeline && incident.timeline.length > 0 && (

          <div style={{

            background: 'var(--brand-white)', border: '1px solid var(--brand-hairline)',

            borderRadius: 16, padding: isMobile ? '24px 20px' : '28px 32px', marginBottom: 24,

          }}>

            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--brand-muted)', marginBottom: 20, letterSpacing: '0.02em' }}>TIMELINE</div>

            {incident.timeline.map((event: any, index: number) => (

              <div key={index} style={{ display: 'flex', gap: 16, marginBottom: index < incident.timeline.length - 1 ? 20 : 0 }}>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 24 }}>

                  <div style={{

                    width: 12, height: 12, borderRadius: '50%',

                    background: event.status === 'completed' ? 'var(--status-green)' : 'var(--brand-muted)',

                    border: event.status === 'completed' ? '2px solid var(--status-green)' : '2px solid var(--brand-divider)',

                  }} />

                  {index < incident.timeline.length - 1 && (

                    <div style={{ width: 2, flex: 1, background: 'var(--brand-divider)', minHeight: 32, marginTop: 8 }} />

                  )}

                </div>

                <div style={{ flex: 1, paddingTop: 2 }}>

                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{event.title}</div>

                  <div style={{ fontSize: 12, color: 'var(--brand-muted)' }}>{event.description}</div>

                  <div style={{ fontSize: 11, color: 'var(--brand-muted)', marginTop: 4 }}>{event.timestamp}</div>

                </div>

              </div>

            ))}

          </div>

        )}



        {/* Activity log card */}

        {incident.activity_log && incident.activity_log.length > 0 && (

          <div style={{

            background: 'var(--brand-white)', border: '1px solid var(--brand-hairline)',

            borderRadius: 16, padding: isMobile ? '24px 20px' : '28px 32px', marginBottom: 24,

          }}>

            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--brand-muted)', marginBottom: 20, letterSpacing: '0.02em' }}>ACTIVITY LOG</div>

            {incident.activity_log.map((log: any, index: number) => (

              <div key={index} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 0', borderBottom: index < incident.activity_log.length - 1 ? '1px solid var(--brand-hairline)' : 'none' }}>

                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--brand-muted)', minWidth: 50 }}>{log.time}</span>

                <span style={{ width: 8, height: 8, borderRadius: '50%', background: log.color || 'var(--brand-muted)' }} />

                <span style={{ fontSize: 14, color: 'var(--brand-ink)' }}>{log.event}</span>

              </div>

            ))}

          </div>

        )}

      </div>

    </div>

  );

}
