import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { GoBellFill, GoCheck } from "react-icons/go";
import ButtonLink from './tools/ButtonLink';
import { useFetchUserQuery, useFetchStudiesQuery, useFetchTaskQuery } from "../store";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import '../static/custom.css';

const Home = () => {
    const navigate = useNavigate();
    const { data: user, error: userError, isLoading: isLoadingUser } = useFetchUserQuery();
    const { data: userStudies, error: studiesError, isLoading: isLoadingStudies } = useFetchStudiesQuery();
    const [respondedStatus, setRespondedStatus] = useState({});
    const [tasks, setTasks] = useState([]);
    const [viewDiscussionModal, setViewDiscussionModal] = useState(false);

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
            <div className="row">
                {userStudies.map((study) => {
                    const studyId = study._id;
                    const studyDashboardLink = `/study/dashboard/${studyId}`;

                    return (
                        <div className="col-12 col-md-6 col-lg-4 col-xl-3 mb-4" key={study._id}>
                            <div className="card h-100">
                                <div className="card-body d-flex flex-column">
                                    <h5 className="card-header mb-3">{study.name}</h5>
                                    <p className="card-text description">{study.description}</p>
                                    <p className="card-text">
                                        Completed Studies: {study.participants.filter(p => p.responded).length} / {study.participants.length}
                                    </p>
                                    <div className="mt-auto">
                                        <div className="btn-group w-100">
                                            <ButtonLink to='#' additionalClasses="btn-success card-link" text='Edit' />
                                            <button className="btn btn-secondary card-link" onClick={() => navigate(studyDashboardLink)}>View</button>
                                        </div>
                                    </div>
                                </div>
                                <div className="card-footer">
                                    <small className="text-body-secondary">Date Created: {new Date(study._dateCreated).toLocaleDateString()}</small>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    // PARTICIPANT ///////////////////////////////////////////////////////////////////////////////////////////

    const handleViewDiscussion = async (study) => {
        const taskIds = study.tasks;
        try {
            const fetchedTasks = await Promise.all(taskIds.map(taskId =>
                fetch(`/api/study/task/${taskId}`)
                    .then(response => response.json())
            ));

            setTasks(fetchedTasks);

            if (fetchedTasks.length > 0) {
                setViewDiscussionModal(!viewDiscussionModal);
            }
        } catch (error) {
            console.error("Error fetching tasks:", error);
        }
    };
    const toggleModal = () => setViewDiscussionModal(!viewDiscussionModal);

    const renderCompletedStudyCard = (status, study) => {
        const studyId = study._id;
        switch (status) {
            case true:
                return (
                    <div className="btn-group w-100 mt-auto" role="group">
                        <button
                            className="btn btn-secondary text-decoration-none text-white"
                            onClick={() => handleViewDiscussion(study)}
                        >
                            View Discussion
                        </button>
                        {viewDiscussionModal &&
                            <Modal isOpen={viewDiscussionModal} toggle={toggleModal} >
                                <ModalHeader toggle={toggleModal}>
                                    Choose Task Discussion
                                </ModalHeader>
                                <ModalFooter className='d-flex align-items-center justify-content-center'>
                                    {tasks.map((task) => (
                                        <Button color='primary' onClick={() =>
                                            navigate(`/discussion/${task._id}`)
                                        } key={task._id}>
                                            {task.name}
                                        </Button>
                                    ))}
                                </ModalFooter>
                            </Modal>
                        }
                    </div>
                );
            default:
                return (
                    <button
                        className="btn btn-success text-decoration-none text-white w-100 mt-auto"
                        onClick={() => navigate(`/study/response/${studyId}`)}
                    >
                        Start
                    </button>
                );
        }
    };


    const renderParticipant = () => {
        return (
            <div className="row">
                {userStudies.map((study, studyIndex) => (
                    <div className="col-12 col-md-6 col-lg-4 col-xl-3 mb-4" key={studyIndex}>
                        <div className="card h-100">
                            <div className="card-body d-flex flex-column">
                                <h5 className="card-header mb-2">{study.name}</h5>
                                <p className="card-text description">{study.description}</p>
                                {renderCompletedStudyCard(respondedStatus[study._id], study)}
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
        <div className="container py-2 px-5 text-start">
            <h3 className='text-center'>My Studies</h3>
            {renderContent()}
        </div>
    );
};

export default Home;