import { Spinner } from "reactstrap";
import ButtonLink from "../tools/ButtonLink"
import ExistingEvaluationsTable from "./ExistingEvaluationsTable";
import { useFetchAllEvaluationsQuery } from "../../store";
import { useState } from "react";


const LLMRELanding = ({ currentUserRole, currentUserUsername, currentUserFirst, currentUserLast }) => {
    const { data: allEvaluations, isLoading, error } = useFetchAllEvaluationsQuery();
    const [showExistingEvaluations, setShowExistingEvaluations] = useState(false);

    if (isLoading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
                <Spinner color="primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="border border-danger rounded text-danger px-2 mt-2">
                {error}
            </div>
        )
    }

    if (!currentUserRole || !currentUserUsername) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
                <Spinner color="primary" />
            </div>
        );
    }

    const handleShowExistingEvaluations = () => {
        setShowExistingEvaluations(!showExistingEvaluations);
        console.log(allEvaluations)
    };

    const renderFacilitator = () => {
        return (
            <div>
                <h3 className="text-center mb-4">LLM Response Evaluation - Facilitator</h3>
                <div className="container py-5">
                    <div className="row">
                        <div className="col">
                            <ButtonLink to="/llm-response-evaluation/create" text="Create New LLM Response Evaluation" additionalClasses="btn-primary" />
                        </div>
                        <div className="col">
                            <button className="btn btn-primary" onClick={handleShowExistingEvaluations}>Show Existing LLM Response Evaluations</button>
                        </div>
                    </div>
                    {showExistingEvaluations ? (<ExistingEvaluationsTable existingEvaluations={allEvaluations} />) : (<div></div>) }
                    
                </div>
            </div>

        )
    };

    const renderParticipant = () => {
        return
    };

    switch (currentUserRole) {
        case 'facilitator':
            return renderFacilitator();
        case 'participant':
            return renderParticipant();
        case 'admin':
            return renderFacilitator();
        default:
            return 'No user role defined, please contact system adminstrator for assistance.'
    }

}

export default LLMRELanding;