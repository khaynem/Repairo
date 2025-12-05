import StatusCard from "../molecules/StatusCard";

/**
 * @typedef {import('@/interfaces/api.types').DashboardStats} DashboardStats
 */

/**
 * @typedef {Object} DashboardStatsProps
 * @property {DashboardStats} stats - Dashboard statistics
 */

/**
 * Organism DashboardStats component for displaying dashboard statistics
 * @param {DashboardStatsProps} props
 * @returns {JSX.Element}
 */
export default function DashboardStats({ stats }) {
  const statCards = [
    { label: "Total Jobs", value: stats?.total || 0 },
    { label: "Pending", value: stats?.pending || 0, status: "pending" },
    {
      label: "In Progress",
      value: stats?.inProgress || 0,
      status: "in_progress",
    },
    { label: "Completed", value: stats?.completed || 0, status: "completed" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {statCards.map((stat, index) => (
        <StatusCard
          key={index}
          label={stat.label}
          value={stat.value}
          status={stat.status}
        />
      ))}
    </div>
  );
}
