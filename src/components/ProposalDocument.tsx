'use client';

import type { Proposal } from '@/lib/types';

export default function ProposalDocument({
  proposal,
  showActions = false,
  onSign,
}: {
  proposal: Proposal;
  showActions?: boolean;
  onSign?: () => void;
}) {
  return (
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
        {proposal.client_company && (
          <p className="text-sm text-text-sec">{proposal.client_company}</p>
        )}
        {proposal.client_email && (
          <p className="text-sm text-text-dim font-mono">{proposal.client_email}</p>
        )}
      </div>

      {/* Scope of Work */}
      {proposal.scope_of_work && (
        <div className="bg-surface border-x border-t border-border p-6 sm:p-8">
          <h2 className="font-display text-lg text-text mb-3">Scope of Work</h2>
          <p className="text-sm text-text-sec leading-relaxed whitespace-pre-wrap">
            {proposal.scope_of_work}
          </p>
        </div>
      )}

      {/* Line Items */}
      <div className="bg-surface border-x border-t border-border p-6 sm:p-8">
        <h2 className="font-display text-lg text-text mb-4">Line Items</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs font-mono text-text-dim uppercase tracking-wider border-b border-border">
                <th className="text-left py-2 pr-4">Description</th>
                <th className="text-right py-2 px-2 hidden sm:table-cell">Qty</th>
                <th className="text-right py-2 px-2 hidden sm:table-cell">Rate</th>
                <th className="text-right py-2 pl-2">Amount</th>
              </tr>
            </thead>
            <tbody>
              {proposal.line_items.map((item, i) => (
                <tr key={i} className="border-b border-border/50">
                  <td className="py-3 pr-4 text-text-sec">{item.desc}</td>
                  <td className="py-3 px-2 text-right font-mono text-text-dim hidden sm:table-cell">
                    {item.qty}
                  </td>
                  <td className="py-3 px-2 text-right font-mono text-text-dim hidden sm:table-cell">
                    ${item.rate.toLocaleString()}
                  </td>
                  <td className="py-3 pl-2 text-right font-mono text-text">
                    ${item.total.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="mt-6 border-t border-border pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-mono text-text-dim">Subtotal</span>
            <span className="font-mono text-text">${proposal.subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="font-mono text-text-dim">Tax ({(proposal.tax_rate * 100).toFixed(2)}%)</span>
            <span className="font-mono text-text">${proposal.tax.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-lg pt-2 border-t border-border">
            <span className="font-display text-text">Total</span>
            <span className="font-display molten-glow text-xl">
              ${proposal.total.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Terms */}
      <div className="bg-surface border-x border-t border-border p-6 sm:p-8">
        <h2 className="font-display text-lg text-text mb-3">Terms & Conditions</h2>
        <p className="text-sm text-text-sec leading-relaxed">{proposal.terms}</p>
      </div>

      {/* Actions */}
      {showActions && proposal.status !== 'signed' && (
        <div className="bg-surface2 border border-border rounded-b-lg p-6 sm:p-8">
          <button onClick={onSign} className="btn-rust w-full text-center py-3 text-lg font-display">
            Approve & Sign
          </button>
        </div>
      )}

      {proposal.status === 'signed' && (
        <div className="bg-surface2 border border-border rounded-b-lg p-6 sm:p-8 text-center">
          <div className="text-green-forge font-display text-lg mb-2">Signed & Approved</div>
          <p className="text-xs font-mono text-text-dim">
            Signed by {proposal.signed_by} on{' '}
            {proposal.signed_at && new Date(proposal.signed_at).toLocaleDateString()}
          </p>
          <div className="flex gap-3 mt-4 justify-center">
            <button className="btn-outline text-sm">Download PDF</button>
            <button className="btn-rust text-sm">Pay Deposit</button>
          </div>
        </div>
      )}

      {!showActions && proposal.status !== 'signed' && (
        <div className="bg-surface2 border border-border rounded-b-lg p-6" />
      )}
    </div>
  );
}
