import React from 'react';
import { toast } from 'sonner';
import { Icon, StatusBadge, StatusStepper, resolveMediaUrl, getIncidentType } from '@/components/irms-shared';
import type { Incident, IncidentStatus } from '@/components/irms-shared';
import { updateIncidentStatus } from '@/lib/agency-api';
import { toBeType, toFeType } from '@/lib/agency-types';
import { useAgencyProfile } from './context';
import { useIsMobile } from '@/hooks/use-media-query';

const PRIORITY_STYLES: Record<string, { color: string; bg: string; border: string; label: string }> = {
  low:      { color: '#16A34A', bg: 'rgba(22,163,74,0.08)',  border: 'rgba(22,163,74,0.25)',  label: 'Low Priority' },
  medium:   { color: '#D97706', bg: 'rgba(217,119,6,0.08)',  border: 'rgba(217,119,6,0.25)',  label: 'Medium Priority' },
  high:     { color: '#EA580C', bg: 'rgba(234,88,12,0.08)',  border: 'rgba(234,88,12,0.25)',  label: 'High Priority' },
  critical: { color: '#DC2626', bg: 'rgba(220,38,38,0.08)',  border: 'rgba(220,38,38,0.25)',  label: 'Critical' },
};

const STRESS_STYLES: Record<string, { color: string; bg: string; border: string; emoji: string }> = {
  low:      { color: '#16A34A', bg: 'rgba(22,163,74,0.08)',  border: 'rgba(22,163,74,0.2)',  emoji: '😐' },
  medium:   { color: '#D97706', bg: 'rgba(217,119,6,0.08)',  border: 'rgba(217,119,6,0.2)',  emoji: '😟' },
  high:     { color: '#EA580C', bg: 'rgba(234,88,12,0.08)',  border: 'rgba(234,88,12,0.2)',  emoji: '😰' },
  critical: { color: '#DC2626', bg: 'rgba(220,38,38,0.08)',  border: 'rgba(220,38,38,0.2)',  emoji: '😱' },
  unknown:  { color: 'var(--brand-muted)', bg: 'var(--brand-cream)', border: 'var(--brand-divider)', emoji: '🔇' },
};

const AP_BAR_COUNT = 30;

