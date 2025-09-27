import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Spinner, Card, CardBody, CardTitle, CardSubtitle, CardText, Button } from "reactstrap";
import { GoPeople, GoPerson, GoSearch, GoFilter } from 'react-icons/go';
import { useFetchStudyCommentsQuery, useFetchStudyQuery, useLazyFetchAllStudyResponsesQuery, useLazyFetchCompleteDiscussionQuery, useLazyGetUserByIdQuery, useFetchUserIdsQuery, useLazyFetchUserDataQuery } from "../../../store";
import ReactGA from 'react-ga4';
import { isNumber } from "lodash";
import { Link } from "react-router-dom";

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
    const [fetchAllStudyResponses, { data: allStudyResponses, isLoading: isLoadingAllStudyResponses, error: errorAllStudyResponses }] = useLazyFetchAllStudyResponsesQuery();
    const [fetchCompleteDiscussion, { error: errorCompleteDiscussion, isLoading: isLoadingCompleteDiscussion }] = useLazyFetchCompleteDiscussionQuery();
    const [getUsernameById, { error: errorGetUsername, isLoading: isLoadingGetUsername }] = useLazyGetUserByIdQuery();

    const { data: userIds, error: errorUserIds, isLoading: isLoadingUserIds } = useFetchUserIdsQuery();
    const [fetchUserData, { data: userData, error: errorUserData, isLoading: isLoadingUserData }] = useLazyFetchUserDataQuery();

    const [taskDiscussions, setTaskDiscussions] = useState({});
    const [userDataMap, setUserDataMap] = useState({});
    const [sortType, setSortType] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');

    const toggleAccordion = (id) => {
        if (openAccordion === id) {
            setOpenAccordion('');
        } else {
            setOpenAccordion(id);
        }
    };


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


    if (isLoadingStudy || isLoadingComments || isLoadingAllStudyResponses || isLoadingCompleteDiscussion || isLoadingUserIds || isLoadingUserData) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
                <Spinner color="primary" />
            </div>
        );
    }

    if (errorStudy || errorComments || errorAllStudyResponses || errorUserIds || errorUserData) {
        return <div>Error: {errorStudy?.data || errorComments?.data || errorAllStudyResponses || errorUserIds || errorUserData}</div>;
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


    const sortUsers = (a, b) => {
        if (sortType === 0) {
            // Sort by firstName
            const firstNameA = a.user.firstName || '';
            const firstNameB = b.user.firstName || '';
            return firstNameA.localeCompare(firstNameB);
        } else if (sortType === 1) {
            // Sort by cohort
            const cohortA = a.user.cohort || '';
            const cohortB = b.user.cohort || '';
            const numA = parseInt(cohortA, 10);
            const numB = parseInt(cohortB, 10);

            // If both are valid numbers, sort numerically
            if (!isNaN(numA) && !isNaN(numB)) {
                return numA - numB;
            }
            return cohortA.localeCompare(cohortB);
        }
        return 0;
    };

    const filterUsers = (users) => {
        if (!searchTerm.trim()) return users;

        const searchLower = searchTerm.toLowerCase().trim();

        return users.filter(user => {
            const firstName = (user.user.firstName || '').toLowerCase();
            const lastName = (user.user.lastName || '').toLowerCase();
            const cohort = (user.user.cohort || '').toLowerCase();
            const username = (user.user.username || '').toLowerCase();

            return firstName.includes(searchLower) ||
                lastName.includes(searchLower) ||
                cohort.includes(searchLower) ||
                username.includes(searchLower);
        });
    };


    return (
        <div className="container-fluid bg-secondary-subtle rounded py-2">
            <h3 className="text-center mb-4">Study Dashboard</h3>

            <div className="mx-2 my-3 px-2 py-2">

                <div className="row">
                    <div className="col-2 bg-white rounded shadow-sm py-3 px-0 mb-3">
                        {/** Side Nav Header */}
                        <div className="px-3 mb-3">
                            <h6 className="text-uppercase text-muted small fw-bold mb-0" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>Auxiliary Functions</h6>
                        </div>

                        <nav className="nav flex-column">
                            {/**Task Discussions */}
                            <Link
                                to={`/study-dashboard/task-discussions/${studyId}`}
                                className="nav-link d-flex align-items-center justify-content-between px-3 py-2 text-decoration-none border-0 text-dark nav-link-hover"
                                onMouseEnter={(e) => {
                                    e.currentTarget.classList.add('bg-info-subtle');
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.classList.remove('bg-info-subtle');
                                }}
                            >
                                <div className="d-flex align-items-center">
                                    <span className="small">Task Discussions</span>
                                </div>
                            </Link>
                            <Link
                                to={`/study-dashboard/assign-participants/${studyId}`}
                                c className="nav-link d-flex align-items-center px-3 py-2 text-decoration-none border-0 text-dark"
                                onMouseEnter={(e) => {
                                    e.currentTarget.classList.add('bg-info-subtle');
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.classList.remove('bg-info-subtle');
                                }}
                            >
                                <div className="d-flex align-items-center">
                                    <span className="small">Assign Participants</span>
                                </div>
                            </Link>

                            <Link
                                to={`/study-dashboard/unassign-participants/${studyId}`}
                                className="nav-link d-flex align-items-center px-3 py-2 text-decoration-none border-0 text-dark"
                                onMouseEnter={(e) => {
                                    e.currentTarget.classList.add('bg-info-subtle');
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.classList.remove('bg-info-subtle');
                                }}
                            >
                                <div className="d-flex align-items-center">
                                    <span className="small">Unassign Participants</span>
                                </div>
                            </Link>

                            <Link
                                to={`/study-dashboard/consent-table`}
                                className="nav-link d-flex align-items-center px-3 py-2 text-decoration-none border-0 text-dark"
                                onMouseEnter={(e) => {
                                    e.currentTarget.classList.add('bg-info-subtle');
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.classList.remove('bg-info-subtle');
                                }}
                            >
                                <div className="d-flex align-items-center">
                                    <span className="small">View Consent Table</span>
                                </div>
                            </Link>
                        </nav>
                        {/* Download Section */}

                        <div className="accordion accordion-flush mb-4 mt-4" id="studyDashboardAccordion">
                            {/* Download Data Section */}
                            <div className="accordion-item border-0">
                                <h5 className="accordion-header">
                                    <button
                                        className={`accordion-button ${openAccordion !== '2' && 'collapsed'} bg-transparent border-0 px-3 py-3`}
                                        type="button"
                                        onClick={() => toggleAccordion('2')}
                                        style={{
                                            boxShadow: 'none',
                                            fontSize: '14px'
                                        }}
                                    >
                                        <i className="bi bi-download me-3 text-primary"></i>
                                        <span>Download Data</span>
                                    </button>
                                </h5>
                                {/**Download Data */}
                                <div className={`accordion-collapse collapse ${openAccordion === '2' ? 'show' : ''}`}>
                                    <div className="accordion-body px-3 py-3">
                                        <div className="row g-2">
                                            <div className="col-6">
                                                <button
                                                    className="btn btn-outline-primary btn-sm w-100 d-flex align-items-center justify-content-center"
                                                    onClick={() => handleDownloadResponses("json")}
                                                >
                                                    <i className="bi bi-file-earmark-code me-2"></i>
                                                    {'{}'} JSON
                                                </button>
                                            </div>
                                            <div className="col-6">
                                                <button
                                                    className="btn btn-outline-secondary btn-sm w-100 d-flex align-items-center justify-content-center"
                                                    onClick={() => handleDownloadResponses("csv")}
                                                >
                                                    <i className="bi bi-file-earmark-spreadsheet me-2"></i>
                                                    {'<,>'} CSV
                                                </button>
                                            </div>
                                        </div>
                                        <div className="text-center my-2">
                                            <small className="text-muted">Responses</small>
                                        </div>
                                        <div className="row g-2">
                                            <div className="col-6">
                                                <button
                                                    className="btn btn-outline-primary btn-sm w-100 d-flex align-items-center justify-content-center"
                                                    onClick={() => handleDownloadDiscussion("json")}
                                                >
                                                    <i className="bi bi-file-earmark-code me-2"></i>
                                                    {'{}'} JSON
                                                </button>
                                            </div>
                                            <div className="col-6">
                                                <button
                                                    className="btn btn-outline-secondary btn-sm w-100 d-flex align-items-center justify-content-center"
                                                    onClick={() => handleDownloadDiscussion("csv")}
                                                >
                                                    <i className="bi bi-file-earmark-spreadsheet me-2"></i>
                                                    {'<,>'} CSV
                                                </button>
                                            </div>
                                        </div>
                                        <div className="text-center mt-2">
                                            <small className="text-muted">Discussions</small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/** Summary Cards */}
                    <div className="col-10">
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

                        {/** Participant Stats*/}
                        <div className="row my-2">
                            <div className="col-12">
                                <hr className="mb-3" />
                                <h3 className="text-center">Participants</h3>
                                <div className="d-flex justify-content-evenly align-items-center py-2 px-3 bg-light rounded">
                                    {/**Search */}
                                    <div className="d-flex align-items-center gap-2" style={{ flex: '0 0 75%' }}>
                                        <div className="position-relative w-100">
                                            <span className="position-absolute start-0 top-50 translate-middle-y ms-2 text-muted">
                                                <GoSearch />
                                            </span>
                                            <input
                                                id="searchInput"
                                                type="text"
                                                className="form-control form-control-sm ps-4 w-100"
                                                placeholder="Search participants by name, username, or cohort..."
                                                style={{ width: '200px' }}
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                            />
                                        </div>
                                        {searchTerm && (
                                            <button
                                                className="btn btn-sm btn-outline-secondary"
                                                onClick={() => setSearchTerm('')}
                                                title="Clear search"
                                            >
                                                ×
                                            </button>
                                        )}
                                    </div>
                                    {/** Sort */}
                                    <div className="d-flex align-items-center gap-2 justify-content-end" style={{ flex: '0 0 25%' }}>
                                        <span className="position-relative">
                                            <span className="text-muted"><GoFilter /></span>
                                        </span>
                                        <select
                                            id="sortSelect"
                                            className="form-select form-select-sm border-0 bg-transparent"
                                            style={{ width: 'auto' }}
                                            value={sortType}
                                            onChange={(e) => setSortType(parseInt(e.target.value))}
                                        >
                                            <option value={0}>Name</option>
                                            <option value={1}>Cohort</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="row px-2 py-2 rounded">
                            <div className="my-2 py-2"></div>
                            <div className="col">
                                {filterUsers(Object.values(userDataMap)
                                    .filter(user => user.user.role === "participant"))
                                    .sort(sortUsers)
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
                                                                <div className="text-muted">
                                                                    <small>
                                                                        Cohort: {user.user.cohort ? user.user.cohort : 'No cohort assigned'}
                                                                    </small>

                                                                </div>
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
                                                                </div> 
                                                            */}
                                                        </div>
                                                    </div>
                                                </CardBody>
                                            </Card>
                                        )
                                    })
                                }
                                {/* Show message when no results found */}
                                {searchTerm && filterUsers(Object.values(userDataMap)
                                    .filter(user => user.user.role === "participant")).length === 0 && (
                                        <div className="text-center text-muted py-4">
                                            <p>No participants found matching "{searchTerm}"</p>
                                            <button
                                                className="btn btn-sm btn-outline-primary"
                                                onClick={() => setSearchTerm('')}
                                            >
                                                Clear search
                                            </button>
                                        </div>
                                    )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudyDashboard;
