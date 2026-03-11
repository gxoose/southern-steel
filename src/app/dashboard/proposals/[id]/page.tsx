'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import ProposalDocument from '@/components/ProposalDocument';
import type { Proposal, LineItem } from '@/lib/types';

export default function ProposalViewPage() {
  const params = useParams();
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [repricing, setRepricing] = useState(false);
  const [repriceError, setRepriceError] = useState('');
  const [repricedIndices, setRepricedIndices] = useState<Set<number>>(new Set());

  // Editable state — only used in draft mode
  const [editItems, setEditItems] = useState<LineItem[]>([]);
  const [editScope, setEditScope] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [dirty, setDirty] = useState(false);

  const isDraft = proposal?.status === 'draft';

  const loadProposal = useCallback(async () => {
    try {
      const res = await fetch(`/api/proposals/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setProposal(data);
        setEditItems(data.line_items.map((li: LineItem) => ({ ...li })));
        setEditScope(data.scope_of_work || '');
        setDirty(false);
      }
    } catch (e) {
      console.error('Failed to load proposal', e);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => { loadProposal(); }, [loadProposal]);

  // Recalculate totals
  const subtotal = editItems.reduce((sum, item) => sum + item.total, 0);
  const taxRate = proposal?.tax_rate ?? 0.0825;
  const tax = Math.round(subtotal * taxRate * 100) / 100;
  const total = Math.round((subtotal + tax) * 100) / 100;

  function updateItem(index: number, field: keyof LineItem, raw: string) {
    setEditItems(prev => {
      const next = prev.map((item, i) => {
        if (i !== index) return item;
        const updated = { ...item };
        if (field === 'desc') {
          updated.desc = raw;
        } else {
          const num = parseFloat(raw) || 0;
          if (field === 'qty') { updated.qty = num; updated.total = Math.round(num * updated.rate * 100) / 100; }
          if (field === 'rate') { updated.rate = num; updated.total = Math.round(updated.qty * num * 100) / 100; }
          if (field === 'total') { updated.total = num; }
        }
        return updated;
      });
      return next;
    });
    setDirty(true);
  }

  function addItem() {
    setEditItems(prev => [...prev, { desc: '', qty: 1, rate: 0, total: 0 }]);
    setEditingIndex(editItems.length);
    setDirty(true);
  }

  function deleteItem(index: number) {
    setEditItems(prev => prev.filter((_, i) => i !== index));
    setEditingIndex(null);
    setDirty(true);
  }

  async function handleSave() {
    if (!proposal || !dirty) return;
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch(`/api/proposals/${proposal.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          line_items: editItems,
          scope_of_work: editScope,
          subtotal,
          tax,
          total,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setProposal(updated);
        setDirty(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch (e) {
      console.error('Failed to save', e);
    } finally {
      setSaving(false);
    }
  }

  async function handleSend() {
    if (!proposal) return;
    // Save any pending edits first
    if (dirty) await handleSave();
    const res = await fetch(`/api/proposals/${proposal.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'sent' }),
    });
    if (res.ok) setProposal(await res.json());
  }

  async function handleReprice() {
    if (!proposal || editItems.length === 0) return;
    setRepricing(true);
    setRepriceError('');
    setRepricedIndices(new Set());
    try {
      const res = await fetch('/api/reprice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scope: editScope,
          items: editItems.map(({ desc, qty, rate }) => ({ desc, qty, rate })),
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'AI repricing failed');
      }
      const data = await res.json();
      const aiItems: LineItem[] = data.items || [];

      // Merge AI suggestions: match by index, keep original desc, update qty/rate/total
      setEditItems(prev => {
        const updated = prev.map((item, i) => {
          if (i < aiItems.length) {
            return {
              desc: item.desc, // keep owner's description
              qty: aiItems[i].qty,
              rate: aiItems[i].rate,
              total: Math.round(aiItems[i].qty * aiItems[i].rate * 100) / 100,
            };
          }
          return item;
        });
        return updated;
      });
      // Mark which rows were updated
      const indices = new Set<number>();
      for (let i = 0; i < Math.min(editItems.length, aiItems.length); i++) {
        indices.add(i);
      }
      setRepricedIndices(indices);
      setDirty(true);
      // Clear highlights after a few seconds
      setTimeout(() => setRepricedIndices(new Set()), 4000);
    } catch (err) {
      setRepriceError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setRepricing(false);
    }
  }

  async function handleSign() {
    if (!proposal) return;
    setSigning(true);
    try {
      const res = await fetch(`/api/proposals/${proposal.id}/sign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signed_by: proposal.client_name }),
      });
      if (res.ok) setProposal(await res.json());
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

  // Non-draft: use the read-only ProposalDocument
  if (!isDraft) {
    return (
      <div className="py-4">
        {proposal.status === 'sent' && (
          <div className="max-w-3xl mx-auto mb-4">
            <div className="forge-card p-3 flex items-center justify-between">
              <span className="text-sm text-text-sec">Share link with client:</span>
              <code className="text-xs font-mono text-ember">
                {typeof window !== 'undefined' ? window.location.origin : ''}/p/{proposal.id}
              </code>
            </div>
          </div>
        )}
        <ProposalDocument proposal={proposal} showActions onSign={signing ? undefined : handleSign} />
      </div>
    );
  }

  // Draft mode: editable view
  return (
    <div className="py-4">
      {/* Action bar */}
      <div className="max-w-3xl mx-auto mb-4 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono px-2 py-1 rounded bg-yellow-warm/10 border border-yellow-warm/30 text-yellow-warm">
            DRAFT
          </span>
          {saved && (
            <span className="text-xs font-mono text-green-forge animate-pulse">Saved</span>
          )}
          {repriceError && (
            <span className="text-xs font-mono text-red-hot">{repriceError}</span>
          )}
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={handleReprice}
            disabled={repricing || editItems.length === 0}
            className="text-sm px-4 py-2 rounded-md font-mono bg-ember/15 border border-ember/30 text-ember hover:bg-ember/25 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {repricing ? 'AI Repricing...' : 'Re-run AI Pricing'}
          </button>
          <button
            onClick={handleSave}
            disabled={!dirty || saving}
            className={`text-sm px-4 py-2 rounded-md font-mono transition-all ${
              dirty
                ? 'bg-green-forge/15 border border-green-forge/40 text-green-forge hover:bg-green-forge/25'
                : 'bg-surface2 border border-border text-text-dim cursor-not-allowed'
            }`}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button onClick={handleSend} className="btn-rust text-sm">
            Send to Customer
          </button>
        </div>
      </div>

      {/* Repricing progress bar */}
      {repricing && (
        <div className="max-w-3xl mx-auto mb-4">
          <div className="forge-card p-4 flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-ember border-t-transparent rounded-full animate-spin flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-text">AI is analyzing current market rates...</p>
              <p className="text-xs text-text-dim font-mono mt-0.5">Quantities and rates will update. You can still edit after.</p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="bg-surface2 border border-border rounded-t-lg p-6 sm:p-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="font-display text-2xl sm:text-3xl">
                <span className="text-text">Southern</span>{' '}
                <span className="text-rust">Steel</span>
              </h1>
              <p className="text-sm text-text-sec mt-1">Welding & Fabrication</p>
              <p className="text-xs font-mono text-text-dim mt-1">San Antonio, TX</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-mono text-text-dim">PROPOSAL</p>
              <p className="text-sm font-mono text-text mt-1">{proposal.proposal_number}</p>
              <p className="text-xs font-mono text-text-dim mt-1">
                {new Date(proposal.created_at).toLocaleDateString()}
              </p>
              {proposal.ai_generated && (
                <span className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded text-xs font-mono bg-surface3 text-ember border border-border">
                  AI Generated
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Client Info */}
        <div className="bg-surface border-x border-border p-6 sm:p-8">
          <p className="text-xs font-mono text-text-dim uppercase tracking-wider mb-2">Prepared For</p>
          <p className="text-lg font-display text-text">{proposal.client_name}</p>
          {proposal.client_company && <p className="text-sm text-text-sec">{proposal.client_company}</p>}
          {proposal.client_email && <p className="text-sm text-text-dim font-mono">{proposal.client_email}</p>}
        </div>

        {/* Editable Scope of Work */}
        <div className="bg-surface border-x border-t border-border p-6 sm:p-8">
          <h2 className="font-display text-lg text-text mb-3">Scope of Work</h2>
          <textarea
            value={editScope}
            onChange={(e) => { setEditScope(e.target.value); setDirty(true); }}
            rows={4}
            className="w-full bg-surface2 border border-border rounded-md px-3 py-2 text-sm text-text-sec leading-relaxed focus:outline-none focus:border-rust resize-y"
          />
        </div>

        {/* Editable Line Items */}
        <div className="bg-surface border-x border-t border-border p-6 sm:p-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg text-text">Line Items</h2>
            <button
              onClick={addItem}
              className="text-xs font-mono px-3 py-1.5 rounded-md bg-rust/15 border border-rust/30 text-rust hover:bg-rust/25 transition-colors"
            >
              + Add Item
            </button>
          </div>

          {/* Table header */}
          <div className="hidden sm:grid grid-cols-[1fr_70px_90px_100px_36px] gap-2 text-xs font-mono text-text-dim uppercase tracking-wider pb-2 border-b border-border mb-1">
            <span>Description</span>
            <span className="text-right">Qty</span>
            <span className="text-right">Rate</span>
            <span className="text-right">Amount</span>
            <span />
          </div>

          {editItems.map((item, i) => {
            const isEditing = editingIndex === i;
            const wasRepriced = repricedIndices.has(i);
            return (
              <div
                key={i}
                onClick={() => setEditingIndex(i)}
                className={`grid grid-cols-1 sm:grid-cols-[1fr_70px_90px_100px_36px] gap-2 py-2 border-b border-border/50 items-center cursor-pointer transition-all ${
                  isEditing
                    ? 'bg-surface2/50 -mx-2 px-2 rounded-md'
                    : wasRepriced
                    ? 'bg-ember/5 -mx-2 px-2 rounded-md border-l-2 border-l-ember'
                    : 'hover:bg-surface2/30'
                }`}
              >
                {isEditing ? (
                  <>
                    <input
                      type="text"
                      value={item.desc}
                      onChange={(e) => updateItem(i, 'desc', e.target.value)}
                      className="bg-surface2 border border-border rounded px-2 py-1.5 text-sm text-text focus:outline-none focus:border-rust"
                      placeholder="Description"
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                    />
                    <input
                      type="number"
                      value={item.qty}
                      onChange={(e) => updateItem(i, 'qty', e.target.value)}
                      className="bg-surface2 border border-border rounded px-2 py-1.5 text-sm text-text text-right font-mono focus:outline-none focus:border-rust"
                      min={0}
                      step={1}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <input
                      type="number"
                      value={item.rate}
                      onChange={(e) => updateItem(i, 'rate', e.target.value)}
                      className="bg-surface2 border border-border rounded px-2 py-1.5 text-sm text-text text-right font-mono focus:outline-none focus:border-rust"
                      min={0}
                      step={0.01}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="text-right font-mono text-sm text-text py-1.5">
                      ${item.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteItem(i); }}
                      className="w-7 h-7 rounded flex items-center justify-center text-text-dim hover:text-red-hot hover:bg-red-hot/10 transition-colors mx-auto"
                      title="Delete item"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </>
                ) : (
                  <>
                    <span className="text-sm text-text-sec">{item.desc || <em className="text-text-dim">No description</em>}</span>
                    <span className="text-right font-mono text-sm text-text-dim hidden sm:block">{item.qty}</span>
                    <span className="text-right font-mono text-sm text-text-dim hidden sm:block">${item.rate.toLocaleString()}</span>
                    <span className="text-right font-mono text-sm text-text hidden sm:block">
                      ${item.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span className="hidden sm:block" />
                  </>
                )}
              </div>
            );
          })}

          {editItems.length === 0 && (
            <div className="py-8 text-center text-text-dim text-sm">
              No line items. Click &quot;+ Add Item&quot; to get started.
            </div>
          )}

          {/* Totals */}
          <div className="mt-6 border-t border-border pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-mono text-text-dim">Subtotal</span>
              <span className="font-mono text-text">
                ${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="font-mono text-text-dim">Tax ({(taxRate * 100).toFixed(2)}%)</span>
              <span className="font-mono text-text">
                ${tax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between text-lg pt-2 border-t border-border">
              <span className="font-display text-text">Total</span>
              <span className="font-display molten-glow text-xl">
                ${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* Terms */}
        <div className="bg-surface border-x border-t border-border p-6 sm:p-8">
          <h2 className="font-display text-lg text-text mb-3">Terms & Conditions</h2>
          <p className="text-sm text-text-sec leading-relaxed">{proposal.terms}</p>
        </div>

        {/* Bottom bar */}
        <div className="bg-surface2 border border-border rounded-b-lg p-6 sm:p-8 flex items-center justify-between flex-wrap gap-3">
          <p className="text-xs font-mono text-text-dim">Click any line item to edit</p>
          <div className="flex gap-2">
            <button
              onClick={handleReprice}
              disabled={repricing || editItems.length === 0}
              className="text-sm px-4 py-2 rounded-md font-mono bg-ember/15 border border-ember/30 text-ember hover:bg-ember/25 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {repricing ? 'Repricing...' : 'Re-run AI Pricing'}
            </button>
            <button
              onClick={handleSave}
              disabled={!dirty || saving}
              className={`text-sm px-4 py-2 rounded-md font-mono transition-all ${
                dirty
                  ? 'bg-green-forge/15 border border-green-forge/40 text-green-forge hover:bg-green-forge/25'
                  : 'bg-surface2 border border-border text-text-dim cursor-not-allowed'
              }`}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
