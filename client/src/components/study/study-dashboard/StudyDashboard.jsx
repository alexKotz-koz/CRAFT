import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useLazyFetchDiscussionQuery, useFetchStudyCommentsQuery, useFetchStudyQuery } from "../../../store";
import SimplePieChart from "./SimplePieChart";
import TimeLinePlot from "./TimeLinePlot";
import ButtonLink from "../../tools/ButtonLink";
import { Card, CardBody, CardFooter, CardHeader } from "reactstrap";

const StudyDashboard = () => {
    const { studyId } = useParams();
    const { data: study, error: errorStudy, isLoading: isLoadingStudy } = useFetchStudyQuery(studyId);
    const { data: comments, error: errorComments, isLoading: isLoadingComments } = useFetchStudyCommentsQuery(studyId);
    const [fetchTaskDiscussion, { data: taskDiscussion, error: errorTaskDiscussion, isLoading: isLoadingTaskDiscussion }] = useLazyFetchDiscussionQuery();
    const [taskDiscussions, setTaskDiscussions] = useState({});
    console.log(study)
    useEffect(() => {
        if (study && study.tasks) {
            study.tasks.forEach(async (task) => {
                const taskId = task._id;
                const taskResults = await fetchTaskDiscussion(taskId).unwrap();
                setTaskDiscussions(prev => ({ ...prev, [taskId]: taskResults }));
            });
        }
    }, [study, fetchTaskDiscussion]);

    if (isLoadingStudy || isLoadingComments) {
        return <div>Loading...</div>;
    }

    if (errorStudy || errorComments) {
        console.log("Error: ", errorStudy);
        return <div>Error: {errorStudy.data || errorComments.data}</div>;
    }

    const { dateCreated, dateModified, description, instructions, name, participants, prompts, responses } = study;

    const participantsCompletedStudy = participants.filter(p => p.responded).length;
    const participantsUncompletedStudy = participants.length - participantsCompletedStudy;

    const respondedData = [
        { name: 'Completed Study', value: participantsCompletedStudy },
        { name: 'Incompleted Study', value: participantsUncompletedStudy }
    ];

    // Comments over Time
    const commentData = [];
    comments.forEach(comment => {
        const commentDate = new Date(comment.dateCreated);
        const year = commentDate.getFullYear();
        const month = commentDate.getMonth() + 1; // Months are zero-indexed
        const day = commentDate.getDate();
        const hour = commentDate.getHours();

        // Create a new date object in the desired format
        const formattedDate = `${year}-${month}-${day} ${hour}:00`;

        // Add to commentData array
        commentData.push({ date: formattedDate, count: 1 });
    });

    // Aggregate comment counts by date
    const aggregatedCommentData = commentData.reduce((acc, curr) => {
        const existing = acc.find(item => item.date === curr.date);
        if (existing) {
            existing.count += 1;
        } else {
            acc.push(curr);
        }
        return acc;
    }, []);

    // Sort the aggregated data by date in ascending order
    aggregatedCommentData.sort((a, b) => new Date(a.date) - new Date(b.date));

    return (
        <div className="container-fluid">
            <h3 className="text-center mb-4">Study Dashboard</h3>

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
                        <div key={idx} className="w-25">
                            <Card>
                                <CardHeader>
                                    {task?.name ?? study.name}
                                </CardHeader>
                                <CardBody>
                                    <ul>
                                        <li>
                                            <p>Responded: {task.participants.filter(p => p.responded).length}/{task.participants.length}</p>
                                        </li>
                                        <li>
                                            <p className={promptsWithDiscussion > 0 ? 'text-success' : 'text-danger'}>Discussions: {promptsWithDiscussion}</p>
                                        </li>
                                    </ul>
                                </CardBody>
                                <CardFooter className="d-flex justify-content-center">
                                    <ButtonLink key={idx} to={discussionLink} text="Go To Discussion" additionalClasses="btn-primary btn-sm w-100" />
                                </CardFooter>
                            </Card>
                        </div>
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