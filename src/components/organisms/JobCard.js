import Card from "../molecules/Card";
import Badge from "../atoms/Badge";
import Button from "../atoms/Button";
import { isValidJobStatus } from "@/interfaces/api.types";

/**
 * @typedef {import('@/interfaces/api.types').RepairJob} RepairJob
 */

/**
 * @typedef {Object} JobCardProps
 * @property {RepairJob} job - Repair job data
 * @property {(job: RepairJob) => void} [onView] - View job handler
 * @property {(job: RepairJob) => void} [onUpdate] - Update job handler
 * @property {boolean} [showActions=true] - Whether to show action buttons
 */

/**
 * Organism JobCard component for displaying job details
 * @param {JobCardProps} props
 * @returns {JSX.Element | null}
 */
export default function JobCard({ job, onView, onUpdate, showActions = true }) {
  if (!job || !job._id) {
    return null;
  }

  const jobStatus = isValidJobStatus(job.status) ? job.status : "pending";

  return (
    <Card
      title={`Job #${job._id?.slice(-6)}`}
      actions={
        showActions ? (
          <>
            {onView && (
              <Button size="small" onClick={() => onView(job)}>
                View
              </Button>
            )}
            {onUpdate && (
              <Button
                size="small"
                variant="secondary"
                onClick={() => onUpdate(job)}
              >
                Update
              </Button>
            )}
          </>
        ) : null
      }
    >
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Device:</span>
          <span className="text-sm text-gray-700">
            {job.deviceType || "N/A"}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Status:</span>
          <Badge status={jobStatus}>{jobStatus}</Badge>
        </div>
        {job.priority && (
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Priority:</span>
            <Badge status={job.priority}>{job.priority}</Badge>
          </div>
        )}
        <div className="mt-3">
          <p className="text-sm text-gray-600 line-clamp-2">
            {job.issueDescription || "No description"}
          </p>
        </div>
        {job.estimatedCost && (
          <div className="flex justify-between items-center mt-2 pt-2 border-t">
            <span className="text-sm font-medium">Est. Cost:</span>
            <span className="text-sm font-bold text-green-600">
              ${job.estimatedCost}
            </span>
          </div>
        )}
      </div>
    </Card>
  );
}
