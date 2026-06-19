import React from 'react';
import { toast } from 'sonner';
import { Icon, INCIDENT_TYPES } from '@/components/irms-shared';
import { useIsMobile, useIsTablet } from '@/hooks/use-media-query';
import { checkAgencyCoverage } from '@/lib/incidents-api';
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

function Spinner() {

  return (

    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 0.75s linear infinite' }}>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="40 20" strokeLinecap="round" />

    </svg>

  );

}

export function ReportForm({ pinLocation, selectedType, setSelectedType, description, setDescription, attachments, setAttachments, trackReport, setTrackReport, onClose, onSubmit, submitting, selectedPlace, manualLocation, resolvedLocation }: any) {

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

  // Get the location name to display
  const getDisplayLocationName = () => {
    if (manualLocation?.trim()) return manualLocation.trim();
    if (selectedPlace?.name) return selectedPlace.name;
    if (selectedPlace?.display_name) {
      const parts = selectedPlace.display_name.split(',');
      return parts[0].trim();
    }
    if (resolvedLocation) {
      const parts = resolvedLocation.split(',');
      return parts[0].trim();
    }
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

    if (invalid.length) {

      toast.error('Some files exceed the 20 MB limit and were skipped.');

    }

    const valid = files.filter(f => f.size <= 20 * 1024 * 1024);

    setAttachments((prev: File[]) => [...prev, ...valid].slice(0, MAX_FILES));

    // Reset file input

    if (fileInputRef.current) fileInputRef.current.value = '';

  };



  const removeAttachment = (idx: number) => {

    setAttachments((prev: File[]) => prev.filter((_: File, i: number) => i !== idx));

  };



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

                onMouseEnter={e => {

                  if (!selected) {

                    e.currentTarget.style.background = 'var(--brand-white)';

                    e.currentTarget.style.borderColor = 'var(--brand-muted)';

                    e.currentTarget.style.transform = 'scale(1.02)';

                  }

                }}

                onMouseLeave={e => {

                  if (!selected) {

                    e.currentTarget.style.background = 'var(--brand-cream)';

                    e.currentTarget.style.borderColor = 'var(--brand-divider)';

                    e.currentTarget.style.transform = 'scale(1)';

                  }

                }}

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



      {/* Agency coverage notice — shown directly below incident type selector */}

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

              : 'No registered responders are currently active in your area. Your report will still be recorded and reviewed.'

            }

          </span>

        </div>

      )}



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

        {/* Progress bar */}

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

              onMouseEnter={e => {

                e.currentTarget.style.borderColor = 'var(--brand-ink)';

                e.currentTarget.style.color = 'var(--brand-ink)';

                e.currentTarget.style.background = 'var(--brand-cream)';

              }}

              onMouseLeave={e => {

                e.currentTarget.style.borderColor = 'var(--brand-muted)';

                e.currentTarget.style.color = 'var(--brand-muted)';

                e.currentTarget.style.background = 'transparent';

              }}

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

          <>

            <Spinner />

            Submitting report…

          </>

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
