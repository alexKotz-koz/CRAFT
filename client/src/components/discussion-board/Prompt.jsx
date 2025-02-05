import { useState } from "react";
import { GoChevronDown, GoChevronLeft } from 'react-icons/go';
import InitialResponse from "./InitialResponse";

function Prompt({ prompt, responses, notifications, promptIndex, studyId, currentUser, taskId }) {
    const [isExpanded, setIsExpanded] = useState(true);
    if (responses.length <= 0){
        return <div>Error fetching responses for this discussion. Please contact administrative services for further assistance.</div>
    }

    console.log("responses",responses.map((response) => response))

    const parser = new DOMParser();
    const doc = parser.parseFromString(prompt.question, 'text/html');
    const questionTitle = doc.body.firstChild ? doc.body.firstChild.textContent : '';

    const handleClick = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <div className="card" style={{ borderTop: 'none', borderRight: 'none', borderBottom: 'none', borderLeft: 'none' }}>
            <div className="card-body" onClick={handleClick}>
                <div className="d-flex align-items-center">
                    <h5 className="card-header fw-bolder" style={{ background: 'none'}}>
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
                    {responses.map((responseObj, idx) => {
                        username = responseObj._participant.username;
                        avatar = responseObj._participant.avatar;
                        dateCreated = responseObj._dateCreated;
                        responseObj.responses.map((response, index) => {
                            console.log(response)
                       

                        return (
                            <InitialResponse
                                key={idx}
                                username={username}
                                avatar={avatar}
                                dateCreated={dateCreated}
                                response={response.responses}
                                notifications={notifications}
                                studyId={studyId}
                                promptId={response.prompt}
                                responseId={response.responses[promptIndex]._id}
                                currentUser={currentUser}
                                votes={response.responses[promptIndex].votes}
                                comments={response.responses[promptIndex].comments}
                                taskId={taskId}
                            />
                        );
                    })})}
                </div>
            )}
        </div>
    );
}

export default Prompt;