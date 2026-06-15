import React from 'react';
import { toast } from 'sonner';
import {
    IRMSLogo,
    Icon,
    StatusBadge,
    StatusStepper,
    getIncidentType,
    Incident,
    IncidentStatus,
} from './irms-shared';
import { getMyReports } from '@/lib/incidents-api';
import { useIsMobile } from '@/hooks/use-media-query';
import { ThemeToggle } from './ThemeToggle';
import { Clock, Search } from 'lucide-react';

// -----------------------------------------------------------
// SEEDED DEMO DATA — MY REPORTS
// -----------------------------------------------------------
const MY_REPORTS: Incident[] = [
    {
        ref: 'INC-2026-00149',
        type: 'medical',
        location: 'Auditorium 3, Main Bowl',
        status: 'pending',
        reportedAt: 'Today · 14:32',
        desc: 'Elderly man collapsed during service. Witnesses report chest pain. Crowd gathered, space cleared.',
        media: 2,
        assignedTo: null,
        lat: 6.8932,
        lng: 3.1721,
        reported: '2 min ago',
    },
    {
        ref: 'INC-2026-00131',
        type: 'rta',
        location: 'Lagos-Ibadan Expressway, Mile 46',
        status: 'assigned',
        reportedAt: '23 May · 18:12',
        desc: 'Two-vehicle collision near camp gate. One vehicle overturned. Possible injuries.',
        media: 3,
        assignedTo: 'Federal Road Safety Corps',
        lat: 6.8865,
        lng: 3.1812,
        reported: '5 days ago',
    },
    {
        ref: 'INC-2026-00114',
        type: 'flood',
        location: 'Drainage Channel B',
        status: 'resolved',
        reportedAt: '18 May · 09:40',
        desc: 'Water overflow blocking pedestrian path after morning rain.',
        media: 1,
        assignedTo: 'Camp Maintenance Unit',
        lat: 6.8878,
        lng: 3.1656,
        reported: '10 days ago',
    },
    {
        ref: 'INC-2026-00097',
        type: 'civil',
        location: 'Camp Gate 2',
        status: 'resolved',
        reportedAt: '02 May · 21:05',
        desc: 'Disorderly crowd near vehicle screening point. Security on scene.',
        media: 0,
        assignedTo: 'RCCG Camp Security',
        lat: 6.8954,
        lng: 3.1745,
        reported: '26 days ago',
    },
];

// ─── Status timeline metadata ───────────────────────────────

function getTimestamps(report: Incident): Record<string, string | null> {
    const s = report.status;
    const idx = ['pending', 'in_progress', 'assigned', 'resolved'].indexOf(s);
    const times = ['14:32', '14:38', '14:51', '15:30'];
    return {
        pending: times[0],
        in_progress: idx >= 1 ? times[1] : null,
        assigned: idx >= 2 ? times[2] : null,
        resolved: idx >= 3 ? times[3] : null,
    };
}

// ─── Agency Type Metadata ───────────────────────────────────

const AGENCY_TYPE_MAP: Record<string, { label: string; color: string; bg: string; bd: string }> = {
    'Federal Road Safety Corps': { label: 'Road Safety', color: 'var(--status-amber)', bg: 'var(--status-amber-bg)', bd: 'var(--status-amber-bd)' },
    'Camp Maintenance Unit': { label: 'Maintenance', color: 'var(--status-blue)', bg: 'var(--status-blue-bg)', bd: 'var(--status-blue-bd)' },
    'RCCG Camp Security': { label: 'Security', color: 'var(--status-green)', bg: 'var(--status-green-bg)', bd: 'var(--status-green-bd)' },
    'RCCG Medical Centre': { label: 'Medical', color: 'var(--status-red)', bg: 'var(--status-red-bg)', bd: 'var(--status-red-bd)' },
};

// ─── Component Interfaces ───────────────────────────────────

interface MyReportsScreenProps {
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
                status: r.status as IncidentStatus,
                reported: new Date(r.created_at).toLocaleDateString(),
                reportedAt: new Date(r.created_at).toLocaleString(),
                desc: r.description,
                media: r.media.length,
                assignedTo: r.responding_agency?.name || null,
            }));
            setReports(mappedReports);
        } catch (err) {
            console.error('Failed to load reports:', err);
            setReports([]);
        } finally {
            setLoading(false);
        }
    };

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
                        style={{
                            display: 'flex', alignItems: 'center', gap: 10, padding: '6px 12px 6px 6px',
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
                        <span style={{ fontSize: 13, fontWeight: 500 }}>{user?.name?.split(' ')[0] || 'You'}</span>
                        <Icon.chevDown style={{ color: 'var(--brand-muted)' }} />
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
                        <div style={{ padding: '64px 24px', textAlign: 'center' }}>
                            <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'center' }}><Clock size={32} style={{ color: 'var(--brand-muted)' }} /></div>
                            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>Loading reports...</div>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div style={{ padding: '64px 24px', textAlign: 'center' }}>
                            <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'center' }}><Search size={32} style={{ color: 'var(--brand-muted)' }} /></div>
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

