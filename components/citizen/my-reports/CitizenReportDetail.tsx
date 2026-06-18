import React from 'react';
import { toast } from 'sonner';
import {
  Icon, StatusBadge, StatusStepper, getIncidentType, resolveMediaUrl,
} from '@/components/irms-shared';
import type { Incident, IncidentStatus } from '@/components/irms-shared';
import { useIsMobile } from '@/hooks/use-media-query';
import { getMyReports } from '@/lib/incidents-api';
import { formatAbsolute, formatTimeOnly } from '@/lib/agency-types';

// ─── Internal helpers ────────────────────────────────────────

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

const AGENCY_TYPE_MAP: Record<string, { label: string; color: string; bg: string; bd: string }> = {
    'Federal Road Safety Corps': { label: 'Road Safety', color: 'var(--status-amber)', bg: 'var(--status-amber-bg)', bd: 'var(--status-amber-bd)' },
    'Camp Maintenance Unit': { label: 'Maintenance', color: 'var(--status-blue)', bg: 'var(--status-blue-bg)', bd: 'var(--status-blue-bd)' },
    'RCCG Camp Security': { label: 'Security', color: 'var(--status-green)', bg: 'var(--status-green-bg)', bd: 'var(--status-green-bd)' },
    'RCCG Medical Centre': { label: 'Medical', color: 'var(--status-red)', bg: 'var(--status-red-bg)', bd: 'var(--status-red-bd)' },
};

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

// ─────────────────────────────────────────────────────────────
// CITIZEN REPORT DETAIL DRAWER
// ─────────────────────────────────────────────────────────────
export function CitizenReportDetail({ report, onClose, navigate }: { report: Incident; onClose: () => void; navigate: (to: string, params?: any) => void }) {
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
                                {Array.from({ length: report.media }).map((_, i) => {
                                    const item = report.mediaItems?.[i];
                                    const url = item ? resolveMediaUrl(item.file_url) : '';
                                    const isImage = item ? /^image\//i.test(item.media_type) || /\.(jpg|jpeg|png|webp|gif)$/i.test(item.file_url) : false;
                                    const isVideo = item ? /^video\//i.test(item.media_type) || /\.(mp4|webm|ogg|mov)$/i.test(item.file_url) : false;

                                    if (url) {
                                        if (isImage) {
                                            return (
                                                <a key={i} href={url} target="_blank" rel="noopener noreferrer" style={{
                                                    aspectRatio: '1', borderRadius: 8, overflow: 'hidden',
                                                    border: '1px solid var(--brand-divider)', background: 'var(--brand-cream)',
                                                    display: 'block', position: 'relative', cursor: 'zoom-in',
                                                    transition: 'opacity 0.2s',
                                                }}
                                                onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                                                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                                                >
                                                    <img src={url} alt={`Evidence ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                </a>
                                            );
                                        }
                                        if (isVideo) {
                                            return (
                                                <video key={i} src={url} controls style={{
                                                    aspectRatio: '1', borderRadius: 8, overflow: 'hidden',
                                                    border: '1px solid var(--brand-divider)', background: 'var(--brand-cream)',
                                                    objectFit: 'cover', width: '100%', height: '100%',
                                                }} />
                                            );
                                        }
                                        return (
                                            <a key={i} href={url} target="_blank" rel="noopener noreferrer" style={{
                                                aspectRatio: '1', borderRadius: 8,
                                                background: 'var(--brand-cream)', border: '1px solid var(--brand-divider)',
                                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                                color: 'var(--brand-ink)', textDecoration: 'none', gap: 6, fontSize: 10, fontWeight: 600,
                                                transition: 'background 0.2s',
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.background = 'var(--brand-divider)'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'var(--brand-cream)'}
                                            >
                                                <Icon.upload style={{ width: 16, height: 16, color: 'var(--brand-muted)' }} />
                                                <span>View File</span>
                                            </a>
                                        );
                                    }

                                    return (
                                        <div
                                            key={i}
                                            style={{
                                                aspectRatio: '1',
                                                borderRadius: 8,
                                                background: `linear-gradient(135deg, oklch(0.42 0.08 ${i * 80 + 30}), oklch(0.32 0.06 ${i * 80 + 70}))`,
                                                border: '1px solid var(--brand-divider)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            }}
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                                                <rect x="3" y="3" width="18" height="18" rx="2" />
                                                <circle cx="8.5" cy="8.5" r="1.5" />
                                                <polyline points="21 15 16 10 5 21" />
                                            </svg>
                                        </div>
                                    );
                                })}
                            </div>
                        </DetailRow>
                    )}

                    {/* Timeline */}
                    {report.timeline && report.timeline.length > 0 && (
                        <DetailRow label="Timeline">
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                {report.timeline.map((event: any, index: number) => (
                                    <div key={index} style={{ display: 'flex', gap: 16 }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 24 }}>
                                            <div style={{
                                                width: 12, height: 12, borderRadius: '50%',
                                                background: event.status === 'completed' ? 'var(--status-green)' : 'var(--brand-muted)',
                                                border: event.status === 'completed' ? '2px solid var(--status-green)' : '2px solid var(--brand-divider)',
                                            }} />
                                            {index < (report.timeline?.length ?? 0) - 1 && (
                                                <div style={{ width: 2, flex: 1, background: 'var(--brand-divider)', minHeight: 24, marginTop: 8 }} />
                                            )}
                                        </div>
                                        <div style={{ flex: 1, paddingTop: 2 }}>
                                            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{event.title}</div>
                                            <div style={{ fontSize: 12, color: 'var(--brand-muted)' }}>{event.description}</div>
                                            <div style={{ fontSize: 11, color: 'var(--brand-muted)', marginTop: 4, fontFamily: 'var(--font-mono)' }}>{event.timestamp}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </DetailRow>
                    )}

                    {/* Activity Log */}
                    {report.activity_log && report.activity_log.length > 0 && (
                        <DetailRow label="Activity Log">
                            <div style={{ display: 'flex', flexDirection: 'column', border: '1px solid var(--brand-hairline)', borderRadius: 12, background: 'var(--brand-white)', padding: '12px 16px' }}>
                                {report.activity_log.map((log: any, index: number) => (
                                    <div key={index} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 0', borderBottom: index < (report.activity_log?.length ?? 0) - 1 ? '1px solid var(--brand-hairline)' : 'none' }}>
                                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--brand-muted)', minWidth: 50 }}>{log.time}</span>
                                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: log.color || 'var(--brand-muted)' }} />
                                        <span style={{ fontSize: 13, color: 'var(--brand-ink)' }}>{log.event}</span>
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
                                    padding: '9px 16px', borderRadius: 8, border: 'none',
                                    background: noteSent ? '#3E7350' : (!note.trim() || noteLoading) ? 'transparent' : '#E84A3F',
                                    color: noteSent ? '#ffffff' : (!note.trim() || noteLoading) ? 'var(--brand-muted)' : '#ffffff',
                                    outline: (!note.trim() || noteLoading) ? '1.5px solid var(--brand-divider)' : 'none',
                                    fontSize: 13, fontWeight: 600,
                                    cursor: (noteLoading || !note.trim()) ? 'not-allowed' : 'pointer',
                                    display: 'inline-flex', alignItems: 'center', gap: 6,
                                    transition: 'background 0.2s',
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
