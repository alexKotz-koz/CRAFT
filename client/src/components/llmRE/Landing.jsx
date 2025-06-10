import { Spinner } from "reactstrap";
import ButtonLink from "../tools/ButtonLink"

const LLMRELanding = ({ currentUserRole, currentUserUsername, currentUserFirst, currentUserLast }) => {

    if (!currentUserRole || !currentUserUsername) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
                <Spinner color="primary" />
            </div>
        );
    }

    const renderFacilitator = () => {
        return (
            <div>
                <h3 className="text-center mb-4">LLM Response Evaluation - Facilitator</h3>
                <div className="container py-5">

                    <div className="row">
                        <div className="col">
                            <ButtonLink to="/llm-response-evaluation/create" text="Create New LLM Response Evaluation" additionalClasses="btn-primary" />
                        </div>
                    </div>
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