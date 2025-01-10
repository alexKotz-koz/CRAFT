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
        return <div>Error: {userError?.message || studiesError?.message}</div>;
    }

    if (!user) {
        return <div>No user data available</div>;
    }

    // Group studies into chunks of 4
    const studyChunks = userStudies.reduce((resultArray, item, index) => {
        const chunkIndex = Math.floor(index / 4);

        if (!resultArray[chunkIndex]) {
            resultArray[chunkIndex] = []; // start a new chunk
        }

        resultArray[chunkIndex].push(item);

        return resultArray;
    }, []);

    const renderFacilitator = () => {
        return (
            <div>
                {studyChunks.map((chunk, chunkIndex) => (
                    <div className="row" key={chunkIndex}>
                        <div className="card-group">
                            {chunk.map((study) => (
                                <div className="col-3" key={study._id}>
                                    <div className="card p-3 h-100">
                                        <h5 className="card-title">
                                            {study.name}
                                        </h5>
                                        <p className="card-text description">{study.description}</p>
                                        <div className="mb-3">
                                            <p className="card-text fw-bold mt-3">Number of Participants: {study.participants.length}</p>
                                        </div>

                                        <div className="d-flex justify-content-center mt-auto mb-3">
                                            <ButtonLink to='#' additionalClasses="btn-primary card-link me-auto" text='Edit' />
                                            <ButtonLink to='#' additionalClasses="btn-primary card-link" text='View' />
                                        </div>
                                        <div className="card-footer">
                                            <small className="text-body-secondary">Date Created:
                                                {new Date(study.dateCreated).toLocaleDateString()}
                                            </small>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

        );
    };

    const handleResponseClick = (studyId) => {
        navigate(`/study/response/${studyId}`);
    }

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
                                    <div className="mb-3">
                                        {/* Additional content */}
                                    </div>
                                    <button
                                        className="btn btn-success text-decoration-none text-white"
                                        onClick={()=>handleResponseClick(study._id)}
                                    >
                                        {respondedStatus[study._id] ? "View Response" : "Start"}
                                    </button>
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
        <div className="container">
            <h3>My Studies</h3>
            {renderContent()}
        </div>
    );
};

export default Home;