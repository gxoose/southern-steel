'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Lead } from '@/lib/types';

function TierBadge({ tier }: { tier: string }) {
  const colors: Record<string, string> = {
    URGENT: 'bg-rust/20 text-rust border-rust/30',
    WARM: 'bg-yellow-warm/20 text-yellow-warm border-yellow-warm/30',
    LOW: 'bg-text-dim/20 text-text-dim border-text-dim/30',
  };
  return (
    <span className={`text-xs font-mono px-2 py-0.5 rounded border ${colors[tier] || colors.LOW}`}>
      {tier}
    </span>
  );
}

export default function LeadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/leads/${params.id}`);
        if (res.ok) setLead(await res.json());
      } catch (e) {
        console.error('Failed to load lead', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.id]);

  async function updateStatus(status: string) {
    if (!lead) return;
    try {
      const res = await fetch(`/api/leads/${lead.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) setLead(await res.json());
    } catch (e) {
      console.error('Failed to update', e);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-text-sec font-mono text-sm">Loading lead...</p>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-text-sec font-mono text-sm">Lead not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl text-text">{lead.name}</h1>
          <div className="flex items-center gap-3 mt-2">
            <TierBadge tier={lead.tier} />
            <span className="text-xs font-mono text-text-dim">{lead.score} points</span>
            <span className="text-xs font-mono text-text-dim capitalize">{lead.status}</span>
          </div>
        </div>
      </div>

      {/* Lead Details */}
      <div className="forge-card p-6 mb-6">
        <h2 className="font-display text-lg text-text mb-4">Details</h2>
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          {lead.phone && (
            <div>
              <span className="text-xs font-mono text-text-dim block">Phone</span>
              <span className="text-text">{lead.phone}</span>
            </div>
          )}
          {lead.email && (
            <div>
              <span className="text-xs font-mono text-text-dim block">Email</span>
              <span className="text-text">{lead.email}</span>
            </div>
          )}
          {lead.type && (
            <div>
              <span className="text-xs font-mono text-text-dim block">Type</span>
              <span className="text-text">{lead.type}</span>
            </div>
          )}
          {lead.material && (
            <div>
              <span className="text-xs font-mono text-text-dim block">Material</span>
              <span className="text-text">{lead.material}</span>
            </div>
          )}
          {lead.setting && (
            <div>
              <span className="text-xs font-mono text-text-dim block">Setting</span>
              <span className="text-text">{lead.setting}</span>
            </div>
          )}
          {lead.timeline && (
            <div>
              <span className="text-xs font-mono text-text-dim block">Timeline</span>
              <span className="text-text">{lead.timeline}</span>
            </div>
          )}
          {lead.zip && (
            <div>
              <span className="text-xs font-mono text-text-dim block">Zip</span>
              <span className="text-text">{lead.zip}</span>
            </div>
          )}
          {lead.source && (
            <div>
              <span className="text-xs font-mono text-text-dim block">Source</span>
              <span className="text-text capitalize">{lead.source}</span>
            </div>
          )}
          {lead.estimated_value && (
            <div>
              <span className="text-xs font-mono text-text-dim block">Estimated Value</span>
              <span className="text-ember">${lead.estimated_value.toLocaleString()}</span>
            </div>
          )}
        </div>
      </div>

      {/* Scope */}
      {lead.scope && (
        <div className="forge-card p-6 mb-6">
          <h2 className="font-display text-lg text-text mb-3">Scope</h2>
          <p className="text-sm text-text-sec whitespace-pre-wrap">{lead.scope}</p>
        </div>
      )}

      {/* Photos */}
      {lead.photos && lead.photos.length > 0 && (
        <div className="forge-card p-6 mb-6">
          <h2 className="font-display text-lg text-text mb-3">Photos ({lead.photos.length})</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {lead.photos.map((photo, i) => (
              <div key={i} className="aspect-square rounded-md overflow-hidden bg-surface3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      {lead.notes && (
        <div className="forge-card p-6 mb-6">
          <h2 className="font-display text-lg text-text mb-3">Notes</h2>
          <p className="text-sm text-text-sec whitespace-pre-wrap">{lead.notes}</p>
        </div>
      )}

      {/* Timeline */}
      <div className="forge-card p-6 mb-6">
        <h2 className="font-display text-lg text-text mb-3">Timeline</h2>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-green-forge" />
            <span className="text-sm text-text-sec">
              Lead created via {lead.source} — {new Date(lead.created_at).toLocaleString()}
            </span>
          </div>
          {lead.status !== 'new' && (
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-ember" />
              <span className="text-sm text-text-sec capitalize">
                Status: {lead.status} — {new Date(lead.updated_at).toLocaleString()}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => updateStatus('site_visit')}
          className="btn-outline text-sm"
        >
          Schedule Site Visit
        </button>
        <Link
          href={`/dashboard/proposals/new?lead=${lead.id}&name=${encodeURIComponent(lead.name)}`}
          className="btn-rust text-sm"
        >
          Create Proposal
        </Link>
        <button
          onClick={() => {
            updateStatus('lost');
            router.push('/dashboard');
          }}
          className="btn-outline text-sm text-red-hot border-red-hot/30 hover:bg-red-hot/10"
        >
          Mark as Lost
        </button>
      </div>
    </div>
  );
}
