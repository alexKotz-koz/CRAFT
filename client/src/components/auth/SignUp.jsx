import { Form, Field } from "react-final-form";
import { Link, useNavigate } from "react-router-dom";
import SignUpField from "../form/FormField";
import FORM_FIELDS from "../form/signupFormFields";
import { useCreateUserMutation } from "../../store";
import { Spinner } from "reactstrap";
import { useEffect } from "react";
import ReactGA from 'react-ga4';


const SignUp = () => {

    useEffect(() => {
        ReactGA.send({
            hitType: "pageview",
            page: "/signup",
            title: "Sign Up - CRAFT",
        });
    }, []);

    const navigate = useNavigate();

    const [createUser, { isLoading, error }] = useCreateUserMutation();

    if (isLoading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
                <Spinner color="primary" />
            </div>
        );
    }

    if (error) {
        return <div>{error?.data}</div>
    }

    const handleFormSubmit = async (values) => {
        try {
            values = { ...values, username: '' };
            await createUser(values).unwrap(); //handle the promise returned by the mutation
            navigate('/login');
        } catch (error) {
            console.error("handleFormSubmit", error);
        }

    };

    const validate = (values) => {
        const errors = {};
        const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
        FORM_FIELDS.forEach(({ name }) => {
            if (!values[name]) {
                errors[name] = "You must provide a value";
            } else if (name === "email" && !emailRegex.test(values[name])) {
                errors[name] = "You must provide a valid email address";
            } else if (name === "confirm") {
                if (values['confirm'] !== values['password']) {
                    errors[name] = "Passwords do not match";
                }
            }
        });

        return errors;
    };

    return (
        <div className="form-signin w-50 m-auto">
            <Form
                onSubmit={handleFormSubmit}
                validate={validate}
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
                                    <SignUpField
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
                        {error && <div style={{ color: 'red' }}>{error.data.error.error}</div>}
                        <div className="d-flex justify-content-end mt-3">
                            <button type="submit" className="btn btn-primary px-4 gap-3" disabled={isLoading}>Submit</button>
                            <Link to="/login" className="btn btn-secondary px-4 ms-2">Cancel</Link>
                        </div>


                    </form>
                )}
            />
        </div>
    );
};

export default SignUp;