import Link from 'next/link';
import type { Lead } from '@/lib/types';

function TierDot({ tier }: { tier: string }) {
  if (tier === 'URGENT') {
    return <span className="w-2.5 h-2.5 rounded-full bg-rust tier-urgent inline-block flex-shrink-0" />;
  }
  if (tier === 'WARM') {
    return <span className="w-2.5 h-2.5 rounded-full bg-yellow-warm inline-block flex-shrink-0" />;
  }
  return <span className="w-2.5 h-2.5 rounded-full bg-text-dim inline-block flex-shrink-0" />;
}

export default function LeadCard({ lead }: { lead: Lead }) {
  return (
    <Link href={`/dashboard/leads/${lead.id}`}>
      <div className="forge-card p-4 cursor-pointer">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <TierDot tier={lead.tier} />
            <span className="font-medium text-text truncate">{lead.name}</span>
          </div>
          <span className="text-xs font-mono text-text-dim flex-shrink-0">
            {lead.score}pts
          </span>
        </div>
        {lead.scope && (
          <p className="text-sm text-text-sec mt-2 line-clamp-2">{lead.scope}</p>
        )}
        <div className="flex items-center gap-3 mt-2 text-xs font-mono text-text-dim">
          {lead.material && <span>{lead.material}</span>}
          {lead.timeline && <span>{lead.timeline}</span>}
          {lead.photos && lead.photos.length > 0 && (
            <span>{lead.photos.length} photo{lead.photos.length > 1 ? 's' : ''}</span>
          )}
          {lead.estimated_value && (
            <span className="text-ember">${lead.estimated_value.toLocaleString()}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
