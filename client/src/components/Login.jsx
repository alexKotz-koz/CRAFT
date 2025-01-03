import { Form, Field } from 'react-final-form';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';
import FormField from './form/FormField';
import FORM_FIELDS from './form/loginFormFields';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const error = useSelector((state) => state.auth.error);

  const handleFormSubmit = async (values) => {
    try {
      await dispatch(loginUser({ values, navigate }));
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
            {error && <div style={{ color: 'red' }}>{error}</div>}
            <button type="submit">Login</button>
          </form>
        )}
      />
    </div>
  );
};

export default Login;