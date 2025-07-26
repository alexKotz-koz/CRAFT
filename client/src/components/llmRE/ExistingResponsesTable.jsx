import { Link } from "react-router-dom";

const ExsitingResponsesTable = ({ existingResponses }) => {

    const handleFormatType = (type) => {
        switch (type) {
            case "SectionsLLMResponseEvaluation":
                return "Sections of an LLM Transcript"
            case "FullLLMResponseEvaluation":
                return "Full LLM Transcript"
            default:
                break;
        }
    };

    return (
        <div>
            {/* Desktop Table */}
            <table className="table table-striped d-none d-md-table">
                <thead>
                    <tr>
                        <th scope="col">#</th>
                        <th scope="col">LLM Response Evaluation Title</th>
                        <th scope="col">Type</th>
                        <th scope="col">Participant Username</th>
                        <th scope="col">Date Created</th>
                    </tr>
                </thead>
                <tbody>
                    {existingResponses && existingResponses.length > 0 ? (
                        existingResponses.map((response, idx) => {
                            if (!response.evaluationId || response.evaluationId === null || response.evaluationId === undefined) {
                                return (
                                    <tr key={response._id || idx}>
                                        <td colSpan="5" className="text-center text-muted">Bad Record for User: {response.userId.username}</td>
                                    </tr>
                                );
                            }
                            return (
                                <tr key={response._id}>
                                    <th scope="row">{idx + 1}</th>
                                    <td>
                                        <Link
                                            to={`/llm-response-evaluation/readonly/${response.evaluationId?._id || response.evaluationId}/${response._id}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            {response.evaluationId?.title || 'N/A'}
                                        </Link>
                                    </td>
                                    <td>{handleFormatType(response.evaluationId?.kind)}</td>
                                    <td>{response.userId?.username || 'N/A'}</td>
                                    <td>{new Date(response.createdAt).toLocaleString()}</td>
                                </tr>
                            );
                        })
                    ) : (
                        <tr>
                            <td colSpan="5" className="text-center">No evaluations found.</td>
                        </tr>
                    )}
                </tbody>
            </table>
            {/* Mobile Cards */}
            <div className="d-block d-md-none">
                {existingResponses && existingResponses.length > 0 ? (
                    existingResponses.map((response, idx) => (
                        <div className="card mb-3" key={response._id}>
                            <div className="card-body">
                                <h5 className="card-title mb-2">
                                    {response.evaluationId?.title || 'Bad Record'}
                                </h5>
                                <p className="card-text mb-1"><strong>Type:</strong> {response.evaluationId?.kind ? handleFormatType(response.evaluationId.kind) : 'N/A'}</p>
                                <p className="card-text mb-1"><strong>Participant Username:</strong> {response.userId?.username || 'N/A'}</p>
                                <p className="card-text mb-1"><strong>Date:</strong> {new Date(response.createdAt).toLocaleString()}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center text-muted">No evaluations found.</div>
                )}
            </div>
        </div>
    );
};

export default ExsitingResponsesTable;