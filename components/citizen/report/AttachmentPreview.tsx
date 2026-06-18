import React from 'react';
import { Icon } from '@/components/irms-shared';

export function AttachmentPreview({ file, onRemove }: { file: File; onRemove: () => void }) {

  const [preview, setPreview] = React.useState<string | null>(null);

  const isImage = file.type.startsWith('image/');

  const isVideo = file.type.startsWith('video/');



  React.useEffect(() => {

    if (isImage) {

      const reader = new FileReader();

      reader.onload = e => setPreview(e.target?.result as string);

      reader.readAsDataURL(file);

    }

    return () => setPreview(null);

  }, [file]);



  const formatSize = (bytes: number) => {

    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

  };



  return (

    <div style={{

      width: 80, height: 80, borderRadius: 10, position: 'relative',

      border: '1px solid var(--brand-divider)', overflow: 'hidden',

      background: 'var(--brand-cream)',

      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',

    }}>

      {isImage && preview ? (

        <img

          src={preview}

          alt={file.name}

          style={{ width: '100%', height: '100%', objectFit: 'cover' }}

        />

      ) : isVideo ? (

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: 4 }}>

          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--brand-muted)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">

            <path d="M15 10l4.553-2.276A1 1 0 0 1 21 8.723v6.554a1 1 0 0 1-1.447.894L15 14M3 8a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8z" />

          </svg>

          <span style={{ fontSize: 9, color: 'var(--brand-muted)', fontWeight: 600, textAlign: 'center', lineHeight: 1.2 }}>{formatSize(file.size)}</span>

        </div>

      ) : (

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: 4 }}>

          <Icon.upload style={{ width: 20, height: 20, color: 'var(--brand-muted)' }} />

          <span style={{ fontSize: 9, color: 'var(--brand-muted)', fontWeight: 600, textAlign: 'center', lineHeight: 1.2 }}>{formatSize(file.size)}</span>

        </div>

      )}

      {/* Remove button */}

      <button

        type="button"

        onClick={onRemove}

        style={{

          position: 'absolute', top: 4, right: 4, width: 20, height: 20, borderRadius: '50%',

          background: 'rgba(20, 18, 14, 0.8)', color: 'white',

          display: 'flex', alignItems: 'center', justifyContent: 'center',

          border: 'none', cursor: 'pointer', padding: 0,

        }}

      >

        <Icon.close style={{ width: 12, height: 12 }} />

      </button>

      {/* File name tooltip on hover */}

      <div style={{

        position: 'absolute', bottom: 0, left: 0, right: 0,

        background: 'rgba(20, 18, 14, 0.75)', backdropFilter: 'blur(4px)',

        padding: '3px 5px', fontSize: 9, color: 'white', fontWeight: 500,

        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',

      }}>

        {file.name.length > 10 ? file.name.slice(0, 8) + '…' : file.name}

      </div>

    </div>

  );

}
