/**
 * @typedef {Object} CardProps
 * @property {string} [title] - Card title
 * @property {React.ReactNode} children - Card content
 * @property {React.ReactNode} [actions] - Action buttons/elements
 * @property {string} [className=''] - Additional CSS classes
 */

/**
 * Molecule Card component for content containers
 * @param {CardProps} props
 * @returns {JSX.Element}
 */
export default function Card({ title, children, actions, className = "" }) {
  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      {title && (
        <h3 className="text-lg font-semibold mb-4 text-gray-800">{title}</h3>
      )}
      <div className="mb-4">{children}</div>
      {actions && <div className="flex gap-2 justify-end">{actions}</div>}
    </div>
  );
}
