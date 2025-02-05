import { useState, useEffect } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import { useCreateStudyResponseMutation, useFetchStudyQuery } from "../../../store";
import { Collapse, Card, CardBody, CardHeader, Button } from 'reactstrap';



const StudyResponseWizard = ({ user }) => {
    const navigate = useNavigate();
    const { studyId } = useParams();
    const { data: study, error: errorStudy, isLoading: isLoadingStudy, refetch: refetchStudy } = useFetchStudyQuery(studyId);
    const [respondedStatus, setRespondedStatus] = useState({});

    console.log(study)
    console.log(user)

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

    const taskChunks = study.tasks.reduce((resultArray, item, index) => {
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
                        onClick={async () =>{
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
        <div className="container py-2 px-5 ">
            {taskChunks.map((chunk, chunkIndex) => (
                <div className="row" key={chunkIndex}>
                    <div className="card-group">
                        {chunk.map((task, index) => { 
                            console.log("task: ", task)
                            return (
                            <div className="col-3" key={index}>
                                <div className="card p-3 h-100">
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <h5 className="card-title">
                                            {task.name ? task.name : study.name}
                                        </h5>

                                    </div>
                                    <p className="card-text description">
                                        {task.instructions}
                                    </p>
                                    {renderCompletedTaskCard(respondedStatus[task._id], task._id)}
                                </div>

                            </div>
                        )})}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default StudyResponseWizard;