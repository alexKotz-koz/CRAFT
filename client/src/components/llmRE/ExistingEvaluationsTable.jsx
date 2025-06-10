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
            <table className="table table-striped">
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
        </div>
    );
};

export default ExistingEvaluationsTable;