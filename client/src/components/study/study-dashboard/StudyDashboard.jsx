import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Spinner } from "reactstrap";
import { useLazyFetchDiscussionQuery, useFetchStudyCommentsQuery, useFetchStudyQuery, useLazyFetchAllStudyResponsesQuery } from "../../../store";
import SimplePieChart from "./SimplePieChart";
import TimeLinePlot from "./TimeLinePlot";
import StudyCard from "../../tools/StudyCard";

const StudyDashboard = () => {
    const { studyId } = useParams();
    const navigate = useNavigate();

    const { data: study, error: errorStudy, isLoading: isLoadingStudy } = useFetchStudyQuery(studyId);
    const { data: comments, error: errorComments, isLoading: isLoadingComments } = useFetchStudyCommentsQuery(studyId);
    const [fetchTaskDiscussion, { data: taskDiscussion, error: errorTaskDiscussion, isLoading: isLoadingTaskDiscussion }] = useLazyFetchDiscussionQuery();
    const [fetchAllStudyResponses, { data: allStudyResponses, isLoading: isLoadingAllStudyResponses, error: errorAllStudyResponses }] = useLazyFetchAllStudyResponsesQuery();


    const [taskDiscussions, setTaskDiscussions] = useState({});
    
    useEffect(() => {
        if (study && study.tasks) {
            study.tasks.forEach(async (task) => {
                const taskId = task._id;
                const taskResults = await fetchTaskDiscussion(taskId).unwrap();
                setTaskDiscussions(prev => ({ ...prev, [taskId]: taskResults }));
            });
        }
    }, [study, fetchTaskDiscussion]);

    if (isLoadingStudy || isLoadingComments || isLoadingTaskDiscussion || isLoadingAllStudyResponses) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
                <Spinner color="primary" />
            </div>
        );
    }

    if (errorStudy || errorComments || errorTaskDiscussion || errorAllStudyResponses) {
        return <div>Error: {errorStudy.data || errorComments.data || errorTaskDiscussion?.data || errorAllStudyResponses?.data}</div>;
    }

    const { dateCreated, dateModified, description, instructions, name, participants, prompts, responses } = study;

    const participantsCompletedStudy = participants.filter(p => p.responded).length;
    const participantsUncompletedStudy = participants.length - participantsCompletedStudy;

    const respondedData = [
        { name: 'Completed Study', value: participantsCompletedStudy },
        { name: 'Incompleted Study', value: participantsUncompletedStudy }
    ];

    const commentData = [];
    comments.forEach(comment => {
        const commentDate = new Date(comment.dateCreated);
        const year = commentDate.getFullYear();
        const month = commentDate.getMonth() + 1;
        const day = commentDate.getDate();
        const hour = commentDate.getHours();

        const formattedDate = `${year}-${month}-${day} ${hour}:00`;

        commentData.push({ date: formattedDate, count: 1 });
    });

    const aggregatedCommentData = commentData.reduce((acc, curr) => {
        const existing = acc.find(item => item.date === curr.date);
        if (existing) {
            existing.count += 1;
        } else {
            acc.push(curr);
        }
        return acc;
    }, []);
    aggregatedCommentData.sort((a, b) => new Date(a.date) - new Date(b.date));


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
    const handleDownload = async (downloadType) => {
        await fetchAllStudyResponses(studyId);
        if (!isLoadingAllStudyResponses){
            console.log(allStudyResponses);
        }
    };

    return (
        <div className="container-fluid">
            <h3 className="text-center mb-4">Study Dashboard</h3>
            <div className="d-flex justify-content-end mb-3">
                <button className="btn btn-primary me-2" onClick={() => handleDownload("json")}>
                    Download Responses (JSON)
                </button>
                <button className="btn btn-secondary" onClick={() => handleDownload("csv")}>
                    Download Responses (CSV)
                </button>
            </div>
            <div className="row">
                <h5 className="text-center mb-4">Task Discussions</h5>
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

            <div className="row mt-3 mb-3">
                <SimplePieChart data={respondedData} title="Responded" />
                <TimeLinePlot data={aggregatedCommentData} title="Comments" lineDataKey="count" />
            </div>
        </div>
    );
};

export default StudyDashboard;