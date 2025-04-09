import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Spinner, Accordion, AccordionItem, AccordionHeader, AccordionBody } from "reactstrap";
import { useLazyFetchDiscussionQuery, useFetchStudyCommentsQuery, useFetchStudyQuery, useLazyFetchAllStudyResponsesQuery, useLazyFetchCompleteDiscussionQuery, useLazyGetUserByIdQuery } from "../../../store";
import SimplePieChart from "./SimplePieChart";
import TimeLinePlot from "./TimeLinePlot";
import StudyCard from "../../tools/StudyCard";
import AssignNewParticipants from "./AssignNewParticipants";
import ReactGA from 'react-ga4';

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

    const [openAccordion, setOpenAccordion] = useState('0');

    const { data: study, error: errorStudy, isLoading: isLoadingStudy } = useFetchStudyQuery(studyId);
    const { data: comments, error: errorComments, isLoading: isLoadingComments } = useFetchStudyCommentsQuery(studyId);
    const [fetchTaskDiscussion, { data: taskDiscussion, error: errorTaskDiscussion, isLoading: isLoadingTaskDiscussion }] = useLazyFetchDiscussionQuery();
    const [fetchAllStudyResponses, { data: allStudyResponses, isLoading: isLoadingAllStudyResponses, error: errorAllStudyResponses }] = useLazyFetchAllStudyResponsesQuery();
    const [fetchCompleteDiscussion, {error: errorCompleteDiscussion, isLoading: isLoadingCompleteDiscussion}] = useLazyFetchCompleteDiscussionQuery();
    const [getUsernameById, {error: errorGetUsername, isLoading: isLoadingGetUsername}] = useLazyGetUserByIdQuery();
    const [taskDiscussions, setTaskDiscussions] = useState({});

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

    if (isLoadingStudy || isLoadingComments || isLoadingTaskDiscussion || isLoadingAllStudyResponses || isLoadingCompleteDiscussion) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
                <Spinner color="primary" />
            </div>
        );
    }

    if (errorStudy || errorComments || errorTaskDiscussion || errorAllStudyResponses) {
        return <div>Error: {errorStudy.data || errorComments.data || errorTaskDiscussion?.data || errorAllStudyResponses}</div>;
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
            // Process each task discussion
            const taskIds = Object.keys(taskDiscussions);
            // For now we'll just use the latest selected task or first task
            const currentTaskId = taskIds[0];
            if (!currentTaskId) return;
            
            // Use the complete discussion endpoint to get all nested comments
            const completeData = await fetchCompleteDiscussion({ taskId: currentTaskId }).unwrap();
            
            if (!completeData) {
                console.error("No complete discussion data found");
                return;
            }
            
            // Get task name and study name for filename
            const task = study.tasks.find(t => t._id === currentTaskId);
            const taskName = task?.name || 'task';
            const studyName = study.name || 'study';
            const fileName = `study-${studyName}-task-${taskName}`.replace(/\s+/g, '-');
            
            // Format the data according to the required structure
            const formattedData = {
                study: study.name,
                task: {
                    name: task.name,
                    prompts: []
                }
            };
            
            // Fetch all comment data first since we're only getting IDs
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
            
            // Create a map of comment details for easy lookup
            const commentDetailsMap = {};
            
            // If we have comments as IDs, fetch them first
            if (allCommentIds.length > 0) {
                for (const commentId of allCommentIds) {
                    try {
                        // We need to fetch each comment individually
                        const commentResponse = await fetch(`/api/discussion/comment/${commentId}`);
                        if (commentResponse.ok) {
                            const commentData = await commentResponse.json();
                            commentDetailsMap[commentId] = {
                                user: {
                                    username: commentData.user?.username || "Unknown User",
                                },
                                content: commentData.content || "No content",
                                dateCreated: commentData.dateCreated || new Date().toISOString(),
                                // Store subcomments if any
                                comments: commentData.childComments || [],
                                // Include votes
                                votes: commentData.votes || []
                            };
                        } else {
                            console.warn(`Failed to fetch comment data for ID: ${commentId}`);
                            // Create placeholder data
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
                        // Create placeholder data
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
            
            // Helper function to extract voter username from different vote structures
            async function extractVoterUsername(vote) {
                // Case 1: vote has voter as object with username
                if (vote.voter && typeof vote.voter === 'object' && vote.voter.username) {
                    return vote.voter.username;
                }
                
                // Case 2: vote has voter as string (username directly)
                if (vote.voter && typeof vote.voter === 'string') {
                    const userFound = await getUsernameById({ userId: vote.voter }).unwrap();
                    return userFound.username;
                }
                
                // Fallback
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
                            
                            // Add votes for this subcomment - properly extract voter username
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
                        
                        // Add votes for this subcomment - properly extract voter username
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
            
            // Process each prompt - converted to for...of for async support
            for (const promptObj of completeData.prompts) {
                const prompt = {
                    prompt: promptObj.question.replace(/<[^>]*>/g, ''),
                    responses: []
                };
                
                // Find all responses for this prompt - converted to for...of for async support
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
                                // Process each comment and its nested subcomments
                                for (const commentRef of respObj.comments) {
                                    // Get the comment ID
                                    const commentId = typeof commentRef === 'string' ? commentRef : 
                                        (commentRef._id ? commentRef._id.toString() : null);
                                    
                                    if (!commentId) continue;
                                    
                                    // Get comment details from our map or use the comment object if it's already populated
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
                                        
                                        // Add votes for this comment - properly extract voter username
                                        if (comment.votes && comment.votes.length > 0) {
                                            for (const vote of comment.votes) {
                                                // Extract voter info based on structure
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
                                            // If comments are already nested objects
                                            await processSubComments(comment.comments, commentObj.subcomments);
                                        }
                                        
                                        responseObj.comments.push(commentObj);
                                    }
                                }
                            }
                            
                            // Add votes - properly extract voter username
                            if (respObj.votes && respObj.votes.length > 0) {
                                for (const vote of respObj.votes) {
                                    // Extract voter info based on structure
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
                
                formattedData.task.prompts.push(prompt);
            }
            
            // Download in requested format
            if (downloadType === "json") {
                const jsonData = JSON.stringify(formattedData, null, 2);
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
                
                // Flatten nested structure for CSV using recursive approach
                formattedData.task.prompts.forEach(prompt => {
                    const promptText = prompt.prompt;
                    
                    prompt.responses.forEach(response => {
                        const studyName = escapeCsv(formattedData.study);
                        const taskName = escapeCsv(formattedData.task.name);
                        const promptCsv = escapeCsv(promptText);
                        const username = escapeCsv(response.user);
                        const responseText = escapeCsv(response.response);
                        const responseDate = escapeCsv(response.dateCreated);
                        
                        // If no comments or votes, output just the response row
                        if (response.comments.length === 0 && response.votes.length === 0) {
                            csvContent += `${studyName},${taskName},${promptCsv},${username},${responseText},${responseDate},,,,,,\n`;
                        }
                        
                        // Add rows for response votes
                        if (response.votes.length > 0) {
                            response.votes.forEach(vote => {
                                csvContent += `${studyName},${taskName},${promptCsv},${username},${responseText},${responseDate},`;
                                csvContent += `${escapeCsv(username)},"Vote on response",${escapeCsv(responseDate)},-1,,${escapeCsv(vote.user)},${vote.vote}\n`;
                            });
                        }
                        
                        // Process comments with nested structure
                        if (response.comments.length > 0) {
                            // Recursively add comments, their votes, and their subcomments
                            const flattenCommentsAndVotes = (comments, level, parentUser) => {
                                comments.forEach(comment => {
                                    // For each comment, add a row
                                    csvContent += `${studyName},${taskName},${promptCsv},${username},${responseText},${responseDate},`;
                                    csvContent += `${escapeCsv(comment.user)},${escapeCsv(comment.comment)},${escapeCsv(comment.dateCreated)},${level},${level > 0 ? escapeCsv(parentUser) : ''},${escapeCsv('')},${escapeCsv('')}\n`;
                                    
                                    // Add rows for comment votes
                                    if (comment.votes && comment.votes.length > 0) {
                                        comment.votes.forEach(vote => {
                                            csvContent += `${studyName},${taskName},${promptCsv},${username},${responseText},${responseDate},`;
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
                
                downloadFile(csvContent, `${fileName}.csv`, 'text/csv');
            }
        } catch (error) {
            console.error("Error downloading discussion data:", error);
            alert("Failed to download discussion data. See console for details.");
        }
    };
    
    return (
        <div className="container-fluid">
            <h3 className="text-center mb-4">Study Dashboard</h3>

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
                {/* Assign New Participants */}
                <div className="accordion-item">
                    <h2 className="accordion-header">
                        <button
                            className={`accordion-button ${openAccordion !== '3' && 'collapsed'}`}
                            type="button"
                            onClick={() => toggleAccordion('3')}
                        >
                            Assign New Participants
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
            </div>
        </div>
    );
};

export default StudyDashboard;