import { useState, useEffect } from "react";
import { Form } from "react-final-form";
import PropTypes from 'prop-types';
import { GoPersonAdd, GoTrash } from "react-icons/go";
import { validateEmail } from "../../utils/validation";
import { useLazyFetchUsernameQuery } from "../../store";


const StudyParticipants = ({ onSubmit, onCancel, initialValues }) => {
  const [email, setEmail] = useState("");
  const [emailList, setEmailList] = useState([]);
  const [invalidEmail, setInvalidEmail] = useState(false);
  const [fetchUsername, { isLoading, data, error }] = useLazyFetchUsernameQuery();


  useEffect(() => {
    setEmailList(initialValues || []);
  }, [initialValues]);

  const handleInputChange = (e) => {
    setEmail(e.target.value);
  };

  const handleAddEmail = async () => {
    setInvalidEmail(false);
    if (email && !emailList.some(item => item.email === email)) {
      if (!validateEmail(email)) {
        setInvalidEmail(true);
        return;
      }

      // Fetch a new username
      const result = await fetchUsername().unwrap();
      if (result.error) {
        console.error("Failed to fetch username:", result.error);
        return;
      }

      const username = result.username;
      console.log(username);
      setEmailList([...emailList, { email, username }]);
      setEmail("");
    }
  };

  const handleRemoveEmail = (emailToRemove) => {
    setEmailList(emailList.filter(item => item.email !== emailToRemove));
  };

  const handleFormSubmit = (values) => {
    if (emailList.length === 0) {
      setInvalidEmail(true);
      return;
    }
    onSubmit({ ...values, emailList });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddEmail();
    }
  };

  return (
    <div>
      <h3>Add Participants</h3>
      <Form
        onSubmit={handleFormSubmit}
        render={({ handleSubmit }) => (
          <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="needs-validation" noValidate>
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
                {emailList.map((item, index) => (
                  <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                    {item.email} ({item.username})
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => handleRemoveEmail(item.email)}
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