import { useParams } from "react-router-dom";
import { useFetchStudyQuery } from "../../store";

const Study = ({ user }) => {
    const { studyId } = useParams();
    const { data: study, error: errorStudy, isLoading: isLoadingStudy } = useFetchStudyQuery(studyId);

    if (isLoadingStudy) return <div className="text-center mt-5">Loading...</div>;
    if (errorStudy) return <div className="alert alert-danger mt-5">Error: {errorStudy.message}</div>;

    return (
        <div className="container mt-5">
            <h1 className="mb-4">{study.name}</h1>
            <p className="lead">{study.description}</p>
            {study.prompts.map((prompt, idx) => {
                const promptId = prompt._id;
                const responseForPrompt = study.responses[0].responses.find(response => response.prompt === promptId);

                return (
                    <div key={idx} className="card mb-4">
                        <div className="card-body">
                            <h3 className="card-title">{prompt.prompt}</h3>
                            {responseForPrompt ? (
                                <div>
                                    <p className="card-text">{responseForPrompt.response}</p>
                                    <div className="mt-3">
                                        <h5>Comments:</h5>
                                        {responseForPrompt.comments.length > 0 ? (
                                            responseForPrompt.comments.map((comment, idx) => (
                                                <div key={idx} className="border rounded p-2 mb-2">
                                                    <p className="mb-1">{comment.content}</p>
                                                    <small className="text-muted">By: {comment.user.username}</small>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-muted">No comments yet.</p>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <p className="text-muted">No response for this prompt.</p>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default Study;