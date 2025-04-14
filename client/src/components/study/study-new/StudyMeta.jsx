import React, { useEffect } from 'react';
import { Form, Field } from "react-final-form";
import PropTypes from 'prop-types';
import { Tooltip } from 'react-tooltip';
import { GoQuestion } from 'react-icons/go';
import DOMPurify from 'dompurify';

const StudyMeta = ({ onSubmit, initialValues, setStudyType }) => {

  const validate = (values) => {
    const errors = {};
    if (!values.name) {
      errors.name = "You must provide a value";
    }
    if (!values.description) {
      errors.description = "You must provide a value";
    }
    return errors;
  };

  const handleFormSubmit = (values) => {
    
    const cleanedValues = Object.keys(values).reduce((acc, key) => {
        acc[key] = DOMPurify.sanitize(values[key]);
        return acc;
      }, {});    
    
    const updatedValues = { ...cleanedValues};
    setStudyType(updatedValues.studyType);
    onSubmit(updatedValues);
  }
  return (
    <div className="bg-body-tertiary border border-tertiary p-2 rounded">
      <h3 className="text-center">Create New Study</h3>
      <Form
        onSubmit={handleFormSubmit}
        initialValues={{ ...initialValues, studyType: '' }}
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
              <div className="form-text mb-3">Please provide a short description of the study, 2-3 sentences</div>
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
              <label className="form-label">Study Consent/Preface</label>
              <div className="form-text mb-3">Please provide any consent or preface information you would like to display to the participant upon initially joining the study.</div>
              <Field
                name="preface"
                component="textarea"
                type="text"
                className="form-control"
                rows="5"
                required
              />
              <Field name="preface">
                {({ meta }) => meta.error && meta.touched && <span className="text-danger">{meta.error}</span>}
              </Field>
            </div>
            {/* Temporarily hide the Study Type field */}
            { <div className="mb-3">
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
                <option value="app-review">Task-Based</option>
                <option value="survey">Single Survey-Based</option>
              </Field>
              <Field name="studyType">
                {({ meta }) => meta.error && meta.touched && <span className="text-danger">{meta.error}</span>}
              </Field>
            </div> }
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
};

StudyMeta.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  initialValues: PropTypes.object
};

export default StudyMeta;