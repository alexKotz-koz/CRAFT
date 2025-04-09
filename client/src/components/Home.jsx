import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import ButtonLink from './tools/ButtonLink';
import StudyCard from './tools/StudyCard';
import PrefaceModal from './tools/modals/PrefaceModal';
import { useFetchUserQuery, useFetchStudiesQuery } from "../store";
import { Spinner } from 'reactstrap';
import '../static/custom.css';
import ReactGA from 'react-ga4';

const Home = () => {
    const navigate = useNavigate();
    const { data: user, error: userError, isLoading: isLoadingUser } = useFetchUserQuery();
    const { data: userStudies, error: studiesError, isLoading: isLoadingStudies, refetch } = useFetchStudiesQuery();
    const [respondedStatus, setRespondedStatus] = useState({});

    const [prefaceModalOpen, setPrefaceModalOpen] = useState(false);
    const [studyName, setStudyName] = useState("");
    const [studyId, setStudyId] = useState("");
    const [studyPreface, setStudyPreface] = useState("");

    useEffect(() => {
        ReactGA.send({
            hitType: "pageview",
            page: "/home",
            title: "Home - CRAFT",
        });
    }, []);

    
    useEffect(() => {
        if(user) {
            refetch();
        }
    }, [user?._id, refetch])

    // Participant: Upon initial render, get all studies associated with the logged in user && get the status (responded/not responded) for each study
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

    // Participant: Upon initial render, check if it is the first time the user is logging into the app, if so send to initialConfiguration form, otherwise ignore and display user studies.
    useEffect(() => {
        if (user && user.firstLogin) {
            if (user.role === 'participant'){
                navigate(`/participant-config`);
            }
        }
    }, [user]);

    if (isLoadingUser || isLoadingStudies) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
                <Spinner color="primary" />
            </div>
        );
    }

    if (userError || studiesError) {
        return <div>Error: {userError?.data.error || studiesError?.data.error}</div>;
    }

    if (!user) {
        return <div>No user data available</div>;
    }


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
                {/*This code is present in the study dashboard cards and clutters this card facilitatorCompletedStudies({ study })*/}
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
    }

    const showPreface = (currentUser, study) => {
        const participant = study.participants.find(p => p.username === currentUser);
        const hasResponded = participant.responded;
        if (hasResponded) {
            return false
        } else if (!hasResponded) {
            return true
        }
    };

    const showPrefaceModal = (study) => {
        setStudyName(study.name);
        setStudyPreface(study.preface);
        setStudyId(study._id);
        setPrefaceModalOpen(!prefaceModalOpen);
    }

    const renderCompletedStudyCard = (status, study) => {
        const studyId = study._id;
        const currentUser = user.username;
        if (study.tasks.length >= 1) {
            return (
                <button
                    className="btn btn-success text-decoration-none text-white w-100 mt-auto"
                    onClick={
                        () => {
                            if (showPreface(currentUser, study)) {
                                showPrefaceModal(study);
                            } else {
                                navigate(`/study/response/${studyId}`);
                            }
                        }
                    }
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
    };
    const renderContent = () => {
        switch (user.role) {
            case 'facilitator':
                return renderFacilitator();
            case 'participant':
                return renderParticipant();
            default:
                return <div>Invalid user role</div>;
        }
    };

    return (
        <div className="container py-2 px-5 text-start">
            <h3 className='text-center mb-5'>My Studies</h3>
            {renderContent()}
            {prefaceModalOpen &&
                <PrefaceModal
                    isOpen={prefaceModalOpen}
                    toggle={showPrefaceModal}
                    studyName={studyName}
                    studyId={studyId}
                    preface={studyPreface}
                />
            }
        </div>
    );
};

export default Home;