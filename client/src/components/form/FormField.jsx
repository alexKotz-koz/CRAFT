import PropTypes from 'prop-types';

const formatDropDownString = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const FormField = ({ input, label, type, options, meta: { error, touched }, required }) => {
  return (
    <div className="mb-3">
      <label className="form-label">
        {label} {required && <span className="text-danger">*</span>}
      </label>
      {type === 'select' ? (
        <select {...input} className="form-control" required={required}>
          <option value="" disabled hidden>Select an option...</option>
          {options.map((option) => (
            <option key={option} value={option}>{formatDropDownString(option)}</option>
          ))}
        </select>
      ) : (
        <input {...input} type={type} className="form-control" style={{ marginBottom: "5px" }} required={required} />
      )}
      <div className="form-text" style={{ marginBottom: "20px" }}>
        {touched && error}
      </div>
    </div>
  );
};

FormField.propTypes = {
  input: PropTypes.object.isRequired,
  label: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  options: PropTypes.array,
  meta: PropTypes.shape({
    error: PropTypes.string,
    touched: PropTypes.bool
  }).isRequired,
  required: PropTypes.bool.isRequired,
};

export default FormField;