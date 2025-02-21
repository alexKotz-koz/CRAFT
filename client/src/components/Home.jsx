import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import ButtonLink from './tools/ButtonLink';
import StudyCard from './tools/StudyCard';
import { useFetchUserQuery, useFetchStudiesQuery } from "../store";
import '../static/custom.css';

const Home = () => {
    const navigate = useNavigate();
    const { data: user, error: userError, isLoading: isLoadingUser } = useFetchUserQuery();
    const { data: userStudies, error: studiesError, isLoading: isLoadingStudies } = useFetchStudiesQuery();
    const [respondedStatus, setRespondedStatus] = useState({});
    const [tasks, setTasks] = useState([]);

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

    if (isLoadingUser || isLoadingStudies) {
        return <div>Loading...</div>;
    }

    if (userError || studiesError) {
        return <div>Error: {userError?.data.error || studiesError?.data.error}</div>;
    }

    if (!user) {
        return <div>No user data available</div>;
    }



    // FACILITATOR ///////////////////////////////////////////////////////////////////////////////////////////

    const facilitatorCompletedStudies = ({ study }) => {
        return (
            <p className="card-text">
                Participants Responded: {study.participants.filter(p => p.responded).length} / {study.participants.length}
            </p>
        );
    };

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
                {facilitatorCompletedStudies({ study })}
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

const renderCompletedStudyCard = (status, study) => {
    const studyId = study._id;
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
    </div>
);
};

export default Home;