function AudioPlayer({ url, color, bgColor }: { url: string; color: string; bgColor: string }) {
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = React.useRef<AudioContext | null>(null);
  const analyserRef = React.useRef<AnalyserNode | null>(null);
  const animFrameRef = React.useRef<number | null>(null);
  const srcCreated = React.useRef(false);
  const [playing, setPlaying] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [duration, setDuration] = React.useState(0);
  const [bars, setBars] = React.useState<number[]>(new Array(AP_BAR_COUNT).fill(0.15));

  React.useEffect(() => {
    const audio = new Audio();
    audio.crossOrigin = 'anonymous';
    audio.preload = 'metadata';
    audio.src = url;
    audioRef.current = audio;

    audio.addEventListener('loadedmetadata', () => {
      const d = audio.duration;
      if (isFinite(d) && d > 0) {
        setDuration(d);
      } else if (!isFinite(d)) {
        // WebM from MediaRecorder often has Infinity duration in its header.
        // Seeking past the end forces the browser to compute the real length.
        audio.currentTime = 1e6;
      }
    });

    audio.addEventListener('seeked', () => {
      // Triggered after the Infinity-fix seek above — browser now knows the real duration.
      if (!isFinite(audio.duration)) return;
      setDuration(audio.duration);
      audio.currentTime = 0;
    });

    audio.addEventListener('timeupdate', () => {
      const d = audio.duration;
      if (d > 0 && isFinite(d)) {
        setProgress(audio.currentTime / d);
      }
    });

    audio.addEventListener('ended', () => {
      // Use currentTime at playback end as the authoritative duration —
      // this corrects metadata that claims a longer duration than the actual audio.
      if (audio.currentTime > 0) setDuration(audio.currentTime);
      setPlaying(false);
      setProgress(0);
      setBars(new Array(AP_BAR_COUNT).fill(0.15));
      if (animFrameRef.current) { cancelAnimationFrame(animFrameRef.current); animFrameRef.current = null; }
    });
    return () => {
      audio.pause(); audio.src = '';
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (audioCtxRef.current) audioCtxRef.current.close().catch(() => {});
    };
  }, [url]);

  const startVisualizer = (audio: HTMLAudioElement) => {
    if (srcCreated.current) return;
    try {
      const ACtx = (window.AudioContext || (window as any).webkitAudioContext) as typeof AudioContext;
      if (!ACtx) return;
      const ac = new ACtx();
      audioCtxRef.current = ac;
      const analyser = ac.createAnalyser();
      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = 0.8;
      analyserRef.current = analyser;
      const src = ac.createMediaElementSource(audio);
      src.connect(analyser);
      analyser.connect(ac.destination);
      srcCreated.current = true;

      const freqData = new Uint8Array(analyser.frequencyBinCount);
      const animate = () => {
        analyser.getByteFrequencyData(freqData);
        setBars(Array.from({ length: AP_BAR_COUNT }, (_, i) => {
          const idx = Math.floor((i / AP_BAR_COUNT) * freqData.length);
          return Math.max(0.08, freqData[idx] / 255);
        }));
        animFrameRef.current = requestAnimationFrame(animate);
      };
      animFrameRef.current = requestAnimationFrame(animate);
    } catch {
      // CORS or API unavailable — player still works without visualizer
    }
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
      if (animFrameRef.current) { cancelAnimationFrame(animFrameRef.current); animFrameRef.current = null; }
      setBars(new Array(AP_BAR_COUNT).fill(0.15));
      setPlaying(false);
    } else {
      startVisualizer(audioRef.current);
      audioRef.current.play().catch(() => {});
      setPlaying(true);
    }
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !duration || !isFinite(audio.duration)) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audio.currentTime = ratio * duration;
    setProgress(ratio);
  };

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  const currentSec = progress * duration;
  const durationDisplay = duration > 0 ? fmt(duration) : '--:--';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0' }}>
      <button
        onClick={togglePlay}
        style={{
          width: 38, height: 38, borderRadius: '50%', border: 'none',
          background: color, color: 'white', cursor: 'pointer', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: playing ? `0 0 0 4px ${bgColor}` : 'none',
          transition: 'box-shadow 0.2s',
        }}
      >
        {playing ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
            <rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/>
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
            <polygon points="5 3 19 12 5 21 5 3"/>
          </svg>
        )}
      </button>

      <div style={{ flex: 1 }}>
        {/* Frequency bars — click to seek */}
        <div
          onClick={seek}
          style={{ display: 'flex', alignItems: 'center', gap: 2, height: 30, cursor: 'pointer', marginBottom: 4 }}
          title="Click to seek"
        >
          {bars.map((amp, i) => {
            const played = duration > 0 && i / AP_BAR_COUNT <= progress;
            return (
              <div key={i} style={{
                flex: 1,
                height: `${Math.max(10, amp * 100)}%`,
                background: played ? color : bgColor,
                borderRadius: 2,
                transition: playing ? 'height 0.06s ease' : 'none',
              }} />
            );
          })}
        </div>
        <div style={{ fontSize: 10, color: 'var(--brand-muted)', fontFamily: 'var(--font-mono)' }}>
          {fmt(currentSec)} / {durationDisplay}
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--brand-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>{title}</div>
      {children}
    </div>
  );
}

