import { Spinner, Card, CardBody, Badge, Alert } from "reactstrap";
import ButtonLink from "../tools/ButtonLink"
import ExistingEvaluationsTable from "./ExistingEvaluationsTable";
import { useFetchAllEvaluationsQuery } from "../../store";
import { useState } from "react";

const LLMRELanding = ({ currentUserRole, currentUserUsername, currentUserFirst, currentUserLast }) => {
    const { data: allEvaluations, isLoading, error } = useFetchAllEvaluationsQuery();
    const [showExistingEvaluations, setShowExistingEvaluations] = useState(false);

    if (isLoading) {
        return (
            <div className="d-flex flex-column justify-content-center align-items-center" style={{ height: '60vh' }}>
                <Spinner color="primary" />
                <p className="mt-3 text-muted">Loading evaluations...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mt-4">
                <Alert color="danger" className="text-center">
                    <h4 className="alert-heading">Error Loading Evaluations</h4>
                    <p className="mb-0">{error?.message || error}</p>
                </Alert>
            </div>
        );
    }

    if (!currentUserRole || !currentUserUsername) {
        return (
            <div className="d-flex flex-column justify-content-center align-items-center" style={{ height: '60vh' }}>
                <Spinner color="primary" size="lg" />
                <p className="mt-3 text-muted">Loading user information...</p>
            </div>
        );
    }

    const handleShowExistingEvaluations = () => {
        setShowExistingEvaluations(!showExistingEvaluations);
    };

    const getRoleDisplayName = (role) => {
        switch (role) {
            case 'facilitator': return 'Facilitator';
            case 'participant': return 'Participant';
            case 'admin': return 'Administrator';
            default: return 'User';
        }
    };

    const getRoleBadgeColor = (role) => {
        switch (role) {
            case 'facilitator': return 'danger';
            case 'participant': return 'success';
            case 'admin': return 'warning';
            default: return 'secondary';
        }
    };

    const renderWelcomeHeader = () => (
        <div className="bg-light border-bottom mb-4">
            <div className="container py-4">
                <div className="row align-items-center">
                    <div className="col-md-8">
                        <h1 className="display-6 mb-2">LLM Response Evaluation</h1>
                        <p className="lead text-muted mb-0">
                            Welcome back, {currentUserFirst} {currentUserLast}
                        </p>
                    </div>
                    <div className="col-md-4 text-md-end">
                        <Badge color={getRoleBadgeColor(currentUserRole)} pill className="fs-6 px-3 py-2">
                            {getRoleDisplayName(currentUserRole)}
                        </Badge>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderFacilitator = () => {
        const totalEvaluations = Array.isArray(allEvaluations) ? allEvaluations.length : 0;
        
        return (
            <div>
                {renderWelcomeHeader()}
                <div className="container">
                    {/* Quick Stats */}
                    <div className="row mb-4">
                        <div className="col-md-4">
                            <Card className="text-center border-0 shadow-sm">
                                <CardBody>
                                    <div className="display-4 text-primary mb-2">{totalEvaluations}</div>
                                    <h6 className="text-muted">Total Evaluations</h6>
                                </CardBody>
                            </Card>
                        </div>
                        {/*<div className="col-md-4">
                            <Card className="text-center border-0 shadow-sm">
                                <CardBody>
                                    <div className="display-4 text-success mb-2">
                                        <i className="fas fa-plus-circle"></i>
                                    </div>
                                    <h6 className="text-muted">Ready to Create</h6>
                                </CardBody>
                            </Card>
                        </div> 
                        <div className="col-md-4">
                            <Card className="text-center border-0 shadow-sm">
                                <CardBody>
                                    <div className="display-4 text-info mb-2">
                                        <i className="fas fa-chart-line"></i>
                                    </div>
                                    <h6 className="text-muted">Analytics Ready</h6>
                                </CardBody>
                            </Card>
                        </div>*/}
                    </div>

                    {/* Action Cards */}
                    <div className="row g-4 mb-5">
                        <div className="col-md-6">
                            <Card className="h-100 border-0 shadow-sm hover-shadow">
                                <CardBody className="d-flex flex-column">
                                    <div className="d-flex align-items-center mb-3">
                                        <div className="bg-primary bg-opacity-10 rounded-circle p-3 me-3">
                                            <i className="fas fa-plus text-primary fs-4"></i>
                                        </div>
                                        <h5 className="mb-0">Create New Evaluation</h5>
                                    </div>
                                    <p className="text-muted mb-4 flex-grow-1">
                                        Set up a new LLM response evaluation with custom rubrics and participants.
                                    </p>
                                    <ButtonLink 
                                        to="/llm-response-evaluation/create" 
                                        text="Create Evaluation" 
                                        additionalClasses="btn-primary w-100"
                                    />
                                </CardBody>
                            </Card>
                        </div>
                        
                        <div className="col-md-6">
                            <Card className="h-100 border-0 shadow-sm hover-shadow">
                                <CardBody className="d-flex flex-column">
                                    <div className="d-flex align-items-center mb-3">
                                        <div className="bg-info bg-opacity-10 rounded-circle p-3 me-3">
                                            <i className="fas fa-list text-info fs-4"></i>
                                        </div>
                                        <h5 className="mb-0">Manage Evaluations</h5>
                                    </div>
                                    <p className="text-muted mb-4 flex-grow-1">
                                        View, edit, and manage your existing evaluations and participant responses.
                                    </p>
                                    <button 
                                        className="btn btn-outline-info w-100" 
                                        onClick={handleShowExistingEvaluations}
                                    >
                                        {showExistingEvaluations ? 'Hide' : 'Show'} Evaluations
                                        <i className={`fas fa-chevron-${showExistingEvaluations ? 'up' : 'down'} ms-2`}></i>
                                    </button>
                                </CardBody>
                            </Card>
                        </div>
                    </div>

                    {/* Existing Evaluations Table */}
                    {showExistingEvaluations && (
                        <div className="mb-4">
                            <Card className="border-0 shadow-sm">
                                <CardBody>
                                    <h5 className="card-title mb-3">
                                        <i className="fas fa-table me-2"></i>
                                        Existing Evaluations
                                    </h5>
                                    <ExistingEvaluationsTable existingEvaluations={allEvaluations} />
                                </CardBody>
                            </Card>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const renderParticipant = () => {
        const userEvaluations = Array.isArray(allEvaluations)
            ? allEvaluations.filter(evaluation =>
                Array.isArray(evaluation.participants) &&
                evaluation.participants.some(
                    participant => participant.username === currentUserUsername
                )
            )
            : [];

        return (
            <div>
                {renderWelcomeHeader()}
                <div className="container">
                    {/* Stats Card */}
                    <div className="row mb-4">
                        <div className="col-md-6 mx-auto">
                            <Card className="text-center border-0 shadow-sm">
                                <CardBody>
                                    <div className="display-4 text-success mb-2">{userEvaluations.length}</div>
                                    <h6 className="text-muted">Assigned Evaluations</h6>
                                </CardBody>
                            </Card>
                        </div>
                    </div>

                    {/* Evaluations Content */}
                    <Card className="border-0 shadow-sm">
                        <CardBody>
                            <div className="d-flex align-items-center mb-4">
                                <div className="bg-success bg-opacity-10 rounded-circle p-3 me-3">
                                    <i className="fas fa-clipboard-check text-success fs-4"></i>
                                </div>
                                <h4 className="mb-0">Your Assigned Evaluations</h4>
                            </div>
                            
                            {userEvaluations.length === 0 ? (
                                <div className="text-center py-5">
                                    <div className="text-muted mb-3">
                                        <i className="fas fa-inbox fs-1"></i>
                                    </div>
                                    <h5 className="text-muted">No evaluations assigned</h5>
                                    <p className="text-muted">Check back later for new evaluation assignments.</p>
                                </div>
                            ) : (
                                <ExistingEvaluationsTable existingEvaluations={userEvaluations} />
                            )}
                        </CardBody>
                    </Card>
                </div>
            </div>
        );
    };

    switch (currentUserRole) {
        case 'facilitator':
        case 'admin':
            return renderFacilitator();
        case 'participant':
            return renderParticipant();
        default:
            return (
                <div className="container mt-4">
                    <Alert color="warning" className="text-center">
                        <h4 className="alert-heading">Access Issue</h4>
                        <p className="mb-0">
                            No user role defined. Please contact your system administrator for assistance.
                        </p>
                    </Alert>
                </div>
            );
    }
};

export default LLMRELanding;