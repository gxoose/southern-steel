'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const JOB_TYPES = [
  'Fence/Railing', 'Gate', 'Structural', 'Ornamental',
  'Pipe', 'Repair', 'Fabrication', 'Powder Coat',
];

export default function NewProposalPage() {
  const router = useRouter();
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [jobType, setJobType] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;
    const newFiles = Array.from(files);
    setPhotoFiles((prev) => [...prev, ...newFiles]);
    // Create preview URLs
    newFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setPhotos((prev) => [...prev, ev.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  }

  async function handleGenerate() {
    if (!clientName.trim()) {
      setError('Client name is required');
      return;
    }
    if (!notes.trim()) {
      setError('Site visit notes are required');
      return;
    }

    setError('');
    setGenerating(true);
    setProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress((p) => Math.min(p + Math.random() * 15, 90));
    }, 500);

    try {
      const res = await fetch('/api/generate-proposal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_name: clientName,
          client_phone: clientPhone,
          client_email: clientEmail,
          notes,
          job_type: jobType,
          photos,
        }),
      });

      clearInterval(progressInterval);

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to generate proposal');
      }

      setProgress(100);
      const proposal = await res.json();

      setTimeout(() => {
        router.push(`/dashboard/proposals/${proposal.id}`);
      }, 500);
    } catch (err) {
      clearInterval(progressInterval);
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setGenerating(false);
      setProgress(0);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="font-display text-2xl text-text mb-6">New Proposal</h1>

      {/* Generating State */}
      {generating && (
        <div className="forge-card p-8 text-center mb-6">
          <div className="text-4xl mb-4">🔥</div>
          <h2 className="font-display text-xl text-ember mb-2">Forging your proposal...</h2>
          <p className="text-sm text-text-sec mb-4">
            AI is analyzing your notes and generating line items with market-rate pricing
          </p>
          <div className="w-full h-3 bg-surface3 rounded-full overflow-hidden mb-2">
            <div
              className="h-full progress-bar rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs font-mono text-text-dim">{Math.round(progress)}%</p>
        </div>
      )}

      {!generating && (
        <div className="space-y-6">
          {error && (
            <div className="bg-red-hot/10 border border-red-hot/30 rounded-lg p-3 text-sm text-red-hot">
              {error}
            </div>
          )}

          {/* Client Info */}
          <div className="forge-card p-6 space-y-4">
            <h2 className="font-display text-lg text-text">Client Info</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-text-sec mb-1">Client Name *</label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full bg-surface2 border border-border rounded-md px-3 py-2 text-text text-sm focus:outline-none focus:border-rust"
                  placeholder="John Smith"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-text-sec mb-1">Phone</label>
                <input
                  type="tel"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  className="w-full bg-surface2 border border-border rounded-md px-3 py-2 text-text text-sm focus:outline-none focus:border-rust"
                  placeholder="(210) 555-0123"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-mono text-text-sec mb-1">Email</label>
              <input
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                className="w-full bg-surface2 border border-border rounded-md px-3 py-2 text-text text-sm focus:outline-none focus:border-rust"
                placeholder="john@example.com"
              />
            </div>
          </div>

          {/* Job Type */}
          <div className="forge-card p-6">
            <h2 className="font-display text-lg text-text mb-3">Job Type</h2>
            <div className="flex flex-wrap gap-2">
              {JOB_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => setJobType(type)}
                  className={`px-3 py-1.5 rounded-md text-sm font-mono transition-colors ${
                    jobType === type
                      ? 'bg-rust text-white'
                      : 'bg-surface2 text-text-sec border border-border hover:border-border-light'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Site Notes */}
          <div className="forge-card p-6">
            <h2 className="font-display text-lg text-text mb-3">Site Visit Notes</h2>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={5}
              className="w-full bg-surface2 border border-border rounded-md px-3 py-2 text-text text-sm focus:outline-none focus:border-rust resize-none"
              placeholder="Describe it like you're telling your crew..."
            />
          </div>

          {/* Photo Upload */}
          <div className="forge-card p-6">
            <h2 className="font-display text-lg text-text mb-3">Photos</h2>
            <label className="block border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-border-light transition-colors">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoUpload}
                className="hidden"
              />
              <div className="text-text-dim">
                <p className="text-sm mb-1">Drop photos here or click to upload</p>
                <p className="text-xs font-mono">JPG, PNG up to 10MB each</p>
              </div>
            </label>
            {photos.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-4">
                {photos.map((photo, i) => (
                  <div key={i} className="aspect-square rounded-md overflow-hidden bg-surface3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photo} alt={`Upload ${i + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            className="btn-rust w-full py-3 text-lg font-display"
          >
            Generate Proposal
          </button>
        </div>
      )}
    </div>
  );
}