export function IncidentDetailPanel({ incident, onClose, onUpdateIncident }: { incident: Incident; onClose: () => void; onUpdateIncident: (ref: string, updates: Partial<Incident>) => void }) {
  const isMobile = useIsMobile();
  const profile = useAgencyProfile();
  const myAgencyName = profile?.agencyName || 'your agency';
  const [status, setStatus] = React.useState<IncidentStatus>(incident.status);
  const [assigned, setAssigned] = React.useState(!!incident.assignedTo);
  const [updating, setUpdating] = React.useState(false);
  const t = getIncidentType(incident.type);

  React.useEffect(() => {
    setStatus(incident.status);
    setAssigned(!!incident.assignedTo);
  }, [incident]);

  const stepperTimestamps: Record<string, string | null> = {
    pending: incident.reportedAt || null,
    in_progress: null,
    assigned: null,
    resolved: null,
  };

  if (incident.timeline) {
    incident.timeline.forEach((event: any) => {
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

  // Claiming an incident = moving it to "review" (backend in_progress). The
  // backend has no separate assign endpoint; the strict flow is
  // pending -> in_progress -> assigned -> resolved | closed.
  const handleAssign = async () => {
    if (incident.id) {
      try {
        const updated = await updateIncidentStatus(incident.id, 'assigned');
        toast.success(`Incident ${incident.ref} claimed — assigned to your agency.`);
        setAssigned(true);
        setStatus(updated.status);
        onUpdateIncident(incident.ref, { ...updated });
        window.dispatchEvent(new CustomEvent('irms:incident_updated', { detail: { ref: incident.ref } }));
        return;
      } catch (err: any) {
        toast.error(err.message || 'Could not claim this incident.');
      }
      return;
    }
    toast.error('This incident cannot be claimed (missing backend id).');
  };

  const handleDirectStatusUpdate = async (targetStatus: IncidentStatus) => {
    if (!incident.id) {
      toast.error('This incident cannot be updated (missing backend id).');
      return;
    }
    setUpdating(true);
    try {
      const updated = await updateIncidentStatus(incident.id, targetStatus);
      toast.success(`Incident ${incident.ref} updated to "${updated.status}".`);
      setStatus(updated.status);
      onUpdateIncident(incident.ref, { ...updated });
      window.dispatchEvent(new CustomEvent('irms:incident_updated', { detail: { ref: incident.ref } }));
    } catch (err: any) {
      toast.error(err.message || 'Could not update this incident.');
    } finally {
      setUpdating(false);
    }
  };

  const handleStatusUpdate = async () => {
    await handleDirectStatusUpdate(status);
  };

  return (
    <>
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, background: 'var(--scrim)', zIndex: 1500,
        animation: 'fadeIn 0.2s ease-out',
      }} />
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: 'min(620px, 92vw)',
        background: 'var(--brand-white)', zIndex: 1600, overflowY: 'auto',
        boxShadow: '-20px 0 60px rgba(0,0,0,0.15)',
        animation: 'slideRight 0.3s cubic-bezier(.2,.8,.2,1)',
      }}>
        {/* Header */}
        <div style={{
          position: 'sticky', top: 0, background: 'var(--brand-white)', zIndex: 10,
          padding: isMobile ? '24px 20px 16px' : '24px 32px 16px', borderBottom: '1px solid var(--brand-hairline)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--brand-muted)', letterSpacing: '0.1em', marginBottom: 8 }}>INCIDENT REFERENCE</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 700, letterSpacing: '-0.01em' }}>{incident.ref}</div>
                <StatusBadge status={status} />
                {incident.priority && (() => {
                  const p = PRIORITY_STYLES[incident.priority] || PRIORITY_STYLES.medium;
                  return (
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                      padding: '3px 10px', borderRadius: 6,
                      background: p.bg, border: `1px solid ${p.border}`,
                      fontSize: 11, fontWeight: 700, color: p.color, letterSpacing: '0.04em',
                    }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: p.color, display: 'inline-block' }} />
                      {p.label.toUpperCase()}
                    </span>
                  );
                })()}
              </div>
            </div>
            <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: 10, border: '1px solid var(--brand-hairline)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', cursor: 'pointer' }}>
              <Icon.close />
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 8,
              background: 'var(--brand-cream)', border: '1px solid var(--brand-hairline)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}><t.icon style={{ width: 18, height: 18 }} /></div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600 }}>{t.label}</div>
              <div style={{ fontSize: 12, color: 'var(--brand-muted)' }}>Reported {incident.reportedAt}</div>
            </div>
          </div>
        </div>

        <div style={{ padding: isMobile ? '24px 20px 40px' : '24px 32px 40px' }}>
          {/* Status stepper */}
          <div style={{ padding: '20px 4px', marginBottom: 24, borderBottom: '1px solid var(--brand-hairline)', overflowX: 'auto' }}>
            <StatusStepper current={status} theme="light"
              timestamps={{
                pending: stepperTimestamps.pending || incident.reportedAt || null,
                in_progress: stepperTimestamps.in_progress || null,
                assigned: stepperTimestamps.assigned || null,
                resolved: stepperTimestamps.resolved || null,
              }}
            />
          </div>

          {/* Location */}
          <Section title="Location">
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <Icon.pin style={{ color: 'var(--status-red)', flexShrink: 0, marginTop: 2 }} />
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{incident.location}</div>
                <div style={{ fontSize: 12, color: 'var(--brand-muted)', fontFamily: 'var(--font-mono)' }}>
                  {incident.lat.toFixed(4)}° N · {incident.lng.toFixed(4)}° E
                </div>
              </div>
            </div>
          </Section>

          {/* Description */}
          <Section title="Description">
            <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--brand-ink)', margin: 0 }}>{incident.desc}</p>
          </Section>

          {/* Reporter contact */}
          {incident.reporter_phone && (
            <Section title="Reporter Contact">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <a
                  href={`tel:${incident.reporter_phone}`}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    padding: '8px 14px', borderRadius: 8, fontSize: 14, fontWeight: 600,
                    background: 'rgba(22,163,74,0.08)', border: '1px solid rgba(22,163,74,0.25)',
                    color: '#16A34A', textDecoration: 'none', transition: 'all 0.1s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#16A34A'; e.currentTarget.style.color = 'white'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(22,163,74,0.08)'; e.currentTarget.style.color = '#16A34A'; }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                  {incident.reporter_phone}
                </a>
              </div>
            </Section>
          )}

          {/* Media */}
          {incident.media > 0 && (
            <Section title={`Evidence (${incident.media} attachment${incident.media > 1 ? 's' : ''})`}>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)', gap: 10 }}>
                {Array.from({ length: incident.media }).map((_, i) => {
                  const item = incident.mediaItems?.[i];
                  const url = item ? resolveMediaUrl(item.file_url) : '';
                  const isImage = item ? /^image\//i.test(item.media_type) || /\.(jpg|jpeg|png|webp|gif)$/i.test(item.file_url) : false;
                  const isVideo = item ? /^video\//i.test(item.media_type) || /\.(mp4|webm|ogg|mov)$/i.test(item.file_url) : false;

                  if (url) {
                    if (isImage) {
                      return (
                        <a key={i} href={url} target="_blank" rel="noopener noreferrer" style={{
                          aspectRatio: '1', borderRadius: 10, overflow: 'hidden',
                          border: '1px solid var(--brand-hairline)', background: 'var(--brand-cream)',
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
                          aspectRatio: '1', borderRadius: 10, overflow: 'hidden',
                          border: '1px solid var(--brand-hairline)', background: 'var(--brand-cream)',
                          objectFit: 'cover', width: '100%', height: '100%',
                        }} />
                      );
                    }
                    return (
                      <a key={i} href={url} target="_blank" rel="noopener noreferrer" style={{
                        aspectRatio: '1', borderRadius: 10,
                        background: 'var(--brand-cream)', border: '1px solid var(--brand-hairline)',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        color: 'var(--brand-ink)', textDecoration: 'none', gap: 6, fontSize: 11, fontWeight: 600,
                        transition: 'background 0.2s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--brand-divider)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'var(--brand-cream)'}
                      >
                        <Icon.upload style={{ width: 18, height: 18, color: 'var(--brand-muted)' }} />
                        <span>View File</span>
                      </a>
                    );
                  }

                  return (
                    <div key={i} style={{
                      aspectRatio: '1', borderRadius: 10,
                      background: 'var(--brand-cream)', border: '1px solid var(--brand-hairline)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-muted)',
                    }}>
                      <Icon.upload style={{ width: 18, height: 18 }} />
                    </div>
                  );
                })}
              </div>
            </Section>
          )}

          {/* Timeline */}
          {incident.timeline && incident.timeline.length > 0 && (
            <Section title="Timeline">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {incident.timeline.map((event: any, index: number) => (
                  <div key={index} style={{ display: 'flex', gap: 16 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 24 }}>
                      <div style={{
                        width: 12, height: 12, borderRadius: '50%',
                        background: event.status === 'completed' ? 'var(--status-green)' : 'var(--brand-muted)',
                        border: event.status === 'completed' ? '2px solid var(--status-green)' : '2px solid var(--brand-divider)',
                      }} />
                      {index < (incident.timeline?.length ?? 0) - 1 && (
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
            </Section>
          )}

          {/* Activity Log */}
          {incident.activity_log && incident.activity_log.length > 0 && (
            <Section title="Activity Log">
              <div style={{ display: 'flex', flexDirection: 'column', border: '1px solid var(--brand-hairline)', borderRadius: 12, background: 'var(--brand-white)', padding: '12px 16px' }}>
                {incident.activity_log.map((log: any, index: number) => (
                  <div key={index} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 0', borderBottom: index < (incident.activity_log?.length ?? 0) - 1 ? '1px solid var(--brand-hairline)' : 'none' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--brand-muted)', minWidth: 50 }}>{log.time}</span>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: log.color || 'var(--brand-muted)' }} />
                    <span style={{ fontSize: 13, color: 'var(--brand-ink)' }}>{log.event}</span>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Voice note stress analysis */}
          {incident.voice_note && (() => {
            const vn = incident.voice_note!;
            const ss = STRESS_STYLES[vn.stress_level] || STRESS_STYLES.unknown;
            return (
              <Section title="Voice Note Analysis">
                <div style={{ borderRadius: 12, border: `1px solid ${ss.border}`, background: ss.bg, overflow: 'hidden' }}>
                  {/* Stress header */}
                  <div style={{ padding: '14px 16px', borderBottom: `1px solid ${ss.border}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: vn.audio_url ? 4 : 0 }}>
                      <span style={{ fontSize: 22 }}>{ss.emoji}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: ss.color, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 2 }}>
                          Caller Stress: {vn.stress_level.charAt(0).toUpperCase() + vn.stress_level.slice(1)}
                          {vn.stress_score > 0 && <span style={{ opacity: 0.7, fontWeight: 400 }}> · Score {vn.stress_score}/100</span>}
                        </div>
                        {vn.analysis_summary && (
                          <div style={{ fontSize: 12, color: 'var(--brand-ink)', lineHeight: 1.4 }}>{vn.analysis_summary}</div>
                        )}
                      </div>
                    </div>
                    {/* Inline streaming audio player */}
                    {vn.audio_url && (
                      <AudioPlayer url={vn.audio_url} color={ss.color} bgColor={ss.bg} />
                    )}
                  </div>
                  {/* Stress indicators */}
                  {vn.stress_indicators?.length > 0 && (
                    <div style={{ padding: '12px 16px' }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--brand-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>Indicators</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {vn.stress_indicators.map((ind: string, i: number) => (
                          <span key={i} style={{
                            fontSize: 11, padding: '3px 9px', borderRadius: 6,
                            background: 'var(--brand-white)', border: `1px solid ${ss.border}`,
                            color: ss.color, fontWeight: 500,
                          }}>{ind}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* Transcript */}
                  {vn.transcript && (
                    <div style={{ padding: '0 16px 14px' }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--brand-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>Transcript</div>
                      <p style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--brand-ink)', margin: 0, fontStyle: 'italic' }}>"{vn.transcript}"</p>
                    </div>
                  )}
                </div>
              </Section>
            );
          })()}

          {/* Agency actions */}
          <div style={{ marginTop: 32, padding: 20, borderRadius: 12, background: 'var(--brand-cream)', border: '1px solid var(--brand-hairline)' }}>
            {!assigned ? (
              <>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--brand-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>UNASSIGNED INCIDENT</div>
                <div style={{ fontSize: 14, color: 'var(--brand-ink)', marginBottom: 16 }}>
                  This incident is in your service radius. Assign your agency to take responsibility.
                </div>
                <button onClick={handleAssign} style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '12px 20px',
                  background: 'var(--status-red)', color: 'white', borderRadius: 10, fontWeight: 600, fontSize: 14,
                  width: '100%', justifyContent: 'center', border: 'none', cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(232,74,63,0.25)',
                }}>
                  Claim this incident <Icon.arrow />
                </button>
              </>
            ) : status === 'resolved' || status === 'closed' ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                  background: 'var(--status-green-bg)', border: '2px solid var(--status-green)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon.check style={{ color: 'var(--status-green)', width: 16, height: 16 }} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--status-green)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Incident Resolved</div>
                  <div style={{ fontSize: 12, color: 'var(--brand-muted)', marginTop: 2 }}>This incident has been closed by {incident.assignedTo || myAgencyName}.</div>
                </div>
              </div>
            ) : status === 'assigned' ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                    background: 'var(--status-blue-bg)', border: '2px solid var(--status-blue)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon.check style={{ color: 'var(--status-blue)', width: 16, height: 16 }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--status-blue)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Incident Claimed</div>
                    <div style={{ fontSize: 12, color: 'var(--brand-muted)', marginTop: 2 }}>{incident.assignedTo || myAgencyName}</div>
                  </div>
                </div>
                <div style={{ fontSize: 13, color: 'var(--brand-ink)', marginBottom: 16 }}>
                  Update the status as your team responds to this incident.
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <button
                    onClick={() => handleDirectStatusUpdate('in_progress')}
                    disabled={updating}
                    style={{
                      padding: '11px 16px', borderRadius: 10, border: '1.5px solid var(--status-amber)',
                      background: 'var(--status-amber-bg)', color: 'var(--status-amber)',
                      fontWeight: 600, fontSize: 13, cursor: updating ? 'not-allowed' : 'pointer',
                      opacity: updating ? 0.7 : 1, transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => { if (!updating) e.currentTarget.style.filter = 'brightness(0.93)'; }}
                    onMouseLeave={e => { e.currentTarget.style.filter = ''; }}
                  >
                    Start Review
                  </button>
                  <button
                    onClick={() => handleDirectStatusUpdate('resolved')}
                    disabled={updating}
                    style={{
                      padding: '11px 16px', borderRadius: 10, border: 'none',
                      background: 'var(--status-green)', color: 'white',
                      fontWeight: 600, fontSize: 13, cursor: updating ? 'not-allowed' : 'pointer',
                      opacity: updating ? 0.7 : 1, transition: 'all 0.15s',
                      boxShadow: updating ? 'none' : '0 4px 14px rgba(62,134,87,0.3)',
                    }}
                    onMouseEnter={e => { if (!updating) e.currentTarget.style.filter = 'brightness(0.9)'; }}
                    onMouseLeave={e => { e.currentTarget.style.filter = ''; }}
                  >
                    Mark Resolved
                  </button>
                </div>
              </>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--status-amber)' }} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--status-amber)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Under Review</span>
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>{incident.assignedTo || myAgencyName}</div>

                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--brand-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>UPDATE INCIDENT STATUS</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 16, padding: 4, background: 'var(--brand-white)', borderRadius: 10, border: '1px solid var(--brand-hairline)' }}>
                  {(['in_progress', 'resolved'] as const).map(s => {
                    const map = {
                      in_progress: { c: 'var(--status-amber)', bg: 'var(--status-amber-bg)', l: 'Under Review' },
                      resolved:    { c: 'var(--status-green)', bg: 'var(--status-green-bg)', l: 'Resolved' },
                    };
                    const m = map[s];
                    const active = status === s;
                    return (
                      <button key={s} onClick={() => setStatus(s)} style={{
                        padding: '10px 8px', borderRadius: 7, fontSize: 12, fontWeight: 600,
                        background: active ? m.bg : 'transparent',
                        color: active ? m.c : 'var(--brand-muted)',
                        border: active ? `1px solid ${m.c}` : '1px solid transparent',
                        transition: 'all 0.15s', cursor: 'pointer',
                      }}
                        onMouseEnter={e => { if (!active) { e.currentTarget.style.background = m.bg; e.currentTarget.style.color = m.c; } }}
                        onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--brand-muted)'; } }}
                      >{m.l}</button>
                    );
                  })}
                </div>

                {(() => {
                  const s = status as IncidentStatus;
                  const btnColor = s === 'resolved' ? 'var(--status-green)' : 'var(--status-amber)';
                  const btnShadow = s === 'resolved' ? 'rgba(62,134,87,0.3)' : 'rgba(185,122,42,0.3)';
                  return (
                    <button
                      onClick={handleStatusUpdate}
                      disabled={updating}
                      style={{
                        width: '100%', padding: '12px 20px', borderRadius: 10, border: 'none',
                        cursor: updating ? 'not-allowed' : 'pointer',
                        background: updating ? 'var(--brand-muted)' : btnColor,
                        color: 'white', fontWeight: 600, fontSize: 14,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        boxShadow: updating ? 'none' : `0 4px 14px ${btnShadow}`,
                        transition: 'background 0.15s, box-shadow 0.15s, transform 0.1s',
                        opacity: updating ? 0.8 : 1,
                      }}
                      onMouseEnter={e => { if (!updating) { e.currentTarget.style.filter = 'brightness(0.9)'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
                      onMouseLeave={e => { e.currentTarget.style.filter = ''; e.currentTarget.style.transform = ''; }}
                      onMouseDown={e => { if (!updating) e.currentTarget.style.transform = 'scale(0.98)'; }}
                      onMouseUp={e => { e.currentTarget.style.transform = ''; }}
                    >
                      {updating ? (
                        <>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 0.75s linear infinite' }}>
                            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                            <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeDasharray="40 20" strokeLinecap="round" />
                          </svg>
                          Updating…
                        </>
                      ) : (
                        <><Icon.check /> Update to {s === 'resolved' ? 'Resolved' : 'Under Review'}</>
                      )}
                    </button>
                  );
                })()}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
