import { useState } from 'react';

interface Job {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  url: string;
  created_at: string;
  completed_at?: string;
  progress?: number;
}

export default function JobsStatus() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false); // Changed to false initially
  const [error, setError] = useState<string | null>(null);

  async function fetchJobs() {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/jobs/list');
      if (res.ok) {
        const data = await res.json();
        setJobs(data.jobs || []);
      } else {
        throw new Error(`HTTP ${res.status}`);
      }
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
      setError('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  }

  // Show manual refresh button instead of auto-polling
  if (error) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-yellow-900">⚠️ Jobs Status Unavailable</h3>
            <p className="text-sm text-yellow-700">Job tracking is being set up</p>
          </div>
          <button 
            onClick={fetchJobs}
            disabled={loading}
            className="px-3 py-1 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded text-sm"
          >
            {loading ? 'Loading...' : 'Retry'}
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="animate-pulse">Loading jobs...</div>
      </div>
    );
  }

  const activeJobs = jobs.filter(job => job.status === 'pending' || job.status === 'processing');

  if (activeJobs.length === 0) {
    return null; // Don't show anything if no active jobs
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <h3 className="font-medium text-blue-900 mb-2">🔄 Processing Jobs ({activeJobs.length})</h3>
      <div className="space-y-2">
        {activeJobs.map(job => (
          <div key={job.id} className="flex items-center justify-between text-sm">
            <span className="truncate flex-1">{job.url}</span>
            <div className="flex items-center gap-2">
              {job.status === 'processing' && job.progress && (
                <div className="w-16 bg-blue-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${job.progress}%` }}
                  />
                </div>
              )}
              <span className={`px-2 py-1 rounded text-xs ${
                job.status === 'processing' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'
              }`}>
                {job.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
