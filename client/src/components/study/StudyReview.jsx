import { Field, Form } from "react-final-form";

const StudyReview = ({ onSubmit, onCancel, formValues, isLoading, error }) => {
    var emailList = formValues.emailList;
    var promptList = formValues.promptList;

    return (
        <div className="container mt-5">
            <h3 className="text-center mb-4">Review Your Study</h3>
            <Form
                onSubmit={onSubmit}
                render={({ handleSubmit }) => (
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <h4>Study Name</h4>
                            <div className="fw-bold">{formValues.name}</div>
                        </div>

                        <div className="mb-3">
                            <h4 className="form-label">Description</h4>
                            <div>{formValues.description}</div>
                        </div>

                        <div className="mb-3">
                            <h4 className="form-label">Instructions</h4>
                            <div>{formValues.instructions}</div>
                        </div>

                        <div className="mb-3">
                            <h4 className="form-label">Participants</h4>
                            {emailList.map(({ email, username }, index) => (
                                <div key={index} className="mb-2">
                                    <span className="fw-bold">Email:</span> {email} | <span className="fw-bold">Username:</span> {username}
                                </div>
                            ))}
                        </div>

                        <div className="mb-3">
                            <h4 className="form-label">Prompts</h4>
                            {promptList.map((prompt, index) => (
                                <div key={index} className="mb-2">{prompt}</div>
                            ))}
                        </div>

                        {error && (error.data.message || error.data.error) && <p className="text-danger">Error: {error.data.message || error.data.error}</p>}

                        <div className="d-flex justify-content-between mt-4">
                            <button type="button" className="btn btn-secondary" onClick={onCancel}>
                                Back
                            </button>
                            <button type="submit" className="btn btn-primary">
                                Submit
                            </button>
                        </div>
                    </form>
                )}
            />
        </div>
    );
};

export default StudyReview;