'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import ProposalDocument from '@/components/ProposalDocument';
import type { Proposal } from '@/lib/types';

export default function PublicProposalPage() {
  const params = useParams();
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/proposals/${params.id}`);
        if (res.ok) {
          const data = await res.json();
          setProposal(data);
          // Mark as viewed
          if (data.status === 'sent') {
            fetch(`/api/proposals/${params.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status: 'viewed' }),
            });
          }
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
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <p className="text-text-sec font-mono text-sm">Loading proposal...</p>
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <p className="text-text-sec font-mono text-sm">Proposal not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg py-8 px-4">
      <ProposalDocument
        proposal={proposal}
        showActions
        onSign={signing ? undefined : handleSign}
      />
    </div>
  );
}
