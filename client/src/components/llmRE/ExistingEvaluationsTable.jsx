import { Link } from "react-router-dom";

const ExistingEvaluationsTable = ({ existingEvaluations }) => {

    const handleFormatType = (type) => {
        switch(type){
            case "SectionsLLMResponseEvaluation":
                return "Sections of an LLM Transcript"
            case "FullLLMResponseEvaluation":
                return "Full LLM Transcript"
            default:
                break;
        }
    }

    return (
        <div>
            {/* Desktop Table */}
            <table className="table table-striped d-none d-md-table">
                <thead>
                    <tr>
                        <th scope="col">#</th>
                        <th scope="col">Title</th>
                        <th scope="col">Type</th>
                        <th scope="col"># of Rubric Items</th>
                        <th scope="col">Date Created</th>
                    </tr>
                </thead>
                <tbody>
                    {existingEvaluations && existingEvaluations.length > 0 ? (
                        existingEvaluations.map((evalItem, idx) => (
                            <tr key={evalItem._id}>
                                <th scope="row">{idx + 1}</th>
                                <td>
                                    <Link to={`/llm-response-evaluation/${evalItem._id}`} className="text-decoration-none text-primary">
                                        {evalItem.title}
                                    </Link>
                                </td>
                                <td>{handleFormatType(evalItem.kind)}</td>
                                <td>{evalItem.rubricItems ? evalItem.rubricItems.length : 0}</td>
                                <td>{new Date(evalItem.createdAt).toLocaleString()}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="5" className="text-center">No evaluations found.</td>
                        </tr>
                    )}
                </tbody>
            </table>
            {/* Mobile Cards */}
            <div className="d-block d-md-none">
                {existingEvaluations && existingEvaluations.length > 0 ? (
                    existingEvaluations.map((evalItem, idx) => (
                        <div className="card mb-3" key={evalItem._id}>
                            <div className="card-body">
                                <h5 className="card-title mb-2">
                                    <Link to={`/llm-response-evaluation/${evalItem._id}`} className="text-decoration-none text-primary">
                                        {evalItem.title}
                                    </Link>
                                </h5>
                                <p className="card-text mb-1"><strong>Type:</strong> {handleFormatType(evalItem.kind)}</p>
                                <p className="card-text mb-1"><strong>Rubric Items:</strong> {evalItem.rubricItems ? evalItem.rubricItems.length : 0}</p>
                                <p className="card-text mb-1"><strong>Date:</strong> {new Date(evalItem.createdAt).toLocaleString()}</p>
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

export default ExistingEvaluationsTable;