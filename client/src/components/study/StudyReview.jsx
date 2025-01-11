import { Field, Form } from "react-final-form";

const StudyReview = ({ onSubmit, onCancel, formValues, isLoading, error }) => {
    var emailList = formValues.emailList;
    var promptList = formValues.promptList;

    return (
        <div>
            <h3>Review Your Study</h3>
            <Form
                onSubmit={onSubmit}
                render={({ handleSubmit }) => (
                    <form onSubmit={handleSubmit}>
                        <label>Study Name</label>
                        <div >{formValues.name}</div>

                        <label>Description</label>
                        <div>{formValues.description}</div>

                        <label>Instructions</label>
                        <div>{formValues.instructions}</div>

                        <label>Participants</label>

                        {emailList.map(({email, username}, index) => (
                            <div key={index}>Email: {email} | Username: {username}</div>
                        ))}

                        <label>Prompts</label>
                        {promptList.map((prompt, index) => (
                            <div key={index}>{prompt}</div>
                        ))}
                        {error && <p>Error: {error.data.error}</p>}
                        <div className="d-flex justify-content-between mt-3">
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