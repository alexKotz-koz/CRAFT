import { useState } from "react";
import { GoChevronDown, GoChevronLeft } from 'react-icons/go';
import InitialResponse from "./InitialResponse";

function Prompt({ prompt, responses, promptIndex, studyId, currentUser }) {
    const [isExpanded, setIsExpanded] = useState(false);

    const handleClick = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <div className="card mb-3">
            <div className="card-body" onClick={handleClick}>
                <div className="d-flex align-items-center">
                    <h5 className="card-title mb-0">
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
                                username={response.participant}
                                dateCreated={response.dateCreated}
                                response={response.responses[promptIndex].response}
                                studyId={studyId}
                                promptId={response.responses[promptIndex].prompt}
                                responseId={response._id}
                                currentUser={currentUser}
                                upvotes={response.responses[promptIndex].upvotes} // Pass upvotes
                                downvotes={response.responses[promptIndex].downvotes} // Pass downvotes
                                voters={response.responses[promptIndex].voters} // Pass voters
                                comments={response.responses[promptIndex].comments}
                            />
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default Prompt;