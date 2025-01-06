import { useState, useEffect } from "react";
import { Field, Form } from "react-final-form";
import PropTypes from 'prop-types';
import { GoPersonAdd, GoTrash } from "react-icons/go";
import { validateEmail } from "../../utils/validation";
import FormField from "../form/FormField";

const StudyParticipants = ({ onSubmit, onCancel, onKeyDown, initialValues }) => {
  const [email, setEmail] = useState("");
  const [emailList, setEmailList] = useState([]);
  const [invalidEmail, setInvalidEmail] = useState(false);

  useEffect(() => {
    setEmailList(initialValues || []);
  }, [initialValues]);

  const handleInputChange = (e) => {
    setEmail(e.target.value);
  };

  const handleAddEmail = () => {
    setInvalidEmail(false);
    if (email && !emailList.includes(email)) {
      if (!validateEmail(email)) {
        setInvalidEmail(true);
        return;
      }
      setEmailList([...emailList, email]);
      setEmail("");
    }
  };

  const handleRemoveEmail = (emailToRemove) => {
    setEmailList(emailList.filter(email => email !== emailToRemove));
  };

  const handleFormSubmit = (values) => {
    if (emailList.length === 0) {
      setInvalidEmail(true);
      return;
    }
    onSubmit({ ...values, emailList });
  };

  return (
    <div>
      <h3>Add Participants</h3>
      <Form
        onSubmit={handleFormSubmit}
        render={({ handleSubmit }) => (
          <form onSubmit={handleSubmit} onKeyDown={onKeyDown} className="needs-validation" noValidate>
            <div className="mb-3">

              <label className="form-label">Email</label>
              <input
                type="email"
                value={email}
                onChange={handleInputChange}
                className="form-control"
                required
              />
              {invalidEmail && (
                <div className="form-text text-danger">
                  You must provide a valid email address
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={handleAddEmail}
              className="btn btn-info"
            >
              <GoPersonAdd /> Add
            </button>
            <div className="mt-3">
              <ul className="list-group">
                {emailList.map((email, index) => (
                  <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                    {email}
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => handleRemoveEmail(email)}
                    >
                      <GoTrash />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div className="d-flex justify-content-between mt-3">
              <button type="button" className="btn btn-secondary" onClick={onCancel}>
                Back
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

StudyParticipants.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default StudyParticipants;