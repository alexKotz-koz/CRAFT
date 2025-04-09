import { useState, useEffect } from "react";
import { Form, Field } from "react-final-form";
import FormField from "../form/FormField";
import FORM_FIELDS from "../form/userUpdateFormFields";
import { useNavigate } from "react-router-dom";
import { useLogoutUserMutation, usePasswordResetMutation, useUpdateUserMutation } from "../../store";
import { Spinner } from "reactstrap";
import ReactGA from "react-ga4";


const ParticipantInitialConfig = ({ user }) => {
    
    useEffect(() => {
        ReactGA.send({
            hitType: "pageview",
            page: "/participant-config",
            title: "Participant Config - CRAFT",
        });
    }, []);
    
    const navigate = useNavigate();

    const [jobRole, setJobRole] = useState("");
    const [jobDepartment, setJobDepartment] = useState("");
    const [jobOrganization, setJobOrganization] = useState("");


    const [passwordReset, { isLoading: isLoadingPasswordReset, error: errorPasswordReset }] = usePasswordResetMutation();
    const [updateUser, { isLoading: isLoadingUpdateUser, error: errorUpdateUser }] = useUpdateUserMutation();
    const [logoutUser, { isLoading: isLoadingLogoutUser, error: errorLogoutUser }] = useLogoutUserMutation();


    if (isLoadingPasswordReset || isLoadingUpdateUser) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
                <Spinner color="primary" />
            </div>
        );
    }

    if (errorPasswordReset || errorUpdateUser) {
        return <div>Error: {errorPasswordReset?.data.error || errorUpdateUser?.data.error}</div>;
    }

    const handleLogout = async () => {
        try {
            await logoutUser().unwrap(); // Ensure the logout request is successful
            navigate('/login'); // Redirect to the login page
        } catch (error) {
            console.error("Error during logout:", error);
        }
    };

    const handleFormSubmit = (values) => {
        const currentPassword = values.currentPassword;
        const newPassword = values.newPassword;
        const email = user.email;
        const passwordResetValues = {email, currentPassword, newPassword}
        const jobRole = values.jobRole;
        const jobDepartment = values.jobDepartment;
        const jobYears = values.jobYears;
        const username = user.username;
        const updateUserValues = {username, jobRole, jobDepartment, jobYears}
        try {
            updateUser(updateUserValues).unwrap()
            passwordReset(passwordResetValues).unwrap();
            handleLogout();
          } catch (error) {
            console.error("handleFormSubmit", error);
          }
 
    }
    const validate = (values) => {
        const errors = {};
        if (values.newPassword === values.currentPassword){
            errors.newPassword = "New password cannot be the same as your old password";
        }
        if (values.newPassword !== values.confirmPassword) {
            errors.confirmPassword = "Passwords do not match";
        }
        return errors;
    }

    return (
        <div className="container mb-3">
            <h3>Initial Account Configuration</h3>
            <Form
                onSubmit={handleFormSubmit}
                validate={validate}
                render={({ handleSubmit }) => {
                    return (
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
                        {errorUpdateUser && <div style={{ color: 'red' }}>{errorUpdateUser?.data}</div>}

                            <div className="d-flex justify-content-end mt-3">
                                <button type="submit" className="btn btn-primary px-4 gap-3" disabled={isLoadingUpdateUser}>Submit</button>
                                <button type="button" className="btn btn-secondary px-4">Cancel</button>
                            </div>
                        </form>
                    )

                }}
            />
        </div>
    );
};


export default ParticipantInitialConfig