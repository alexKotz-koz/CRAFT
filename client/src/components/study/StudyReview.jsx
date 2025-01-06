import { forEach } from "lodash";
import { Field, Form } from "react-final-form";

const StudyReview = ({ onSubmit, onCancel, formValues }) => {
    console.log(formValues);
    var emailList = formValues.emailList;
    var promptList = formValues.promptList;
    console.log(emailList, " ", promptList)

    return (
        <div>
            <h3>Review Your Study</h3>
            <Form
                onSubmit={onSubmit}
                render={({ handleSubmit }) => (
                    <form onSubmit={handleSubmit}>
                        <label>Study Name</label>
                        <div >{formValues.name}</div>

                        <label>Instructions</label>
                        <div>{formValues.instructions}</div>

                        <label>Participants</label>

                        {emailList.map((email, index) => (
                            <div key={index}>{email}</div>
                        ))}

                        <label>Prompts</label>
                        {promptList.map((prompt, index) => (
                            <div key={index}>{prompt}</div>
                        ))}

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