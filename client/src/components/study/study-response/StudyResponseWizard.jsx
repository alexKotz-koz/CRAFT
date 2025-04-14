import { useState, useEffect } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import { useFetchStudyQuery } from "../../../store";
import { Collapse, Card, CardBody, CardHeader, Button } from 'reactstrap';
import ReactGA from 'react-ga4';


const StudyResponseWizard = ({ user }) => {
    const navigate = useNavigate();
    const { studyId } = useParams();
    const { data: study, error: errorStudy, isLoading: isLoadingStudy, refetch: refetchStudy } = useFetchStudyQuery(studyId);
    const [respondedStatus, setRespondedStatus] = useState({});

    useEffect(() => {
        ReactGA.send({
            hitType: "pageview",
            page: "/study/response/:studyId",
            title: "Study Response Wizard - CRAFT",
        });
    }, []);
    

    useEffect(() => {
        if (study && study.tasks) {
            const status = {};
            study.tasks.forEach(task => {
                const participant = task.participants.find(p => p.email === user.email);
                if (participant && participant.responded) {
                    status[task._id] = true;
                } else {
                    status[task._id] = false;
                }
            });
            setRespondedStatus(status);
        }
    }, [study, user]);

    if (isLoadingStudy) {
        return <div>Loading...</div>;
    }

    if (errorStudy) {
        return <div>Error: {errorStudy?.data.error}</div>;
    }

    if (!user) {
        return <div>No user data available</div>;
    }

    if (!study || !study.tasks) {
        return <div>No study data available</div>;
    }

    const taskChunks = study.tasks
        .filter(task => task.participants.some(participant => participant.email === user.email)) // Filter tasks
        .reduce((resultArray, item, index) => {
            const chunkIndex = Math.floor(index / 4);
    
            if (!resultArray[chunkIndex]) {
                resultArray[chunkIndex] = [];
            }
    
            resultArray[chunkIndex].push(item);
    
            return resultArray;
        }, []);

    const renderCompletedTaskCard = (status, taskId) => {

        switch (status) {
            case true:
                return (
                    <div className="btn-group mt-auto" role="group">
                        <button
                            className="btn btn-secondary text-decoration-none text-white"
                            onClick={() => navigate(`/discussion/${taskId}`)}
                        >
                            View Discussion
                        </button>
                    </div>
                );
            default:
                return (
                    <button
                        className="btn btn-success text-decoration-none text-white mt-auto"
                        onClick={async () => {
                            await refetchStudy();
                            navigate(`/study/response/task/${taskId}`)
                        }}
                    >
                        Start
                    </button>
                );
        }
    };

    return (
        <div className="container py-2 px-3 px-md-5">
            <h3 className="text-center mb-3 mb-md-5">Tasks</h3>
            <div className="card mb-4">
                <div className="card-body">
                    <h5 className="card-title">Study Description</h5>
                    <p className="card-text">{study.description}</p>
                </div>
            </div>
            
            <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-3">
                {study.tasks
                    .filter(task => task.participants.some(participant => participant.email === user.email))
                    .map((task, index) => (
                        <div className="col mb-3" key={index}>
                            <div className="card p-3 h-100 d-flex flex-column">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h5 className="card-title">
                                        {task.name ? task.name : study.name}
                                    </h5>
                                </div>
                                <p className="card-text description flex-grow-1">
                                    {task.instructions}
                                </p>
                                {renderCompletedTaskCard(respondedStatus[task._id], task._id)}
                            </div>
                        </div>
                    ))}
            </div>
        </div>
    );
};

export default StudyResponseWizard;