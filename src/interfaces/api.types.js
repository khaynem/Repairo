/**
 * @typedef {Object} User
 * User entity representing both customers and technicians in the system
 * @property {string} _id - MongoDB unique identifier (ObjectId as string)
 * @property {string} username - User's display name (3-50 characters)
 * @property {string} email - User's email address (unique, 5-100 characters)
 * @property {string} password - Hashed password (never sent to client in responses)
 * @property {'customer' | 'technician' | 'admin'} role - User's role in the system
 * @property {string} [phone] - Phone number (required for technicians)
 * @property {string[]} [skills] - Array of skill names (technician only)
 * @property {string} [certifications] - Certifications description (technician only)
 * @property {string} [bio] - Professional bio (technician only)
 * @property {Date} createdAt - Account creation timestamp
 * @property {Date} [updatedAt] - Last modification timestamp
 */

/**
 * @typedef {Object} RepairJob
 * Repair request entity connecting customers with technicians
 * @property {string} _id - MongoDB unique identifier
 * @property {string} title - Brief repair title (e.g., "Phone - iPhone 12")
 * @property {string} description - Detailed issue description
 * @property {'Pending' | 'Assigned' | 'In Progress' | 'Completed' | 'Cancelled'} status - Current repair status
 * @property {string} userId - Customer ID who created the request (ObjectId reference)
 * @property {string} [technicianId] - Assigned technician ID (ObjectId reference, null if unclaimed)
 * @property {Date} createdAt - Request creation timestamp
 * @property {Date} updatedAt - Last modification timestamp
 */

/**
 * @typedef {Object} Message
 * Message entity for customer-technician communication
 * @property {string} _id - MongoDB unique identifier
 * @property {string} senderId - Sender user ID (ObjectId reference)
 * @property {string} receiverId - Receiver user ID (ObjectId reference)
 * @property {string} repairId - Associated repair request ID (ObjectId reference)
 * @property {string} content - Message text content (max 2000 characters)
 * @property {boolean} read - Whether message has been read by receiver
 * @property {Date} createdAt - Message creation timestamp
 */

/**
 * @typedef {Object} AuthResponse
 * Response from authentication endpoints (login/register)
 * @property {string} token - JWT authentication token (expires in 7 days)
 * @property {User} user - Authenticated user data (password excluded)
 * @property {string} [message] - Success message
 */

/**
 * @template T
 * @typedef {Object} ApiResponse
 * Generic API response wrapper
 * @property {T} [data] - Response payload of type T
 * @property {boolean} success - Whether request was successful
 * @property {string} [message] - Success/info message
 * @property {string} [error] - Error message if request failed
 */

/**
 * @typedef {Object} DashboardStats
 * Statistics for dashboard overview
 * @property {number} total - Total number of repair jobs
 * @property {number} pending - Number of pending/assigned jobs
 * @property {number} inProgress - Number of jobs in progress
 * @property {number} completed - Number of completed jobs
 */

/**
 * @typedef {Object} Conversation
 * Conversation summary for messages list
 * @property {string} repairId - Associated repair request ID
 * @property {Object} repair - Repair summary object
 * @property {string} repair._id - Repair ID
 * @property {string} repair.title - Repair title
 * @property {string} repair.status - Repair status
 * @property {User} customer - Customer user object
 * @property {User} technician - Technician user object
 * @property {string} lastMessage - Last message content
 * @property {Date} lastMessageTime - Last message timestamp
 * @property {number} unreadCount - Number of unread messages for current user
 */

// ============================================
// CONSTANTS
// ============================================

export const UserRole = {
  CUSTOMER: "customer",
  TECHNICIAN: "technician",
  ADMIN: "admin",
};

export const UserStatus = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  PENDING: "pending",
};

export const JobStatus = {
  PENDING: "pending",
  ASSIGNED: "assigned",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
};

export const Priority = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  URGENT: "urgent",
};

export const formatStatus = (status) => {
  if (!status) return "";
  return status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
};

export const isValidJobStatus = (status) => {
  return Object.values(JobStatus).includes(status);
};

export const isValidUserRole = (role) => {
  return Object.values(UserRole).includes(role);
};
