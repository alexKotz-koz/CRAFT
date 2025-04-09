import { Form, Field } from 'react-final-form';
import { useNavigate } from 'react-router-dom';

import FormField from '../form/FormField';
import FORM_FIELDS from '../form/loginFormFields';

import { useLoginUserMutation } from '../../store';

import { Spinner } from 'reactstrap';

import ButtonLink from '../tools/ButtonLink';

import { useEffect } from 'react';
import ReactGA from 'react-ga4';

const Login = () => {

    useEffect(() => {
        ReactGA.send({
            hitType: "pageview",
            page: "/login",
            title: "Login - CRAFT",
        });
    }, []);

    const navigate = useNavigate();

    const [loginUser, { isLoading: isLoadingLogin, error: errorLogin }] = useLoginUserMutation();

    if (isLoadingLogin) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
                <Spinner color="primary" />
            </div>
        );
    }

    // Login errors are handled by the Form, do not manually specify custom error handler


    const handleFormSubmit = async (values) => {
        try {
            await loginUser(values).unwrap();
            navigate('/home');
        } catch (error) {

            console.error("handleFormSubmit", error);
        }
    };

    return (
        <div className='form-signin w-50 m-auto'>
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
                        {errorLogin && <div style={{ color: 'red' }}>{errorLogin.data.error.error}</div>}
                        <div className='d-grid gap-2 d-sm-flex justify-content-sm-center'>
                            <button type="submit" disabled={isLoadingLogin} className='btn btn-primary px-4 gap-3' >Login</button>
                            <ButtonLink to='/password_reset' text='Reset Password' additionalClasses='btn btn-secondary px-4' />
                        </div>

                    </form>
                )}
            />
        </div>
    );
};

export default Login;