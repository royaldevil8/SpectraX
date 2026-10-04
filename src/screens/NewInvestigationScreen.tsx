import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Panel } from '@/components/ui/Panel';
import { Stepper } from '@/components/ui/Stepper';
import { PIPELINE_STEPS } from '@/data';
import type { InvestigationType, Screen } from '@/types';
import {
  Upload,
  FileVideo,
  Shield,
  Fingerprint,
  Lock,
  Check,
  ChevronLeft,
  Film,
} from 'lucide-react';

const FILE_TYPES = ['MP4', 'MOV', 'AVI', 'WEBM', 'MP3', 'WAV', 'JPG', 'PNG'];
const INVESTIGATION_TYPES: InvestigationType[] = [
  'Fraud',
  'Security Incident',
  'Media Verification',
  'Forensic Review',
  'Trust & Safety',
];

export function NewInvestigationScreen({
  onNavigate,
  onStart,
}: {
  onNavigate: (s: Screen) => void;
  onStart: () => void;
}) {
  const [title, setTitle] = useState('Executive Communication Verification');
  const [description, setDescription] = useState(
    'Potentially manipulated executive video received by internal security team.'
  );
  const [selectedType, setSelectedType] = useState<InvestigationType>('Media Verification');
  const [uploaded, setUploaded] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleStart = () => {
    onStart();
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in max-w-5xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => onNavigate('dashboard')} className="text-text-secondary hover:text-text-primary transition-colors">
          <ChevronLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">New Investigation</h1>
          <p className="text-sm text-text-secondary mt-1">Upload media and define case parameters for forensic analysis.</p>
        </div>
      </div>

      {/* Stepper */}
      <Panel className="p-5">
        <Stepper steps={PIPELINE_STEPS} current={0} />
      </Panel>

      {/* Upload zone */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-text-secondary mb-3">Media Upload</h3>
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); setUploaded(true); }}
          onClick={() => setUploaded(true)}
          className={`relative border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all overflow-hidden ${
            dragOver ? 'border-accent-cyan bg-accent-cyan/5' : uploaded ? 'border-success/40 bg-success/5' : 'border-border hover:border-border-strong bg-bg-surface'
          }`}
        >
          {/* Scan line animation when uploading */}
          {uploaded && (
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-success to-transparent animate-scan" />
          )}

          <div className="relative z-10">
            {uploaded ? (
              <>
                <div className="w-14 h-14 rounded-lg bg-success/10 border border-success/30 flex items-center justify-center mx-auto mb-4">
                  <FileVideo size={24} className="text-success" />
                </div>
                <div className="text-sm font-medium text-text-primary mb-1">executive_message.mp4</div>
                <div className="text-2xs text-text-muted font-mono mb-3">
                  42.3 MB · 00:42.3 · 1920 × 1080 · H.264
                </div>
                <div className="inline-flex items-center gap-1.5 text-2xs text-success">
                  <Check size={12} /> SHA-256 fingerprinted · Ready for analysis
                </div>
              </>
            ) : (
              <>
                <div className="w-14 h-14 rounded-lg bg-bg-elevated border border-border flex items-center justify-center mx-auto mb-4">
                  <Upload size={24} className="text-accent-cyan" />
                </div>
                <div className="text-sm font-medium text-text-primary mb-1">Upload media for forensic analysis</div>
                <div className="text-xs text-text-secondary mb-4">Drag and drop or click to browse</div>
                <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
                  {FILE_TYPES.map((ft) => (
                    <span key={ft} className="px-2 py-0.5 bg-bg-elevated border border-border rounded text-2xs font-mono text-text-secondary">
                      {ft}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Upload security details */}
        <div className="grid grid-cols-3 gap-3 mt-3">
          <div className="flex items-center gap-2 text-2xs text-text-muted">
            <Lock size={12} className="text-accent-cyan" />
            <span>Maximum file size: 2 GB</span>
          </div>
          <div className="flex items-center gap-2 text-2xs text-text-muted">
            <Shield size={12} className="text-accent-cyan" />
            <span>Secure local processing</span>
          </div>
          <div className="flex items-center gap-2 text-2xs text-text-muted">
            <Fingerprint size={12} className="text-accent-cyan" />
            <span>SHA-256 integrity fingerprinting</span>
          </div>
        </div>
      </div>

      {/* Case Information */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-text-secondary mb-3">Case Information</h3>
        <Panel className="p-5 space-y-5">
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-2xs uppercase tracking-wider text-text-secondary font-medium mb-1.5">
                Case Title
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full h-10 bg-bg-base border border-border rounded-md px-3 text-sm text-text-primary focus:outline-none focus:border-accent-cyan/40 transition-colors"
              />
            </div>
            <div>
              <label className="block text-2xs uppercase tracking-wider text-text-secondary font-medium mb-1.5">
                Investigation Type
              </label>
              <div className="flex flex-wrap gap-2">
                {INVESTIGATION_TYPES.map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={`px-3 h-8 rounded-md text-xs font-medium border transition-all ${
                      selectedType === type
                        ? 'bg-accent-cyan/15 border-accent-cyan/40 text-accent-cyan'
                        : 'bg-bg-base border-border text-text-secondary hover:border-border-strong hover:text-text-primary'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-2xs uppercase tracking-wider text-text-secondary font-medium mb-1.5">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full bg-bg-base border border-border rounded-md px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-cyan/40 transition-colors resize-none"
            />
          </div>

          {/* Preview info bar */}
          <div className="flex items-center gap-3 px-4 py-3 bg-bg-base border border-border rounded-md">
            <Film size={16} className="text-accent-cyan" />
            <div className="flex-1 flex items-center gap-6 text-xs">
              <div>
                <span className="text-text-muted">Filename: </span>
                <span className="font-mono text-text-primary">executive_message.mp4</span>
              </div>
              <div>
                <span className="text-text-muted">Type: </span>
                <span className="text-text-primary">{selectedType}</span>
              </div>
              <div>
                <span className="text-text-muted">Integrity: </span>
                <span className="font-mono text-success">SHA-256 ✓</span>
              </div>
            </div>
          </div>
        </Panel>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pb-6">
        <Button variant="ghost" onClick={() => onNavigate('dashboard')}>Cancel</Button>
        <Button variant="secondary">Save as Draft</Button>
        <Button onClick={handleStart} icon={<Film size={16} />} disabled={!uploaded}>
          {uploaded ? 'Start Investigation' : 'Upload media to continue'}
        </Button>
      </div>
    </div>
  );
}