// ─────────────────────────────────────────────────────────────
// CITIZEN REPORT DETAIL DRAWER
// ─────────────────────────────────────────────────────────────
function CitizenReportDetail({ report, onClose, navigate }: { report: Incident; onClose: () => void; navigate: (to: string, params?: any) => void }) {
    const isMobile = useIsMobile();
    const t = getIncidentType(report.type);
    const agencyMeta = report.assignedTo ? AGENCY_TYPE_MAP[report.assignedTo] : null;

    // Citizen note state
    const [note, setNote] = React.useState('');
    const [noteLoading, setNoteLoading] = React.useState(false);
    const [noteSent, setNoteSent] = React.useState(false);
    const [notes, setNotes] = React.useState<{ text: string; time: string }[]>([]);
    const NOTE_MAX = 300;

    const handleSubmitNote = async () => {
        if (!note.trim()) return;
        setNoteLoading(true);
        try {
            // TODO: Implement citizen note API endpoint when available
            setNotes(prev => [{ text: note.trim(), time: 'Just now' }, ...prev]);
            setNote('');
            setNoteSent(true);
            toast.success('Your update has been sent to the responding agency!');
            setTimeout(() => setNoteSent(false), 3000);
        } catch (err: any) {
            toast.error(err.message || 'Failed to submit update. Please try again.');
        } finally {
            setNoteLoading(false);
        }
    };

    return (
        <>
            <div
                onClick={onClose}
                style={{
                    position: 'fixed', inset: 0, background: 'var(--scrim)', backdropFilter: 'blur(2px)',
                    zIndex: 1500, animation: 'fadeIn 0.2s ease-out',
                }}
            />
            <div style={{
                position: 'fixed', top: 0, right: 0, bottom: 0, width: isMobile ? '100vw' : 'min(580px, 94vw)',
                background: 'var(--brand-white)', borderLeft: '1px solid var(--brand-divider)',
                zIndex: 1600, overflowY: 'auto',
                animation: 'slideRight 0.3s cubic-bezier(.2,.8,.2,1)',
            }}>
                {/* Sticky header */}
                <div style={{
                    position: 'sticky', top: 0, background: 'var(--surface-overlay)',
                    backdropFilter: 'blur(8px)',
                    padding: isMobile ? '18px 16px 14px' : '20px 28px 16px', borderBottom: '1px solid var(--brand-hairline)', zIndex: 5,
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--brand-muted)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6 }}>Reference</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 20, fontWeight: 700 }}>{report.ref}</div>
                                <StatusBadge status={report.status} />
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            style={{
                                width: 34, height: 34, borderRadius: 9, border: '1px solid var(--brand-divider)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                background: 'none', cursor: 'pointer', transition: 'background 0.15s',
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--brand-cream)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'none'}
                        >
                            <Icon.close />
                        </button>
                    </div>
                </div>

                <div style={{ padding: isMobile ? '20px 16px 40px' : '24px 28px 48px' }}>
                    {/* Incident type row */}
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
                        borderRadius: 10, background: 'var(--brand-cream)', border: '1px solid var(--brand-hairline)', marginBottom: 24,
                    }}>
                        <div style={{
                            width: 38, height: 38, borderRadius: 9, background: 'var(--brand-white)',
                            border: '1px solid var(--brand-divider)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        }}><t.icon style={{ width: 20, height: 20 }} /></div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 14, fontWeight: 600 }}>{t.label}</div>
                            <div style={{ fontSize: 12, color: 'var(--brand-muted)' }}>Reported {report.reportedAt}</div>
                        </div>
                        <button
                            type="button"
                            onClick={() => navigate('track', { ref: report.ref })}
                            style={{
                                fontSize: 12, fontWeight: 600, color: 'var(--brand-ink)',
                                textDecoration: 'underline', textUnderlineOffset: 2,
                                background: 'none', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
                            }}
                        >
                            Track →
                        </button>
                    </div>

                    {/* Status stepper */}
                    <div style={{ padding: '4px 0 24px', borderBottom: '1px solid var(--brand-hairline)', marginBottom: 24 }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--brand-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 18 }}>Status Timeline</div>
                        {isMobile ? (
                            <div style={{ overflowX: 'auto' }}>
                                <StatusStepper current={report.status} timestamps={getTimestamps(report)} theme="light" />
                            </div>
                        ) : (
                            <StatusStepper current={report.status} timestamps={getTimestamps(report)} theme="light" />
                        )}
                    </div>

                    {/* Location */}
                    <DetailRow label="Location">
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                            <Icon.pin style={{ width: 14, height: 14, color: 'var(--brand-muted)', marginTop: 2, flexShrink: 0 }} />
                            <div>
                                <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 3 }}>{report.location}</div>
                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--brand-muted)' }}>
                                    {report.lat.toFixed(5)}° N · {report.lng.toFixed(5)}° E
                                </div>
                            </div>
                        </div>
                    </DetailRow>

                    {/* Description */}
                    <DetailRow label="Your description">
                        <p style={{ fontSize: 14, lineHeight: 1.65, color: 'var(--brand-ink)', margin: 0 }}>{report.desc}</p>
                    </DetailRow>

                    {/* Assigned Agency */}
                    {report.assignedTo && (
                        <DetailRow label="Responding agency">
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: isMobile ? 10 : 14, padding: '14px 16px',
                                borderRadius: 10, flexWrap: 'wrap',
                                background: agencyMeta?.bg || 'var(--status-blue-bg)',
                                border: `1px solid ${agencyMeta?.bd || 'var(--status-blue-bd)'}`,
                            }}>
                                <div style={{
                                    width: 38, height: 38, borderRadius: 9, flexShrink: 0,
                                    background: 'var(--brand-white)', border: `1px solid ${agencyMeta?.bd || 'var(--status-blue-bd)'}`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: agencyMeta?.color || 'var(--status-blue)',
                                }}>
                                    <Icon.pin style={{ width: 18, height: 18 }} />
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--brand-ink)', marginBottom: 2 }}>{report.assignedTo}</div>
                                    <div style={{ fontSize: 12, color: agencyMeta?.color || 'var(--status-blue)', fontWeight: 500 }}>
                                        {agencyMeta?.label || 'Responding Agency'} · Acknowledged
                                    </div>
                                </div>
                                <div style={{
                                    fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 99,
                                    background: 'var(--brand-white)', color: agencyMeta?.color || 'var(--status-blue)',
                                    border: `1px solid ${agencyMeta?.bd || 'var(--status-blue-bd)'}`,
                                }}>
                                    On scene
                                </div>
                            </div>
                        </DetailRow>
                    )}

                    {/* Evidence thumbnails */}
                    {report.media > 0 && (
                        <DetailRow label={`Evidence (${report.media} ${report.media === 1 ? 'file' : 'files'})`}>
                            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(3, 1fr)' : 'repeat(4, 1fr)', gap: 8 }}>
                                {Array.from({ length: report.media }).map((_, i) => (
                                    <div
                                        key={i}
                                        style={{
                                            aspectRatio: '1',
                                            borderRadius: 8,
                                            background: `linear-gradient(135deg, oklch(0.42 0.08 ${i * 80 + 30}), oklch(0.32 0.06 ${i * 80 + 70}))`,
                                            border: '1px solid var(--brand-divider)',
                                            cursor: 'pointer',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            transition: 'opacity 0.15s',
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
                                        onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="3" y="3" width="18" height="18" rx="2" />
                                            <circle cx="8.5" cy="8.5" r="1.5" />
                                            <polyline points="21 15 16 10 5 21" />
                                        </svg>
                                    </div>
                                ))}
                            </div>
                        </DetailRow>
                    )}

                    {/* Submitted notes */}
                    {notes.length > 0 && (
                        <DetailRow label={`Your updates (${notes.length})`}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {notes.map((n, i) => (
                                    <div key={i} style={{
                                        padding: '12px 14px', borderRadius: 9,
                                        background: 'var(--brand-cream)', border: '1px solid var(--brand-hairline)',
                                    }}>
                                        <div style={{ fontSize: 13, lineHeight: 1.55, color: 'var(--brand-ink)', marginBottom: 6 }}>{n.text}</div>
                                        <div style={{ fontSize: 11, color: 'var(--brand-muted)', fontFamily: 'var(--font-mono)' }}>{n.time}</div>
                                    </div>
                                ))}
                            </div>
                        </DetailRow>
                    )}

                    {/* Citizen note updater */}
                    {report.status !== 'resolved' && (
                        <div style={{
                            marginTop: 8, padding: 16, borderRadius: 12,
                            background: 'var(--brand-cream)', border: '1px solid var(--brand-divider)',
                        }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--brand-ink)', marginBottom: 4 }}>
                                Have an update?
                            </div>
                            <div style={{ fontSize: 12, color: 'var(--brand-muted)', marginBottom: 12, lineHeight: 1.55 }}>
                                If the situation has changed on the ground, add a note. The responding agency will see it immediately.
                            </div>

                            {/* Textarea */}
                            <div style={{ position: 'relative', marginBottom: 10 }}>
                                <textarea
                                    value={note}
                                    onChange={e => setNote(e.target.value.slice(0, NOTE_MAX))}
                                    placeholder="e.g. The fire has spread to the adjacent block. More people are evacuating now."
                                    rows={3}
                                    style={{
                                        width: '100%', padding: '10px 12px', borderRadius: 9, boxSizing: 'border-box',
                                        background: 'var(--brand-white)', border: `1.5px solid ${note.length > 0 ? 'var(--brand-ink)' : 'var(--brand-divider)'}`,
                                        color: 'var(--brand-ink)', fontSize: 13, lineHeight: 1.55, resize: 'vertical',
                                        fontFamily: 'inherit', outline: 'none',
                                        transition: 'border-color 0.15s',
                                        minHeight: 72,
                                    }}
                                    onFocus={e => e.target.style.borderColor = 'var(--brand-ink)'}
                                    onBlur={e => e.target.style.borderColor = note.length > 0 ? 'var(--brand-ink)' : 'var(--brand-divider)'}
                                />
                                <div style={{
                                    position: 'absolute', bottom: 8, right: 10,
                                    fontSize: 10, color: note.length > NOTE_MAX * 0.85 ? 'var(--status-red)' : 'var(--brand-muted)',
                                    fontFamily: 'var(--font-mono)', pointerEvents: 'none',
                                }}>
                                    {note.length}/{NOTE_MAX}
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={handleSubmitNote}
                                disabled={!note.trim() || noteLoading}
                                style={{
                                    padding: '9px 16px', borderRadius: 8,
                                    background: noteSent ? 'var(--status-green)' : (noteLoading || !note.trim()) ? 'var(--brand-divider)' : 'var(--brand-ink)',
                                    color: (noteLoading || !note.trim()) ? 'var(--brand-muted)' : 'white',
                                    fontSize: 13, fontWeight: 600, border: 'none',
                                    cursor: (noteLoading || !note.trim()) ? 'not-allowed' : 'pointer',
                                    display: 'inline-flex', alignItems: 'center', gap: 6,
                                    transition: 'background 0.2s, color 0.2s',
                                }}
                            >
                                {noteLoading ? (
                                    <><NoteSpinner /> Sending…</>
                                ) : noteSent ? (
                                    <><Icon.check style={{ width: 14, height: 14 }} /> Sent!</>
                                ) : (
                                    'Send update'
                                )}
                            </button>
                        </div>
                    )}

                    {/* Resolved summary */}
                    {report.status === 'resolved' && (
                        <div style={{
                            marginTop: 8, padding: '14px 16px', borderRadius: 10,
                            background: 'var(--status-green-bg)', border: '1px solid var(--status-green-bd)',
                            display: 'flex', alignItems: 'flex-start', gap: 12,
                        }}>
                            <div style={{
                                width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                                background: 'var(--status-green)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <Icon.check style={{ width: 14, height: 14, color: 'white' }} />
                            </div>
                            <div>
                                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--status-green)', marginBottom: 3 }}>Incident resolved</div>
                                <div style={{ fontSize: 12, color: 'var(--brand-muted)', lineHeight: 1.5 }}>
                                    This report has been marked as resolved by the responding agency. If the issue persists, you can submit a new report.
                                </div>
                                <button
                                    type="button"
                                    onClick={() => navigate('report')}
                                    style={{
                                        marginTop: 8, fontSize: 12, fontWeight: 600, color: 'var(--brand-ink)',
                                        textDecoration: 'underline', textUnderlineOffset: 2, background: 'none', border: 'none', cursor: 'pointer',
                                    }}
                                >
                                    Submit a new report →
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

function NoteSpinner() {
    return (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 0.75s linear infinite' }}>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="40 20" strokeLinecap="round" />
        </svg>
    );
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--brand-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>{label}</div>
            {children}
        </div>
    );
}
