import { useState } from "react";
import { GoChevronDown, GoChevronLeft } from 'react-icons/go';
import InitialResponse from "./InitialResponse";

function Prompt({ prompt, responses, promptIndex, studyId, currentUser }) {
    const [isExpanded, setIsExpanded] = useState(false);

    // Handle click for the dropdown
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
                            <GoChevronDown style={{ fontSize: '24px' }} />
                        ) : (
                            <GoChevronLeft style={{ fontSize: '24px' }} />
                        )}
                    </div>
                </div>
            </div>
            {isExpanded && (
                <div className="card-body">
                    {responses.map((response, idx) => {
                        console.log(response); // Log the value of response
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
                            />
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default Prompt;