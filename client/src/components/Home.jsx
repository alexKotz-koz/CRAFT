import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import StudyCard from './tools/StudyCard';
import PrefaceModal from './tools/modals/PrefaceModal';
import { useFetchUserQuery, useFetchStudiesQuery, useFetchAllStudiesQuery, useFetchAllEvaluationsQuery } from "../store";
import { Spinner, Badge } from "reactstrap";
import '../static/custom.css';
import ReactGA from 'react-ga4';
import { Link } from 'react-router-dom';

const Home = () => {
    const navigate = useNavigate();
    const { data: user, error: userError, isLoading: isLoadingUser } = useFetchUserQuery();
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
    const [prefaceModalOpen, setPrefaceModalOpen] = useState(false);
    const [studyNeedingPreface, setStudyNeedingPreface] = useState(null);

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
        if (user && userStudies && user.role === 'participant') {
            const study = userStudies.find(study => {
                const participant = study.participants.find(
                    p => p.username === user.username || p.email === user.email
                );
                return participant && !participant.consent;
            });
            if (study) {
                setStudyNeedingPreface(study);
                setPrefaceModalOpen(true);
            } else {
                setStudyNeedingPreface(null);
                setPrefaceModalOpen(false);
            }
        }
    }, [user, userStudies]);

    const hasLLMREs = allEvaluations?.some(evaluation =>
        evaluation.participants?.find(
            participant =>
                (participant.username === user.username || participant.email === user.email) &&
                participant.responded === false
        )
    );

    if (isLoadingUser || isLoadingStudies || isLoadingAllEvaluations) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
                <Spinner color="primary" />
            </div>
        );
    }

    if (userError || studiesError || allEvaluationsError) {
        return <div>Error: {userError?.data?.error || studiesError?.data?.error || allEvaluationsError?.data?.error}</div>;
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
        if (study.tasks.length >= 1) {
            return (
                <button
                    className="btn btn-success text-decoration-none text-white w-100 mt-auto"
                    onClick={() => navigate(`/study/response/${studyId}`)}
                >
                    Open Study
                </button>
            );
        } else {
            switch (status) {
                case true:
                    return (
                        <div className="card-footer w-100">
                            <button
                                className="btn btn-secondary text-decoration-none text-white w-100"
                                onClick={() => handleViewDiscussion(studyId)}
                            >
                                View Discussions
                            </button>
                        </div>
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
        }
    };

    const renderParticipant = () => {
        if (hasLLMREs) {
            return (
                <div className="col-12 col-md-6 col-lg-4 col-xl-3 mb-4">
                    <div className="card h-100">
                        <div className="card-body d-flex flex-column">
                            <h5 className="card-title mb-2">LLM Response Evaluations</h5>
                            <p className="card-text description">You have LLM Response Evalutions to Complete</p>
                            <button
                                className='btn btn-success'
                                type='button'
                            >
                                <Link to="/llm-response-evaluation" className="text-decoration-none text-white">
                                    Open LLM Response Evaluations
                                </Link>
                            </button>
                        </div>
                    </div>
                </div>
            )
        } else {
            return (
                <div className="row">
                    {userStudies.map((study, studyIndex) => (
                        <StudyCard
                            key={studyIndex}
                            cardIndex={studyIndex}
                            cardName={study.name}
                            cardDescription={study.description}
                            content={renderCompletedStudyCard(respondedStatus[study._id], study)}
                        />
                    ))}
                </div>
            );
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
                {studyNeedingPreface && prefaceModalOpen &&
                    <PrefaceModal
                        isOpen={prefaceModalOpen}
                        setIsOpen={setPrefaceModalOpen}
                        toggle={() => setPrefaceModalOpen(!prefaceModalOpen)}
                        studyName={studyNeedingPreface.name}
                        studyId={studyNeedingPreface._id}
                        preface={studyNeedingPreface.preface}
                        userId={user._id}
                    />
                }
            </div>
        </>
    );
};

export default Home;