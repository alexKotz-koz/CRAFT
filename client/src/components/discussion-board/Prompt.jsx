import { useState } from "react";
import { GoChevronDown, GoChevronLeft } from 'react-icons/go';
import InitialResponse from "./InitialResponse";

function Prompt({ prompt, responses, notifications, promptIndex, studyId, currentUser, taskId }) {
    const [isExpanded, setIsExpanded] = useState(true);

    if (responses.length <= 0){
        return <div>Error fetching responses for this discussion. Please contact administrative services for further assistance.</div>
    }

    const handleClick = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <div className="card" style={{ borderTop: 'none', borderRight: 'none', borderBottom: 'none', borderLeft: 'none' }}>
            <div className="card-body" onClick={handleClick}>
                <div className="d-flex align-items-center">
                    <h5 className="card-header fw-bolder" style={{ background: 'none'}}>
                        {prompt}
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
                    {responses.map((response, idx) => {
                        return (
                            <InitialResponse
                                key={idx}
                                username={response._participant.username}
                                avatar={response._participant.avatar}
                                dateCreated={response._dateCreated}
                                response={response.responses[promptIndex].response}
                                notifications={notifications}
                                studyId={studyId}
                                promptId={response.responses[promptIndex].prompt}
                                responseId={response.responses[promptIndex]._id}
                                currentUser={currentUser}
                                votes={response.responses[promptIndex].votes}
                                comments={response.responses[promptIndex].comments}
                                taskId={taskId}
                            />
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default Prompt;