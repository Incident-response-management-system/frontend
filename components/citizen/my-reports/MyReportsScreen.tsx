import React from 'react';
import { toast } from 'sonner';
import { IRMSLogo, Icon, StatusBadge, ReportRowSkeleton, getIncidentType } from '@/components/irms-shared';
import type { Incident } from '@/components/irms-shared';
import { useIsMobile } from '@/hooks/use-media-query';
import { useAutoRefresh } from '@/hooks/use-auto-refresh';
import { ThemeToggle } from '@/components/ThemeToggle';
import { getMyReports } from '@/lib/incidents-api';
import { formatAbsolute } from '@/lib/agency-types';
import { CitizenReportDetail } from './CitizenReportDetail';

// ─── Status timeline metadata ───────────────────────────────

function getTimestamps(report: Incident): Record<string, string | null> {
    const stepperTimestamps: Record<string, string | null> = {
        pending: report.reportedAt || null,
        in_progress: null,
        assigned: null,
        resolved: null,
    };

    if (report.timeline) {
        report.timeline.forEach((event: any) => {
            const titleLower = event.title.toLowerCase();
            const timeStr = event.timestamp || null;

            if (titleLower.includes('received') || titleLower.includes('pending')) {
                stepperTimestamps.pending = timeStr || stepperTimestamps.pending;
            } else if (titleLower.includes('review') || titleLower.includes('under review') || titleLower.includes('in_progress')) {
                stepperTimestamps.in_progress = timeStr;
            } else if (titleLower.includes('assigned')) {
                stepperTimestamps.assigned = timeStr;
            } else if (titleLower.includes('resolved')) {
                stepperTimestamps.resolved = timeStr;
            }
        });
    }

    return stepperTimestamps;
}

// ─── Agency Type Metadata ───────────────────────────────────

const AGENCY_TYPE_MAP: Record<string, { label: string; color: string; bg: string; bd: string }> = {
    'Federal Road Safety Corps': { label: 'Road Safety', color: 'var(--status-amber)', bg: 'var(--status-amber-bg)', bd: 'var(--status-amber-bd)' },
    'Camp Maintenance Unit': { label: 'Maintenance', color: 'var(--status-blue)', bg: 'var(--status-blue-bg)', bd: 'var(--status-blue-bd)' },
    'RCCG Camp Security': { label: 'Security', color: 'var(--status-green)', bg: 'var(--status-green-bg)', bd: 'var(--status-green-bd)' },
    'RCCG Medical Centre': { label: 'Medical', color: 'var(--status-red)', bg: 'var(--status-red-bg)', bd: 'var(--status-red-bd)' },
};

// ─── Component Interfaces ───────────────────────────────────

export interface MyReportsScreenProps {
    navigate: (to: string) => void;
    user: { name: string; email: string; phone?: string } | null;
    onSignOut: () => void;
}

