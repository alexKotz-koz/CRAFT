import { Form, Field } from 'react-final-form';
import { useNavigate } from 'react-router-dom';

import FormField from '../form/FormField';
import FORM_FIELDS from '../form/passwordResetFormFields';

import { usePasswordResetMutation } from '../../store';

const PasswordReset = () => {
    const navigate = useNavigate();

    const [passwordReset, { isLoading, error }] = usePasswordResetMutation();
    console.log("error", error)
    const handleFormSubmit = async (values) => {
      try {
        await passwordReset(values).unwrap();
        navigate('/login');
      } catch (error) {
        console.error("handleFormSubmit", error);
      }
    };

    const validate = (values) => {
        console.log("validate", values);
        const errors = {};
        if (values.newPassword === values.currentPassword){
            errors.newPassword = "New password cannot be the same as your old password";
        }
        if (values.newPassword !== values.confirmPassword) {
            errors.confirmPassword = "Passwords do not match";
        }
        return errors;
    };
  
    return (
      <div>
        <Form
          onSubmit={handleFormSubmit}
          validate={validate}
          render={({ handleSubmit, submitError }) => (
            <form onSubmit={handleSubmit}>
              {FORM_FIELDS.map(({ label, name, type, options, required }) => (
                <Field
                  key={name}
                  name={name}
                  type={type}
                  options={options}
                  required={required}
                >
                  {({ input, meta }) => (
                    <FormField
                      input={input}
                      label={label}
                      type={type}
                      options={options}
                      meta={meta}
                      required={required}
                    />
                  )}
                </Field>
              ))}
              {submitError && <div className='alert alert-danger'>{submitError}</div>}
              {error && <div className='alert alert-danger'>{error.data.error}</div>}
              <button type="submit" disabled={isLoading}>Reset Password</button>
            </form>
          )}
        />
      </div>
    );
};

export default PasswordReset;