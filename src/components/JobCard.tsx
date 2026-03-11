import type { Job } from '@/lib/types';

export default function JobCard({ job }: { job: Job }) {
  return (
    <div className="forge-card p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-medium text-text">{job.client_name}</p>
          {job.description && (
            <p className="text-sm text-text-sec mt-1 line-clamp-1">{job.description}</p>
          )}
        </div>
        {job.value && (
          <span className="text-sm font-mono text-ember">${job.value.toLocaleString()}</span>
        )}
      </div>
      <div className="mt-3">
        <div className="flex items-center justify-between text-xs font-mono text-text-dim mb-1">
          <span>{job.status.replace('_', ' ')}</span>
          <span>{job.progress}%</span>
        </div>
        <div className="w-full h-2 bg-surface3 rounded-full overflow-hidden">
          <div
            className="h-full progress-bar rounded-full transition-all duration-500"
            style={{ width: `${job.progress}%` }}
          />
        </div>
      </div>
      {job.due_date && (
        <p className="text-xs font-mono text-text-dim mt-2">
          Due: {new Date(job.due_date).toLocaleDateString()}
        </p>
      )}
    </div>
  );
}
