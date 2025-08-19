import { Form, Field } from "react-final-form";
import { Spinner, Table } from "reactstrap";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFetchAllUsersQuery, useCreateConsentMutation } from "../../store";

const CreateNewConsent = () => {
    const navigate = useNavigate();
    const { data: users, isLoading: isLoadingAllUsers, error: errorAllUsers } = useFetchAllUsersQuery();
    const [createConsent, { isLoading: isLoadingCreateConsent, error: errorCreateConsent }] = useCreateConsentMutation();

    if (isLoadingAllUsers || isLoadingCreateConsent) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
                <Spinner color="primary" />
            </div>
        );
    }
    if (errorAllUsers || errorCreateConsent) {
        return (
            <div className="border border-danger rounded text-danger px-2 mt-2">
                {errorAllUsers || errorCreateConsent}
            </div>
        );
    }

    const participants = users ? users.filter(user => user.role === "participant") : [];

    const handleFormSubmit = async (values) => {
        try {
            const selectedIds = values.participants || [];
            const participantsPayload = selectedIds
                .map(id => {
                    const u = participants.find(p => p._id === id);
                    return u ? { _id: u._id, email: u.email, username: u.username } : null;
                })
                .filter(Boolean);

            const payload = {
                studyName: values.studyName,
                consent: values.consent,
                participants: participantsPayload,
            };

            await createConsent(payload).unwrap();
            navigate('/home');
        } catch (err) {
            console.error("Error creating consent: ", err);
        }
    };
    const required = (v) => (v ? undefined : "Required");

    return (
        <div className="container py-3">
            <h2>Create a New Consent Form</h2>

            <Form
                onSubmit={handleFormSubmit}
                render={({ handleSubmit, form, values, submitError }) => (
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label className="form-label" htmlFor="studyName">
                                Study Name
                            </label>
                            <Field name="studyName" validate={required}>
                                {({ input, meta }) => (
                                    <>
                                        <input
                                            {...input}
                                            id="studyName"
                                            type="text"
                                            className="form-control"
                                            placeholder="Enter study name for consent form"
                                        />
                                        {meta.touched && meta.error && (
                                            <span className="text-danger">{meta.error}</span>
                                        )}
                                    </>
                                )}
                            </Field>
                            <br />
                            <label className="form-label" htmlFor="consent">Consent Content</label>
                            <Field name="consent" validate={required}>
                                {({ input, meta }) => (
                                    <>
                                        <textarea
                                            {...input}
                                            id="consent"
                                            className="form-control"
                                            rows={12}
                                            placeholder="Enter consent content for consent form"
                                        />
                                        {meta.touched && meta.error && (
                                            <span className="text-danger">{meta.error}</span>
                                        )}
                                    </>
                                )}
                            </Field>
                            <br />
                            <label className="form-label">Participants</label>
                            <Table responsive size="sm" className="mb-2">
                                <thead>
                                    <tr>
                                        <th style={{ width: 60 }}>Select</th>
                                        <th>Username</th>
                                        <th>Email</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {participants.map((p) => (
                                        <tr key={p._id}>
                                            <td>
                                                <Field name="participants" type="checkbox" value={p._id}>
                                                    {({ input }) => (
                                                        <input
                                                            {...input}
                                                            type="checkbox"
                                                            aria-label={`Select ${p.username}`}
                                                        />
                                                    )}
                                                </Field>
                                            </td>
                                            <td>{p.username}</td>
                                            <td>{p.email}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                            <div className="d-flex align-items-center gap-2">
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary btn-sm"
                                    onClick={() => form.change('participants', participants.map(p => p._id))}
                                >
                                    Select All
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary btn-sm"
                                    onClick={() => form.change('participants', [])}
                                >
                                    Clear
                                </button>
                                <span className="ms-auto text-muted small">
                                    {(values.participantIds?.length || 0)} selected
                                </span>
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary">Create</button>
                    </form>
                )}
            />

        </div>
    );
};

export default CreateNewConsent;