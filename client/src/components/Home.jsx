import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { GoBellFill, GoCheck } from "react-icons/go";
import ButtonLink from './tools/ButtonLink';
import { useFetchUserQuery, useFetchStudiesQuery } from "../store";
import '../static/custom.css';

const Home = () => {
    const navigate = useNavigate();
    const { data: user, error: userError, isLoading: isLoadingUser } = useFetchUserQuery();
    const { data: userStudies, error: studiesError, isLoading: isLoadingStudies } = useFetchStudiesQuery();
    const [respondedStatus, setRespondedStatus] = useState({});

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

    // Group studies into chunks of 4 for view
    const studyChunks = userStudies.reduce((resultArray, item, index) => {
        const chunkIndex = Math.floor(index / 4);

        if (!resultArray[chunkIndex]) {
            resultArray[chunkIndex] = [];
        }

        resultArray[chunkIndex].push(item);

        return resultArray;
    }, []);

    // FACILITATOR ///////////////////////////////////////////////////////////////////////////////////////////
    const renderFacilitator = () => {
        return (
            <div>
                {studyChunks.map((chunk, chunkIndex) => (
                    <div className="row" key={chunkIndex}>
                        <div className="card-group">
                            {chunk.map((study) => {

                                const studyId = study._id;
                                const studyDiscussionLink = `/discussion/${studyId}`

                                return (
                                    <div className="col-3" key={study._id}>
                                        <div className="card p-3 h-100">
                                            <h5 className="card-title">
                                                {study.name}
                                            </h5>
                                            <p className="card-text description">{study.description}</p>
                                            <div className="mb-3">
                                                <p className="card-text">
                                                    Completed Studies: {study.participants.filter(p => p.responded).length} / {study.participants.length}
                                                </p>
                                            </div>

                                            <div className="btn-group mt-auto mb-3">
                                                <ButtonLink to='#' additionalClasses="btn-success card-link me-auto" text='Edit' />
                                                <ButtonLink to={studyDiscussionLink} additionalClasses="btn-secondary card-link" text='View' />
                                            </div>
                                            <div className="card-footer">
                                                <small className="text-body-secondary">Date Created:
                                                    {new Date(study.dateCreated).toLocaleDateString()}
                                                </small>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                ))}
            </div>

        );
    };

    // PARTICIPANT ///////////////////////////////////////////////////////////////////////////////////////////
    const handleResponseClick = (status, studyId) => {
        switch (status) {
            case true:
                navigate(`/study/${studyId}`);
                break;
            default:
                navigate(`/study/response/${studyId}`);
                break;
        }

    };

    const renderCompletedStudyCard = (status, studyId) => {
        switch (status) {
            case true:
                return (
                    <div className="btn-group mt-auto" role="group">

                        <button
                            className="btn btn-success text-decoration-none text-white"
                            onClick={() => handleResponseClick(status, studyId)}
                        >
                            View Response
                        </button>
                        <button
                            className="btn btn-secondary text-decoration-none text-white"
                            onClick={() => navigate(`/discussion/${studyId}`)}
                        >
                            View Discussion
                        </button>
                    </div>
                );
            default:
                return (
                    <button
                        className="btn btn-success text-decoration-none text-white mt-auto"
                        onClick={() => handleResponseClick(status, studyId)}
                    >
                        Start
                    </button>
                );
        }
    };

    const renderParticipant = () => {
        return (
            <div>
                {userStudies.map((study, studyIndex) => (
                    <div className="row" key={studyIndex}>
                        <div className="card-group">
                            <div className="col-3" key={study._id}>
                                <div className="card p-3 h-100">
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <h5 className="card-title">
                                            {study.name}
                                        </h5>
                                        {respondedStatus[study._id] ? (
                                            <GoCheck style={{ fontSize: '24px', color: 'green' }} />
                                        ) : (
                                            <GoBellFill style={{ fontSize: '24px', color: 'red' }} />
                                        )}
                                    </div>
                                    <p className="card-text description">{study.description}</p>
                                    {renderCompletedStudyCard(respondedStatus[study._id], study._id)}
                                </div>
                            </div>
                        </div>
                    </div>
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
        <div className="container py-2 px-5 text-center">
            <h3>My Studies</h3>
            {renderContent()}
        </div>
    );
};

export default Home;