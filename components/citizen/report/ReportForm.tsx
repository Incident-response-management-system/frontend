import React from 'react';
import { toast } from 'sonner';
import { Icon, INCIDENT_TYPES } from '@/components/irms-shared';
import { useIsMobile, useIsTablet } from '@/hooks/use-media-query';
import { checkAgencyCoverage } from '@/lib/incidents-api';
import type { IncidentPriority } from '@/lib/incidents-api';
import { AttachmentPreview } from './AttachmentPreview';

// ─── Description hints per type ────────────────────────────────

const TYPE_DESCRIPTION_HINTS: Record<string, string> = {
  rta: 'e.g. Two vehicles collided near the gate. One overturned. Injuries visible. Approx. 5 passengers.',
  missing: 'e.g. 7-year-old boy, blue striped shirt, last seen near the food court at 14:20.',
  civil: 'e.g. Large crowd gathering at Gate 2. Arguments reported. No weapons seen yet.',
  medical: 'e.g. Elderly woman collapsed near Auditorium 3. Conscious but unresponsive. Crowd gathered.',
  flood: 'e.g. Water overflowing drainage channel B, blocking the pedestrian pathway.',
  fire: 'e.g. Smoke visible from Kitchen Block C. No flames yet. Residents evacuating.',
};

// ─── Dynamic voice note questions per incident type ─────────────

const VOICE_NOTE_QUESTIONS: Record<string, string[]> = {
  fire_outbreak: [
    'How big is the fire? (room-size, building, or spreading to multiple structures)',
    'Has anyone been hurt or is anyone trapped?',
    'Is the fire spreading quickly to nearby areas?',
    'Are people evacuating the area?',
  ],
  road_traffic_accident: [
    'How many vehicles are involved?',
    'Are there injuries or people trapped inside vehicles?',
    'Is the road completely blocked?',
    'Are there any hazards like fuel spills or fallen power lines?',
  ],
  medical_emergency: [
    'Is the person conscious and breathing normally?',
    'What are the visible symptoms or condition?',
    'Do they have any known medical conditions?',
    'Is anyone with them providing first aid right now?',
  ],
  missing_person: [
    'What is the person\'s age and physical description?',
    'What were they last wearing?',
    'When and where were they last seen?',
    'Do they have any medical conditions or special needs?',
  ],
  civil_disturbance: [
    'Approximately how many people are involved?',
    'Are there weapons or physical violence happening?',
    'Has anyone been injured?',
    'Is the situation escalating or calming down?',
  ],
  flood: [
    'How deep is the water approximately?',
    'Are people trapped or in immediate danger?',
    'Is the water level rising or stable?',
    'Are there vehicles or structures submerged?',
  ],
};

// ─── Priority config ────────────────────────────────────────────

const PRIORITY_CONFIG: Array<{ value: IncidentPriority; label: string; color: string; bg: string; border: string; description: string }> = [
  { value: 'low',      label: 'Low',      color: '#16A34A', bg: 'rgba(22,163,74,0.08)',   border: 'rgba(22,163,74,0.3)',   description: 'Minor, no immediate danger' },
  { value: 'medium',   label: 'Medium',   color: '#D97706', bg: 'rgba(217,119,6,0.08)',   border: 'rgba(217,119,6,0.3)',   description: 'Moderate urgency' },
  { value: 'high',     label: 'High',     color: '#EA580C', bg: 'rgba(234,88,12,0.08)',   border: 'rgba(234,88,12,0.3)',   description: 'Urgent, risk to safety' },
  { value: 'critical', label: 'Critical', color: '#DC2626', bg: 'rgba(220,38,38,0.08)',   border: 'rgba(220,38,38,0.3)',   description: 'Life-threatening' },
];

function Spinner() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 0.75s linear infinite' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="40 20" strokeLinecap="round" />
    </svg>
  );
}

function MicIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
      <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
      <line x1="12" y1="19" x2="12" y2="23"/>
      <line x1="8" y1="23" x2="16" y2="23"/>
    </svg>
  );
}

function StopIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <rect x="4" y="4" width="16" height="16" rx="2"/>
    </svg>
  );
}

function PlayIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <polygon points="5 3 19 12 5 21 5 3"/>
    </svg>
  );
}

function TrashIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
      <path d="M10 11v6"/><path d="M14 11v6"/>
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
    </svg>
  );
}

// ─── Voice Note Recorder ────────────────────────────────────────

function VoiceNoteRecorder({
  incidentType,
  audioBlob,
  setAudioBlob,
}: {
  incidentType: string | null;
  audioBlob: Blob | null;
  setAudioBlob: (blob: Blob | null) => void;
}) {
  const [recording, setRecording] = React.useState(false);
  const [duration, setDuration] = React.useState(0);
  const [playing, setPlaying] = React.useState(false);
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const chunksRef = React.useRef<BlobPart[]>([]);
  const timerRef = React.useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = React.useRef<string>('');

  const questions = incidentType ? (VOICE_NOTE_QUESTIONS[incidentType] || []) : [];

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mr;
      chunksRef.current = [];

      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
        audioUrlRef.current = URL.createObjectURL(blob);
        stream.getTracks().forEach(t => t.stop());
      };

      mr.start();
      setRecording(true);
      setDuration(0);
      timerRef.current = setInterval(() => setDuration(d => d + 1), 1000);
    } catch {
      toast.error('Microphone access denied. Please allow microphone permission.');
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const togglePlay = () => {
    if (!audioUrlRef.current && audioBlob) {
      audioUrlRef.current = URL.createObjectURL(audioBlob);
    }
    if (!audioRef.current) {
      audioRef.current = new Audio(audioUrlRef.current);
      audioRef.current.onended = () => setPlaying(false);
    }
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.play();
      setPlaying(true);
    }
  };

  const deleteRecording = () => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    if (audioUrlRef.current) { URL.revokeObjectURL(audioUrlRef.current); audioUrlRef.current = ''; }
    setAudioBlob(null);
    setPlaying(false);
    setDuration(0);
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <label style={{ fontFamily: 'var(--font-serif)', fontSize: 16, fontWeight: 600, color: 'var(--brand-ink)' }}>
          Voice note <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--brand-muted)', fontWeight: 400 }}>(optional · AI-analysed for urgency)</span>
        </label>
      </div>

      {/* Dynamic questions */}
      {questions.length > 0 && (
        <div style={{
          padding: '12px 14px', borderRadius: 10, marginBottom: 12,
          background: 'var(--brand-cream)', border: '1px solid var(--brand-divider)',
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--brand-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
            Please answer these questions in your recording:
          </div>
          <ol style={{ margin: 0, padding: '0 0 0 18px', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {questions.map((q, i) => (
              <li key={i} style={{ fontSize: 13, color: 'var(--brand-ink)', lineHeight: 1.5 }}>{q}</li>
            ))}
          </ol>
        </div>
      )}

      {/* Recorder UI */}
      <div style={{
        padding: '14px 16px', borderRadius: 12,
        background: recording ? 'rgba(220,38,38,0.04)' : 'var(--brand-cream)',
        border: `1.5px solid ${recording ? 'var(--status-red)' : 'var(--brand-divider)'}`,
        display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
        transition: 'all 0.2s',
      }}>
        {!audioBlob ? (
          <>
            <button
              type="button"
              onClick={recording ? stopRecording : startRecording}
              style={{
                width: 44, height: 44, borderRadius: '50%', border: 'none',
                background: recording ? 'var(--status-red)' : 'var(--brand-ink)',
                color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, transition: 'all 0.2s',
                boxShadow: recording ? '0 0 0 4px rgba(220,38,38,0.2)' : 'none',
              }}
            >
              {recording ? <StopIcon /> : <MicIcon />}
            </button>
            <div style={{ flex: 1 }}>
              {recording ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--status-red)', animation: 'pulse 1s ease-in-out infinite' }} />
                  <style>{`@keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.3; } }`}</style>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--status-red)' }}>Recording… {formatTime(duration)}</span>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--brand-ink)' }}>Tap to record a voice note</div>
                  <div style={{ fontSize: 12, color: 'var(--brand-muted)', marginTop: 2 }}>Answer the questions above to help responders assess urgency</div>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={togglePlay}
              style={{
                width: 44, height: 44, borderRadius: '50%', border: 'none',
                background: 'var(--status-blue)', color: 'white', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}
            >
              {playing ? <StopIcon size={16} /> : <PlayIcon />}
            </button>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--brand-ink)' }}>Voice note recorded</div>
              <div style={{ fontSize: 12, color: 'var(--brand-muted)', marginTop: 2 }}>
                {formatTime(duration)} · Will be analysed for stress signals on submission
              </div>
            </div>
            <button
              type="button"
              onClick={deleteRecording}
              style={{
                width: 32, height: 32, borderRadius: 8, border: '1px solid var(--brand-divider)',
                background: 'none', color: 'var(--brand-muted)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
              title="Delete recording"
            >
              <TrashIcon />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Main ReportForm ────────────────────────────────────────────

export function ReportForm({
  pinLocation, selectedType, setSelectedType,
  description, setDescription,
  attachments, setAttachments,
  trackReport, setTrackReport,
  onClose, onSubmit, submitting,
  selectedPlace, manualLocation, resolvedLocation,
  priority, setPriority,
  audioBlob, setAudioBlob,
}: any) {
  const isMobile = useIsMobile();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const MAX_CHARS = 500;
  const charCount = description.length;
  const [agencyCoverage, setAgencyCoverage] = React.useState<boolean | null>(null);
  const [checkingCoverage, setCheckingCoverage] = React.useState(false);

  React.useEffect(() => {
    if (!pinLocation || !selectedType) {
      setAgencyCoverage(null);
      return;
    }
    let cancelled = false;
    setCheckingCoverage(true);
    checkAgencyCoverage(pinLocation.lat, pinLocation.lng, selectedType)
      .then(res => { if (!cancelled) setAgencyCoverage(res.has_coverage); })
      .catch(() => { if (!cancelled) setAgencyCoverage(null); })
      .finally(() => { if (!cancelled) setCheckingCoverage(false); });
    return () => { cancelled = true; };
  }, [pinLocation?.lat, pinLocation?.lng, selectedType]);

  const getDisplayLocationName = () => {
    if (manualLocation?.trim()) return manualLocation.trim();
    if (selectedPlace?.name) return selectedPlace.name;
    if (selectedPlace?.display_name) return selectedPlace.display_name.split(',')[0].trim();
    if (resolvedLocation) return resolvedLocation.split(',')[0].trim();
    return 'Selected location';
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const MAX_FILES = 6;
    const remaining = MAX_FILES - attachments.length;
    if (files.length > remaining) {
      toast.error(`You can attach up to ${MAX_FILES} files. ${MAX_FILES - attachments.length} slots remaining.`);
      return;
    }
    const invalid = files.filter(f => f.size > 20 * 1024 * 1024);
    if (invalid.length) toast.error('Some files exceed the 20 MB limit and were skipped.');
    const valid = files.filter(f => f.size <= 20 * 1024 * 1024);
    setAttachments((prev: File[]) => [...prev, ...valid].slice(0, MAX_FILES));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachment = (idx: number) => {
    setAttachments((prev: File[]) => prev.filter((_: File, i: number) => i !== idx));
  };

  const selectedPriority: IncidentPriority = priority || 'medium';

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: isMobile ? '20px 16px 28px' : '20px 28px 32px' }}>
      {/* Drag handle */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
        <div style={{ width: 40, height: 4, borderRadius: 2, background: 'var(--brand-hairline)' }} />
      </div>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <Icon.pin style={{ color: 'var(--status-red)', width: 16, height: 16 }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--status-red)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Pinned location</span>
          </div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 18, fontWeight: 600, marginBottom: 4, letterSpacing: '0.01em' }}>{getDisplayLocationName()}</div>
          <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--brand-muted)' }}>
            {pinLocation ? `${pinLocation.lat.toFixed(5)}° N · ${pinLocation.lng.toFixed(5)}° E · OGUN STATE` : 'Tap the map to pin your location'}
          </div>
        </div>
        <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: 10, border: '1px solid var(--brand-divider)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', cursor: 'pointer' }}>
          <Icon.close />
        </button>
      </div>

      {/* Incident Type Selector Grid */}
      <div style={{ marginBottom: 24 }}>
        <label style={{ display: 'block', fontFamily: 'var(--font-serif)', fontSize: 16, fontWeight: 600, color: 'var(--brand-ink)', marginBottom: 12 }}>
          What is happening? <span style={{ color: 'var(--status-red)', marginLeft: 2 }}>*</span>
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)', gap: 8 }}>
          {INCIDENT_TYPES.map(t => {
            const selected = selectedType === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setSelectedType(selected ? null : t.id)}
                style={{
                  padding: '16px 10px 14px', borderRadius: 12,
                  background: selected ? 'var(--status-red-bg)' : 'var(--brand-cream)',
                  border: selected ? '2px solid var(--status-red)' : '1.5px solid var(--brand-divider)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 9,
                  color: selected ? 'var(--status-red)' : 'var(--brand-ink)',
                  transition: 'all 0.18s cubic-bezier(.2,.8,.2,1)',
                  cursor: 'pointer',
                  boxShadow: selected ? '0 0 0 3px rgba(200, 70, 60, 0.12)' : '0 1px 2px rgba(40,35,20,0.04)',
                  transform: selected ? 'scale(1.02)' : 'scale(1)',
                }}
                onMouseEnter={e => { if (!selected) { e.currentTarget.style.background = 'var(--brand-white)'; e.currentTarget.style.borderColor = 'var(--brand-muted)'; e.currentTarget.style.transform = 'scale(1.02)'; } }}
                onMouseLeave={e => { if (!selected) { e.currentTarget.style.background = 'var(--brand-cream)'; e.currentTarget.style.borderColor = 'var(--brand-divider)'; e.currentTarget.style.transform = 'scale(1)'; } }}
              >
                <div style={{
                  width: 38, height: 38, borderRadius: 10,
                  background: selected ? 'rgba(200, 70, 60, 0.1)' : 'var(--brand-white)',
                  border: `1px solid ${selected ? 'var(--status-red-bd)' : 'var(--brand-hairline)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.18s',
                }}>
                  <t.icon style={{ width: 20, height: 20 }} />
                </div>
                <span style={{ fontSize: 11.5, fontWeight: 600, textAlign: 'center', lineHeight: 1.25 }}>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Agency coverage notice */}
      {selectedType && pinLocation && !checkingCoverage && agencyCoverage !== null && (
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: 10,
          padding: '11px 14px', borderRadius: 10, marginBottom: 20,
          background: agencyCoverage ? 'rgba(34,197,94,0.08)' : 'rgba(234,179,8,0.08)',
          border: `1px solid ${agencyCoverage ? 'rgba(34,197,94,0.25)' : 'rgba(234,179,8,0.25)'}`,
        }}>
          <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>{agencyCoverage ? '✓' : '⚠'}</span>
          <span style={{ fontSize: 12, lineHeight: 1.5, color: 'var(--brand-ink)' }}>
            {agencyCoverage
              ? 'Registered responders are active in your area and will be able to see this report.'
              : 'No registered responders are currently active in your area. Your report will still be recorded and reviewed.'}
          </span>
        </div>
      )}

      {/* ─── Priority / Threat Level ─── */}
      <div style={{ marginBottom: 24 }}>
        <label style={{ display: 'block', fontFamily: 'var(--font-serif)', fontSize: 16, fontWeight: 600, color: 'var(--brand-ink)', marginBottom: 8 }}>
          Threat level <span style={{ color: 'var(--status-red)', marginLeft: 2 }}>*</span>
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, marginBottom: 10 }}>
          {PRIORITY_CONFIG.map(p => {
            const active = selectedPriority === p.value;
            return (
              <button
                key={p.value}
                type="button"
                onClick={() => setPriority(p.value)}
                style={{
                  padding: '10px 6px 8px', borderRadius: 10, border: `1.5px solid ${active ? p.border : 'var(--brand-divider)'}`,
                  background: active ? p.bg : 'var(--brand-cream)',
                  color: active ? p.color : 'var(--brand-muted)',
                  cursor: 'pointer', transition: 'all 0.15s',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                }}
                onMouseEnter={e => { if (!active) { e.currentTarget.style.borderColor = p.border; e.currentTarget.style.color = p.color; } }}
                onMouseLeave={e => { if (!active) { e.currentTarget.style.borderColor = 'var(--brand-divider)'; e.currentTarget.style.color = 'var(--brand-muted)'; } }}
              >
                <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.02em' }}>{p.label.toUpperCase()}</span>
                <span style={{ fontSize: 10, fontWeight: 400, textAlign: 'center', lineHeight: 1.3, opacity: active ? 1 : 0.7 }}>{p.description}</span>
              </button>
            );
          })}
        </div>
        {/* Disclaimer */}
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: 8,
          padding: '9px 12px', borderRadius: 8,
          background: 'rgba(234,179,8,0.06)', border: '1px solid rgba(234,179,8,0.2)',
        }}>
          <span style={{ fontSize: 13, flexShrink: 0 }}>⚠</span>
          <span style={{ fontSize: 11.5, lineHeight: 1.5, color: 'var(--brand-ink)' }}>
            <strong>Important:</strong> If the actual threat level is found to be significantly lower than reported,
            agencies may deprioritize this incident in favour of more urgent situations. Please report accurately.
          </span>
        </div>
      </div>

      {/* Description */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <label style={{ fontFamily: 'var(--font-serif)', fontSize: 16, fontWeight: 600, color: 'var(--brand-ink)' }}>
            Describe the incident <span style={{ color: 'var(--status-red)', marginLeft: 2 }}>*</span>
          </label>
          <span style={{
            fontSize: 11, fontFamily: 'var(--font-mono)',
            color: charCount > MAX_CHARS * 0.9 ? 'var(--status-red)' : 'var(--brand-muted)',
          }}>
            {charCount}/{MAX_CHARS}
          </span>
        </div>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value.slice(0, MAX_CHARS))}
          placeholder={selectedType && TYPE_DESCRIPTION_HINTS[selectedType]
            ? TYPE_DESCRIPTION_HINTS[selectedType]
            : 'Describe what you are seeing right now — be as specific as possible. Mention injuries, vehicles, landmarks.'}
          style={{
            width: '100%', minHeight: 110, padding: '13px 14px', borderRadius: 10,
            background: 'var(--brand-cream)', border: '1.5px solid var(--brand-divider)',
            color: 'var(--brand-ink)', fontSize: 14, lineHeight: 1.6, resize: 'vertical',
            fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
            transition: 'border-color 0.15s',
          }}
          onFocus={e => e.target.style.borderColor = 'var(--status-red)'}
          onBlur={e => e.target.style.borderColor = 'var(--brand-divider)'}
        />
        <div style={{ height: 2, background: 'var(--brand-hairline)', borderRadius: 1, marginTop: 6, overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${(charCount / MAX_CHARS) * 100}%`,
            background: charCount > MAX_CHARS * 0.9 ? 'var(--status-red)' : charCount > MAX_CHARS * 0.6 ? 'var(--status-amber)' : 'var(--status-green)',
            borderRadius: 1,
            transition: 'width 0.2s, background 0.3s',
          }} />
        </div>
      </div>

      {/* Voice Note Recorder */}
      <VoiceNoteRecorder
        incidentType={selectedType}
        audioBlob={audioBlob}
        setAudioBlob={setAudioBlob}
      />

      {/* File Upload */}
      <div style={{ marginBottom: 24 }}>
        <label style={{ display: 'block', fontFamily: 'var(--font-serif)', fontSize: 16, fontWeight: 600, color: 'var(--brand-ink)', marginBottom: 8 }}>
          Photos or videos <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--brand-muted)', fontWeight: 400 }}>(optional · max 6 files · 20 MB each)</span>
        </label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          {attachments.map((file: File, idx: number) => (
            <AttachmentPreview key={`${file.name}-${idx}`} file={file} onRemove={() => removeAttachment(idx)} />
          ))}
          {attachments.length < 6 && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              style={{
                width: 80, height: 80, borderRadius: 10,
                border: '2px dashed var(--brand-muted)', background: 'transparent',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 5,
                color: 'var(--brand-muted)', cursor: 'pointer',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--brand-ink)'; e.currentTarget.style.color = 'var(--brand-ink)'; e.currentTarget.style.background = 'var(--brand-cream)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--brand-muted)'; e.currentTarget.style.color = 'var(--brand-muted)'; e.currentTarget.style.background = 'transparent'; }}
            >
              <Icon.upload style={{ width: 18, height: 18 }} />
              <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.02em' }}>ATTACH</span>
            </button>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
      </div>

      {/* Track toggle */}
      <div style={{
        padding: 14, borderRadius: 10, background: 'var(--brand-cream)',
        border: '1px solid var(--brand-divider)', marginBottom: 20,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--brand-ink)' }}>Track this report</div>
            <div style={{ fontSize: 12, color: 'var(--brand-muted)', marginTop: 2 }}>We'll give you a reference code to check status in this browser.</div>
          </div>
          <button
            type="button"
            onClick={() => setTrackReport(!trackReport)}
            style={{
              width: 44, height: 24, borderRadius: 12,
              background: trackReport ? 'var(--brand-ink)' : 'var(--brand-divider)',
              position: 'relative', transition: 'background 0.2s', flexShrink: 0,
              border: 'none', cursor: 'pointer'
            }}>
            <div style={{
              position: 'absolute', top: 2, left: trackReport ? 22 : 2,
              width: 20, height: 20, borderRadius: '50%', background: 'white',
              transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(40,35,20,0.2)',
            }} />
          </button>
        </div>
      </div>

      {/* Submit */}
      <button
        type="button"
        onClick={onSubmit}
        disabled={!selectedType || !pinLocation || submitting}
        style={{
          width: '100%', padding: '14px 24px', borderRadius: 9,
          background: (!selectedType || !pinLocation || submitting) ? 'var(--brand-muted)' : 'var(--status-red)',
          color: 'white', fontWeight: 600, fontSize: 15, border: 'none',
          cursor: (!selectedType || !pinLocation || submitting) ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          transition: 'background 0.2s, transform 0.1s',
          transform: 'scale(1)',
          letterSpacing: '0.005em',
        }}
        onMouseEnter={e => { if (selectedType && !submitting) e.currentTarget.style.background = '#B23B33'; }}
        onMouseLeave={e => { if (selectedType && !submitting) e.currentTarget.style.background = 'var(--status-red)'; }}
        onMouseDown={e => { if (selectedType && !submitting) e.currentTarget.style.transform = 'scale(0.98)'; }}
        onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        {submitting ? (
          <><Spinner /> Submitting report…</>
        ) : (
          <>Submit Report</>
        )}
      </button>

      {!selectedType && (
        <div style={{ fontSize: 12, color: 'var(--brand-muted)', textAlign: 'center', marginTop: 8 }}>
          Select an incident type above to continue
        </div>
      )}

      <div style={{ fontSize: 11, color: 'var(--brand-muted)', textAlign: 'center', marginTop: 10 }}>
        By submitting you confirm this is a genuine incident. False reports are an offense.
      </div>
    </div>
  );
}
