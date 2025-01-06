import { Form, Field } from 'react-final-form';
import { useNavigate } from 'react-router-dom';
import FormField from './form/FormField';
import FORM_FIELDS from './form/loginFormFields';
import { useLoginUserMutation } from '../store';

const Login = () => {
  const navigate = useNavigate();

  const [loginUser, { isLoading, error }] = useLoginUserMutation();

  const handleFormSubmit = async (values) => {
    try {
      await loginUser(values).unwrap();
      navigate('/');
    } catch (error) {
      
      console.error("handleFormSubmit", error);
    }
  };

  return (
    <div>
      <Form
        onSubmit={handleFormSubmit}
        render={({ handleSubmit }) => (
          <form onSubmit={handleSubmit}>
            {FORM_FIELDS.map(({ label, name, type, options }) => (
                        <Field
                            key={name}
                            name={name}
                            type={type}
                            options={options}
                        >
                            {({ input, meta }) => (
                            <FormField
                                input={input}
                                label={label}
                                type={type}
                                options={options}
                                meta={meta}
                            />
                            )}
                        </Field>
                        ))}
            {error && <div style={{ color: 'red' }}>{error.data.error.error}</div>}
            <button type="submit" disabled={isLoading}>Login</button>
          </form>
        )}
      />
    </div>
  );
};

export default Login;