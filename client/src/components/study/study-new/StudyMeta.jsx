import React, { useEffect } from 'react';
import { Form, Field } from "react-final-form";
import PropTypes from 'prop-types';
import { Tooltip } from 'react-tooltip';
import { GoQuestion } from 'react-icons/go';

const StudyMeta = ({ onSubmit, onCancel, initialValues, setStudyType }) => {

  const validate = (values) => {
    const errors = {};
    if (!values.name) {
      errors.name = "You must provide a value";
    }
    if (!values.description) {
      errors.description = "You must provide a value";
    }
    if (!values.studyType || (values.studyType !== 'app-review' && values.studyType !== 'survey')) {
      errors.studyType = "You must select either App Review or Survey";
    }
    return errors;
  };

  const handleFormSubmit = (values) => {
    setStudyType(values.studyType);
    onSubmit({values});
  }

  return (
    <div className="bg-body-tertiary border border-tertiary p-2 rounded">
      <h3 className="text-center">Create New Study</h3>
      <Form
        onSubmit={handleFormSubmit}
        initialValues={initialValues?.values}
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
            <div className="mb-3">
              <div className="d-flex justify-content-between align-items-center">
                <label className="form-label">Study Type</label>
                <GoQuestion data-tooltip-id='studytype' style={{ fontSize: '24px'}} />
                <Tooltip
                  id="studytype"
                  place="bottom"
                  type="dark"
                  effect="solid"
                  content='App Review: Use this option for studies that involve detailed app evaluations. Survey: Use this option for studies that collect user feedback via questionnaires'
                />
              </div>
              <Field
                name="studyType"
                component="select"
                className="form-control"
                required>
                <option />
                <option value="app-review">App Review</option>
                <option value="survey">Survey</option>
              </Field>
              <Field name="studyType">
                {({ meta }) => meta.error && meta.touched && <span className="text-danger">{meta.error}</span>}
              </Field>
            </div>
            <div className="d-flex justify-content-end mt-3">
              <button type="button" className="btn btn-secondary" onClick={onCancel}>
                Back
              </button>
              <button type="submit" className="btn btn-success ms-2 me-2">
                Next
              </button>
            </div>
          </form>
        )}
      />
    </div>
  );
};

StudyMeta.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  initialValues: PropTypes.object
};

export default StudyMeta;