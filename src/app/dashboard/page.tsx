'use client';

import { useEffect, useState } from 'react';
import StatCard from '@/components/StatCard';
import LeadCard from '@/components/LeadCard';
import JobCard from '@/components/JobCard';
import type { Lead, Job } from '@/lib/types';

export default function DashboardPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [leadsRes, jobsRes] = await Promise.all([
          fetch('/api/leads'),
          fetch('/api/jobs'),
        ]);
        if (leadsRes.ok) setLeads(await leadsRes.json());
        if (jobsRes.ok) setJobs(await jobsRes.json());
      } catch (e) {
        console.error('Failed to load dashboard data', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const activeJobs = jobs.filter((j) => j.status !== 'completed' && j.status !== 'invoiced');
  const pipelineValue = leads.reduce((sum, l) => sum + (l.estimated_value || 0), 0);
  const monthlyRevenue = jobs
    .filter((j) => j.status === 'completed' || j.status === 'invoiced')
    .reduce((sum, j) => sum + (j.value || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-text-sec font-mono text-sm">Loading forge data...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-2xl text-text mb-6">Dashboard</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Open Leads" value={leads.filter((l) => l.status === 'new').length} />
        <StatCard label="Active Jobs" value={activeJobs.length} />
        <StatCard
          label="Pipeline Value"
          value={`$${pipelineValue.toLocaleString()}`}
          sub={`${leads.length} leads`}
        />
        <StatCard
          label="Monthly Revenue"
          value={`$${monthlyRevenue.toLocaleString()}`}
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Left: Incoming Work */}
        <div className="lg:col-span-3">
          <h2 className="font-display text-lg text-text mb-4">Incoming Work</h2>
          <div className="space-y-3">
            {leads.length === 0 ? (
              <div className="forge-card p-8 text-center">
                <p className="text-text-sec text-sm">No leads yet. They&apos;ll show up here when they come in.</p>
              </div>
            ) : (
              leads
                .sort((a, b) => b.score - a.score)
                .map((lead) => <LeadCard key={lead.id} lead={lead} />)
            )}
          </div>
        </div>

        {/* Right: Jobs + Chatbot Status */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h2 className="font-display text-lg text-text mb-4">Active Jobs</h2>
            <div className="space-y-3">
              {activeJobs.length === 0 ? (
                <div className="forge-card p-6 text-center">
                  <p className="text-text-sec text-sm">No active jobs</p>
                </div>
              ) : (
                activeJobs.map((job) => <JobCard key={job.id} job={job} />)
              )}
            </div>
          </div>

          {/* Chatbot Status */}
          <div className="forge-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-green-forge" />
              <span className="text-sm font-mono text-text">Chatbot Status</span>
            </div>
            <p className="text-xs text-text-sec">
              Live and qualifying leads on your website. Embed with:
            </p>
            <code className="block mt-2 text-xs font-mono text-ember bg-surface3 p-2 rounded break-all">
              {'<script src="https://southern-steel.vercel.app/widget.js"></script>'}
            </code>
          </div>
        </div>
      </div>
    </div>
  );
}
