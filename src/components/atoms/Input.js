/**
 * @typedef {Object} InputProps
 * @property {string} [type='text'] - Input type
 * @property {string} [name] - Input name attribute
 * @property {string} [value] - Input value
 * @property {(e: React.ChangeEvent<HTMLInputElement>) => void} [onChange] - Change handler
 * @property {string} [placeholder] - Placeholder text
 * @property {boolean} [required=false] - Whether input is required
 * @property {boolean} [disabled=false] - Whether input is disabled
 * @property {string} [className=''] - Additional CSS classes
 */

/**
 * Atomic Input component
 * @param {InputProps} props
 * @returns {JSX.Element}
 */
export default function Input({
  type = "text",
  name,
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  className = "",
}) {
  return (
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
        disabled ? "bg-gray-100 cursor-not-allowed" : ""
      } ${className}`}
    />
  );
}
