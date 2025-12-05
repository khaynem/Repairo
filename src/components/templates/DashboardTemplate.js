import DashboardStats from '../organisms/DashboardStats';
import JobList from '../organisms/JobList';

export default function DashboardTemplate({ 
  stats, 
  jobs, 
  onViewJob, 
  onUpdateJob,
  children 
}) {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Dashboard</h1>
      
      <DashboardStats stats={stats} />
      
      {children}
      
      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Recent Jobs</h2>
        <JobList 
          jobs={jobs} 
          onViewJob={onViewJob} 
          onUpdateJob={onUpdateJob}
        />
      </div>
    </div>
  );
}