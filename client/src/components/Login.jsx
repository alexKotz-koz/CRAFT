import { Form, Field } from 'react-final-form';
import { useNavigate } from 'react-router-dom';

import FormField from './form/FormField';
import FORM_FIELDS from './form/loginFormFields';

import { useLoginUserMutation } from '../store';

import ButtonLink from './tools/ButtonLink';

const Login = () => {
  const navigate = useNavigate();

  const [loginUser, { isLoading: isLoadingLogin, error: errorLogin }] = useLoginUserMutation();

  const handleFormSubmit = async (values) => {
    try {
      await loginUser(values).unwrap();
      navigate('/home');
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
            {errorLogin && <div style={{ color: 'red' }}>{error.data.error.error}</div>}
            <button type="submit" disabled={isLoadingLogin}>Login</button>
            <ButtonLink to='/password_reset' text='Reset Password'/>
          </form>
        )}
      />
    </div>
  );
};

export default Login;