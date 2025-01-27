import { Form, Field } from "react-final-form";
import PropTypes from 'prop-types';

const StudyMeta = ({ onSubmit, onCancel, initialValues }) => {
  const validate = (values) => {
    const errors = {};
    if (!values.name || !values.description) {
      if (!values.name) {
        errors.name = "You must provide a value";
      }
      if (!values.description) {
        errors.description = "You must provide a value";
      }
    }
    return errors;
  };

  return (
    <div className="bg-body-tertiary border border-tertiary p-2 rounded">
      <h3 className="text-center">Create New Study</h3>
      <Form
        onSubmit={onSubmit}
        initialValues={initialValues}
        validate={validate}
        render={({ handleSubmit, submitError }) => (
          <form onSubmit={handleSubmit} className="needs-validation" noValidate>
            <div className="mb-3">
              <label className="form-label">Study Name</label>
              <Field
                name="name"
                component="input"
                type="text"
                className="form-control"
                required
              />
              <Field name="name">
                {({ meta }) => meta.error && meta.touched && <span className="text-danger">{meta.error}</span>}
              </Field>
            </div>
            <div className="mb-3">
              <label className="form-label">Study Description</label>
              <Field
                name="description"
                component="input"
                type="text"
                className="form-control"
                required
              />
              <Field name="description">
                {({ meta }) => meta.error && meta.touched && <span className="text-danger">{meta.error}</span>}
              </Field>
            </div>
            <div className="d-flex justify-content-end mt-3">
              <button type="submit" className="btn btn-success ms-2 me-2">
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