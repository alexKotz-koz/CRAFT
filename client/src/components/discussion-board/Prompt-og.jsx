import { useState } from "react";
import { GoChevronDown, GoChevronLeft } from 'react-icons/go';
import InitialResponse from "./InitialResponse";

function Prompt({ prompt, responses, notifications, promptIndex, studyId, currentUser, taskId }) {
    const [isExpanded, setIsExpanded] = useState(true);
    if (responses.length <= 0) {
        return <div>Error fetching responses for this discussion. Please contact administrative services for further assistance.</div>
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(prompt.question, 'text/html');
    const questionTitle = doc.body.firstChild ? doc.body.firstChild.textContent : '';

    const handleClick = () => {
        setIsExpanded(!isExpanded);
    };

    const filteredResponses = responses.flatMap(responseObj => {
        return responseObj.responses
            .filter(response => {
                return response.prompt === prompt.id;
            })
            .map(response => ({
                ...response,
                _participant: responseObj._participant,
                _dateCreated: responseObj._dateCreated
            }));
    });

    return (
        //So janky!!!! -- Using filteredResponse.length to ignore the questions that have a prompt followed by children questions (i.e. parentQuestion: "Please review the table below and answer the following questions"...)
        filteredResponses.length > 0 && (
        <div className="card bg-body-tertiary border border-tertiary p-2 rounded">
            <div className="card-body" onClick={handleClick}>
                <div className="d-flex align-items-center">
                    <h5 className="card-header fw-bolder" style={{ background: 'none' }}>
                        {questionTitle}
                    </h5>
                    <div className="ms-auto">
                        {isExpanded ? (
                            <GoChevronDown style={{ fontSize: '24px', cursor: 'pointer' }} />
                        ) : (
                            <GoChevronLeft style={{ fontSize: '24px', cursor: 'pointer' }} />
                        )}
                    </div>
                </div>
            </div>
            {isExpanded && (
                <div className="card-body">
                    {filteredResponses.map((response, index) => {
                        const { username, avatar } = response._participant;
                        const dateCreated = response._dateCreated;
                        return (
                            <InitialResponse
                                key={index}
                                username={username}
                                avatar={avatar}
                                dateCreated={dateCreated}
                                response={response.response}
                                notifications={notifications}
                                studyId={studyId._id}
                                promptId={response.prompt}
                                responseId={response._id}
                                currentUser={currentUser}
                                votes={response.votes}
                                comments={response.comments}
                                taskId={taskId}
                            />
                        );
                    })}
                </div>
            )}
        </div>
    ));
}

export default Prompt;