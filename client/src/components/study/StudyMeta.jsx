import FORM_FIELDS from "../form/studyMetaFormFields";
import { Form, Field } from "react-final-form";
import PropTypes from 'prop-types';
import FormField from "../form/FormField";
import { validate } from "../../utils/validation";

const StudyMeta = ({ onSubmit, onCancel, initialValues }) => {
  const validateForm = (values) => validate(values, FORM_FIELDS);

  return (
    <div>
      <h3>Create New Study</h3>
      <Form
        onSubmit={onSubmit}
        validate={validateForm}
        initialValues={initialValues}
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
                  return (
                    <FormField
                      input={input}
                      label={label}
                      type={type}
                      options={options}
                      meta={meta}
                    />
                  );
                }}
              </Field>
            ))}
            <div className="d-flex justify-content-between mt-3">
              <button type="button" className="btn btn-secondary" onClick={onCancel}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Next
              </button>
            </div>
          </form>
        )}
      />
    </div>
  );
}

StudyMeta.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default StudyMeta;