// ─────────────────────────────────────────────────────────────
// MY REPORTS SCREEN
// ─────────────────────────────────────────────────────────────
export function MyReportsScreen({ navigate, user, onSignOut }: MyReportsScreenProps) {
    const isMobile = useIsMobile();
    const [tab, setTab] = React.useState('all');
    const [search, setSearch] = React.useState('');
    const [selected, setSelected] = React.useState<Incident | null>(null);
    const [profileOpen, setProfileOpen] = React.useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
    const [reports, setReports] = React.useState<Incident[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        loadReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tab]);

    const loadReports = async () => {
        setLoading(true);
        try {
            const status = tab === 'all' ? undefined : tab === 'open' ? 'pending' : 'resolved';
            const response = await getMyReports(status);
            const mappedReports = response.results.map(r => ({
                ref: r.reference,
                type: r.incident_type,
                location: r.location_name,
                lat: r.latitude,
                lng: r.longitude,
                status: r.status as any,
                reported: new Date(r.created_at).toLocaleDateString(),
                reportedAt: formatAbsolute(r.created_at),
                desc: r.description,
                media: r.media.length,
                mediaItems: r.media,
                assignedTo: r.responding_agency?.name || null,
                activity_log: Array.isArray(r.activity_log)
                    ? r.activity_log.map((log: any) => ({
                        time: log.at,
                        event: log.message || '',
                        color: 'var(--brand-muted)',
                      }))
                    : [],
                timeline: Array.isArray(r.timeline)
                    ? r.timeline.map((event: any) => ({
                        title: event.label || event.event_type || 'Update',
                        description: event.message || '',
                        timestamp: formatAbsolute(event.at),
                        status: 'completed',
                      }))
                    : [],
            }));
            setReports(mappedReports);
        } catch (err) {
            console.error('Failed to load reports:', err);
            setReports([]);
        } finally {
            setLoading(false);
        }
    };

    useAutoRefresh(loadReports, 45_000, ['irms:report_created', 'irms:incident_updated']);

    const filters = [
        { id: 'all', label: 'All', count: reports.length },
        { id: 'open', label: 'Open', count: reports.filter(r => r.status !== 'resolved' && r.status !== 'closed').length },
        { id: 'resolved', label: 'Resolved', count: reports.filter(r => r.status === 'resolved' || r.status === 'closed').length },
    ];

    const filtered = reports
        .filter(r => tab === 'all' || (tab === 'open' ? r.status !== 'resolved' && r.status !== 'closed' : r.status === 'resolved' || r.status === 'closed'))
        .filter(r => {
            if (!search.trim()) return true;
            const q = search.toLowerCase();
            return (
                r.ref.toLowerCase().includes(q) ||
                r.location.toLowerCase().includes(q) ||
                r.type.toLowerCase().includes(q) ||
                r.desc.toLowerCase().includes(q)
            );
        });

    const initials = (user?.name || 'U').split(' ').map((w: string) => w[0]).slice(0, 2).join('');

    return (
        <div style={{ background: 'var(--brand-cream)', minHeight: '100vh', color: 'var(--brand-ink)' }}>
            {/* Top bar */}
            <header style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: isMobile ? '14px 16px' : '18px 32px', borderBottom: '1px solid var(--brand-hairline)',
                position: 'sticky', top: 0,
                background: 'var(--surface-overlay)', backdropFilter: 'blur(14px) saturate(140%)', zIndex: 50,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 12 : 28 }}>
                    <button onClick={() => navigate('landing')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                        <IRMSLogo size={15} color="var(--brand-ink)" />
                    </button>
                    <nav style={{ display: isMobile ? 'none' : 'flex', gap: 4 }}>
                        <button style={{
                            padding: '7px 12px', fontSize: 13, fontWeight: 600,
                            color: 'var(--brand-ink)', borderRadius: 7,
                            background: 'var(--brand-divider)', border: 'none', cursor: 'pointer',
                        }}>My Reports</button>
                        <button
                            onClick={() => navigate('report')}
                            style={{
                                padding: '7px 12px', fontSize: 13, color: 'var(--brand-muted)',
                                borderRadius: 7, background: 'none', border: 'none', cursor: 'pointer',
                                transition: 'color 0.15s',
                            }}
                            onMouseEnter={e => e.currentTarget.style.color = 'var(--brand-ink)'}
                            onMouseLeave={e => e.currentTarget.style.color = 'var(--brand-muted)'}
                        >Report new</button>
                    </nav>
                </div>

                {/* Desktop: theme toggle + user menu */}
                <div style={{ display: isMobile ? 'none' : 'flex', alignItems: 'center', gap: 12 }}>
                <ThemeToggle />
                {/* User menu */}
                <div style={{ position: 'relative' }}>
                    <button
                        onClick={() => setProfileOpen(!profileOpen)}
                        aria-label="Account menu"
                        style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            padding: isMobile ? 4 : '6px 12px 6px 6px',
                            borderRadius: 999, border: '1px solid var(--brand-divider)', background: 'var(--brand-white)', cursor: 'pointer',
                            transition: 'border-color 0.15s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--brand-muted)'}
                        onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--brand-divider)'}
                    >
                        <div style={{
                            width: 28, height: 28, borderRadius: '50%',
                            background: 'var(--brand-ink)', color: 'var(--brand-cream)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 11, fontWeight: 700, letterSpacing: '0.01em',
                        }}>
                            {initials}
                        </div>
                        {!isMobile && <span style={{ fontSize: 13, fontWeight: 500 }}>{user?.name?.split(' ')[0] || 'You'}</span>}
                        {!isMobile && <Icon.chevDown style={{ color: 'var(--brand-muted)' }} />}
                    </button>

                    {profileOpen && (
                        <>
                            <div onClick={() => setProfileOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 100 }} />
                            <div style={{
                                position: 'absolute', top: '100%', right: 0, marginTop: 8, zIndex: 200,
                                background: 'var(--brand-white)', border: '1px solid var(--brand-divider)', borderRadius: 10,
                                minWidth: 240, padding: 6, boxShadow: '0 12px 28px rgba(0,0,0,0.12)',
                            }}>
                                <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--brand-hairline)', marginBottom: 4 }}>
                                    <div style={{ fontSize: 13, fontWeight: 600 }}>{user?.name}</div>
                                    <div style={{ fontSize: 11, color: 'var(--brand-muted)', marginTop: 2 }}>{user?.email}</div>
                                    {user?.phone && <div style={{ fontSize: 11, color: 'var(--brand-muted)' }}>{user.phone}</div>}
                                </div>
                                {/* Nav links live here on mobile (they're inline in the header on desktop) */}
                                {isMobile && (
                                    <>
                                        <button
                                            onClick={() => setProfileOpen(false)}
                                            style={{
                                                width: '100%', textAlign: 'left', padding: '9px 12px', borderRadius: 7,
                                                fontSize: 13, fontWeight: 600, color: 'var(--brand-ink)', display: 'flex', alignItems: 'center', gap: 10,
                                                background: 'none', border: 'none', cursor: 'pointer',
                                            }}
                                        >
                                            <Icon.list style={{ width: 14, height: 14 }} /> My Reports
                                        </button>
                                        <button
                                            onClick={() => { setProfileOpen(false); navigate('report'); }}
                                            style={{
                                                width: '100%', textAlign: 'left', padding: '9px 12px', borderRadius: 7,
                                                fontSize: 13, color: 'var(--brand-ink)', display: 'flex', alignItems: 'center', gap: 10,
                                                background: 'none', border: 'none', cursor: 'pointer',
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.background = 'var(--brand-surface-alt)'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                        >
                                            <Icon.pin style={{ width: 14, height: 14 }} /> Report new
                                        </button>
                                        <div style={{ height: 1, background: 'var(--brand-hairline)', margin: '4px 8px' }} />
                                    </>
                                )}
                                <button
                                    onClick={() => { onSignOut(); navigate('landing'); }}
                                    style={{
                                        width: '100%', textAlign: 'left', padding: '9px 12px', borderRadius: 7,
                                        fontSize: 13, color: 'var(--status-red)', display: 'flex', alignItems: 'center', gap: 10,
                                        background: 'none', border: 'none', cursor: 'pointer',
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'var(--status-red-bg)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                >
                                    <Icon.logout style={{ width: 14, height: 14 }} /> Sign out
                                </button>
                            </div>
                        </>
                    )}
                </div>
                </div>

                {/* Mobile: hamburger menu */}
                <div style={{ display: isMobile ? 'flex' : 'none', alignItems: 'center', gap: 12 }}>
                    <ThemeToggle />
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        style={{
                            width: 36, height: 36, borderRadius: 8, border: '1px solid var(--brand-divider)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', cursor: 'pointer'
                        }}
                    >
                        {mobileMenuOpen ? <Icon.close /> : <Icon.menu />}
                    </button>
                </div>
            </header>

            {/* Mobile menu dropdown */}
            {mobileMenuOpen && isMobile && (
                <>
                    <div onClick={() => setMobileMenuOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 40, background: 'var(--scrim)', backdropFilter: 'blur(2px)' }} />
                    <div style={{
                        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
                        background: 'var(--surface-overlay)', backdropFilter: 'blur(14px) saturate(140%)',
                        borderBottom: '1px solid var(--brand-hairline)',
                        padding: '16px', animation: 'fadeIn 0.2s ease-out'
                    }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <button
                                onClick={() => { navigate('report'); setMobileMenuOpen(false); }}
                                style={{ padding: '8px 14px', fontSize: 13, fontWeight: 500, color: 'var(--brand-ink)', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                            >
                                Report new
                            </button>
                            <div style={{ width: 1, height: 20, background: 'var(--brand-hairline)', margin: '4px 12px' }} />
                            <button
                                onClick={() => { setProfileOpen(!profileOpen); }}
                                style={{
                                    padding: '8px 14px', fontSize: 13, fontWeight: 500, color: 'var(--brand-ink)', borderRadius: 8,
                                    display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer'
                                }}
                            >
                                <div style={{
                                    width: 22, height: 22, borderRadius: '50%',
                                    background: 'var(--brand-ink)', color: 'var(--brand-cream)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 10, fontWeight: 700, letterSpacing: '0.01em',
                                }}>
                                    {initials}
                                </div>
                                <span>{user?.name?.split(' ')[0] || 'You'}</span>
                            </button>
                            {profileOpen && (
                                <div style={{ marginLeft: 16, marginTop: 4 }}>
                                    <div style={{ padding: '4px 12px', fontSize: 11, color: 'var(--brand-muted)' }}>{user?.email}</div>
                                    {user?.phone && <div style={{ padding: '2px 12px', fontSize: 11, color: 'var(--brand-muted)' }}>{user.phone}</div>}
                                    <button
                                        onClick={() => { onSignOut(); navigate('landing'); setMobileMenuOpen(false); }}
                                        style={{
                                            marginTop: 8, padding: '8px 12px', fontSize: 13, color: 'var(--status-red)',
                                            background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 8
                                        }}
                                    >
                                        <Icon.logout style={{ width: 14, height: 14 }} /> Sign out
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}

            <div style={{ maxWidth: 1120, margin: '0 auto', padding: isMobile ? '28px 16px 56px' : '40px 32px 80px' }}>
                {/* Page header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32, gap: 24, flexWrap: 'wrap' }}>
                    <div>
                        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: isMobile ? 26 : 36, fontWeight: 600, letterSpacing: '-0.01em', margin: '0 0 6px', color: 'var(--brand-ink)' }}>Your reports</h1>
                        <p style={{ fontSize: 14, color: 'var(--brand-muted)', margin: 0 }}>
                            Every incident you have submitted is listed below. Click any report to see full status, assigned agency, and activity.
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('report')}
                        style={{
                            background: 'var(--brand-ink)', color: 'var(--brand-cream)', padding: '10px 16px', borderRadius: 6,
                            fontWeight: 600, fontSize: 14, display: 'inline-flex', alignItems: 'center', gap: 8, border: 'none', cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            whiteSpace: 'nowrap',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--brand-accent)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(197, 168, 128, 0.25)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'var(--brand-ink)'; e.currentTarget.style.boxShadow = 'none'; }}
                    >
                        Report new incident <Icon.arrow />
                    </button>
                </div>

                {/* Summary strip */}
                <div style={{
                    display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: 0,
                    background: 'var(--brand-white)', border: '1px solid var(--brand-hairline)', borderRadius: 12,
                    marginBottom: 24, overflow: 'hidden',
                }}>
                    {[
                        { l: 'Total submitted', v: reports.length, c: 'var(--brand-ink)' },
                        { l: 'Currently open', v: reports.filter(r => ['pending', 'in_progress', 'assigned'].includes(r.status)).length, c: 'var(--status-red)' },
                        { l: 'In progress', v: reports.filter(r => ['in_progress', 'assigned'].includes(r.status)).length, c: 'var(--status-amber)' },
                        { l: 'Resolved', v: reports.filter(r => ['resolved', 'closed'].includes(r.status)).length, c: 'var(--status-green)' },
                    ].map((s, i) => (
                        <div key={i} style={{
                            padding: isMobile ? '16px 14px' : '22px 24px',
                            borderLeft: isMobile
                                ? (i % 2 === 1 ? '1px solid var(--brand-hairline)' : 'none')
                                : (i > 0 ? '1px solid var(--brand-hairline)' : 'none'),
                            borderTop: isMobile && i >= 2 ? '1px solid var(--brand-hairline)' : 'none',
                        }}>
                            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--brand-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>{s.l}</div>
                            <div style={{ fontSize: isMobile ? 24 : 30, fontWeight: 700, fontFamily: 'var(--font-mono)', letterSpacing: '-0.02em', color: s.c }}>{s.v}</div>
                        </div>
                    ))}
                </div>

                {/* Search + Tabs */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 0, flexWrap: 'wrap' }}>
                    {/* Search */}
                    <div style={{
                        flex: 1, minWidth: isMobile ? 140 : 200,
                        display: 'flex', alignItems: 'center', gap: 8,
                        background: 'var(--brand-white)', border: '1px solid var(--brand-hairline)',
                        borderRadius: 8, padding: '0 12px', height: 40,
                    }}>
                        <Icon.search style={{ width: 14, height: 14, color: 'var(--brand-muted)', flexShrink: 0 }} />
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search by ref, location, or type…"
                            style={{
                                flex: 1, border: 'none', outline: 'none', background: 'transparent',
                                fontSize: 13, color: 'var(--brand-ink)', fontFamily: 'inherit',
                            }}
                        />
                        {search && (
                            <button
                                type="button"
                                onClick={() => setSearch('')}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--brand-muted)', padding: 0 }}
                            >
                                <Icon.close style={{ width: 14, height: 14 }} />
                            </button>
                        )}
                    </div>

                    {/* Tabs */}
                    <div style={{ display: 'flex', gap: 4, background: 'var(--brand-cream)', borderRadius: 8, padding: 3, border: '1px solid var(--brand-hairline)' }}>
                        {filters.map(f => (
                            <button
                                key={f.id}
                                type="button"
                                onClick={() => setTab(f.id)}
                                style={{
                                    padding: '6px 12px', fontSize: 13, fontWeight: 600, borderRadius: 6, border: 'none',
                                    background: tab === f.id ? 'var(--brand-white)' : 'transparent',
                                    color: tab === f.id ? 'var(--brand-ink)' : 'var(--brand-muted)',
                                    boxShadow: tab === f.id ? '0 1px 2px rgba(40,35,20,0.06)' : 'none',
                                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                                    transition: 'all 0.15s', whiteSpace: 'nowrap',
                                }}
                            >
                                {f.label}
                                <span style={{
                                    fontSize: 11, padding: '1px 5px', borderRadius: 99,
                                    background: tab === f.id ? 'var(--brand-ink)' : 'var(--brand-divider)',
                                    color: tab === f.id ? 'var(--brand-cream)' : 'var(--brand-muted)',
                                    fontFamily: 'var(--font-mono)',
                                }}>{f.count}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Report list */}
                <div style={{
                    background: 'var(--brand-white)', border: '1px solid var(--brand-hairline)',
                    borderTop: 'none', borderRadius: '0 0 12px 12px', overflow: 'hidden',
                    marginTop: 0,
                }}>
                    {loading ? (
                        <div>
                            {[0, 1, 2, 3, 4].map(i => <ReportRowSkeleton key={i} />)}
                        </div>
                    ) : filtered.length === 0 ? (
                        <div style={{ padding: '64px 24px', textAlign: 'center' }}>
                            <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'center' }}><Icon.search width={32} height={32} style={{ color: 'var(--brand-muted)' }} /></div>
                            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>No reports found</div>
                            <div style={{ fontSize: 13, color: 'var(--brand-muted)', marginBottom: 20 }}>
                                {search ? `No results for "${search}"` : `You have no ${tab === 'all' ? '' : tab} reports yet.`}
                            </div>
                            {!search && (
                                <button
                                    type="button"
                                    onClick={() => navigate('report')}
                                    style={{ fontSize: 13, fontWeight: 600, color: 'var(--brand-ink)', textDecoration: 'underline', textUnderlineOffset: 3, background: 'none', border: 'none', cursor: 'pointer' }}
                                >
                                    Report your first incident
                                </button>
                            )}
                            {search && (
                                <button
                                    type="button"
                                    onClick={() => setSearch('')}
                                    style={{ fontSize: 13, fontWeight: 500, color: 'var(--brand-muted)', textDecoration: 'underline', textUnderlineOffset: 3, background: 'none', border: 'none', cursor: 'pointer' }}
                                >
                                    Clear search
                                </button>
                            )}
                        </div>
                    ) : filtered.map((r, idx) => {
                        const t = getIncidentType(r.type);
                        return (
                            <button
                                key={r.ref}
                                type="button"
                                onClick={() => setSelected(r)}
                                style={{
                                    width: '100%', textAlign: 'left', padding: isMobile ? '14px 16px' : '16px 24px',
                                    borderBottom: '1px solid var(--brand-hairline)',
                                    display: 'grid', gridTemplateColumns: '40px 1fr auto', gap: 16, alignItems: 'center',
                                    transition: 'background 0.1s', background: 'none', border: 'none', cursor: 'pointer',
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = 'var(--brand-cream)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                                {/* Icon */}
                                <div style={{
                                    width: 40, height: 40, borderRadius: 9,
                                    background: 'var(--brand-cream)', border: '1px solid var(--brand-divider)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-ink)',
                                    flexShrink: 0,
                                }}><t.icon style={{ width: 18, height: 18 }} /></div>

                                {/* Main content */}
                                <div style={{ minWidth: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
                                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--brand-muted)' }}>{r.ref}</span>
                                        <span style={{ fontSize: 14, fontWeight: 600 }}>{t.label}</span>
                                        {r.media > 0 && (
                                            <span style={{
                                                fontSize: 10, padding: '1px 6px', borderRadius: 99, fontWeight: 600,
                                                background: 'var(--brand-cream)', color: 'var(--brand-muted)',
                                                border: '1px solid var(--brand-hairline)',
                                            }}>
                                                {r.media} {r.media === 1 ? 'file' : 'files'}
                                            </span>
                                        )}
                                    </div>
                                    <div style={{ fontSize: 13, color: 'var(--brand-muted)', display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
                                        <Icon.pin style={{ width: 11, height: 11, color: 'var(--brand-muted)', flexShrink: 0 }} />
                                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: isMobile ? 150 : 240 }}>{r.location}</span>
                                        <span style={{ color: 'var(--brand-hairline)' }}>·</span>
                                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, whiteSpace: 'nowrap' }}>{r.reportedAt}</span>
                                        {r.assignedTo && (
                                            <>
                                                <span style={{ color: 'var(--brand-hairline)' }}>·</span>
                                                <span style={{ fontSize: 11, color: 'var(--status-blue)', fontWeight: 500 }}>{r.assignedTo}</span>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Right: badge + chevron */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                                    <StatusBadge status={r.status} size="sm" />
                                    {!isMobile && <Icon.chev style={{ color: 'var(--brand-muted)' }} />}
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Empty state search hint */}
                {filtered.length > 0 && search && (
                    <div style={{ marginTop: 12, fontSize: 12, color: 'var(--brand-muted)', textAlign: 'center' }}>
                        {filtered.length} result{filtered.length !== 1 ? 's' : ''} for &ldquo;{search}&rdquo;
                    </div>
                )}
            </div>

            {/* Detail drawer */}
            {selected && <CitizenReportDetail report={selected} onClose={() => setSelected(null)} navigate={navigate} />}
        </div>
    );
}

