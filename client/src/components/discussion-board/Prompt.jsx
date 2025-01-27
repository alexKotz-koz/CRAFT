import { useState } from "react";
import { GoChevronDown, GoChevronLeft } from 'react-icons/go';
import InitialResponse from "./InitialResponse";

function Prompt({ prompt, responses, promptIndex, studyId, currentUser, taskId }) {
    const [isExpanded, setIsExpanded] = useState(true);

    const handleClick = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <div className="card mb-3 bg-body-tertiary border border-tertiary p-2 rounded">
            <div className="card-body" onClick={handleClick}>
                <div className="d-flex align-items-center">
                    <h5 className="card-title mb-0 fw-bolder">
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
                        console.log("Prompt Response Obj: ", response)
                        return (
                            <InitialResponse
                                key={idx}
                                username={response._participant.username}
                                dateCreated={response._dateCreated}
                                response={response.responses[promptIndex].response}
                                studyId={studyId}
                                promptId={response.responses[promptIndex].prompt}
                                responseId={response._id}
                                currentUser={currentUser}
                                upvotes={response.responses[promptIndex].upvotes} // Pass upvotes
                                downvotes={response.responses[promptIndex].downvotes} // Pass downvotes
                                voters={response.responses[promptIndex].voters} // Pass voters
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