import Badge from "../atoms/Badge";

/**
 * @typedef {Object} StatusCardProps
 * @property {string} label - Card label
 * @property {number | string} value - Value to display
 * @property {string} [status] - Status for badge
 */

/**
 * Molecule StatusCard component for displaying stat with status
 * @param {StatusCardProps} props
 * @returns {JSX.Element}
 */
export default function StatusCard({ label, value, status }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <p className="text-sm text-gray-600 mb-2">{label}</p>
      <div className="flex items-center justify-between">
        <p className="text-2xl font-bold text-gray-800">{value}</p>
        {status && <Badge status={status}>{status}</Badge>}
      </div>
    </div>
  );
}
