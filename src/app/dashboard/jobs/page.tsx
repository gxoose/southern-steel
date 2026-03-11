'use client';

import { useEffect, useState } from 'react';
import type { Job } from '@/lib/types';

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/jobs');
        if (res.ok) setJobs(await res.json());
      } catch (e) {
        console.error('Failed to load jobs', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function updateProgress(id: string, progress: number) {
    const status = progress >= 100 ? 'completed' : progress > 0 ? 'in_progress' : 'scheduled';
    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, progress, status }),
      });
      if (res.ok) {
        setJobs((prev) =>
          prev.map((j) => (j.id === id ? { ...j, progress, status } : j))
        );
      }
    } catch (e) {
      console.error('Failed to update job', e);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-text-sec font-mono text-sm">Loading jobs...</p>
      </div>
    );
  }

  const activeJobs = jobs.filter((j) => j.status !== 'completed' && j.status !== 'invoiced');
  const completedJobs = jobs.filter((j) => j.status === 'completed' || j.status === 'invoiced');

  return (
    <div>
      <h1 className="font-display text-2xl text-text mb-6">Jobs</h1>

      {/* Active Jobs */}
      <h2 className="font-display text-lg text-text mb-4">Active</h2>
      <div className="space-y-3 mb-8">
        {activeJobs.length === 0 ? (
          <div className="forge-card p-8 text-center">
            <p className="text-text-sec text-sm">No active jobs</p>
          </div>
        ) : (
          activeJobs.map((job) => (
            <div key={job.id} className="forge-card p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-medium text-text">{job.client_name}</p>
                  {job.description && (
                    <p className="text-sm text-text-sec mt-1">{job.description}</p>
                  )}
                </div>
                {job.value && (
                  <span className="text-sm font-mono text-ember">
                    ${job.value.toLocaleString()}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="w-full h-2 bg-surface3 rounded-full overflow-hidden">
                    <div
                      className="h-full progress-bar rounded-full transition-all duration-500"
                      style={{ width: `${job.progress}%` }}
                    />
                  </div>
                </div>
                <span className="text-xs font-mono text-text-dim w-8 text-right">
                  {job.progress}%
                </span>
              </div>
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-2 text-xs font-mono text-text-dim">
                  <span className="capitalize">{job.status.replace('_', ' ')}</span>
                  {job.due_date && (
                    <span>Due: {new Date(job.due_date).toLocaleDateString()}</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => updateProgress(job.id, Math.min(job.progress + 25, 100))}
                    className="text-xs font-mono text-ember hover:text-molten transition-colors"
                  >
                    +25%
                  </button>
                  <button
                    onClick={() => updateProgress(job.id, 100)}
                    className="text-xs font-mono text-green-forge hover:text-green-forge/80 transition-colors"
                  >
                    Complete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Completed Jobs */}
      {completedJobs.length > 0 && (
        <>
          <h2 className="font-display text-lg text-text mb-4">Completed</h2>
          <div className="space-y-3">
            {completedJobs.map((job) => (
              <div key={job.id} className="forge-card p-5 opacity-60">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-text">{job.client_name}</p>
                    {job.description && (
                      <p className="text-sm text-text-sec mt-1">{job.description}</p>
                    )}
                  </div>
                  {job.value && (
                    <span className="text-sm font-mono text-green-forge">
                      ${job.value.toLocaleString()}
                    </span>
                  )}
                </div>
                <div className="w-full h-2 bg-surface3 rounded-full overflow-hidden mt-3">
                  <div className="h-full bg-green-forge rounded-full w-full" />
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
