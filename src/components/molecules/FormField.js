import Input from "../atoms/Input";

/**
 * @typedef {Object} FormFieldProps
 * @property {string} label - Field label
 * @property {string} [error] - Error message
 * @property {boolean} [required=false] - Whether field is required
 * @property {import('../atoms/Input').InputProps} [inputProps] - Additional input props
 */

/**
 * Molecule FormField component combining label, input, and error
 * @param {FormFieldProps & import('../atoms/Input').InputProps} props
 * @returns {JSX.Element}
 */
export default function FormField({
  label,
  error,
  required = false,
  ...inputProps
}) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <Input required={required} {...inputProps} />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
