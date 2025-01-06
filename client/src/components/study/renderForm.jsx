import { Form, Field } from "react-final-form";
import PropTypes from 'prop-types';
import FormField from "../form/FormField";

export const renderForm = ({ onSubmit, onCancel, cancelButton, nextButton, FORM_FIELDS, errors }) => {
  return (
    <Form
      onSubmit={onSubmit}
      render={({ handleSubmit }) => (
        <form onSubmit={handleSubmit} className="needs-validation" noValidate>
          {FORM_FIELDS.map(({ label, name, type, options }) => (
            <Field
              key={name}
              type={type}
              label={label}
              name={name}
            >
              {({ input, meta }) => {
                const mergedMeta = {
                  ...meta,
                  error: errors[name],
                  touched: meta.touched || !!errors[name],
                };
                return (
                  <FormField
                    input={input}
                    label={label}
                    type={type}
                    options={options}
                    meta={mergedMeta}
                  />
                );
              }}
            </Field>
          ))}
          <div className="d-flex justify-content-between mt-3">
            <button type="button" className="btn btn-secondary" onClick={onCancel}> 
              {cancelButton}
            </button>
            <button type="submit" className="btn btn-primary">
              {nextButton}
            </button>
          </div>
        </form>
      )}
    />
  );
};

renderForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  cancelButton: PropTypes.string.isRequired,
  nextButton: PropTypes.string.isRequired,
  FORM_FIELDS: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired,
      options: PropTypes.array
    })
  ).isRequired,
  errors: PropTypes.object
};