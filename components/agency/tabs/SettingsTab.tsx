import React from 'react';
import { toast } from 'sonner';
import { Icon } from '@/components/irms-shared';
import { FormInput } from '@/components/irms-auth';
import { updateAgencyProfile } from '@/lib/agency-api';
import { useAgencyProfile } from '../context';
import type { AgencyUser } from '@/lib/auth-api';
import { useIsMobile } from '@/hooks/use-media-query';
import { DashTopBar } from '../DashTopBar';

const AGENCY_TYPE_LABELS: Record<string, string> = {
  police: 'Police Service',
  hospital: 'Hospital / Medical',
  fire_rescue: 'Fire & Rescue',
  private_security: 'Private Security',
};

function getAgencyTypeKey(type?: string | null): string {
  if (!type) return '';
  return type.toLowerCase().trim().replace(/[\s-]/g, '_');
}

export function SettingsTab({ onProfileSaved }: { onProfileSaved: (p: AgencyUser) => void }) {
  const isMobile = useIsMobile();
  const profile = useAgencyProfile();
  const typeLabel = profile?.agencyType ? (AGENCY_TYPE_LABELS[getAgencyTypeKey(profile.agencyType)] || profile.agencyType) : '';

  const [isEditing, setIsEditing] = React.useState(false);
  const [agencyName, setAgencyName] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [radius, setRadius] = React.useState(25);
  const [lat, setLat] = React.useState<number | null>(null);
  const [lng, setLng] = React.useState<number | null>(null);
  const [locating, setLocating] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  // Populate fields once profile loads
  React.useEffect(() => {
    if (!profile) return;
    setAgencyName(profile.agencyName || '');
    setPhone(profile.phone || '');
    setRadius(profile.radius || 25);
    setLat(profile.lat ?? null);
    setLng(profile.lng ?? null);
  }, [profile]);

  const handleCancelEdit = () => {
    // Reset to saved values
    if (profile) {
      setAgencyName(profile.agencyName || '');
      setPhone(profile.phone || '');
      setRadius(profile.radius || 25);
      setLat(profile.lat ?? null);
      setLng(profile.lng ?? null);
    }
    setIsEditing(false);
  };

  const detectLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported by your browser.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(parseFloat(pos.coords.latitude.toFixed(6)));
        setLng(parseFloat(pos.coords.longitude.toFixed(6)));
        setLocating(false);
        toast.success('Location detected.');
      },
      () => {
        setLocating(false);
        toast.error('Could not detect location. Please try again.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload: Record<string, any> = {};
      if (agencyName.trim() && agencyName !== profile?.agencyName) payload.agency_name = agencyName.trim();
      if (phone.trim() && phone !== profile?.phone) payload.phone_number = phone.trim();
      if (radius !== profile?.radius) payload.service_radius = radius;
      if (lat !== null && lng !== null && (lat !== profile?.lat || lng !== profile?.lng)) {
        payload.latitude = lat;
        payload.longitude = lng;
      }
      if (Object.keys(payload).length === 0) { toast('No changes to save.'); setSaving(false); setIsEditing(false); return; }
      const updated = await updateAgencyProfile(payload);
      onProfileSaved(updated);
      toast.success('Profile updated successfully.');
      setIsEditing(false);
    } catch (err: any) {
      toast.error(err?.message || 'Could not save profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <DashTopBar title="Settings" subtitle="Your agency profile" />
      <div style={{ padding: isMobile ? 16 : 32, maxWidth: 720 }}>
        <div style={{ background: 'var(--brand-white)', border: '1px solid var(--brand-hairline)', borderRadius: 12, padding: isMobile ? 20 : 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 4px' }}>Agency profile</h3>
              <p style={{ fontSize: 13, color: 'var(--brand-muted)', margin: 0 }}>
                {isEditing ? 'Make your changes below, then save.' : 'Your agency details, service radius and base location.'}
              </p>
            </div>
            {!isEditing && (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                style={{ fontSize: 13, fontWeight: 600, color: 'var(--brand-ink)', background: 'var(--brand-cream)', border: '1px solid var(--brand-divider)', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', flexShrink: 0 }}
              >
                Edit profile
              </button>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <FormInput label="Agency name" value={agencyName} onChange={e => setAgencyName(e.target.value)} disabled={!isEditing} />
            <FormInput label="Agency type" value={typeLabel} onChange={() => {}} disabled />
            <FormInput label="Email" value={profile?.email || ''} onChange={() => {}} disabled />
            <FormInput label="Phone" value={phone} onChange={e => setPhone(e.target.value)} disabled={!isEditing} />
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <label style={{ fontSize: 13, fontWeight: 600 }}>Service coverage radius</label>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600, color: 'var(--status-red)' }}>{radius} km</span>
              </div>
              <input
                type="range" min="1" max="500" value={radius}
                onChange={e => setRadius(Number(e.target.value))}
                disabled={!isEditing}
                style={{ width: '100%', accentColor: 'var(--status-red)', opacity: isEditing ? 1 : 0.5, cursor: isEditing ? 'pointer' : 'not-allowed' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 8 }}>Base location</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--brand-muted)' }}>
                  {lat !== null && lng !== null ? `${lat.toFixed(5)}° N · ${lng.toFixed(5)}° E` : 'Not set'}
                </span>
                {isEditing && (
                  <button
                    type="button"
                    onClick={detectLocation}
                    disabled={locating}
                    style={{ fontSize: 12, fontWeight: 600, color: 'var(--brand-ink)', background: 'var(--brand-divider)', border: 'none', borderRadius: 6, padding: '6px 12px', cursor: locating ? 'not-allowed' : 'pointer', opacity: locating ? 0.6 : 1 }}
                  >
                    {locating ? 'Detecting…' : 'Detect current location'}
                  </button>
                )}
              </div>
            </div>
            {isEditing && (
              <div style={{ display: 'flex', gap: 10, paddingTop: 8 }}>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  style={{ background: 'var(--brand-ink)', color: 'var(--brand-cream)', border: 'none', borderRadius: 8, padding: '12px 24px', fontSize: 14, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}
                >
                  {saving ? 'Saving…' : 'Save changes'}
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={saving}
                  style={{ background: 'none', color: 'var(--brand-muted)', border: '1px solid var(--brand-divider)', borderRadius: 8, padding: '12px 20px', fontSize: 14, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer' }}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
