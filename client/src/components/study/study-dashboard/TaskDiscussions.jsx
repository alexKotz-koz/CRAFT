import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useFetchStudyQuery, useLazyFetchDiscussionQuery } from "../../../store";
import { Spinner } from "reactstrap";
import StudyCard from "../../tools/StudyCard";

const TaskDiscussions = () => {

    const { studyId } = useParams(); // Extract studyId from URL parameters
    const navigate = useNavigate();

    const { data: study, error, isLoading } = useFetchStudyQuery(studyId);
    const [taskDiscussions, setTaskDiscussions] = useState({});
    const [fetchTaskDiscussion, { data: taskDiscussion, error: errorTaskDiscussion, isLoading: isLoadingTaskDiscussion }] = useLazyFetchDiscussionQuery();

    useEffect(() => {
        if (study && study.tasks) {
            study.tasks.forEach(async (task) => {
                const taskId = task._id;
                const taskResults = await fetchTaskDiscussion(taskId).unwrap();
                setTaskDiscussions(prev => ({ ...prev, [taskId]: taskResults }));
            });
        }
    }, [study, fetchTaskDiscussion]);

    if (isLoading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
                <Spinner color="primary" />
            </div>
        );
    }

    if (error) {
        return <div>Error: {error?.data}</div>;
    }



    const renderResponded = ({ task }) => {
        return (
            <p>Responded: {task.participants.filter(p => p.responded).length}/{task.participants.length}</p>
        );
    };

    const renderDiscussions = ({ promptsWithDiscussion }) => {
        return (
            <p className={promptsWithDiscussion > 0 ? 'text-success' : 'text-danger'}>Discussions: {promptsWithDiscussion}</p>
        );
    };

    const renderViewDiscussion = ({ link }) => {
        return (
            <div className="mt-auto">
                <div className="btn-group w-100">
                    <button className="btn btn-secondary card-link" onClick={() => navigate(link)}>Go To Discussion</button>
                </div>
            </div>
        );
    };

    const renderFooter = ({ task }) => {
        return (
            <div className="card-footer">
                <small className="text-body-secondary">Date Created: {new Date(task._dateCreated).toLocaleDateString()}</small>
            </div>
        );
    };


    const renderTaskContent = (task, link, promptsWithDiscussion) => {
        return (
            <>
                {renderResponded({ task })}
                {renderDiscussions({ promptsWithDiscussion })}
                {renderViewDiscussion({ link })}
                {renderFooter({ task })}
            </>
        );
    };


    return (
        <div className="container-fluid bg-secondary-subtle rounded py-2">
            <h3 className="text-center mb-4">Study Task Discussion Boards</h3>
            <div className="row">
                {study.tasks.map((task, idx) => {
                    const taskId = task._id;
                    const discussionLink = `/discussion/${taskId}`;
                    const taskResults = taskDiscussions[taskId];
                    let numComments = 0;
                    let promptsWithDiscussion = 0;
                    if (taskResults) {
                        taskResults.initialResponses.forEach((response) => {
                            response.responses.forEach((res) => {
                                numComments += res.comments.length;
                                if (res.comments.length > 0) {
                                    promptsWithDiscussion++;
                                }
                            });
                        });
                    }

                    return (
                        <StudyCard
                            key={idx}
                            cardIndex={idx}
                            cardName={task?.name ?? study.name}
                            cardDescription={task.instructions}
                            content={renderTaskContent(task, discussionLink, promptsWithDiscussion)}
                        />
                    );
                })}
            </div>
        </div>
    )

}

export default TaskDiscussions;