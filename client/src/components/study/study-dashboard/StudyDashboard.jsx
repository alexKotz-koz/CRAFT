import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Spinner, Accordion, AccordionItem, AccordionHeader, AccordionBody, Card, CardBody, CardTitle, CardSubtitle, CardText, Button } from "reactstrap";
import { GoPeople, GoPaste, GoPerson } from 'react-icons/go';
import { useLazyFetchDiscussionQuery, useFetchStudyCommentsQuery, useFetchStudyQuery, useLazyFetchAllStudyResponsesQuery, useLazyFetchCompleteDiscussionQuery, useLazyGetUserByIdQuery, useFetchUserIdsQuery, useLazyFetchUserDataQuery } from "../../../store";
import SimplePieChart from "./SimplePieChart";
import TimeLinePlot from "./TimeLinePlot";
import StudyCard from "../../tools/StudyCard";
import AssignNewParticipants from "./AssignNewParticipants";
import ViewConsentStatusTable from "../../consent/ViewConsentStatusTable";
import ReactGA from 'react-ga4';
import UnassignParticipants from "./UnassignParticipants";
import { isInteger, isNumber, toInteger } from "lodash";
import { toNumber } from "lodash";

const StudyDashboard = () => {

    useEffect(() => {
        ReactGA.send({
            hitType: "pageview",
            page: "/study/dashboard/:studyId",
            title: "Study Dashboard - CRAFT",
        });
    }, []);

    const { studyId } = useParams();
    const navigate = useNavigate();

    const [openAccordion, setOpenAccordion] = useState('');

    const { data: study, error: errorStudy, isLoading: isLoadingStudy } = useFetchStudyQuery(studyId);
    const { data: comments, error: errorComments, isLoading: isLoadingComments } = useFetchStudyCommentsQuery(studyId);
    const [fetchTaskDiscussion, { data: taskDiscussion, error: errorTaskDiscussion, isLoading: isLoadingTaskDiscussion }] = useLazyFetchDiscussionQuery();
    const [fetchAllStudyResponses, { data: allStudyResponses, isLoading: isLoadingAllStudyResponses, error: errorAllStudyResponses }] = useLazyFetchAllStudyResponsesQuery();
    const [fetchCompleteDiscussion, { error: errorCompleteDiscussion, isLoading: isLoadingCompleteDiscussion }] = useLazyFetchCompleteDiscussionQuery();
    const [getUsernameById, { error: errorGetUsername, isLoading: isLoadingGetUsername }] = useLazyGetUserByIdQuery();

    const { data: userIds, error: errorUserIds, isLoading: isLoadingUserIds } = useFetchUserIdsQuery();
    const [fetchUserData, { data: userData, error: errorUserData, isLoading: isLoadingUserData }] = useLazyFetchUserDataQuery();

    const [taskDiscussions, setTaskDiscussions] = useState({});
    const [userDataMap, setUserDataMap] = useState({});


    const toggleAccordion = (id) => {
        if (openAccordion === id) {
            setOpenAccordion('');
        } else {
            setOpenAccordion(id);
        }
    };

    useEffect(() => {
        if (study && study.tasks) {
            study.tasks.forEach(async (task) => {
                const taskId = task._id;
                const taskResults = await fetchTaskDiscussion(taskId).unwrap();
                setTaskDiscussions(prev => ({ ...prev, [taskId]: taskResults }));
            });
        }
    }, [study, fetchTaskDiscussion]);


    useEffect(() => {
        if (userIds) {
            userIds.forEach(async (item) => {
                const id = item[0];
                const username = item[1];
                const userDataResults = await fetchUserData({ username: username, userId: id }).unwrap();
                setUserDataMap(prev => ({ ...prev, [id]: userDataResults }));
            });
        }
    }, [userIds, useFetchUserIdsQuery]);


    if (isLoadingStudy || isLoadingComments || isLoadingTaskDiscussion || isLoadingAllStudyResponses || isLoadingCompleteDiscussion || isLoadingUserIds || isLoadingUserData) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
                <Spinner color="primary" />
            </div>
        );
    }

    if (errorStudy || errorComments || errorTaskDiscussion || errorAllStudyResponses || errorUserIds || errorUserData) {
        return <div>Error: {errorStudy?.data || errorComments?.data || errorTaskDiscussion?.data || errorAllStudyResponses || errorUserIds || errorUserData}</div>;
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

    /********** DOWNLOAD RESPONSES **********/
    const handleDownloadResponses = async (downloadType) => {
        try {
            const responseData = await fetchAllStudyResponses(studyId).unwrap();

            const participantMap = {};

            responseData.forEach(responseObj => {
                const participant = responseObj._participant;
                const email = participant.email;
                const userInfo = {
                    'email': participant.email,
                    'username': participant.username,
                    'firstName': participant?.firstName || '',
                    'lastName': participant?.lastName || '',
                    'jobTitle': participant.jobRole || '',
                    'jobDepartment': participant.jobDepartment || '',
                    'jobYears': participant.jobYears || ''
                };

                const taskName = responseObj.task.name;
                const taskResponses = {
                    responses: []
                };

                responseObj.responses.forEach(response => {
                    const prompt = response.prompt.prompt.replace(/<[^>]*>/g, '');
                    const participantResponse = response.response;
                    taskResponses.responses.push({
                        promptText: prompt,
                        response: participantResponse
                    });
                });

                if (participantMap[email]) {
                    participantMap[email].responses[taskName] = taskResponses;
                } else {
                    participantMap[email] = {
                        participant: userInfo,
                        responses: {
                            [taskName]: taskResponses
                        }
                    };
                }
            });

            const formattedData = Object.values(participantMap);

            if (downloadType === "json") {
                const jsonData = JSON.stringify(formattedData, null, 2);
                downloadFile(jsonData, `study-${study.name}-responses.json`, 'application/json');
            }
            else if (downloadType === "csv") {
                // CSV creation with modified approach to handle new structure
                let csvContent = "email,username,firstName,lastName,jobTitle,jobDepartment,jobYears,taskName,promptText,response\n";

                formattedData.forEach(data => {
                    const participant = data.participant;

                    // For each task in this participant's responses
                    Object.entries(data.responses).forEach(([taskName, taskData]) => {
                        // For each response in this task
                        taskData.responses.forEach(resp => {
                            // Escape CSV values
                            const escapeCsv = (field) => {
                                if (field === null || field === undefined) return '';
                                const str = String(field).replace(/"/g, '""');
                                return str.includes(',') ? `"${str}"` : str;
                            };

                            csvContent += [
                                escapeCsv(participant.email),
                                escapeCsv(participant.username),
                                escapeCsv(participant.firstName),
                                escapeCsv(participant.lastName),
                                escapeCsv(participant.jobTitle),
                                escapeCsv(participant.jobDepartment),
                                escapeCsv(participant.jobYears),
                                escapeCsv(taskName),
                                escapeCsv(resp.promptText),
                                escapeCsv(resp.response)
                            ].join(',') + '\n';
                        });
                    });
                });

                downloadFile(csvContent, `study-${study.name}-responses.csv`, 'text/csv');
            }
        } catch (error) {
            console.error("Error fetching study responses:", error);
        }
    };

    const downloadFile = (content, fileName, contentType) => {
        const a = document.createElement('a');
        const file = new Blob([content], { type: contentType });
        a.href = URL.createObjectURL(file);
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(a.href);
    };

    /********** DOWNLOAD DISCUSSION ********/
    const handleDownloadDiscussion = async (downloadType) => {
        try {
            // Get all task IDs from the study
            const taskIds = study.tasks.map(task => task._id);
            if (!taskIds.length) {
                alert("No tasks found in this study");
                return;
            }

            // Create a combined data structure for all tasks
            const studyData = {
                study: study.name,
                tasks: []
            };

            let hasData = false;

            // Process each task
            for (const taskId of taskIds) {
                try {
                    // Use the complete discussion endpoint to get all nested comments
                    const completeData = await fetchCompleteDiscussion({ taskId }).unwrap();

                    // Skip tasks with no responses
                    if (!completeData || !completeData.initialResponses || completeData.initialResponses.length === 0) {
                        //console.log(`Task ${taskId} has no responses, skipping`);
                        continue;
                    }

                    hasData = true;

                    // Get task name
                    const task = study.tasks.find(t => t._id === taskId);
                    const taskName = task?.name || 'Unnamed Task';

                    // Format this task's data
                    const taskData = {
                        name: taskName,
                        prompts: []
                    };

                    // Create a map of comment details for easy lookup
                    const commentDetailsMap = {};

                    // Collect all comment IDs from the task
                    const allCommentIds = [];
                    for (const initialResponse of completeData.initialResponses) {
                        for (const respObj of initialResponse.responses) {
                            if (respObj.comments && respObj.comments.length > 0) {
                                // Check if comments are IDs or objects
                                const commentIds = respObj.comments.map(comment =>
                                    typeof comment === 'string' ? comment :
                                        (comment._id ? comment._id.toString() : null)
                                ).filter(id => id !== null);

                                allCommentIds.push(...commentIds);
                            }
                        }
                    }

                    // Fetch comment details if we have comment IDs
                    if (allCommentIds.length > 0) {
                        for (const commentId of allCommentIds) {
                            try {
                                const commentResponse = await fetch(`/api/discussion/comment/${commentId}`);
                                if (commentResponse.ok) {
                                    const commentData = await commentResponse.json();
                                    commentDetailsMap[commentId] = {
                                        user: {
                                            username: commentData.user?.username || "Unknown User",
                                        },
                                        content: commentData.content || "No content",
                                        dateCreated: commentData.dateCreated || new Date().toISOString(),
                                        comments: commentData.childComments || [],
                                        votes: commentData.votes || []
                                    };
                                } else {
                                    commentDetailsMap[commentId] = {
                                        user: { username: "Unknown User" },
                                        content: "Comment data unavailable",
                                        dateCreated: new Date().toISOString(),
                                        comments: [],
                                        votes: []
                                    };
                                }
                            } catch (error) {
                                console.error(`Error fetching comment ${commentId}:`, error);
                                commentDetailsMap[commentId] = {
                                    user: { username: "Error User" },
                                    content: "Error retrieving comment",
                                    dateCreated: new Date().toISOString(),
                                    comments: [],
                                    votes: []
                                };
                            }
                        }
                    }

                    // Helper function to extract voter username
                    async function extractVoterUsername(vote) {
                        if (vote.voter && typeof vote.voter === 'object' && vote.voter.username) {
                            return vote.voter.username;
                        }

                        if (vote.voter && typeof vote.voter === 'string') {
                            try {
                                const userFound = await getUsernameById({ userId: vote.voter }).unwrap();
                                return userFound.username;
                            } catch (error) {
                                console.error("Error fetching username:", error);
                                return "Unknown Voter";
                            }
                        }

                        return "Unknown Voter";
                    }

                    // Helper function to process subcomments recursively
                    async function processSubComments(comments, targetArray) {
                        if (!comments || !comments.length) return;

                        for (const comment of comments) {
                            // Check if comment is an ID or an object
                            if (!comment.user && typeof comment === 'string') {
                                // If it's just an ID and we have it in our map
                                const commentData = commentDetailsMap[comment];
                                if (commentData) {
                                    const subComment = {
                                        user: commentData.user.username,
                                        comment: commentData.content,
                                        dateCreated: commentData.dateCreated,
                                        subcomments: [],
                                        votes: []
                                    };

                                    // Add votes for this subcomment
                                    if (commentData.votes && commentData.votes.length > 0) {
                                        for (const vote of commentData.votes) {
                                            const voterUsername = await extractVoterUsername(vote);
                                            subComment.votes.push({
                                                user: voterUsername,
                                                vote: vote.vote,
                                                dateCreated: vote.dateCreated || new Date().toISOString()
                                            });
                                        }
                                    }

                                    // Process child comments if any
                                    if (commentData.comments && commentData.comments.length > 0) {
                                        await processSubComments(commentData.comments, subComment.subcomments);
                                    }

                                    targetArray.push(subComment);
                                }
                            } else {
                                // It's a populated object
                                const subComment = {
                                    user: comment.user?.username || "Unknown",
                                    comment: comment.content,
                                    dateCreated: comment.dateCreated,
                                    subcomments: [],
                                    votes: []
                                };

                                // Add votes for this subcomment
                                if (comment.votes && comment.votes.length > 0) {
                                    for (const vote of comment.votes) {
                                        const voterUsername = await extractVoterUsername(vote);
                                        subComment.votes.push({
                                            user: voterUsername,
                                            vote: vote.vote,
                                            dateCreated: vote.dateCreated || new Date().toISOString()
                                        });
                                    }
                                }

                                // Recursive call for nested comments
                                if (comment.comments && comment.comments.length > 0) {
                                    await processSubComments(comment.comments, subComment.subcomments);
                                }

                                targetArray.push(subComment);
                            }
                        }
                    }

                    // Process each prompt
                    for (const promptObj of completeData.prompts) {
                        const prompt = {
                            prompt: promptObj.question.replace(/<[^>]*>/g, ''),
                            responses: []
                        };

                        // Find all responses for this prompt
                        for (const initialResponse of completeData.initialResponses) {
                            for (const respObj of initialResponse.responses) {
                                // Match responses to this prompt
                                if (respObj.prompt === promptObj.id) {
                                    const responseObj = {
                                        user: initialResponse._participant.username,
                                        response: respObj.response,
                                        dateCreated: respObj._dateCreated || initialResponse._dateCreated,
                                        comments: [],
                                        votes: []
                                    };

                                    // Add comments with recursive subcomment processing
                                    if (respObj.comments && respObj.comments.length > 0) {
                                        for (const commentRef of respObj.comments) {
                                            const commentId = typeof commentRef === 'string' ? commentRef :
                                                (commentRef._id ? commentRef._id.toString() : null);

                                            if (!commentId) continue;

                                            const comment = typeof commentRef === 'object' && commentRef.user ?
                                                commentRef : commentDetailsMap[commentId];

                                            if (comment) {
                                                const commentObj = {
                                                    user: comment.user.username,
                                                    comment: comment.content,
                                                    dateCreated: comment.dateCreated,
                                                    subcomments: [],
                                                    votes: []
                                                };

                                                // Add votes for this comment
                                                if (comment.votes && comment.votes.length > 0) {
                                                    for (const vote of comment.votes) {
                                                        const voterUsername = await extractVoterUsername(vote);
                                                        commentObj.votes.push({
                                                            user: voterUsername,
                                                            vote: vote.vote,
                                                            dateCreated: vote.dateCreated || new Date().toISOString()
                                                        });
                                                    }
                                                }

                                                // Process nested comments if they exist
                                                if (comment.comments && comment.comments.length > 0) {
                                                    await processSubComments(comment.comments, commentObj.subcomments);
                                                }

                                                responseObj.comments.push(commentObj);
                                            }
                                        }
                                    }

                                    // Add votes
                                    if (respObj.votes && respObj.votes.length > 0) {
                                        for (const vote of respObj.votes) {
                                            const voterUsername = await extractVoterUsername(vote);
                                            responseObj.votes.push({
                                                user: voterUsername,
                                                vote: vote.vote,
                                                dateCreated: vote.dateCreated || new Date().toISOString()
                                            });
                                        }
                                    }

                                    prompt.responses.push(responseObj);
                                }
                            }
                        }

                        taskData.prompts.push(prompt);
                    }

                    // Add this task's data to the study data
                    studyData.tasks.push(taskData);

                } catch (error) {
                    console.error(`Error processing task ${taskId}:`, error);
                    // Continue with other tasks even if one fails
                }
            }

            if (!hasData) {
                alert("No discussion data found for any tasks in this study");
                return;
            }

            const studyName = study.name || 'study';
            const fileName = `study-${studyName}-all-discussions`.replace(/\s+/g, '-');

            // Download in requested format
            if (downloadType === "json") {
                const jsonData = JSON.stringify(studyData, null, 2);
                downloadFile(jsonData, `${fileName}.json`, 'application/json');
            }
            else if (downloadType === "csv") {
                let csvContent = "study,taskName,prompt,username,response,responseDate,commentUsername,comment,commentDate,replyLevel,replyToUsername,voteUsername,voteValue\n";

                // Helper function for CSV escaping
                const escapeCsv = (field) => {
                    if (field === null || field === undefined) return '';
                    const str = String(field).replace(/"/g, '""');
                    return str.includes(',') ? `"${str}"` : str;
                };

                // Process all tasks
                studyData.tasks.forEach(taskData => {
                    const taskName = escapeCsv(taskData.name);

                    // Process all prompts in this task
                    taskData.prompts.forEach(prompt => {
                        const promptText = escapeCsv(prompt.prompt);

                        // Process all responses to this prompt
                        prompt.responses.forEach(response => {
                            const studyNameCsv = escapeCsv(studyData.study);
                            const username = escapeCsv(response.user);
                            const responseText = escapeCsv(response.response);
                            const responseDate = escapeCsv(response.dateCreated);

                            // If no comments or votes, output just the response row
                            if (response.comments.length === 0 && response.votes.length === 0) {
                                csvContent += `${studyNameCsv},${taskName},${promptText},${username},${responseText},${responseDate},,,,,,\n`;
                            }

                            // Add rows for response votes
                            if (response.votes.length > 0) {
                                response.votes.forEach(vote => {
                                    csvContent += `${studyNameCsv},${taskName},${promptText},${username},${responseText},${responseDate},`;
                                    csvContent += `${escapeCsv(username)},"Vote on response",${escapeCsv(responseDate)},-1,,${escapeCsv(vote.user)},${vote.vote}\n`;
                                });
                            }

                            // Process comments with nested structure
                            if (response.comments.length > 0) {
                                // Recursively add comments, their votes, and their subcomments
                                const flattenCommentsAndVotes = (comments, level, parentUser) => {
                                    comments.forEach(comment => {
                                        // For each comment, add a row
                                        csvContent += `${studyNameCsv},${taskName},${promptText},${username},${responseText},${responseDate},`;
                                        csvContent += `${escapeCsv(comment.user)},${escapeCsv(comment.comment)},${escapeCsv(comment.dateCreated)},${level},${level > 0 ? escapeCsv(parentUser) : ''},${escapeCsv('')},${escapeCsv('')}\n`;

                                        // Add rows for comment votes
                                        if (comment.votes && comment.votes.length > 0) {
                                            comment.votes.forEach(vote => {
                                                csvContent += `${studyNameCsv},${taskName},${promptText},${username},${responseText},${responseDate},`;
                                                csvContent += `${escapeCsv(comment.user)},"${escapeCsv(comment.comment.substring(0, 20))}...",${escapeCsv(comment.dateCreated)},${level},${level > 0 ? escapeCsv(parentUser) : ''},${escapeCsv(vote.user)},${vote.vote}\n`;
                                            });
                                        }

                                        // If there are subcomments, process them as well
                                        if (comment.subcomments && comment.subcomments.length > 0) {
                                            flattenCommentsAndVotes(comment.subcomments, level + 1, comment.user);
                                        }
                                    });
                                };

                                flattenCommentsAndVotes(response.comments, 0, '');
                            }
                        });
                    });
                });

                downloadFile(csvContent, `${fileName}.csv`, 'text/csv');
            }
        } catch (error) {
            console.error("Error downloading discussion data:", error);
            alert("Failed to download discussion data. See console for details.");
        }
    };

    /********** RETURN *******************/
    const countParticipants = userIds ? userIds.filter(user => user[2] === "participant").length : 0;
    const consentedUsers = Object.values(userDataMap).filter(user => {
        return user?.consent &&
            Array.isArray(user.consent) &&
            user.consent.length > 0 &&
            user.consent[0]?.participantData?.consent === true;
    }).length;


    const calculateLLMRECompletions = (userDataMap) => {
        if (!userDataMap || Object.keys(userDataMap).length === 0) {
            return 0;
        }

        let usersWithCompletedLLMRE = 0;

        Object.values(userDataMap).forEach(user => {
            let completedLLMREs = 0;
            let userLLMREIds = []

            if (user.llmRE && Array.isArray(user.llmRE) && user.llmRE.length > 0) {
                user.llmRE.forEach(llmRE => {
                    userLLMREIds.push(llmRE._id);
                })
            }
            if (user.llmREResponses && Array.isArray(user.llmREResponses) && user.llmREResponses.length > 0) {
                user.llmREResponses.forEach(response => {
                    if (userLLMREIds.includes(response.evaluationId)) {
                        completedLLMREs += 1;
                    }
                })
            }
            // Check if user completed all their LLMREs
            if (userLLMREIds.length > 0 && completedLLMREs === userLLMREIds.length) {
                usersWithCompletedLLMRE += 1;
            }
        });
        return usersWithCompletedLLMRE;
    }

    const calculateStudyCompletions = (userDataMap) => {
        if (!userDataMap || Object.keys(userDataMap).length === 0) {
            return 0;
        }

        let usersWithCompletedStudyTasks = 0;

        Object.values(userDataMap).forEach(user => {
            let completedStudyTasks = 0;
            let userStudyTaskIds = [];

            if (user.studyTasks && Array.isArray(user.studyTasks) && user.studyTasks.length > 0) {
                user.studyTasks.forEach(task => {
                    userStudyTaskIds.push(task._id);
                })
            }

            if (user.studyResponses && Array.isArray(user.studyResponses) && user.studyResponses.length > 0) {
                user.studyResponses.forEach(response => {
                    if (userStudyTaskIds.includes(response.task)) {
                        completedStudyTasks += 1;
                    }
                })
            }

            if (userStudyTaskIds.length > 0 && completedStudyTasks == userStudyTaskIds.length) {
                usersWithCompletedStudyTasks += 1;
            }
        });
        return usersWithCompletedStudyTasks;

    }

    return (
        <div className="container-fluid bg-secondary-subtle rounded py-2">
            <h3 className="text-center mb-4">Study Dashboard</h3>

            <div className="mx-2 my-3 px-2 py-2">
                <div className="container border border-solid">
                    {/** Summary Cards */}
                    <div className="row g-3 mb-3">
                        <div className="col-md-3">
                            <Card className="h-100">
                                <CardBody className="d-flex flex-column justify-content-center">
                                    <CardTitle className="text-center">
                                        <strong>Total Users in Study</strong>
                                    </CardTitle>
                                    <CardSubtitle className="d-flex justify-content-center my-3">
                                        <GoPeople style={{ color: '#87CEEB', fontSize: '1.75rem' }} />
                                    </CardSubtitle>
                                    <CardText className="text-center fs-4 fw-bold">
                                        {countParticipants}
                                    </CardText>
                                </CardBody>
                            </Card>
                        </div>
                        <div className="col-md-3">
                            <Card className="h-100">
                                <CardBody className="d-flex flex-column justify-content-center">
                                    <CardTitle className="text-center">
                                        <strong>Completed Consents</strong>
                                    </CardTitle>
                                    <CardSubtitle className="d-flex justify-content-center my-3">
                                        <GoPerson style={{ color: '#eb8787ff', fontSize: '1.75rem' }} />
                                    </CardSubtitle>
                                    <CardText className="text-center fs-4 fw-bold">
                                        {consentedUsers}
                                    </CardText>
                                </CardBody>
                            </Card>
                        </div>
                        <div className="col-md-3">
                            <Card className="h-100">
                                <CardBody className="d-flex flex-column justify-content-center">
                                    <CardTitle className="text-center">
                                        <strong>Completed All Assigned LLM Response Evaluations</strong>
                                    </CardTitle>
                                    <CardSubtitle className="d-flex justify-content-center my-3">
                                        <GoPerson style={{ color: '#87eb87ff', fontSize: '1.75rem' }} />
                                    </CardSubtitle>
                                    <CardText className="text-center fs-4 fw-bold">
                                        {/* Add your third metric here */}
                                        {calculateLLMRECompletions(userDataMap)}
                                    </CardText>
                                </CardBody>
                            </Card>
                        </div>
                        <div className="col-md-3">
                            <Card className="h-100">
                                <CardBody className="d-flex flex-column justify-content-center">
                                    <CardTitle className="text-center">
                                        <strong>Completed All Assigned Study Tasks</strong>
                                    </CardTitle>
                                    <CardSubtitle className="d-flex justify-content-center my-3">
                                        <GoPerson style={{ color: '#a787ebff', fontSize: '1.75rem' }} />
                                    </CardSubtitle>
                                    <CardText className="text-center fs-4 fw-bold">
                                        {/* Add your third metric here */}
                                        {calculateStudyCompletions(userDataMap)}
                                    </CardText>
                                </CardBody>
                            </Card>
                        </div>
                    </div>

                    {/** Add search bar to search by cohort or name */}

                    {/** Participant Stats*/}
                    <div className="row px-2 py-2 rounded">
                        <div className="my-2 py-2"></div>
                        <div className="col">

                            {Object.values(userDataMap)
                                .filter(user => user.user.role === "participant")
                                .sort((a, b) => {
                                    const firstNameA = a.user.firstName || '';
                                    const firstNameB = b.user.firstName || '';
                                    return firstNameA.localeCompare(firstNameB);
                                })
                                .map((user, index) => {

                                    //Calculate the user study task completion rate
                                    let assignedStudyTasks = 0;
                                    let completedStudyTasks = 0;
                                    let userCompletedStudyTaskRate = 0;
                                    let userStudyTaskIds = [];

                                    if (user.studyTasks && Array.isArray(user.studyTasks) && user.studyTasks.length > 0) {
                                        assignedStudyTasks = user.studyTasks.length;
                                        user.studyTasks.forEach(task => {
                                            userStudyTaskIds.push(task._id);
                                        })
                                    }

                                    if (user.studyResponses && Array.isArray(user.studyResponses) && user.studyResponses.length > 0) {
                                        user.studyResponses.forEach(response => {
                                            if (userStudyTaskIds.includes(response.task)) {
                                                completedStudyTasks += 1;
                                            }
                                        })
                                    }

                                    if (assignedStudyTasks <= 0) {
                                        userCompletedStudyTaskRate = 'No tasks assigned';
                                    } else {
                                        userCompletedStudyTaskRate = Math.round((completedStudyTasks / assignedStudyTasks) * 100 * 100) / 100;
                                    }


                                    // Calculate the user LLM RE completion rate
                                    let assignedLLMREs = 0;
                                    let completedLLMREs = 0;
                                    let userCompletedLLMRERate = 0;
                                    let userLLMREIds = []

                                    if (user.llmRE && Array.isArray(user.llmRE) && user.llmRE.length > 0) {
                                        assignedLLMREs = user.llmRE.length;
                                        user.llmRE.forEach(llmRE => {
                                            userLLMREIds.push(llmRE._id);
                                        })
                                    }
                                    if (user.llmREResponses && Array.isArray(user.llmREResponses) && user.llmREResponses.length > 0) {
                                        user.llmREResponses.forEach(response => {
                                            if (userLLMREIds.includes(response.evaluationId)) {
                                                completedLLMREs += 1;
                                            }
                                        })
                                    }

                                    if (assignedLLMREs <= 0) {
                                        userCompletedLLMRERate = 'No LLM response evaluations assigned';
                                    } else {
                                        userCompletedLLMRERate = Math.round((completedLLMREs / assignedLLMREs) * 100 * 100) / 100;
                                    }

                                    {/** Card per Participant */ }
                                    return (
                                        <Card key={index} className="mb-3">
                                            <CardBody className="p-3">
                                                <div className="d-flex align-items-center justify-content-between">
                                                    {/** User Demo */}
                                                    <div className="d-flex align-items-center">
                                                        {user.user.avatar && (
                                                            <img
                                                                src={user.user.avatar}
                                                                alt={`${user.user.username}'s avatar`}
                                                                className="rounded-circle me-3"
                                                                style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                                            />
                                                        )}
                                                        <div>
                                                            <div className="d-flex align-items-center">
                                                                <h6 className="mb-0 fw-bold">{user.user.firstName} {user.user.lastName}</h6>
                                                                <span className="badge bg-primary ms-2">Participant</span>
                                                            </div>
                                                            <small className="text-muted">
                                                                {user.user.jobRole} • {user.user.jobDepartment} • {user.user.jobYears}
                                                            </small>
                                                            <div className="text-muted small">@{user.user.username}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <hr className="my-3" />
                                                {/* Progress bars section */}
                                                <div className="mt-3">
                                                    <div className="row">
                                                        <div className="col">
                                                            <div className="d-flex align-items-center mb-2">
                                                                <p className="text-muted me-2 mb-0">Tasks</p>
                                                                <span className="badge bg-info">
                                                                    {!isNumber(userCompletedStudyTaskRate) ? userCompletedStudyTaskRate : `${completedStudyTasks}/${assignedStudyTasks}`}
                                                                </span>
                                                            </div>
                                                            <div className="progress" style={{ height: '6px' }}>
                                                                <div className="progress-bar bg-info" style={{ width: `${userCompletedStudyTaskRate}%` }}></div>
                                                            </div>
                                                        </div>
                                                        <div className="col">
                                                            <div className="d-flex align-items-center mb-2">
                                                                <p className="text-muted me-2 mb-0">LLM Evals</p>
                                                                <span className="badge bg-success">
                                                                    {!isNumber(userCompletedLLMRERate) ? userCompletedLLMRERate : `${completedLLMREs}/${assignedLLMREs}`}
                                                                </span>
                                                            </div>
                                                            <div className="progress" style={{ height: '6px' }}>
                                                                <div className="progress-bar bg-success" style={{ width: `${userCompletedLLMRERate}%` }}></div>
                                                            </div>
                                                        </div>
                                                        <div className="col">
                                                            <div className="d-flex align-items-center mb-2">
                                                                <p className="text-muted me-2 mb-0">Consented?</p>
                                                                <span className={`badge ${Array.isArray(user.consent) &&
                                                                        user.consent.length > 0 &&
                                                                        user.consent[0]?.participantData?.consent === true
                                                                        ? 'bg-success'
                                                                        : Array.isArray(user.consent) && user.consent.length > 0
                                                                            ? 'bg-danger'
                                                                            : 'bg-warning'
                                                                    }`}>
                                                                    {
                                                                        Array.isArray(user.consent) &&
                                                                            user.consent.length > 0 &&
                                                                            user.consent[0]?.participantData?.consent === true
                                                                            ? 'Yes'
                                                                            : Array.isArray(user.consent) && user.consent.length > 0
                                                                                ? 'No'
                                                                                : 'No consent data'
                                                                    }
                                                                </span>
                                                            </div>
                                                        </div>
                                                        {/* <div className="col-4">
                                                        <div className="d-flex align-items-center mb-2">
                                                            <small className="text-muted me-2">Discussions</small>
                                                            <span className="badge bg-warning">45%</span>
                                                        </div>
                                                        <div className="progress" style={{ height: '6px' }}>
                                                            <div className="progress-bar bg-warning" style={{ width: '45%' }}></div>
                                                        </div>
                                                    </div> */}
                                                    </div>
                                                </div>
                                            </CardBody>
                                        </Card>
                                    )
                                })
                            }
                        </div>

                    </div>
                </div>

            </div>
            <div className="accordion mb-4" id="studyDashboardAccordion">

                {/* Task Discussions Section - Open by Default */}
                <div className="accordion-item">
                    <h2 className="accordion-header">
                        <button
                            className={`accordion-button ${openAccordion !== '0' && 'collapsed'}`}
                            type="button"
                            onClick={() => toggleAccordion('0')}
                        >
                            Task Discussions
                        </button>
                    </h2>
                    <div className={`accordion-collapse collapse ${openAccordion === '0' ? 'show' : ''}`}>
                        <div className="accordion-body">
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
                    </div>
                </div>

                {/* Statistics Section */}
                <div className="accordion-item">
                    <h2 className="accordion-header">
                        <button
                            className={`accordion-button ${openAccordion !== '1' && 'collapsed'}`}
                            type="button"
                            onClick={() => toggleAccordion('1')}
                        >
                            Statistics
                        </button>
                    </h2>
                    <div className={`accordion-collapse collapse ${openAccordion === '1' ? 'show' : ''}`}>
                        <div className="accordion-body">
                            <div className="row">
                                <SimplePieChart data={respondedData} title="Responded" />
                                <TimeLinePlot data={aggregatedCommentData} title="Comments" lineDataKey="count" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Download Section */}
                <div className="accordion-item">
                    <h2 className="accordion-header">
                        <button
                            className={`accordion-button ${openAccordion !== '2' && 'collapsed'}`}
                            type="button"
                            onClick={() => toggleAccordion('2')}
                        >
                            Download Data
                        </button>
                    </h2>
                    <div className={`accordion-collapse collapse ${openAccordion === '2' ? 'show' : ''}`}>
                        <div className="accordion-body">
                            <div className="d-flex justify-content-center gap-3 mb-3">
                                <button className="btn btn-primary" onClick={() => handleDownloadResponses("json")}>
                                    Download Responses (JSON)
                                </button>
                                <button className="btn btn-secondary" onClick={() => handleDownloadResponses("csv")}>
                                    Download Responses (CSV)
                                </button>
                            </div>
                            <div className="d-flex justify-content-center gap-3">
                                <button className="btn btn-primary" onClick={() => handleDownloadDiscussion("json")}>
                                    Download Discussion (JSON)
                                </button>
                                <button className="btn btn-secondary" onClick={() => handleDownloadDiscussion("csv")}>
                                    Download Discussion (CSV)
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Assign New Participants - Study */}
                <div className="accordion-item">
                    <h2 className="accordion-header">
                        <button
                            className={`accordion-button ${openAccordion !== '3' && 'collapsed'}`}
                            type="button"
                            onClick={() => toggleAccordion('3')}
                        >
                            Assign New Participants - Study
                        </button>
                    </h2>
                    <div className={`accordion-collapse collapse ${openAccordion === '3' ? 'show' : ''}`}>
                        <div className="accordion-body">
                            <div className="d-flex justify-content-center gap-3">
                                {openAccordion === '3' && <AssignNewParticipants studyId={studyId} />}
                            </div>
                        </div>
                    </div>
                </div>
                {/* Unassign Participants from Tasks */}
                <div className="accordion-item">
                    <h2 className="accordion-header">
                        <button
                            className={`accordion-button ${openAccordion !== '4' && 'collapsed'}`}
                            type="button"
                            onClick={() => toggleAccordion('4')}
                        >
                            Unassign Participants from Study Tasks
                        </button>
                    </h2>
                    <div className={`accordion-collapse collapse ${openAccordion === '4' ? 'show' : ''}`}>
                        <div className="accordion-body">
                            <div className="d-flex justify-content-center gap-3">
                                {openAccordion === '4' && <UnassignParticipants studyId={studyId} />}
                            </div>
                        </div>
                    </div>
                </div>
                {/* View Consent Completions */}
                <div className="accordion-item">
                    <h2 className="accordion-header">
                        <button
                            className={`accordion-button ${openAccordion !== '5' && 'collapsed'}`}
                            type="button"
                            onClick={() => toggleAccordion('5')}
                        >
                            View Participant Consent Status
                        </button>
                    </h2>
                    <div className={`accordion-collapse collapse ${openAccordion === '5' ? 'show' : ''}`}>
                        <div className="accordion-body">
                            <div className="d-flex justify-content-center gap-3">
                                {openAccordion === '5' && <ViewConsentStatusTable />}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudyDashboard;