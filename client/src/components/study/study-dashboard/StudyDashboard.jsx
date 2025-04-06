import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Spinner, Accordion, AccordionItem, AccordionHeader, AccordionBody } from "reactstrap";
import { useLazyFetchDiscussionQuery, useFetchStudyCommentsQuery, useFetchStudyQuery, useLazyFetchAllStudyResponsesQuery } from "../../../store";
import SimplePieChart from "./SimplePieChart";
import TimeLinePlot from "./TimeLinePlot";
import StudyCard from "../../tools/StudyCard";

const StudyDashboard = () => {
    const { studyId } = useParams();
    const navigate = useNavigate();

    const [openAccordion, setOpenAccordion] = useState('0');

    const { data: study, error: errorStudy, isLoading: isLoadingStudy } = useFetchStudyQuery(studyId);
    const { data: comments, error: errorComments, isLoading: isLoadingComments } = useFetchStudyCommentsQuery(studyId);
    const [fetchTaskDiscussion, { data: taskDiscussion, error: errorTaskDiscussion, isLoading: isLoadingTaskDiscussion }] = useLazyFetchDiscussionQuery();
    const [fetchAllStudyResponses, { data: allStudyResponses, isLoading: isLoadingAllStudyResponses, error: errorAllStudyResponses }] = useLazyFetchAllStudyResponsesQuery();

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

    if (isLoadingStudy || isLoadingComments || isLoadingTaskDiscussion || isLoadingAllStudyResponses) {
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
            if (!taskDiscussions) return;
    
            // Process each task discussion
            const taskIds = Object.keys(taskDiscussions);
            
            // For now we'll just use the latest selected task or first task
            const currentTaskId = taskIds[0];
            const discussionData = taskDiscussions[currentTaskId];
            
            if (!discussionData) return;
            
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
            
            // Process each prompt
            discussionData.prompts.forEach(promptObj => {
                const prompt = {
                    prompt: promptObj.question.replace(/<[^>]*>/g, ''),
                    responses: []
                };
                
                // Find all responses for this prompt
                discussionData.initialResponses.forEach(initialResponse => {
                    initialResponse.responses.forEach(respObj => {
                        // Match responses to this prompt
                        if (respObj.prompt === promptObj.id) {
                            const responseObj = {
                                user: initialResponse._participant.username,
                                response: respObj.response,
                                dateCreated: respObj._dateCreated || initialResponse._dateCreated,
                                comments: [],
                                votes: []
                            };
                            
                            // Add comments
                            if (respObj.comments && respObj.comments.length > 0) {
                                respObj.comments.forEach(comment => {
                                    responseObj.comments.push({
                                        user: comment.user.username,
                                        comment: comment.content,
                                        dateCreated: comment.dateCreated
                                    });
                                });
                            }
                            
                            // Add votes
                            if (respObj.votes && respObj.votes.length > 0) {
                                respObj.votes.forEach(vote => {
                                    responseObj.votes.push({
                                        user: vote.voter.username,
                                        vote: vote.vote,
                                        dateCreated: vote.dateCreated
                                    });
                                });
                            }
                            
                            prompt.responses.push(responseObj);
                        }
                    });
                });
                
                formattedData.task.prompts.push(prompt);
            });
            
            // Download in requested format
            if (downloadType === "json") {
                const jsonData = JSON.stringify(formattedData, null, 2);
                downloadFile(jsonData, `${fileName}.json`, 'application/json');
            }
            else if (downloadType === "csv") {
                let csvContent = "study,taskName,prompt,username,response,responseDate,commentUsername,comment,commentDate,voterUsername,vote\n";
                
                // Flatten nested structure for CSV
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
                            csvContent += `${studyName},${taskName},${promptCsv},${username},${responseText},${responseDate},,,,,""\n`;
                        }
                        
                        // Add rows for comments
                        if (response.comments.length > 0) {
                            response.comments.forEach(comment => {
                                csvContent += `${studyName},${taskName},${promptCsv},${username},${responseText},${responseDate},`;
                                csvContent += `${escapeCsv(comment.user)},${escapeCsv(comment.comment)},${escapeCsv(comment.dateCreated)},,\n`;
                            });
                        }
                        
                        // Add rows for votes
                        if (response.votes.length > 0) {
                            response.votes.forEach(vote => {
                                csvContent += `${studyName},${taskName},${promptCsv},${username},${responseText},${responseDate},`;
                                csvContent += `,,,"${escapeCsv(vote.user)}",${vote.vote}\n`;
                            });
                        }
                    });
                });
                
                downloadFile(csvContent, `${fileName}.csv`, 'text/csv');
            }
        } catch (error) {
            console.error("Error downloading discussion data:", error);
        }
    };
    
    // Helper function to escape CSV values
    const escapeCsv = (field) => {
        if (field === null || field === undefined) return '';
        const str = String(field).replace(/"/g, '""');
        return str.includes(',') ? `"${str}"` : str;
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
                                <button className="btn btn-primary" onClick={() => handleDownloadResponses("json")}>
                                    Download Responses (JSON)
                                </button>
                                <button className="btn btn-secondary" onClick={() => handleDownloadResponses("csv")}>
                                    Download Responses (CSV)
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudyDashboard;