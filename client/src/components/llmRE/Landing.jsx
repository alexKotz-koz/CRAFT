import { Spinner, Card, CardBody, Badge, Alert, Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import ButtonLink from "../tools/ButtonLink"
import ExistingEvaluationsTable from "./ExistingEvaluationsTable";
import ExsitingResponsesTable from "./ExistingResponsesTable";
import AssignNewParticipantsTable from "./AssignNewParticipantsTable";
import { useFetchAllEvaluationsQuery, useFetchAllUserEvaluationResponsesQuery, useLazyFetchUserResponsesForDownloadQuery } from "../../store";
import { useState, useEffect } from "react";

const LLMRELanding = ({ currentUserRole, currentUserUsername, currentUserFirst, currentUserLast }) => {
    const { data: allEvaluations, isLoading: isLoadingAllEvalutions, error: errorAllEvaluations } = useFetchAllEvaluationsQuery();
    const { data: allResponses, isLoading: isLoadingAllResponses, error: errorAllResponses } = useFetchAllUserEvaluationResponsesQuery();
    const [triggerDownload, { data: userResponsesForDownload, isLoading: isLoadingUserResponses, error: errorUserResponses }] = useLazyFetchUserResponsesForDownloadQuery();
    const [showExistingEvaluations, setShowExistingEvaluations] = useState(false);
    const [showExistingResponses, setShowExistingResponses] = useState(false);
    const [showDownloadModal, setShowDownloadModal] = useState(false);
    const [showAssignNewParticipants, setShowAssignNewParticipants] = useState(false);
    const [downloadReady, setDownloadReady] = useState(false);
    const [selectedEvaluation, setSelectedEvaluation] = useState(null);
    const [selectedParticipants, setSelectedParticipants] = useState([]);

    useEffect(() => {
        if (userResponsesForDownload) {
            handleShowDownloadModal();
            formatDataForDownload(userResponsesForDownload);
            setSelectedEvaluation(null);
            setSelectedParticipants([]);
            setDownloadReady(true); // set ready after download
        }
    }, [userResponsesForDownload]);

    if (isLoadingAllEvalutions || isLoadingAllResponses || isLoadingUserResponses) {
        return (
            <div className="d-flex flex-column justify-content-center align-items-center" style={{ height: '60vh' }}>
                <Spinner color="primary" />
                <p className="mt-3 text-muted">Loading evaluations...</p>
            </div>
        );
    }
    if (errorAllEvaluations || errorAllResponses || errorUserResponses) {
        return (
            <div className="container mt-4">
                <Alert color="danger" className="text-center">
                    <h4 className="alert-heading">Error Loading Evaluations</h4>
                    <p className="mb-0">{errorAllEvaluations?.message || errorAllResponses?.message || errorUserResponses?.message || errorAllEvaluations || errorAllResponses || errorUserResponses}</p>
                </Alert>
            </div>
        );
    }

    if (!currentUserRole || !currentUserUsername) {
        return (
            <div className="d-flex flex-column justify-content-center align-items-center" style={{ height: '60vh' }}>
                <Spinner color="primary" />
                <p className="mt-3 text-muted">Loading user information...</p>
            </div>
        );
    }


    //console.log("allEvaluations: ", allEvaluations)


    const handleShowExistingEvaluations = () => {
        setShowExistingEvaluations(!showExistingEvaluations);
    };

    const handleShowExistingResponses = () => {
        setShowExistingResponses(!showExistingResponses);
    };

    const handleShowDownloadModal = () => {
        setShowDownloadModal(!showDownloadModal);
        setDownloadReady(false);
    };
    const handleDownloadEvaluationResponses = ({ selectedEvaluation, selectedParticipants }) => {
        //console.log("Download evaluation: ", selectedEvaluation);
        //console.log("For: ", selectedParticipants);
        triggerDownload({ evaluationId: selectedEvaluation._id, participantIds: selectedParticipants });
    };

    const handleShowAssignNewParticipants = () => {
        setShowAssignNewParticipants(!showAssignNewParticipants);
    }

    const downloadFile = (content, fileName, contentType) => {
        const a = document.createElement('a');
        const file = new Blob([content], { type: contentType });
        a.href = URL.createObjectURL(file);
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(a.href);
    };

    const formatDataForDownload = (downloadableData) => {
        if (!downloadableData || !Array.isArray(downloadableData) || downloadableData.length === 0) return;

        const evalKind = downloadableData[0]?.evaluationId?.kind || "FullLLMResponseEvaluation";
        const rubricItems = downloadableData[0]?.evaluationId?.rubricItems || [];
        const isSections = evalKind === "SectionsLLMResponseEvaluation";

        // Headers
        const headers = [
            "participantUsername",
            "participantEmail",
            ...(isSections ? ["sectionId"] : []),
            "rubricItem",
            "rubricItemResponse",
            "rubricItemFeedback"
        ];

        // Build rows
        const rows = [];

        downloadableData.forEach(response => {
            const username = response.userId?.username || "";
            const email = response.userId?.email || "";

            (response.responses || []).forEach(section => {
                rubricItems.forEach(rubricItem => {
                    const rubricResponse = (section.rubricResponses || []).find(
                        rr => rr.itemId === rubricItem.itemId
                    );
                    if (rubricResponse) {
                        let responseValue = "";
                        if (
                            rubricResponse.selectedRadioOption &&
                            rubricResponse.selectedRadioOption !== ""
                        ) {
                            responseValue = rubricResponse.selectedRadioOption;
                        } else if (
                            rubricResponse.selectedCheckboxOptions &&
                            rubricResponse.selectedCheckboxOptions.length > 0
                        ) {
                            responseValue = rubricResponse.selectedCheckboxOptions.join(" | ");
                        }

                        rows.push([
                            username,
                            email,
                            ...(isSections ? [String(section.sectionId)] : []),
                            rubricItem.caption,
                            responseValue,
                            rubricResponse.feedback || ""
                        ]);
                    }
                });
            });
        });

        // Convert to CSV string
        const csvContent = [
            headers.join(","),
            ...rows.map(row =>
                row
                    .map(field =>
                        `"${String(field).replace(/"/g, '""')}"`
                    )
                    .join(",")
            )
        ].join("\r\n");

        const safeTitle = (downloadableData[0]?.evaluationId?.title || "llm_evaluation_responses")
            .replace(/[^a-z0-9_\-]+/gi, "_"); // sanitize for filename

        downloadFile(
            csvContent,
            `${safeTitle}.csv`,
            "text/csv"
        );
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

        const uniqueParticipantsSet = new Set();
        (allEvaluations || []).forEach(evaluation => {
            (evaluation.participants || []).forEach(participant => {
                if (participant.username) uniqueParticipantsSet.add(participant.username);
            });
        });
        const totalUniqueParticipants = uniqueParticipantsSet.size;


        const uniqueRespondedParticipants = Array.from(
            new Map(
                (allEvaluations || [])
                    .flatMap(evaluation => evaluation.participants || [])
                    .filter(participant => participant.responded)
                    .map(participant => [participant._id, participant])
            ).values()
        );
        const totalRespondedParticipants = uniqueRespondedParticipants.length;

        return (
            <div>
                {renderWelcomeHeader()}
                <div className="container">
                    {/* Quick Stats */}
                    <div className="row mb-4">
                        <div className="col-md-4">
                            <Card className="text-center border-0 shadow-sm">
                                <CardBody>
                                    <div className="display-4 text-primary mb-2">{totalUniqueParticipants}</div>
                                    <h6 className="text-muted">Total Participants</h6>
                                </CardBody>
                            </Card>
                        </div>
                        <div className="col-md-4">
                            <Card className="text-center border-0 shadow-sm">
                                <CardBody>
                                    <div className="display-4 text-primary mb-2">{totalRespondedParticipants}/{totalUniqueParticipants}</div>
                                    <h6 className="text-muted">Completed Evaluations</h6>
                                </CardBody>
                            </Card>
                        </div>
                        <div className="col-md-4">
                            <Card className="text-center border-0 shadow-sm">
                                <CardBody>
                                    <div className="display-4 text-primary mb-2">{totalEvaluations}</div>
                                    <h6 className="text-muted">Total Evaluations</h6>
                                </CardBody>
                            </Card>
                        </div>
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

                        {/**Download Responses Card */}
                        <div className="col-md-6">
                            <Card className="h-100 border-0 shadow-sm hover-shadow">
                                <CardBody className="d-flex flex-column">
                                    <div className="d-flex align-items-center mb-3">
                                        <div className="bg-success bg-opacity-10 rounded-circle p-3 me-3">
                                            <i className="fas fa-list text-warning fs-4"></i>
                                        </div>
                                        <h5 className="mb-0">Download Evaluation Responses</h5>
                                    </div>
                                    <p className="text-muted mb-4 flex-grow-1">
                                        Select an LLM response evaluation to download existing participant responses.
                                    </p>
                                    <button
                                        className="btn btn-success w-100"
                                        onClick={handleShowDownloadModal}
                                    >
                                        Download Responses
                                    </button>
                                </CardBody>
                            </Card>
                        </div>

                    </div>
                    {/** Assign New Participants Card */}
                    <div className="row g-4 mb-5">
                        <div className="col-md-6">
                            <Card className="h-100 border-0 shadow-sm hover-shadow">
                                <CardBody className="d-flex flex-column">
                                    <div className="d-flex align-items-center mb-3">
                                        <div className="bg-warning bg-opacity-10 rounded-circle p-3 me-3">
                                            <i className="fas fa-list text-warning fs-4"></i>
                                        </div>
                                        <h5 className="mb-0">Assign New Participants</h5>
                                    </div>
                                    <p className="text-muted mb-4 flex-grow-1">Assign New Participants</p>
                                    <button
                                        className={showAssignNewParticipants ? `btn btn-outline-warning w-100` : `btn btn-warning w-100`}
                                        onClick={handleShowAssignNewParticipants}
                                    >
                                        {showAssignNewParticipants ? 'Hide' : 'Show'} Assignments
                                    </button>
                                </CardBody>
                            </Card>
                        </div>
                    </div>
                    {/** View Evaluations Card */}
                    <div className="row g-4 mb-5">
                        <div className="col-md-6">
                            <Card className="h-100 border-0 shadow-sm hover-shadow">
                                <CardBody className="d-flex flex-column">
                                    <div className="d-flex align-items-center mb-3">
                                        <div className="bg-info bg-opacity-10 rounded-circle p-3 me-3">
                                            <i className="fas fa-list text-info fs-4"></i>
                                        </div>
                                        <h5 className="mb-0">View Evaluations</h5>
                                    </div>
                                    <p className="text-muted mb-4 flex-grow-1">
                                        View existing evaluations.
                                    </p>
                                    <button
                                        className={showExistingEvaluations ? `btn btn-outline-info w-100` : `btn btn-info w-100`}
                                        onClick={handleShowExistingEvaluations}
                                    >
                                        {showExistingEvaluations ? 'Hide' : 'Show'} Evaluations
                                        <i className={`fas fa-chevron-${showExistingEvaluations ? 'up' : 'down'} ms-2`}></i>
                                    </button>
                                </CardBody>
                            </Card>
                        </div>
                        {/** View Responses Card */}
                        <div className="col-md-6">
                            <Card className="h-100 border-0 shadow-sm hover-shadow">
                                <CardBody className="d-flex flex-column">
                                    <div className="d-flex align-items-center mb-3">
                                        <div className="bg-info bg-opacity-10 rounded-circle p-3 me-3">
                                            <i className="fas fa-list text-info fs-4"></i>
                                        </div>
                                        <h5 className="mb-0">View Responses</h5>
                                    </div>
                                    <p className="text-muted mb-4 flex-grow-1">
                                        View participant responses.
                                    </p>
                                    <button
                                        className={showExistingResponses ? `btn btn-outline-info w-100` : `btn btn-info w-100`}
                                        onClick={handleShowExistingResponses}
                                    >
                                        {showExistingResponses ? 'Hide' : 'Show'} Responses
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
                    {/* Existing Responses Table */}
                    {showExistingResponses && (
                        <div className="mb-4">
                            <Card className="border-0 shadow-sm">
                                <CardBody>
                                    <h5 className="card-title mb-3">
                                        <i className="fas fa-table me-2"></i>
                                        Existing Responses
                                    </h5>
                                    <ExsitingResponsesTable existingResponses={allResponses} />
                                </CardBody>
                            </Card>
                        </div>
                    )}
                    {/** Assign New Participants Table */}
                    {showAssignNewParticipants && (
                        <div className="mb-4">
                            <Card className="border-0 shadow-sm">
                                <CardBody>
                                    <h5 className="card-title mb-3">
                                        <i className="fas fa-table me-2"></i>
                                        Responses
                                    </h5>
                                    <AssignNewParticipantsTable evaluations={allEvaluations} />
                                </CardBody>
                            </Card>
                        </div>
                    )}
                    {/* Download Modal */}
                    {showDownloadModal && (
                        <div>
                            <Modal isOpen={showDownloadModal}>
                                <ModalHeader>Select Evaluation and Participants</ModalHeader>
                                <ModalBody>
                                    {!selectedEvaluation ? (
                                        <div>
                                            <h6>Select an Evaluation</h6>
                                            <div>
                                                {isLoadingUserResponses ? (
                                                    <div className="text-center my-4">
                                                        <Spinner color="primary" />
                                                        <div className="mt-2 text-muted">Preparing download...</div>
                                                    </div>
                                                ) : (
                                                    (allEvaluations || []).map(evaluation => (
                                                        <div key={evaluation._id} className="form-check mb-2">
                                                            <input
                                                                className="form-check-input"
                                                                type="radio"
                                                                name="evaluationRadio"
                                                                id={`eval_${evaluation._id}`}
                                                                value={evaluation._id}
                                                                checked={selectedEvaluation && selectedEvaluation._id === evaluation._id}
                                                                onChange={() => {
                                                                    setSelectedEvaluation(evaluation);
                                                                    setSelectedParticipants([]); // reset participants on new eval
                                                                }}
                                                            />
                                                            <label className="form-check-label" htmlFor={`eval_${evaluation._id}`}>
                                                                {evaluation.title}
                                                            </label>
                                                        </div>
                                                    ))
                                                )}
                                                {errorUserResponses && (
                                                    <Alert color="danger" className="mt-3">
                                                        {errorUserResponses.message || "Error preparing download."}
                                                    </Alert>
                                                )}
                                                {downloadReady && (
                                                    <Alert color="success" className="mt-3">
                                                        Download ready! {/* Or trigger your download logic here */}
                                                    </Alert>
                                                )}

                                            </div>
                                        </div>
                                    ) : (
                                        <div>
                                            <h6>Select Participants</h6>

                                            {/* Check All Checkbox */}
                                            <div className="form-check mb-2">
                                                <input
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    id="checkAllParticipants"
                                                    checked={
                                                        (selectedEvaluation.participants || [])
                                                            .filter(p => p.responded !== false)
                                                            .every(p => selectedParticipants.includes(p._id))
                                                        && (selectedEvaluation.participants || []).some(p => p.responded !== false)
                                                    }
                                                    onChange={e => {
                                                        if (e.target.checked) {
                                                            setSelectedParticipants(
                                                                (selectedEvaluation.participants || [])
                                                                    .filter(p => p.responded !== false)
                                                                    .map(p => p._id)
                                                            );
                                                        } else {
                                                            setSelectedParticipants([]);
                                                        }
                                                    }}
                                                />
                                                <label className="form-check-label fw-bold" htmlFor="checkAllParticipants">
                                                    Select All
                                                </label>
                                            </div>
                                            <div>
                                                {(selectedEvaluation.participants || []).map(participant => (
                                                    <div key={participant._id} className="form-check mb-2">
                                                        <input
                                                            className="form-check-input"
                                                            type="checkbox"
                                                            id={`participant_${participant._id}`}
                                                            value={participant._id}
                                                            checked={selectedParticipants.includes(participant._id)}
                                                            onChange={e => {
                                                                if (e.target.checked) {
                                                                    setSelectedParticipants(prev => [...prev, participant._id]);
                                                                } else {
                                                                    setSelectedParticipants(prev => prev.filter(p => p._id !== participant._id));
                                                                }
                                                            }}
                                                            disabled={participant.responded === false}
                                                        />
                                                        <label className="form-check-label" htmlFor={`participant_${participant._id}`}>
                                                            {participant.username} ({participant.email})
                                                        </label>
                                                    </div>
                                                ))}
                                            </div>
                                            <Button
                                                color="secondary"
                                                className="mb-2 p-2"
                                                onClick={() => {
                                                    setSelectedEvaluation(null);
                                                    setSelectedParticipants([]);
                                                }}
                                            >
                                                &larr; Back to Evaluations
                                            </Button>
                                        </div>
                                    )}
                                </ModalBody>
                                <ModalFooter>
                                    <Button color="primary" onClick={() => handleDownloadEvaluationResponses({ selectedEvaluation, selectedParticipants })}>
                                        Download
                                    </Button>
                                    <Button color="secondary" onClick={handleShowDownloadModal}>
                                        Cancel
                                    </Button>
                                </ModalFooter>
                            </Modal>
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