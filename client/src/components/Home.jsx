import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import StudyCard from './tools/StudyCard';
import ConsentModal from './tools/modals/ConsentModal';
import { useFetchUserQuery, useFetchStudiesQuery, useFetchAllStudiesQuery, useFetchAllEvaluationsQuery, useFetchConsentStatusQuery } from "../store";
import { Spinner, Badge } from "reactstrap";
import '../static/custom.css';
import ReactGA from 'react-ga4';
import { Link } from 'react-router-dom';
//
const Home = () => {
    const navigate = useNavigate();
    const { data: user, error: userError, isLoading: isLoadingUser } = useFetchUserQuery();
    const { data: consents, isLoading: isLoadingConsents, error: errorConsents } = useFetchConsentStatusQuery();

    const isAdmin = user?.role === 'admin' || user?.role === 'facilitator';

    const {
        data: regularStudies,
        error: regularStudiesError,
        isLoading: isLoadingRegularStudies,
        refetch: refetchRegularStudies
    } = useFetchStudiesQuery(undefined, { skip: !user || isAdmin });

    const {
        data: allStudies,
        error: allStudiesError,
        isLoading: isLoadingAllStudies,
        refetch: refetchAllStudies
    } = useFetchAllStudiesQuery(undefined, { skip: !user || !isAdmin });

    const {
        data: allEvaluations,
        error: allEvaluationsError,
        isLoading: isLoadingAllEvaluations,
        refetch: refetchAllEvaluations
    } = useFetchAllEvaluationsQuery(undefined, { skip: !user || isAdmin });

    const userStudies = isAdmin ? allStudies : regularStudies;
    const studiesError = isAdmin ? allStudiesError : regularStudiesError;
    const isLoadingStudies = isAdmin ? isLoadingAllStudies : isLoadingRegularStudies;
    const refetch = isAdmin ? refetchAllStudies : refetchRegularStudies;

    const [respondedStatus, setRespondedStatus] = useState({});
    const [consentModalOpen, setConsentModalOpen] = useState(false);
    const [consentModalContent, setConsentModalContent] = useState([]);

    useEffect(() => {
        ReactGA.send({
            hitType: "pageview",
            page: "/home",
            title: "Home - CRAFT",
        });
    }, []);

    useEffect(() => {
        if (user) {
            refetch();
        }
    }, [user?._id, refetch]);

    // Set responded status for studies
    useEffect(() => {
        if (user && userStudies) {
            const status = {};
            userStudies.forEach(study => {
                const participant = study.participants.find(p => p.email === user.email);
                if (participant) {
                    status[study._id] = participant.responded;
                }
            });
            setRespondedStatus(status);
        }
    }, [userStudies, user]);

    // Redirect to participant config if first login
    useEffect(() => {
        if (user && user.firstLogin) {
            if (user.role === 'participant') {
                navigate(`/participant-config`);
            }
        }
    }, [user]);


    // Centralized logic for showing preface modal
    useEffect(() => {
        if (!user || !consents || user.role !== 'participant') return;

        const userMatches = (p) =>
            p && (p.username === user.username || p.email === user.email);

        const relevant = consents.filter((consent) =>
            (consent.participants || []).some(userMatches)
        );

        setConsentModalContent(relevant || []);
    }, [user, consents]);

    // Helper: does the user have any pending (not yet consented) consents?
    const hasPendingConsent = consentModalContent.some((c) =>
        (c.participants || []).some(
            (p) =>
                (p.username === user.username || p.email === user.email) &&
                p.consent === false
        )
    );

    const handleOpenConsentModal = () => setConsentModalOpen(!consentModalOpen);


    const hasLLMREs = allEvaluations?.some(evaluation =>
        evaluation.participants?.find(
            participant =>
                (participant.username === user.username || participant.email === user.email) &&
                participant.responded === false
        )
    );

    const isLoadingConsentLogic = !user || !consents || (user.role === 'participant' && consentModalContent.length === 0 && consents.length > 0);

    if (isLoadingUser || isLoadingStudies || isLoadingAllEvaluations || isLoadingConsents || isLoadingConsentLogic) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
                <Spinner color="primary" />
            </div>
        );
    }

    if (userError || studiesError || allEvaluationsError || errorConsents) {
        return <div>Error: {userError?.data?.error || studiesError?.data?.error || allEvaluationsError?.data?.error || errorConsents?.data?.error}
        </div>;
    }

    if (!user) {
        return <div>No user data available</div>;
    }

    // Helpers //////////////////////////////////////////////////////////////////////////////////////////////
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
        <div className=" bg-light border-bottom mb-4">
            <div className="container py-3">
                <div className="row align-items-center">
                    <div className="col-md-8">
                        <h1 className="display-6 mb-2">My Studies</h1>
                        <p className="lead text-muted mb-0">
                            Welcome back, {user.firstName} {user.lastName}
                        </p>
                    </div>
                    <div className="col-md-4 text-md-end">
                        <Badge color={getRoleBadgeColor(user.role)} pill className="fs-6 px-3 py-2">
                            {getRoleDisplayName(user.role)}
                        </Badge>
                    </div>
                </div>
            </div>
        </div>
    );

    // FACILITATOR ///////////////////////////////////////////////////////////////////////////////////////////

    const facilitatorViewDashboard = ({ link }) => {
        return (
            <div className="mt-auto">
                <div className="btn-group w-100">
                    <button className="btn btn-secondary card-link" onClick={() => navigate(link)}>View</button>
                </div>
            </div>
        );
    };

    const facilitatorFooter = ({ study }) => {
        return (
            <div className="card-footer">
                <small className="text-body-secondary">Date Created: {new Date(study._dateCreated).toLocaleDateString()}</small>
            </div>
        );
    };

    const facilitatorContent = (study) => {
        return (
            <>
                {facilitatorViewDashboard({ link: `/study/dashboard/${study._id}` })}
                {facilitatorFooter({ study })}
            </>
        );
    };

    const renderFacilitator = () => {
        return (
            <div className="row">
                {userStudies.map((study) => {
                    return (
                        <StudyCard
                            key={study._id}
                            cardIndex={study._id}
                            cardName={study.name}
                            cardDescription={study.description}
                            content={facilitatorContent(study)}
                        />
                    );
                })}
            </div>
        );
    };

    // PARTICIPANT ///////////////////////////////////////////////////////////////////////////////////////////

    const handleViewDiscussion = async (studyId) => {
        navigate(`/discussion/landing/${studyId}`)
    };

    const renderCompletedStudyCard = (status, study) => {
        const studyId = study._id;

        switch (status) {
            case true:
                return (

                    <button
                        className="btn btn-secondary text-decoration-none text-white w-100 mt-2"
                        onClick={() => navigate(`/study/response/${studyId}`)}
                    >
                        View Discussions
                    </button>

                );
            default:
                return (
                    <button
                        className="btn btn-success text-decoration-none text-white w-100 mt-auto"
                        onClick={() => navigate(`/study/response/${studyId}`)}
                    >
                        Open Study
                    </button>
                );
        }

    };
    const renderParticipant = () => {
        // Build the Consent card if the user has any relevant consents
        const consentCard = consentModalContent.length > 0 ? (
            <div className="col-12 col-md-6 col-lg-4 col-xl-3 mb-4" key="consent-card">
                <div className="card h-100">
                    <div className="card-body d-flex flex-column">
                        <h5 className="card-title mb-2">Study Consent</h5>
                        <p className="card-text description">
                            {hasPendingConsent
                                ? 'You have a consent form to review and complete.'
                                : 'You can view your consent form.'}
                        </p>
                        <button
                            className={`btn ${hasPendingConsent ? 'btn-success' : 'btn-secondary'} text-white mt-auto`}
                            onClick={handleOpenConsentModal}
                        >
                            {hasPendingConsent ? 'Open Consent' : 'View Consent'}
                        </button>
                    </div>
                </div>
            </div>
        ) : null;
        if (hasPendingConsent) {
            return (
                <div className="row">
                    {consentCard}
                </div>
            );
        } else {
            if (hasLLMREs) {
                return (
                    <div className="row">
                        {consentCard}
                        <div className="col-12 col-md-6 col-lg-4 col-xl-3 mb-4">
                            <div className="card h-100">
                                <div className="card-body d-flex flex-column">
                                    <h5 className="card-title mb-2">LLM Response Evaluations</h5>
                                    <p className="card-text description">You have LLM Response Evaluations to Complete</p>
                                    <Link to="/llm-response-evaluation" className="btn btn-success text-decoration-none text-white mt-auto">
                                        Open LLM Response Evaluations
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            } else {
                return (
                    <div className="row">
                        {consentCard}

                        <div className="col-12 col-md-6 col-lg-4 col-xl-3 mb-4">
                            <div className="card h-100">
                                <div className="card-body d-flex flex-column">
                                    <h5 className="card-title mb-2">LLM Response Evaluations</h5>
                                    <Link to="/llm-response-evaluation" className="btn btn-secondary text-decoration-none text-white mt-auto">
                                        View LLM Response Evaluations
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {userStudies.map((study, studyIndex) => (
                            <StudyCard
                                cardIndex={studyIndex}
                                cardName={study.name}
                                cardDescription={study.description}
                                content={renderCompletedStudyCard(respondedStatus[study._id], study)}
                                key={studyIndex}
                            />
                        ))}
                    </div>
                );
            }
        }
    };

    const renderContent = () => {
        switch (user.role) {
            case 'admin':
            case 'facilitator':
                return renderFacilitator();
            case 'participant':
                return renderParticipant();
            default:
                return <div>Invalid user role</div>;
        }
    };
    return (
        <>
            {renderWelcomeHeader()}
            <div className="container py-0 px-5 text-start">
                {renderContent()}
                {consentModalOpen && consentModalContent.length > 0 && (
                    <ConsentModal
                        consentContent={consentModalContent[0]}
                        userId={user._id}
                        isOpen={consentModalOpen}
                        setIsOpen={setConsentModalOpen}
                        toggle={handleOpenConsentModal}
                    />
                )}
            </div>
        </>
    );
};

export default Home;