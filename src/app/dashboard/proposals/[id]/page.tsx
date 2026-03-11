'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import ProposalDocument from '@/components/ProposalDocument';
import type { Proposal } from '@/lib/types';

export default function ProposalViewPage() {
  const params = useParams();
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/proposals/${params.id}`);
        if (res.ok) {
          setProposal(await res.json());
        }
      } catch (e) {
        console.error('Failed to load proposal', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.id]);

  async function handleSign() {
    if (!proposal) return;
    setSigning(true);
    try {
      const res = await fetch(`/api/proposals/${proposal.id}/sign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signed_by: proposal.client_name }),
      });
      if (res.ok) {
        const updated = await res.json();
        setProposal(updated);
      }
    } catch (e) {
      console.error('Failed to sign', e);
    } finally {
      setSigning(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-text-sec font-mono text-sm">Loading proposal...</p>
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-text-sec font-mono text-sm">Proposal not found</p>
      </div>
    );
  }

  return (
    <div className="py-4">
      {/* Send to Client button */}
      {proposal.status === 'draft' && (
        <div className="max-w-3xl mx-auto mb-4 flex justify-end">
          <button
            onClick={async () => {
              await fetch(`/api/proposals/${proposal.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'sent' }),
              });
              setProposal({ ...proposal, status: 'sent' });
            }}
            className="btn-rust text-sm"
          >
            Send to Client
          </button>
        </div>
      )}

      {proposal.status === 'sent' && (
        <div className="max-w-3xl mx-auto mb-4">
          <div className="forge-card p-3 flex items-center justify-between">
            <span className="text-sm text-text-sec">
              Share link with client:
            </span>
            <code className="text-xs font-mono text-ember">
              {typeof window !== 'undefined' ? window.location.origin : ''}/p/{proposal.id}
            </code>
          </div>
        </div>
      )}

      <ProposalDocument
        proposal={proposal}
        showActions
        onSign={signing ? undefined : handleSign}
      />
    </div>
  );
}
