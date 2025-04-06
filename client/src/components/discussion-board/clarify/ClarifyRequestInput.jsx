import { Form, Field } from "react-final-form";
import { useCreateCommentMutation, useCreateSubCommentMutation } from "../../../store";

const ClarifyRequestInput = ({ showClarificationComment, setShowClarificationComment, promptId, responseId, studyId, location }) => {

    const [createComment, { error: errorComment, isLoading: isLoadingComment }] = useCreateCommentMutation();
    const [createSubcomment, { error: errorSubcomment, isLoading: isLoadingSubcomment }] = useCreateSubCommentMutation();

    const handleSubmitClarificationComment = async (commentContent) => {
        const comment = commentContent['facilitator-comment'];
        try {
            if (location === 'initialResponse') {
                await createComment({ promptId, responseId, content: comment, studyId });
            } else if (location === 'comment') {
                // Fix: Use the correct parameter name to match what createSubcomment expects
                await createSubcomment({ commentId: responseId, content: comment, studyId });
            }

        } catch (error) {
            console.error("Error submitting clarification:", error);
        }
        setShowClarificationComment(!showClarificationComment);
    }
    return (
        <div>
            <Form
                onSubmit={handleSubmitClarificationComment}
                render={({ handleSubmit }) => (
                    <form onSubmit={handleSubmit} className="needs-validation mb-3">
                        <Field
                            name="facilitator-comment"
                            component="textarea"
                            type="text"
                            className="form-control"
                            placeholder="Please specify what part of the response needs clarification..."
                        />
                        <Field name="facilitator-comment">
                            {({ meta }) => meta.error && meta.touched && <span className="text-danger">{meta.error}</span>}
                        </Field>
                        <div>
                            <button type="submit" className="mt-2 btn btn-success">Submit</button>
                            <button className="mt-2 ms-2 btn btn-secondary" onClick={() => setShowClarificationComment(!showClarificationComment)}>Cancel</button>
                        </div>
                    </form>
                )}
            >
            </Form>
        </div>
    );
};

export default ClarifyRequestInput;