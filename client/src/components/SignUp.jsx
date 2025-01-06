import { Form, Field } from "react-final-form";
import { Link, useNavigate } from "react-router-dom";
import SignUpField from "./form/FormField";
import FORM_FIELDS from "./form/signupFormFields";
import { useCreateUserMutation } from "../store";

const SignUp = () => {
    const navigate = useNavigate();

    const [createUser, { isLoading, error }] = useCreateUserMutation();

    const handleFormSubmit = async(values) => {
        try {
            await createUser(values).unwrap(); //handle the promise returned by the mutation
            navigate('/login');
        } catch (error){
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
        }
      });
    
      return errors;
    };

    return (
        <div>
            <Form
                onSubmit={handleFormSubmit}
                validate={validate}
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
                            <SignUpField
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

                        <Link to="/login">Cancel</Link>
                        <button type="submit" disabled={isLoading}>Submit</button>
                    </form>
                )}
            />
        </div>
    );
};

export default SignUp;